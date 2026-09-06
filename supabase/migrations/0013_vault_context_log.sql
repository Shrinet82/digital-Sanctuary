-- ============================================================
-- Digital Sanctuary · 0013 vault Context Log
--
-- v2 redesign §10: "Optional private logging. Never procurement
-- details." This table deliberately has no column for substance,
-- amount, source, or cost — only the surrounding context someone
-- might want to notice a pattern in: setting, mood, who was around.
-- Same consent gate as the rest of the vault (0007).
-- ============================================================

create table public.su_context_log (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        not null references auth.users(id) on delete cascade,
  log_date     date        not null default (now() at time zone 'utc')::date,
  setting      text,
  mood         text,
  people_present text,
  note         text,
  created_at   timestamptz not null default now()
);

comment on table public.su_context_log is
  'Optional private context logging for the vault — setting, mood, who was around. Never procurement details: no substance, amount, source, or cost column exists here by design.';

create index su_context_log_user_date_idx
  on public.su_context_log (user_id, log_date desc);

alter table public.su_context_log enable row level security;

create policy "vault_context_log"
  on public.su_context_log
  for all
  to authenticated
  using ( auth.uid() = user_id and public.has_substance_use_consent() )
  with check ( auth.uid() = user_id and public.has_substance_use_consent() );


-- ============================================================
-- export_my_data() — include the context log in the vault section
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
      ), '[]'::jsonb),
      'context_log', coalesce((
        select jsonb_agg(to_jsonb(x) - 'user_id' order by x.created_at)
        from public.su_context_log x where x.user_id = uid
      ), '[]'::jsonb)
    )
  ) into result;

  return result;
end;
$$;

revoke all on function public.export_my_data() from public, anon;
grant execute on function public.export_my_data() to authenticated;


-- ============================================================
-- delete_substance_use_data() — also wipe the context log
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
  delete from public.su_context_log      where user_id = uid;
  delete from public.consents
    where user_id = uid and consent_type = 'substance_use_domain';
end;
$$;

revoke all on function public.delete_substance_use_data() from public, anon;
grant execute on function public.delete_substance_use_data() to authenticated;
