-- ============================================================
-- Digital Sanctuary · 0001 core schema
-- Phase 1 tables: profiles, daily_checkins, practice_sessions,
-- journal_entries.
--
-- SAFETY CONTRACT (see docs/09-safety-and-privacy.md):
--   * Every user-owned table carries user_id and an RLS policy
--     restricting all access to auth.uid() = user_id.
--   * Guest rows carry a nullable anon_id, claimed on signup.
--   * Nothing here stores clinical/diagnostic conclusions —
--     only the user's own self-reported entries.
-- ============================================================

-- ---------- helper: keep updated_at fresh ----------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- ============================================================
-- profiles — who you are + your settings
-- One row per auth user, created automatically on signup.
-- ============================================================
create table if not exists public.profiles (
  id                uuid primary key references auth.users(id) on delete cascade,
  display_name      text,
  language          text        not null default 'en',
  -- accessibility / comfort preferences
  reduced_motion    boolean     not null default false,
  dyslexia_font     boolean     not null default false,
  -- which modules the user wants visible (empty = show defaults)
  hidden_modules    text[]      not null default '{}',
  reminder_consent  boolean     not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

comment on table public.profiles is
  'User settings and comfort preferences. One row per auth user.';

alter table public.profiles enable row level security;

drop policy if exists "own_profile_only" on public.profiles;
create policy "own_profile_only"
  on public.profiles
  for all
  to authenticated
  using ( auth.uid() = id )
  with check ( auth.uid() = id );

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();


-- ---------- auto-create a profile row on signup ----------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', null)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ============================================================
-- daily_checkins — the optional 15-second check-in
-- All measures are 0-10 self-ratings and nullable (skippable).
-- ============================================================
create table if not exists public.daily_checkins (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        references auth.users(id) on delete cascade,
  anon_id     text,
  distress    smallint    check (distress  between 0 and 10),
  energy      smallint    check (energy    between 0 and 10),
  attention   smallint    check (attention between 0 and 10),
  urge        smallint    check (urge      between 0 and 10),
  -- what the user said would help: calm | act | plan | reflect | connect
  mode        text        check (mode in ('calm','act','plan','reflect','connect')),
  created_at  timestamptz not null default now(),
  -- a row must belong to either a user or a guest session
  constraint checkin_owner_present check (user_id is not null or anon_id is not null)
);

comment on table public.daily_checkins is
  'Optional 15-second self-ratings. Every field is skippable; never a clinical measure.';

create index if not exists daily_checkins_user_created_idx
  on public.daily_checkins (user_id, created_at desc);

alter table public.daily_checkins enable row level security;

drop policy if exists "own_checkins_only" on public.daily_checkins;
create policy "own_checkins_only"
  on public.daily_checkins
  for all
  to authenticated
  using ( auth.uid() = user_id )
  with check ( auth.uid() = user_id );


-- ============================================================
-- practice_sessions — every module the user completes
-- Outcomes are deliberately non-judgemental: there is no
-- 'failed' state, by design.
-- ============================================================
create table if not exists public.practice_sessions (
  id                uuid        primary key default gen_random_uuid(),
  user_id           uuid        references auth.users(id) on delete cascade,
  anon_id           text,
  module_id         text        not null,
  template_version  integer,
  rating_before     smallint    check (rating_before between 0 and 10),
  rating_after      smallint    check (rating_after  between 0 and 10),
  outcome           text        check (outcome in ('done','partly','moved','not_today')),
  -- did the user mark this as helpful? powers "what helps me most"
  was_helpful       boolean,
  started_at        timestamptz not null default now(),
  completed_at      timestamptz,
  constraint session_owner_present check (user_id is not null or anon_id is not null)
);

comment on table public.practice_sessions is
  'One row per module attempt. Outcome vocabulary is intentionally shame-free (no failure state).';

create index if not exists practice_sessions_user_started_idx
  on public.practice_sessions (user_id, started_at desc);
create index if not exists practice_sessions_module_idx
  on public.practice_sessions (user_id, module_id);

alter table public.practice_sessions enable row level security;

drop policy if exists "own_sessions_only" on public.practice_sessions;
create policy "own_sessions_only"
  on public.practice_sessions
  for all
  to authenticated
  using ( auth.uid() = user_id )
  with check ( auth.uid() = user_id );


-- ============================================================
-- journal_entries — private free-text & worksheet answers
-- The most sensitive table in Phase 1. Private by default;
-- retention is user-controlled.
-- ============================================================
create table if not exists public.journal_entries (
  id                uuid        primary key default gen_random_uuid(),
  user_id           uuid        references auth.users(id) on delete cascade,
  anon_id           text,
  -- which worksheet/module produced this (null = free journal)
  worksheet_id      text,
  template_version  integer,
  -- structured answers keyed by the template's step keys
  answers           jsonb       not null default '{}'::jsonb,
  -- optional free-text note
  body              text,
  -- 'keep' | 'auto_delete_30d' | 'auto_delete_90d'
  retention         text        not null default 'keep'
                    check (retention in ('keep','auto_delete_30d','auto_delete_90d')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint journal_owner_present check (user_id is not null or anon_id is not null)
);

comment on table public.journal_entries is
  'Private journal and worksheet answers. Never shared; user controls retention.';

create index if not exists journal_entries_user_created_idx
  on public.journal_entries (user_id, created_at desc);

alter table public.journal_entries enable row level security;

drop policy if exists "own_journal_only" on public.journal_entries;
create policy "own_journal_only"
  on public.journal_entries
  for all
  to authenticated
  using ( auth.uid() = user_id )
  with check ( auth.uid() = user_id );

drop trigger if exists journal_entries_set_updated_at on public.journal_entries;
create trigger journal_entries_set_updated_at
  before update on public.journal_entries
  for each row execute function public.set_updated_at();
