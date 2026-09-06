-- ============================================================
-- Digital Sanctuary · 0010 check-in v2 + the Ledger
--
-- v2 redesign §5/§6: the check-in IS the day's log entry. Sliders
-- are gone — a check-in is now a tap-first bean state, up to three
-- "loudest" feelings, optional context chips, and what would help.
-- Multiple check-ins per day are allowed and expected; the Ledger's
-- Year Grid shows each day's *dominant* state (computed in app code
-- from the day's rows, never stored — see lib/ledger.ts).
--
-- daily_checkins (0001) is replaced outright, not migrated: no
-- live users yet, and the v1 slider shape (distress/energy/
-- attention/urge) has no honest mapping onto the v2 taxonomy.
-- ============================================================

drop table if exists public.daily_checkins;

create table public.check_ins (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  -- the calendar day this check-in belongs to, in the user's own "today" —
  -- stored explicitly (like mood_factors.log_date) rather than derived from
  -- created_at, so the Year Grid and day view don't fight timezone drift.
  log_date    date        not null default (now() at time zone 'utc')::date,
  -- screen 1: the bean. The only required tap.
  state       text        not null check (state in ('rough','low','flat','okay','good')),
  -- screen 2: what's loudest right now. Max 3, enforced in the app (a check
  -- constraint on array length is possible but the UI is the right place to
  -- cap a multi-select — the constraint here just stops garbage rows).
  loudest     text[]      not null default '{}' check (array_length(loudest, 1) is null or array_length(loudest, 1) <= 3),
  -- screen 3: context chips. Optional, user-customisable set — free-form
  -- text rather than a closed enum, since §5 says the chip set is editable.
  context     text[]      not null default '{}',
  -- screen 4: what would help. Null means "just log it".
  want        text        check (want in ('calm','start','lift','urge','log','surprise')),
  created_at  timestamptz not null default now()
);

comment on table public.check_ins is
  'The v2 check-in: tap-first, multiple per day, no numeric sliders. This IS the day''s log entry (§5/§6 of the redesign).';

create index check_ins_user_date_idx
  on public.check_ins (user_id, log_date desc, created_at desc);

alter table public.check_ins enable row level security;

create policy "own_checkins_only"
  on public.check_ins
  for all
  to authenticated
  using ( auth.uid() = user_id )
  with check ( auth.uid() = user_id );


-- ============================================================
-- journal_entries — add log_date for day-keyed lookups
--
-- The Ledger's day view and the gradual-journal ladder (rungs 0-5,
-- §6.2) need "does today already have a journal entry, and how far
-- up the ladder did it get" — a day-keyed lookup that created_at
-- (a timestamp) doesn't give cheaply. One row per user per day for
-- the ladder itself (worksheet_id = 'daily-journal'); other
-- worksheet_ids (task-decomposer plans, CBT sheets, etc.) are
-- unaffected and may still have several rows a day.
-- ============================================================

alter table public.journal_entries
  add column if not exists log_date date not null default (now() at time zone 'utc')::date;

create index if not exists journal_entries_user_date_idx
  on public.journal_entries (user_id, log_date desc);

create unique index if not exists journal_entries_daily_journal_one_per_day
  on public.journal_entries (user_id, log_date)
  where worksheet_id = 'daily-journal';


-- ============================================================
-- export_my_data() — repoint at check_ins instead of daily_checkins
--
-- Same contract as 0006/0007 (SECURITY DEFINER, hard-scoped to
-- auth.uid(), never a parameter — see the warning in 0006). Only
-- the daily_checkins block changes, to check_ins.
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
    'check_ins', coalesce((
      select jsonb_agg(to_jsonb(c) - 'user_id' order by c.created_at)
      from public.check_ins c where c.user_id = uid
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
