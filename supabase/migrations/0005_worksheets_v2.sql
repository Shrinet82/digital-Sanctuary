-- ============================================================
-- Digital Sanctuary · 0005 worksheet v2 — thinking-styles step
--
-- User feedback on v1 was that a worksheet felt "a little
-- helpful": mechanically fine, but it ended in a void and left
-- people staring at blank boxes.
--
-- v2 adds, deterministically:
--   * an Unhelpful Thinking Styles naming step (the "oh, that's
--     what I'm doing" moment — Back from the Bluez, Module 5)
--   * tappable example answers so a blank box is never the wall
--   * a threshold-chosen follow-on module after saving
--
-- v1 rows are kept: entries saved under v1 must keep pointing at
-- the wording their author actually saw.
-- ============================================================

insert into public.worksheet_templates
  (id, version, name, framework, mechanism, evidence_note, reading_level, has_safety_gate, contraindications)
values
  ('abc-cognitive-model', 2, 'The ABC Model', 'CBT',
   'Separates activating event, belief, and consequence; adds identification of unhelpful thinking styles, then re-rates belief strength.',
   'ABC structure plus the unhelpful-thinking-styles step used in CBT self-help (e.g. CCI Back from the Bluez, Module 5). Prompts and example answers are independently authored.',
   'plain', false,
   array['active crisis', 'acute intoxication']),

  ('thought-record', 2, 'Thought Record', 'CBT',
   'Captures situation, body signals, automatic thought, thinking style, a wider view, and a before/after intensity rating.',
   'Standard CBT thought-diary structure with a thinking-styles step. Prompts and example answers independently authored and kept non-judgemental.',
   'plain', false,
   array['active crisis'])
on conflict (id, version) do nothing;
