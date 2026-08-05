-- ============================================================
-- Digital Sanctuary · 0003 worksheet template registry
--
-- The worksheet CONTENT lives as versioned JSON in
-- content/worksheets/*.json (git is the source of truth, so
-- adding a worksheet is a content change, not a code change).
--
-- This table is the *registry*: provenance, clinical governance,
-- and version history for every template we ship. It answers
-- "who approved this, when, and which version did the user see?"
-- — required by docs/09-safety-and-privacy.md.
-- ============================================================

create table if not exists public.worksheet_templates (
  id                text        not null,
  version           integer     not null default 1,
  name              text        not null,
  -- CBT | DBT | ACT | behavioural_activation | harm_reduction | executive_function
  framework         text        not null,
  -- short description of the mechanism this preserves
  mechanism         text,
  -- where the evidence comes from (we author our own wording)
  evidence_note     text,
  -- clinical governance
  clinical_owner    text,
  reviewed_at       date,
  next_review_at    date,
  reading_level     text,
  -- situations where this worksheet should NOT be offered
  contraindications text[]      not null default '{}',
  -- does this template contain a safety_gate step?
  has_safety_gate   boolean     not null default false,
  is_published      boolean     not null default true,
  created_at        timestamptz not null default now(),
  primary key (id, version)
);

comment on table public.worksheet_templates is
  'Registry of worksheet templates: provenance, clinical review, and versioning. Content itself lives in content/worksheets/*.json.';

alter table public.worksheet_templates enable row level security;

-- Templates are shared reference content, not user data: readable by
-- any signed-in user, writable only by the service role (migrations).
drop policy if exists "templates_readable" on public.worksheet_templates;
create policy "templates_readable"
  on public.worksheet_templates
  for select
  to authenticated
  using ( is_published );


-- ---------- seed the Phase 3 templates ----------
insert into public.worksheet_templates
  (id, version, name, framework, mechanism, evidence_note, reading_level, has_safety_gate, contraindications)
values
  ('abc-cognitive-model', 1, 'The ABC Model', 'CBT',
   'Separates an activating event from the belief about it and the emotional/behavioural consequence, then re-rates belief strength.',
   'Structure is the standard ABC/ABCDE cognitive model used across CBT self-help (e.g. CCI, NHS guides). Prompts are independently authored.',
   'plain', false,
   array['active crisis', 'acute intoxication']),

  ('behavioural-experiment', 1, 'Behavioural Experiment', 'CBT',
   'Tests a specific feared prediction against a real-world outcome and re-rates predicted likelihood.',
   'Behavioural experiment structure is standard in CBT for anxiety. Experiment library is clinician-curated; prompts independently authored.',
   'plain', true,
   array['medical symptoms', 'unsafe environment', 'active crisis', 'high suicidality']),

  ('thought-record', 1, 'Thought Record', 'CBT',
   'Captures situation, body signals, automatic thought, a wider view, and a before/after intensity rating.',
   'Standard CBT thought-diary structure. Prompts independently authored and kept non-judgemental.',
   'plain', false,
   array['active crisis'])
on conflict (id, version) do nothing;
