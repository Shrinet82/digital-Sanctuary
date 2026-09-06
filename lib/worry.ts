/**
 * Worry Sorter / Worry Window — redesign §10.
 *
 * Worry Sorter classification is a fixed 3-way choice the USER makes about
 * their own worry — the app routes on their answer, it never classifies
 * the worry itself. Worry Window's postponement is Borkovec's stimulus-
 * control worry postponement (evidence grade B).
 */
import { seededIndex } from "./seed";

export type WorryRoute = "actionable" | "uncertain" | "needs_help";

export const WORRY_ROUTES: { value: WorryRoute; label: string }[] = [
  { value: "actionable", label: "There's something I can actually do about this" },
  { value: "uncertain", label: "It's uncertain, or out of my control" },
  { value: "needs_help", label: "This feels like it needs real help" },
];

export type WorryWindowTime = "hour" | "evening" | "tomorrow" | "ledger";

export const WORRY_WINDOW_TIMES: { value: WorryWindowTime; label: string }[] = [
  { value: "hour", label: "In about an hour" },
  { value: "evening", label: "This evening" },
  { value: "tomorrow", label: "Tomorrow morning" },
  { value: "ledger", label: "I'll just check my Ledger" },
];

/** One thing to do while a parked worry waits. Short, doable anywhere. */
export const REFOCUS_PROMPTS: string[] = [
  "Notice three things you can see from where you're sitting.",
  "Unclench your jaw and drop your shoulders, on purpose.",
  "Name one thing that's going fine right now, even something small.",
  "Take five slower breaths than your last five.",
  "Look at something far away for ten seconds, then something close.",
  "Stretch your hands open, then close them slowly. Repeat twice.",
  "Notice the temperature of the air on your skin.",
  "Say one kind thing to yourself, the way you'd say it to a friend.",
];

export function refocusPrompt(seedKey: string): string {
  return REFOCUS_PROMPTS[seededIndex(seedKey, REFOCUS_PROMPTS.length)];
}
