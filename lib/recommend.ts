/**
 * The recommendation engine.
 *
 * DETERMINISTIC BY DESIGN — see docs/09-safety-and-privacy.md.
 * Every recommendation comes from a fixed, inspectable rule and carries
 * a plain-language `reason` we show to the user. No AI decides anything
 * here, and nothing in this file infers a diagnosis or assesses risk.
 */

export type CheckIn = {
  distress: number | null;
  energy: number | null;
  attention: number | null;
  urge: number | null;
  mode: Mode | null;
};

export type Mode = "calm" | "act" | "plan" | "reflect" | "connect";

export type ModuleId =
  | "ground-and-settle"
  | "task-decomposer"
  | "one-small-action";

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
};

function pick(ids: ModuleId[]): Suggestion[] {
  return ids.map((id) => MODULES[id]);
}

/**
 * Returns one primary action plus up to two alternatives.
 * Rules are ordered: safety-relevant and lowest-effort options come first.
 */
export function recommend(checkIn: CheckIn): Recommendation {
  const distress = checkIn.distress ?? 0;
  const energy = checkIn.energy ?? 0;
  const attention = checkIn.attention ?? 0;
  const urge = checkIn.urge ?? 0;
  const mode = checkIn.mode;

  // Rule 1 — a strong urge: steady the body first, and keep support close.
  // (The full substance-use support plan arrives in Phase 5.)
  if (urge >= 8) {
    return {
      ...MODULES["ground-and-settle"],
      reason:
        "You marked your urge as strong, so we start with something steadying — and urgent help stays one tap away.",
      alternatives: pick(["one-small-action", "task-decomposer"]),
    };
  }

  // Rule 2 — high intensity with little energy: the smallest, calmest option.
  if (distress >= 8 && energy <= 3) {
    return {
      ...MODULES["ground-and-settle"],
      reason:
        "You said it feels very intense and your energy is low, so this asks the least of you.",
      alternatives: pick(["one-small-action", "task-decomposer"]),
    };
  }

  // Rule 3 — stuck or scattered: find the very next physical step.
  // NOTE: a skipped slider is `null`, which must NOT be read as 0 — otherwise
  // an empty check-in looks like "scattered attention" and we'd push a task
  // at someone who told us nothing. Only fire on an explicit low rating.
  const attentionGiven = checkIn.attention !== null;
  if (mode === "plan" || (attentionGiven && attention <= 3 && distress <= 6)) {
    return {
      ...MODULES["task-decomposer"],
      reason:
        "You wanted to get unstuck and focus felt scattered, so we start with one concrete next step.",
      alternatives: pick(["ground-and-settle", "one-small-action"]),
    };
  }

  // Rule 4 — wanting calm, or noticeable distress.
  if (mode === "calm" || distress >= 5) {
    return {
      ...MODULES["ground-and-settle"],
      reason:
        distress >= 5
          ? "Your intensity is in the moderate range, so settling the body first tends to help."
          : "You said you wanted to feel calmer, so let's start there.",
      alternatives: pick(["one-small-action", "task-decomposer"]),
    };
  }

  // Rule 5 — some capacity and a wish to do something.
  if (mode === "act" || mode === "connect" || (energy >= 4 && distress <= 5)) {
    return {
      ...MODULES["one-small-action"],
      reason:
        "You have some energy and wanted to do one small thing, so this is a good fit.",
      alternatives: pick(["ground-and-settle", "task-decomposer"]),
    };
  }

  // Default — nothing urgent stood out; offer the gentlest starting point.
  return {
    ...MODULES["ground-and-settle"],
    reason:
      "Nothing urgent stood out, so we start somewhere gentle. Pick any option below instead if it fits better.",
    alternatives: pick(["one-small-action", "task-decomposer"]),
  };
}

export const MODE_LABELS: { value: Mode; label: string; emoji: string }[] = [
  { value: "calm", label: "chill my nervous system", emoji: "🌊" },
  { value: "act", label: "do one small thing", emoji: "🌱" },
  { value: "plan", label: "get unstuck", emoji: "🧠" },
  { value: "reflect", label: "reflect privately", emoji: "📓" },
  { value: "connect", label: "feel less alone", emoji: "🫶" },
];

export function intensityLabel(v: number): string {
  if (v <= 1) return "Barely";
  if (v <= 3) return "A little";
  if (v <= 6) return "Moderate";
  if (v <= 8) return "High";
  return "Very high";
}
