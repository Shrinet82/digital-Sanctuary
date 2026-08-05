-- ============================================================
-- Digital Sanctuary · 0007 substance-use vault + resources
--
-- The most sensitive data in the product. Per the research doc
-- and docs/04/09, substance-use records live in a SEPARATELY
-- CONSENTED, extra-restricted domain.
--
-- The consent gate is enforced in RLS, not just the UI: without
-- an active consent row, these tables are unreadable even to
-- their owner. Revoking consent freezes access (reversible);
-- explicit deletion is a separate, deliberate action.
-- ============================================================

-- ---------- consents: what was agreed, and when ----------
create table if not exists public.consents (
  id             uuid        primary key default gen_random_uuid(),
  user_id        uuid        not null references auth.users(id) on delete cascade,
  consent_type   text        not null,
  -- version of the consent wording the user actually saw
  version        integer     not null default 1,
  granted_at     timestamptz not null default now(),
  revoked_at     timestamptz,
  unique (user_id, consent_type)
);

comment on table public.consents is
  'Consent ledger. A row with revoked_at IS NULL means consent is currently active.';

alter table public.consents enable row level security;

drop policy if exists "own_consents_only" on public.consents;
create policy "own_consents_only"
  on public.consents
  for all
  to authenticated
  using ( auth.uid() = user_id )
  with check ( auth.uid() = user_id );


-- ---------- the gate ----------
create or replace function public.has_substance_use_consent()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select exists (
    select 1 from public.consents c
    where c.user_id = auth.uid()
      and c.consent_type = 'substance_use_domain'
      and c.revoked_at is null
  );
$$;

comment on function public.has_substance_use_consent() is
  'True only while the caller has active consent for the substance-use domain. Used by vault RLS policies.';


-- ============================================================
-- su_trigger_map — internal/external triggers, alternatives, supports
-- ============================================================
create table if not exists public.su_trigger_map (
  id                 uuid        primary key default gen_random_uuid(),
  user_id            uuid        not null references auth.users(id) on delete cascade,
  -- reduction | safer_use | abstinence | reconnect_care | just_learning
  goal               text        check (goal in
                       ('reduction','safer_use','abstinence','reconnect_care','just_learning')),
  internal_triggers  text[]      not null default '{}',
  external_triggers  text[]      not null default '{}',
  chosen_alternative text,
  support_contact    text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

comment on table public.su_trigger_map is
  'Harm-reduction trigger map. Goals are non-ranked: reduction and safer use are as valid as abstinence.';

alter table public.su_trigger_map enable row level security;

drop policy if exists "vault_trigger_map" on public.su_trigger_map;
create policy "vault_trigger_map"
  on public.su_trigger_map
  for all
  to authenticated
  using ( auth.uid() = user_id and public.has_substance_use_consent() )
  with check ( auth.uid() = user_id and public.has_substance_use_consent() );

drop trigger if exists su_trigger_map_set_updated_at on public.su_trigger_map;
create trigger su_trigger_map_set_updated_at
  before update on public.su_trigger_map
  for each row execute function public.set_updated_at();


-- ============================================================
-- su_mooring_anchors — weekly protective behaviours
-- Counts days present. NEVER a score, never a streak.
-- ============================================================
create table if not exists public.su_mooring_anchors (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        not null references auth.users(id) on delete cascade,
  -- ISO week start (Monday) this count belongs to
  week_start   date        not null,
  anchor_key   text        not null,
  days_present smallint    not null default 0 check (days_present between 0 and 7),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (user_id, week_start, anchor_key)
);

comment on table public.su_mooring_anchors is
  'Protective behaviours per week (ATTC TRUST Mooring Lines). A thin week is not a failed week.';

alter table public.su_mooring_anchors enable row level security;

drop policy if exists "vault_mooring" on public.su_mooring_anchors;
create policy "vault_mooring"
  on public.su_mooring_anchors
  for all
  to authenticated
  using ( auth.uid() = user_id and public.has_substance_use_consent() )
  with check ( auth.uid() = user_id and public.has_substance_use_consent() );

drop trigger if exists su_mooring_set_updated_at on public.su_mooring_anchors;
create trigger su_mooring_set_updated_at
  before update on public.su_mooring_anchors
  for each row execute function public.set_updated_at();


-- ============================================================
-- su_lapse_review — non-punitive event review
-- No streak reset, no "day zero", no failure vocabulary.
-- ============================================================
create table if not exists public.su_lapse_review (
  id              uuid        primary key default gen_random_uuid(),
  user_id         uuid        not null references auth.users(id) on delete cascade,
  context         text,
  warning_signs   text[]      not null default '{}',
  what_helped     text,
  one_adjustment  text,
  -- yes | maybe | not_now
  wants_support   text        check (wants_support in ('yes','maybe','not_now')),
  created_at      timestamptz not null default now()
);

comment on table public.su_lapse_review is
  'Lapse review as information, not verdict. Nothing here resets or penalises anything.';

alter table public.su_lapse_review enable row level security;

drop policy if exists "vault_lapse" on public.su_lapse_review;
create policy "vault_lapse"
  on public.su_lapse_review
  for all
  to authenticated
  using ( auth.uid() = user_id and public.has_substance_use_consent() )
  with check ( auth.uid() = user_id and public.has_substance_use_consent() );


-- ============================================================
-- local_resources — verified crisis & support directory
-- Reference data: readable by everyone, writable only by migrations.
-- Numbers must be verified against an official source before seeding.
-- ============================================================
create table if not exists public.local_resources (
  id            uuid        primary key default gen_random_uuid(),
  region        text        not null,
  service_type  text        not null,
  name          text        not null,
  contact       text        not null,
  hours         text,
  languages     text,
  is_emergency  boolean     not null default false,
  source_url    text,
  verified_at   date,
  sort_order    smallint    not null default 100,
  created_at    timestamptz not null default now()
);

comment on table public.local_resources is
  'Crisis/support directory. Every row needs a source_url and verified_at before it is shown as verified.';

alter table public.local_resources enable row level security;

drop policy if exists "resources_readable" on public.local_resources;
create policy "resources_readable"
  on public.local_resources
  for select
  to authenticated, anon
  using ( true );


-- ---------- seed: India (verified against official sources) ----------
insert into public.local_resources
  (region, service_type, name, contact, hours, languages, is_emergency, source_url, verified_at, sort_order)
values
  ('IN', 'emergency', 'National Emergency Number', '112',
   '24/7', 'Multiple', true,
   'https://www.india.gov.in/', '2026-08-05', 1),

  ('IN', 'crisis_line', 'Tele-MANAS (National Tele Mental Health Programme)', '14416 or 1-800-891-4416',
   '24/7', '20+ Indian languages', false,
   'https://telemanas.mohfw.gov.in/about', '2026-08-05', 2),

  ('IN', 'crisis_line', 'KIRAN Mental Health Rehabilitation Helpline', '1800-599-0019',
   '24/7', '13 languages', false,
   'https://socialjustice.gov.in/', '2026-08-05', 3)
on conflict do nothing;


-- ============================================================
-- Extend export_my_data() to include the vault.
--
-- Right of access covers ALL data we hold, so the vault is
-- included regardless of current consent state — clearly labelled.
-- (This function is SECURITY DEFINER and therefore bypasses RLS,
-- so the vault tables must be listed explicitly.)
-- ============================================================
create or replace function public.export_my_data()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  result jsonb;
begin
  if uid is null then
    raise exception 'Not signed in';
  end if;

  select jsonb_build_object(
    'exported_at', now(),
    'notice', 'This is everything Digital Sanctuary holds about you. It is yours.',
    'profile', (
      select to_jsonb(p) - 'id' from public.profiles p where p.id = uid
    ),
    'consents', coalesce((
      select jsonb_agg(to_jsonb(c) - 'user_id' order by c.granted_at)
      from public.consents c where c.user_id = uid
    ), '[]'::jsonb),
    'daily_checkins', coalesce((
      select jsonb_agg(to_jsonb(c) - 'user_id' order by c.created_at)
      from public.daily_checkins c where c.user_id = uid
    ), '[]'::jsonb),
    'practice_sessions', coalesce((
      select jsonb_agg(to_jsonb(s) - 'user_id' order by s.started_at)
      from public.practice_sessions s where s.user_id = uid
    ), '[]'::jsonb),
    'journal_entries', coalesce((
      select jsonb_agg(to_jsonb(j) - 'user_id' order by j.created_at)
      from public.journal_entries j where j.user_id = uid
    ), '[]'::jsonb),
    'mood_factors', coalesce((
      select jsonb_agg(to_jsonb(m) - 'user_id' order by m.log_date)
      from public.mood_factors m where m.user_id = uid
    ), '[]'::jsonb),
    'substance_use_vault', jsonb_build_object(
      'notice', 'Extra-restricted domain. Included here because your right to your own data does not depend on the consent toggle.',
      'trigger_maps', coalesce((
        select jsonb_agg(to_jsonb(t) - 'user_id' order by t.created_at)
        from public.su_trigger_map t where t.user_id = uid
      ), '[]'::jsonb),
      'mooring_anchors', coalesce((
        select jsonb_agg(to_jsonb(a) - 'user_id' order by a.week_start)
        from public.su_mooring_anchors a where a.user_id = uid
      ), '[]'::jsonb),
      'lapse_reviews', coalesce((
        select jsonb_agg(to_jsonb(l) - 'user_id' order by l.created_at)
        from public.su_lapse_review l where l.user_id = uid
      ), '[]'::jsonb)
    )
  ) into result;

  return result;
end;
$$;

revoke all on function public.export_my_data() from public, anon;
grant execute on function public.export_my_data() to authenticated;


-- ============================================================
-- delete_substance_use_data() — erase just the vault
-- Separate from account deletion: withdrawing from this domain
-- shouldn't require destroying everything else.
-- ============================================================
create or replace function public.delete_substance_use_data()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Not signed in';
  end if;

  delete from public.su_trigger_map      where user_id = uid;
  delete from public.su_mooring_anchors  where user_id = uid;
  delete from public.su_lapse_review     where user_id = uid;
  delete from public.consents
    where user_id = uid and consent_type = 'substance_use_domain';
end;
$$;

revoke all on function public.delete_substance_use_data() from public, anon;
grant execute on function public.delete_substance_use_data() to authenticated;
