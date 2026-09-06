-- ============================================================
-- Digital Sanctuary · 0015 export excludes passcode_hash
--
-- export_my_data() builds the profile blob with `to_jsonb(p) - 'id'`,
-- which pulls in every column — including profiles.passcode_hash
-- (0014). A scrypt hash of a 4-6 digit PIN is crackable offline in
-- minutes; there's no reason for it to ever leave the database in an
-- export file a user might store or share less carefully than their
-- actual account credentials. Right of access covers the data that's
-- useful to the user, not a copy of their own security secret.
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
      select to_jsonb(p) - 'id' - 'passcode_hash' from public.profiles p where p.id = uid
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
