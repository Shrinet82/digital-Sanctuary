-- ============================================================
-- Digital Sanctuary · 0014 passcode lock
--
-- v2 redesign §14: "Passcode lock on the Ledger and the Vault,
-- independent of login." Off by default — opt-in, like everything
-- sensitive in this product.
--
-- Only a salted hash is ever stored, never the passcode itself. This
-- is a screen-lock, not encryption: it stops someone who picks up an
-- already-signed-in device from opening the Ledger or the Vault. Your
-- Supabase login + RLS is what actually protects the data at rest.
-- ============================================================

alter table public.profiles
  add column if not exists passcode_hash text;

comment on column public.profiles.passcode_hash is
  'salt:hash (scrypt), or null if no passcode is set. Screen-lock only — never treat this as data-at-rest encryption.';
