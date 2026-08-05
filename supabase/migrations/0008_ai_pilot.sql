-- ============================================================
-- Digital Sanctuary · 0008 the narrow AI pilot
--
-- AI is OFF BY DEFAULT. "Deterministic by default" is the core
-- principle of this product (docs/09), so generative help is
-- strictly opt-in and can be switched off again at any time.
--
-- Only three tasks are ever allowed:
--   1. reword the user's own task into a smaller first step
--   2. recap the user's own worksheet answers in plain language
--   3. neutral summary of entries the user wrote
--
-- Never: diagnosis, risk assessment, medication or dosing advice,
-- withdrawal/detox guidance, or acting as a therapist.
-- ============================================================

alter table public.profiles
  add column if not exists ai_enabled boolean not null default false;

comment on column public.profiles.ai_enabled is
  'Opt-in switch for the narrow AI features. Default false: the product must be fully usable with AI off.';


-- ============================================================
-- ai_usage_log — accountability without surveillance
--
-- Records THAT a suggestion happened and whether the user kept
-- it. Deliberately stores no prompt text and no output text:
-- we want an audit trail, not a copy of anyone's journal.
-- ============================================================
create table if not exists public.ai_usage_log (
  id            uuid        primary key default gen_random_uuid(),
  user_id       uuid        not null references auth.users(id) on delete cascade,
  -- reword_task | recap_worksheet | summarise_entries
  task          text        not null,
  model         text,
  -- accepted | edited | discarded | refused_by_guard | error
  outcome       text        not null
                check (outcome in ('accepted','edited','discarded','refused_by_guard','error')),
  -- which guard rule fired, when one did (a category, never the text)
  refusal_reason text,
  created_at    timestamptz not null default now()
);

comment on table public.ai_usage_log is
  'Audit trail for AI suggestions. Stores no prompt or output text by design.';

create index if not exists ai_usage_log_user_idx
  on public.ai_usage_log (user_id, created_at desc);

alter table public.ai_usage_log enable row level security;

drop policy if exists "own_ai_log_only" on public.ai_usage_log;
create policy "own_ai_log_only"
  on public.ai_usage_log
  for all
  to authenticated
  using ( auth.uid() = user_id )
  with check ( auth.uid() = user_id );
