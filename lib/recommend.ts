/**
 * The recommendation engine — v2.
 *
 * DETERMINISTIC BY DESIGN — see digital-sanctuary-redesign.md §13.
 * A single ordered rule chain, first match wins. Every result carries a
 * plain-language `reason` shown to the user verbatim. No AI decides
 * anything here, and nothing in this file infers a diagnosis or risk.
 *
 * This implements §13's chain, items 2-11 (item 1, the persistent
 * "urgent" control, lives outside the check-in as its own always-visible
 * button — see components/UrgentHelpButton.tsx — and isn't a rule here).
 */

import type { CheckIn } from "./checkin";
import { seededIndex } from "./seed";

export type ModuleId = string;

export type Suggestion = {
  moduleId: ModuleId;
  title: string;
  description: string;
  condition: string;
};

export type Recommendation = Suggestion & {
  /** Shown to the user verbatim, so they can see why this was chosen. */
  reason: string;
  alternatives: Suggestion[];
};

export const MODULES: Record<ModuleId, Suggestion> = {
  "ground-and-settle": {
    moduleId: "ground-and-settle",
    title: "Ground & Settle",
    description:
      "A short paced-breathing practice. Follow the circle; leave whenever you like.",
    condition: "Anxiety",
  },
  "task-decomposer": {
    moduleId: "task-decomposer",
    title: "Task Decomposer",
    description:
      "Turn one goal into small, observable steps — starting with one under two minutes.",
    condition: "ADHD",
  },
  "one-small-action": {
    moduleId: "one-small-action",
    title: "One Small Action",
    description:
      "One achievable, kind, or connecting action — sized for today, whatever today looks like.",
    condition: "Low mood",
  },
  "safety-gateway": {
    moduleId: "safety-gateway",
    title: "Safety Gateway",
    description:
      "A calm, always-available route to real help — emergency, overdose, withdrawal, and local services.",
    condition: "Substance use",
  },
  "trigger-map": {
    moduleId: "trigger-map",
    title: "Trigger & Support Map",
    description:
      "Map what tends to come before an urge, pre-choose an alternative, and name who you'd contact.",
    condition: "Substance use",
  },
  "values-to-action": {
    moduleId: "values-to-action",
    title: "Values to Action",
    description:
      "Not what you should do — what matters to you. Then one tiny, voluntary step toward it.",
    condition: "Low mood",
  },
  "time-container": {
    moduleId: "time-container",
    title: "Time Container",
    description:
      "One block of focus with a soft start and a soft landing. The container does the holding.",
    condition: "ADHD",
  },
  "priority-lens": {
    moduleId: "priority-lens",
    title: "Priority Lens",
    description:
      "When everything feels urgent: sort each task through one lens and get a list of three, never a wall.",
    condition: "ADHD",
  },
  "energy-aware-week": {
    moduleId: "energy-aware-week",
    title: "Energy-Aware Week",
    description:
      "A week planned from your real capacity, not an ideal one. Move or drop anything, no penalty.",
    condition: "Low mood",
  },
};

/**
 * Modules the "surprise me" rule (§13 item 10) is allowed to pick from.
 * Deliberately excludes the vault (needs consent) and Safety Gateway
 * (never something to stumble into by chance).
 */
const SURPRISE_POOL: ModuleId[] = [
  "ground-and-settle",
  "one-small-action",
  "values-to-action",
  "time-container",
  "priority-lens",
  "energy-aware-week",
];

function pick(ids: ModuleId[]): Suggestion[] {
  return ids.map((id) => MODULES[id]);
}

function result(
  moduleId: ModuleId,
  reason: string,
  alternatives: ModuleId[]
): Recommendation {
  return { ...MODULES[moduleId], reason, alternatives: pick(alternatives) };
}

/**
 * Returns one primary action plus up to two alternatives, from a fixed,
 * ordered rule chain — first match wins (§13).
 *
 * `seedKey` powers the "surprise me" rule so the pick is reproducible
 * (same day + same person = same surprise) rather than random. Pass
 * `${dateString}:${userId}` when the caller knows the user; falls back to
 * date-only, which is still deterministic, just not per-user.
 */
export function recommend(
  checkIn: CheckIn,
  seedKey: string = new Date().toISOString().slice(0, 10)
): Recommendation {
  const { state, loudest, want } = checkIn;

  // 2. Rough + craving: hold on through the urge itself.
  // PLACEHOLDER (Phase B): Ride the Wave doesn't exist yet — Ground & Settle
  // is the nearest built tool for "something to do while this passes."
  if (state === "rough" && loudest.includes("craving")) {
    return result(
      "ground-and-settle",
      "You said it's rough right now and craving is loud. Slow, paced breathing gives you something to do while it passes.",
      ["trigger-map", "one-small-action"]
    );
  }

  // 3. Rough, on its own: the smallest, calmest option.
  if (state === "rough") {
    return result(
      "ground-and-settle",
      "You said it's rough right now, so this asks the least of you.",
      ["one-small-action", "task-decomposer"]
    );
  }

  // 4. Explicitly asked for help through an urge.
  // PLACEHOLDER (Phase B): same substitution as rule 2.
  if (want === "urge") {
    return result(
      "ground-and-settle",
      "You said you want to get through this urge. Steady, paced breathing is the best tool we have for that right now.",
      ["trigger-map", "one-small-action"]
    );
  }

  // 5. Asked to be calmed down.
  if (want === "calm") {
    return result(
      "ground-and-settle",
      "You said you wanted to feel calmer, so let's start there.",
      ["one-small-action", "task-decomposer"]
    );
  }

  // 6. Asked for help starting.
  // PLACEHOLDER (Phase B): "What's Blocking Me?" doesn't exist yet —
  // Task Decomposer is today's real entry point for "I can't start."
  if (want === "start") {
    return result(
      "task-decomposer",
      "You said you want help starting, so let's find the smallest first step.",
      ["ground-and-settle", "priority-lens"]
    );
  }

  // 7. Asked for a lift.
  if (want === "lift") {
    return result(
      "one-small-action",
      "You said you want a lift, so here's one small, achievable thing.",
      ["values-to-action", "ground-and-settle"]
    );
  }

  // 8. "Can't start" is the loudest thing, even without saying so directly.
  if (loudest.includes("cant_start")) {
    return result(
      "task-decomposer",
      "Can't start was the loudest thing you flagged, so we start with one concrete next step.",
      ["priority-lens", "time-container"]
    );
  }

  // 9. Anxious is the loudest thing.
  // PLACEHOLDER (Phase B): Card Deck doesn't exist yet — Ground & Settle is
  // today's real anxiety tool.
  if (loudest.includes("anxious")) {
    return result(
      "ground-and-settle",
      "Anxious was the loudest thing you flagged, so let's settle the body first.",
      ["one-small-action", "task-decomposer"]
    );
  }

  // 10. "Surprise me" — date-seeded, reproducible, never random.
  if (want === "surprise") {
    const idx = seededIndex(seedKey, SURPRISE_POOL.length);
    const moduleId = SURPRISE_POOL[idx];
    const rest = SURPRISE_POOL.filter((id) => id !== moduleId).slice(0, 2);
    return result(
      moduleId,
      "You asked us to pick. This is today's pick — same day, same pick, if you check back.",
      rest
    );
  }

  // 11. Fallback — nothing above matched (e.g. "just log it" with a flat
  // or good state and nothing loud). Offer the gentlest starting point.
  return result(
    "one-small-action",
    "Nothing urgent stood out, so here's a gentle starting point. Pick something else below if it fits better.",
    ["ground-and-settle", "values-to-action"]
  );
}
