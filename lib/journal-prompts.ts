/**
 * Rung 3 of the gradual journal (§6.2): one prompted sentence.
 *
 * Selected deterministically by date — day N always shows the same prompt,
 * so it's reproducible and testable, never random (§13 "Daily rotation").
 * This is a starter bank; the redesign calls for ~200 — grow this array
 * over time, the selection mechanism doesn't change.
 */
import { seededIndex } from "./seed";

export const RUNG3_PROMPTS: string[] = [
  "What took the most out of you today?",
  "Anything go slightly better than expected?",
  "Who did you speak to?",
  "What did today ask of you?",
  "What's one thing you noticed about your body today?",
  "What did you avoid today, if anything?",
  "What's something small that helped, even a little?",
  "What would you tell a friend who had your day?",
  "What are you carrying into tomorrow?",
  "What felt heavier than it should have?",
  "Was there a moment you felt more like yourself?",
  "What did you not have the energy for today?",
  "What's one thing you're glad is over?",
  "Did anything surprise you today?",
  "What's something you did even though it was hard?",
  "What did you need today that you didn't get?",
  "What's a small thing that went right?",
  "What are you putting off, and why?",
  "What's one word for today?",
  "What did you do for no reason other than it helped?",
  "Who or what got you through today?",
  "What's something you're proud of, even if it's tiny?",
  "What felt different about today compared to yesterday?",
  "What's weighing on you right now?",
  "What did you notice about your energy today?",
  "What's one thing that made today easier?",
  "What's something you wish had gone differently?",
  "What did you choose not to do today, on purpose?",
  "What's a thought that kept coming back today?",
  "What's something true about today that isn't obvious from the outside?",
  "What did you do today that you'd do again?",
  "What's something you're avoiding thinking about?",
  "What kept you company today — a person, a task, a thought?",
  "What's one thing that felt like progress, however small?",
  "What did today cost you?",
  "What's something you noticed but didn't say out loud?",
  "What's one thing you'd change about today if you could?",
  "What did you do today just for you?",
  "What's a small kindness — to yourself or someone else — from today?",
  "What's still unresolved from today?",
];

/** Day N always shows the same prompt — reproducible, testable, never random. */
export function promptForDate(dateStr: string): string {
  return RUNG3_PROMPTS[seededIndex(dateStr, RUNG3_PROMPTS.length)];
}
