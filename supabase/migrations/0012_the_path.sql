-- ============================================================
-- Digital Sanctuary · 0012 the Path
--
-- v2 redesign §9: a fixed, authored, identical-for-everyone 14-day
-- sequence, skippable at any point. The sequence content itself lives
-- in lib/path.ts (authored, not data-driven) — this migration only
-- adds the one bit of state needed: whether the user dismissed it.
--
-- Day number is computed from auth.users.created_at, not stored, so
-- there's nothing here to drift out of sync.
-- ============================================================

alter table public.profiles
  add column if not exists path_dismissed boolean not null default false;

comment on column public.profiles.path_dismissed is
  'True once the user tapped "show me everything now" or finished day 14. The Path only ever controls what''s offered, never what''s reachable — dismissing it loses nothing.';
