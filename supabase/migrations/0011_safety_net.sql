-- ============================================================
-- Digital Sanctuary · 0011 the Safety Net
--
-- v2 redesign §8: the calm version of you writes instructions for the
-- version of you in trouble. One row per user — built once, edited
-- anytime, shown at every crisis exit. "Lines" isn't stored here: it's
-- always read live from local_resources, same as Safety Gateway, so it
-- can never go stale independently of the verified directory.
-- ============================================================

create table public.safety_net (
  user_id             uuid        primary key references auth.users(id) on delete cascade,
  -- "What does it look like when I'm heading downhill?"
  signs               text,
  -- "Not what should work — what has."
  things_that_worked  text,
  -- [{ "name": "Ankit", "contact": "+91..." }, ...] — kept as jsonb rather
  -- than a child table since it's small, always read/written whole, and
  -- never queried by field.
  people              jsonb       not null default '[]'::jsonb,
  updated_at          timestamptz not null default now()
);

comment on table public.safety_net is
  'One row per user: signs, things that have worked, and people to call. Shown at every crisis exit (§8).';

alter table public.safety_net enable row level security;

create policy "own_safety_net_only"
  on public.safety_net
  for all
  to authenticated
  using ( auth.uid() = user_id )
  with check ( auth.uid() = user_id );

create trigger safety_net_set_updated_at
  before update on public.safety_net
  for each row execute function public.set_updated_at();


-- ============================================================
-- export_my_data() — include the Safety Net
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
    'safety_net', (
      select to_jsonb(sn) - 'user_id' from public.safety_net sn where sn.user_id = uid
    ),
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
