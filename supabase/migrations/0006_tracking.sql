-- ============================================================
-- Digital Sanctuary · 0006 tracking, insights, export & delete
--
-- The Bearable/Moodfit half. Design constraints from
-- docs/08-tracking-and-insights.md:
--   * NO streaks, scores, or pass/fail days anywhere
--   * insights are computed by transparent rules on the user's
--     own numbers — never inferred by a model
--   * the user can export everything and delete everything
-- ============================================================

-- ---------- mood_factors: Bearable-style daily trackables ----------
create table if not exists public.mood_factors (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        not null references auth.users(id) on delete cascade,
  log_date     date        not null default (now() at time zone 'utc')::date,
  -- e.g. 'sleep_hours', 'movement', 'meds_taken', or a custom key
  factor_key   text        not null,
  -- numeric value; meaning depends on the factor's own scale
  value        numeric,
  note         text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  -- one value per factor per day; re-logging updates rather than duplicates
  unique (user_id, log_date, factor_key)
);

comment on table public.mood_factors is
  'Daily self-tracked factors (sleep, movement, meds, custom). One row per factor per day. Never a score.';

create index if not exists mood_factors_user_date_idx
  on public.mood_factors (user_id, log_date desc);

alter table public.mood_factors enable row level security;

drop policy if exists "own_factors_only" on public.mood_factors;
create policy "own_factors_only"
  on public.mood_factors
  for all
  to authenticated
  using ( auth.uid() = user_id )
  with check ( auth.uid() = user_id );

drop trigger if exists mood_factors_set_updated_at on public.mood_factors;
create trigger mood_factors_set_updated_at
  before update on public.mood_factors
  for each row execute function public.set_updated_at();


-- ---------- which factors has this user chosen to track? ----------
alter table public.profiles
  add column if not exists tracked_factors text[] not null default '{}';

comment on column public.profiles.tracked_factors is
  'Factor keys the user has opted to track. Empty means none — tracking is entirely optional.';


-- ============================================================
-- export_my_data() — everything we hold about the caller
--
-- Returns one JSON document. Runs as SECURITY DEFINER but is
-- hard-scoped to auth.uid(), so it can only ever return the
-- caller's own rows.
--
-- ⚠️ DO NOT "FIX" THE ADVISOR WARNING ON THIS FUNCTION.
-- Supabase's linter flags SECURITY DEFINER functions that
-- `authenticated` can execute. Here that is the entire point:
-- users must be able to export and delete their own data
-- (docs/09-safety-and-privacy.md), and reaching auth.users
-- requires DEFINER. Both functions:
--   * raise if auth.uid() is null,
--   * filter/act on auth.uid() only, never a parameter,
--   * are revoked from public and anon.
-- Verified with two accounts: user A's export contains none of
-- user B's rows, and A deleting itself leaves B untouched.
-- Revoking EXECUTE here would silently remove the user's right
-- to their own data.
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
    ), '[]'::jsonb)
  ) into result;

  return result;
end;
$$;

revoke all on function public.export_my_data() from public, anon;
grant execute on function public.export_my_data() to authenticated;


-- ============================================================
-- delete_my_account() — irreversible, self-service
--
-- Deleting the auth.users row cascades to every table that
-- references it, so this removes all of the caller's data.
-- Scoped to auth.uid(); a user can never delete anyone else.
-- ============================================================
create or replace function public.delete_my_account()
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

  delete from auth.users where id = uid;
end;
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
