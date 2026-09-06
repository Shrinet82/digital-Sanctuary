-- ============================================================
-- Digital Sanctuary · 0009 remove the AI pilot
--
-- v2 redesign (§13): zero AI, everywhere. The AI pilot from
-- 0008 was opt-in and guarded, but the guard it required was
-- the highest-stakes code in the repo — removing the model
-- removes that whole failure mode. See digital-sanctuary-redesign.md §13.
--
-- No live users yet, so this is a straight drop rather than a
-- deprecation window.
-- ============================================================

drop table if exists public.ai_usage_log;

alter table public.profiles
  drop column if exists ai_enabled;
