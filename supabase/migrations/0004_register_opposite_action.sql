-- ============================================================
-- Digital Sanctuary · 0004 register the Opposite Action worksheet
--
-- Demonstrates the content workflow: the worksheet itself is
-- content/worksheets/opposite-action.json (no code change), and
-- this row records its clinical provenance in the registry.
-- ============================================================

insert into public.worksheet_templates
  (id, version, name, framework, mechanism, evidence_note, reading_level, has_safety_gate, contraindications)
values
  ('opposite-action', 1, 'Opposite Action', 'DBT',
   'Identifies an emotion''s action urge and substitutes a small, deliberate opposite behaviour, then re-rates intensity.',
   'Opposite action is a core DBT emotion-regulation skill. Structure follows the standard skill; prompts are independently authored and explicitly exclude cases where the emotion is a valid danger signal.',
   'plain', true,
   array['emotion is a valid danger signal', 'unsafe environment', 'active crisis'])
on conflict (id, version) do nothing;
