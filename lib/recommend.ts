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
  },
  "task-decomposer": {
    moduleId: "task-decomposer",
    title: "Task Decomposer",
    description:
      "Turn one goal into small, observable steps — starting with one under two minutes.",
  },
  "one-small-action": {
    moduleId: "one-small-action",
    title: "One Small Action",
    description:
      "One achievable, kind, or connecting action — sized for today, whatever today looks like.",
  },
  "safety-gateway": {
    moduleId: "safety-gateway",
    title: "Safety Gateway",
    description:
      "A calm, always-available route to real help — emergency, overdose, withdrawal, and local services.",
  },
  "trigger-map": {
    moduleId: "trigger-map",
    title: "Trigger & Support Map",
    description:
      "Map what tends to come before an urge, pre-choose an alternative, and name who you'd contact.",
  },
  "values-to-action": {
    moduleId: "values-to-action",
    title: "Values to Action",
    description:
      "Not what you should do — what matters to you. Then one tiny, voluntary step toward it.",
  },
  "time-container": {
    moduleId: "time-container",
    title: "Time Container",
    description:
      "One block of focus with a soft start and a soft landing. The container does the holding.",
  },
  "priority-lens": {
    moduleId: "priority-lens",
    title: "Priority Lens",
    description:
      "When everything feels urgent: sort each task through one lens and get a list of three, never a wall.",
  },
  "energy-aware-week": {
    moduleId: "energy-aware-week",
    title: "Energy-Aware Week",
    description:
      "A week planned from your real capacity, not an ideal one. Move or drop anything, no penalty.",
  },
  "ride-the-wave": {
    moduleId: "ride-the-wave",
    title: "Ride the Wave",
    description:
      "A timed container for an urge or spike — something to do while it passes, not a plan for later.",
  },
  "card-deck": {
    moduleId: "card-deck",
    title: "Card Deck",
    description:
      "Swipe away unhelpful self-talk, keep the supportive. Sixty seconds, no typing.",
  },
  "whats-blocking-me": {
    moduleId: "whats-blocking-me",
    title: "What's Blocking Me?",
    description:
      "Name the friction and get routed straight to the tool built for it.",
  },
  "grounding-54321": {
    moduleId: "grounding-54321",
    title: "5-4-3-2-1",
    description:
      "A guided sensory countdown — five things you see, down to one thing you taste.",
  },
  "before-after": {
    moduleId: "before-after",
    title: "Before / After",
    description:
      "Rate your mood, do one small thing, rate it again — watch doing lift mood.",
  },
  "worry-sorter": {
    moduleId: "worry-sorter",
    title: "Worry Sorter",
    description:
      "You classify the worry — actionable, uncertain, or needs real help — and get routed accordingly.",
  },
  "worry-window": {
    moduleId: "worry-window",
    title: "Worry Window",
    description:
      "Park a worry to a set time you choose, with something small to refocus on meanwhile.",
  },
  "body-settle": {
    moduleId: "body-settle",
    title: "Body Settle",
    description:
      "Progressive muscle release — tense one group at a time, then let it all go.",
  },
  "cool-the-storm": {
    moduleId: "cool-the-storm",
    title: "Cool the Storm",
    description:
      "Paced breathing, slow movement, and a long release — no physical shock, ever.",
  },
  "focus-setup": {
    moduleId: "focus-setup",
    title: "Focus Setup",
    description:
      "An environment checklist before you start — friction removed before it's needed.",
  },
  "gentle-rhythm": {
    moduleId: "gentle-rhythm",
    title: "Gentle Rhythm",
    description:
      "Rebuild routine without a rigid schedule — pick anchors for today, no times attached.",
  },
  "problem-ladder": {
    moduleId: "problem-ladder",
    title: "Problem Ladder",
    description:
      "Vague dread, narrowed down: the whole thing → one piece → one doable move.",
  },
};

/**
 * Modules the "surprise me" rule (§13 item 10) is allowed to pick from.
 * Deliberately excludes the vault (needs consent), Safety Gateway (never
 * something to stumble into by chance), Ride the Wave (targeted at an
 * urge someone didn't say they have), and What's Blocking Me? (a router,
 * not something to land on at random).
 */
const SURPRISE_POOL: ModuleId[] = [
  "ground-and-settle",
  "one-small-action",
  "values-to-action",
  "time-container",
  "priority-lens",
  "energy-aware-week",
  "grounding-54321",
  "card-deck",
  "before-after",
  "body-settle",
  "gentle-rhythm",
  "problem-ladder",
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
  if (state === "rough" && loudest.includes("craving")) {
    return result(
      "ride-the-wave",
      "You said it's rough right now and craving is loud — this is the one for holding on.",
      ["trigger-map", "ground-and-settle"]
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
  if (want === "urge") {
    return result(
      "ride-the-wave",
      "You said you want to get through this urge. This is a timed container built for exactly that.",
      ["trigger-map", "ground-and-settle"]
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
  if (want === "start") {
    return result(
      "whats-blocking-me",
      "You said you want help starting. Let's name what's actually in the way first.",
      ["task-decomposer", "priority-lens"]
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
  if (loudest.includes("anxious")) {
    return result(
      "card-deck",
      "Anxious was the loudest thing you flagged — a quick pass through the deck can take the edge off the noise.",
      ["ground-and-settle", "grounding-54321"]
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
