/**
 * The v2 check-in taxonomy.
 *
 * Tap-first, no sliders (redesign §5). This file is the single source of
 * truth for the check-in's shape — the check-in UI, the recommender, and
 * the Ledger all import from here rather than repeating string unions.
 */

export type CheckInState = "rough" | "low" | "flat" | "okay" | "good";

export const STATES: { value: CheckInState; label: string; emoji: string }[] = [
  { value: "rough", label: "Rough", emoji: "🌧️" },
  { value: "low", label: "Low", emoji: "🌥️" },
  { value: "flat", label: "Flat", emoji: "😐" },
  { value: "okay", label: "Okay", emoji: "🙂" },
  { value: "good", label: "Good", emoji: "☀️" },
];

/** Order matters for the Year Grid's colour ramp and for tie-breaks. */
export const STATE_ORDER: CheckInState[] = ["rough", "low", "flat", "okay", "good"];

export const STATE_COLOR: Record<CheckInState, string> = {
  rough: "bg-coral",
  low: "bg-sand",
  flat: "bg-surface-2",
  okay: "bg-mint",
  good: "bg-teal",
};

export type Loudest =
  | "anxious"
  | "cant_start"
  | "empty"
  | "craving"
  | "restless"
  | "angry"
  | "numb"
  | "overwhelmed"
  | "cant_sleep"
  | "fine";

export const LOUDEST_OPTIONS: { value: Loudest; label: string }[] = [
  { value: "anxious", label: "Anxious" },
  { value: "cant_start", label: "Can't start" },
  { value: "empty", label: "Empty" },
  { value: "craving", label: "Craving" },
  { value: "restless", label: "Restless" },
  { value: "angry", label: "Angry" },
  { value: "numb", label: "Numb" },
  { value: "overwhelmed", label: "Overwhelmed" },
  { value: "cant_sleep", label: "Can't sleep" },
  { value: "fine", label: "Fine" },
];

export const MAX_LOUDEST = 3;

/** Default context chip set. User-customisable later; fixed for now. */
export const DEFAULT_CONTEXT_CHIPS: string[] = [
  "Slept badly",
  "Ate",
  "Moved",
  "Saw someone",
  "Alone all day",
  "Work",
  "Family",
  "Money",
  "Health",
  "Screen all day",
];

export type Want = "calm" | "start" | "lift" | "urge" | "log" | "surprise";

export const WANT_OPTIONS: { value: Want; label: string }[] = [
  { value: "calm", label: "Calm me down" },
  { value: "start", label: "Help me start" },
  { value: "lift", label: "Lift me a bit" },
  { value: "urge", label: "Get through this urge" },
  { value: "log", label: "Just log it" },
  { value: "surprise", label: "Surprise me" },
];

export type CheckIn = {
  state: CheckInState;
  loudest: Loudest[];
  context: string[];
  want: Want | null;
};

export function stateLabel(state: CheckInState): string {
  return STATES.find((s) => s.value === state)?.label ?? state;
}

export function stateEmoji(state: CheckInState): string {
  return STATES.find((s) => s.value === state)?.emoji ?? "•";
}

export function loudestLabel(value: string): string {
  return LOUDEST_OPTIONS.find((l) => l.value === value)?.label ?? value;
}
