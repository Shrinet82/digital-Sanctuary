-- ============================================================
-- Digital Sanctuary · 0002 harden helper functions
--
-- The Supabase security advisor correctly flagged that our two
-- SECURITY DEFINER trigger functions were reachable as RPC
-- endpoints (/rest/v1/rpc/...). They are trigger-only helpers —
-- no client should ever call them directly.
--
-- NOTE: Postgres grants EXECUTE to PUBLIC by default, so
-- revoking from anon/authenticated alone is NOT enough — the
-- PUBLIC grant must go too. (Verified via pg_proc.proacl.)
--
-- Triggers still run correctly: they execute as the table owner,
-- not as the calling role.
-- ============================================================

revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.set_updated_at()  from public, anon, authenticated;

-- Keep execution available to the privileged role.
grant execute on function public.handle_new_user() to service_role;
grant execute on function public.set_updated_at()  to service_role;
