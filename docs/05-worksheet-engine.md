# 5 · The Worksheet Engine

**The most important idea in the whole project.** Instead of hand-coding every worksheet (slow, unscalable), we build **one smart player** and describe each worksheet as a simple data file. Adding a new sheet becomes *writing content*, not *writing code*.

## The problem it solves

There are dozens of proven worksheets — the ABC Cognitive Model, Behavioural Experiments, Thought Records, DBT's TIPP and DEAR MAN, and more. If each needs a developer to build from scratch, we'll never keep up. So we flip it:

```
Worksheet (JSON template) → The Engine (one component) → Interactive form (step-by-step) → Answers saved (private, per user)
```

## The template format

Every worksheet is a list of **steps**. Each step has a `type` (the engine knows how to draw each), a `prompt`, and optional rules.

**Step types**
- `text` / `longtext` — short or long writing box
- `scale` — a 0–10 slider (intensity, belief, mood)
- `single_choice` / `multi_choice` — tap-to-pick options or chips
- `info` — a psychoeducation card ("why this helps"), hidden by default
- `safety_gate` — a red-flag check that can reroute to urgent help
- `summary` — end screen showing before/after and the user's own words

**Step rules a step can carry**
- `optional: true`
- `branch` — show step X only if answer is Y
- `ai_recap: true` — offer an optional, user-approved plain-language summary

## Worked example ① — The ABC Cognitive Model (CBT)

```json
{
  "id": "abc-cognitive-model",
  "name": "The ABC Model",
  "framework": "CBT",
  "version": 1,
  "steps": [
    { "type": "info", "title": "What's the ABC?",
      "body": "A thought isn't a fact. We'll look at one moment together." },
    { "type": "longtext", "key": "A_event",
      "prompt": "A — Activating event: what happened?" },
    { "type": "longtext", "key": "B_belief",
      "prompt": "B — Belief: what went through your mind?" },
    { "type": "scale", "key": "belief_before",
      "prompt": "How much do you believe it? (0–10)" },
    { "type": "longtext", "key": "C_consequence",
      "prompt": "C — Consequence: how did you feel & act?" },
    { "type": "single_choice", "key": "reframe_lens", "optional": true,
      "prompt": "Try one wider view",
      "options": ["Advice to a friend", "Other explanations", "What I control"] },
    { "type": "scale", "key": "belief_after",
      "prompt": "And now — how much do you believe it?" },
    { "type": "summary", "compare": ["belief_before", "belief_after"],
      "ai_recap": true }
  ]
}
```

> That file **is** the worksheet. The engine reads it top to bottom and draws a friendly, one-question-at-a-time form.

## Worked example ② — Behavioural Experiment (CBT)

Note the `safety_gate` — the engine reroutes to urgent help if the "experiment" touches something risky.

```json
{
  "id": "behavioural-experiment",
  "name": "Behavioural Experiment",
  "framework": "CBT",
  "version": 1,
  "steps": [
    { "type": "safety_gate",
      "prompt": "Does this involve danger, a medical symptom, or feeling unsafe?",
      "on_yes": "route_urgent_help" },
    { "type": "longtext", "key": "prediction",
      "prompt": "What are you afraid will happen?" },
    { "type": "scale", "key": "prob_before",
      "prompt": "How likely does that feel? (0–10)" },
    { "type": "single_choice", "key": "experiment",
      "prompt": "Pick a small, safe test from your library",
      "source": "curated_experiments" },
    { "type": "longtext", "key": "what_happened",
      "prompt": "Afterwards: what actually happened?" },
    { "type": "scale", "key": "prob_after",
      "prompt": "How likely does the feared thing feel now?" },
    { "type": "summary", "compare": ["prob_before", "prob_after"] }
  ]
}
```

## How a template becomes a saved result

- `<WorksheetPlayer>` takes a template id, fetches it from `worksheet_templates`, and renders one step at a time (candy neo-brutalist styling).
- Answers collect into one object keyed by each step's `key`.
- On finish it saves to `journal_entries` (private words) + `practice_sessions` (before/after numbers for trends), tagged with the template **version**.
- **Versioning matters:** if we improve a worksheet later, old entries still remember the version they were made with — nothing silently changes under the user.

## Content & licensing

We don't scrape/rehost copyrighted PDFs. For each worksheet we **preserve the proven mechanism** (the ABC structure, the experiment logic) but write **our own prompts and wording**, reviewed for clinical soundness — unless a source's licence explicitly allows adaptation. The template format keeps this clean: the *structure* is ours to design, the *evidence base* is credited.

## Backlog: worksheets to author as templates

CBT — ABC Model ✅ example, Behavioural Experiment ✅ example, Thought Record, Problem-Solving Ladder, Worry Window, Behavioural Activation planner.
DBT — TIPP, DEAR MAN, Opposite Action, Distress-tolerance menu, Check-the-Facts.
