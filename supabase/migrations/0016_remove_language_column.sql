-- ============================================================
-- Digital Sanctuary · 0016 remove the unused language column
--
-- profiles.language (0001) was i18n scaffolding for a Hindi
-- localisation that was never built and is now a permanent "no" —
-- the founder, in consultation with the consulting psychiatrist,
-- decided English-only: the target users function in English on
-- their phones, and this isn't a phase-1 gap to revisit.
--
-- Safe to drop: grepped the entire app — nothing reads or writes this
-- column. It has sat at its default ('en') for every row since 0001.
-- ============================================================

alter table public.profiles
  drop column if exists language;
