/**
 * The trackable-factors catalog.
 *
 * Deliberately small and opt-in. Tracking everything is its own kind of
 * burden, so nothing is tracked unless the user turns it on.
 */

export type FactorKind = "hours" | "scale" | "yesno" | "count";

export type Factor = {
  key: string;
  label: string;
  emoji: string;
  kind: FactorKind;
  /** Shown under the control. */
  help?: string;
  min?: number;
  max?: number;
  /** Higher values are generally the pleasant direction. Used for wording only. */
  higherIsBetter?: boolean;
};

export const FACTORS: Factor[] = [
  {
    key: "sleep_hours",
    label: "Sleep",
    emoji: "😴",
    kind: "hours",
    help: "Roughly how many hours — a guess is fine.",
    min: 0,
    max: 12,
    higherIsBetter: true,
  },
  {
    key: "sleep_quality",
    label: "Sleep quality",
    emoji: "🛏️",
    kind: "scale",
    help: "How rested did you feel?",
    higherIsBetter: true,
  },
  {
    key: "movement",
    label: "Movement",
    emoji: "🚶",
    kind: "scale",
    help: "Any movement counts — a walk to the kitchen is movement.",
    higherIsBetter: true,
  },
  {
    key: "outside",
    label: "Time outside",
    emoji: "🌤️",
    kind: "scale",
    help: "Even standing by an open door.",
    higherIsBetter: true,
  },
  {
    key: "social",
    label: "Contact with people",
    emoji: "🫶",
    kind: "scale",
    help: "However much felt right for you today.",
    higherIsBetter: true,
  },
  {
    key: "meds_taken",
    label: "Medication",
    emoji: "💊",
    kind: "yesno",
    help: "Only if this is relevant to you.",
  },
  {
    key: "ate_regularly",
    label: "Ate regularly",
    emoji: "🍜",
    kind: "yesno",
  },
  {
    key: "pain",
    label: "Physical discomfort",
    emoji: "🩹",
    kind: "scale",
    help: "Pain, tension, or feeling unwell.",
    higherIsBetter: false,
  },
];

export function getFactor(key: string): Factor | undefined {
  return FACTORS.find((f) => f.key === key);
}

export function factorValueLabel(factor: Factor, value: number): string {
  switch (factor.kind) {
    case "hours":
      return `${value}h`;
    case "yesno":
      return value >= 1 ? "Yes" : "No";
    case "scale":
      if (value <= 1) return "Barely";
      if (value <= 3) return "A little";
      if (value <= 6) return "Some";
      if (value <= 8) return "A lot";
      return "Loads";
    default:
      return String(value);
  }
}
