/**
 * Ride the Wave — urge surfing (Marlatt & Gordon, Relapse Prevention, 1985).
 * Redesign §7. A timed container for the urge itself, not a plan for later.
 *
 * Content rules from §7, non-negotiable:
 *   - authored by us, nothing involving pain, cold shock, or sensory
 *     punishment — those are substitution, not regulation.
 *   - doable in a small room, alone, on a phone, no equipment or money.
 */
import { seededIndex } from "./seed";

export type WaveTarget = "craving" | "panic" | "lash_out" | "disappear" | "other";

export const WAVE_TARGETS: { value: WaveTarget; label: string }[] = [
  { value: "craving", label: "Craving" },
  { value: "panic", label: "Panic" },
  { value: "lash_out", label: "The urge to lash out" },
  { value: "disappear", label: "The urge to disappear" },
  { value: "other", label: "Something else" },
];

export type WaveDuration = 2 | 5 | 15;

export const WAVE_DURATIONS: { value: WaveDuration; label: string }[] = [
  { value: 2, label: "2 minutes" },
  { value: 5, label: "5 minutes" },
  { value: 15, label: "15 minutes" },
];

export type WaveKind = "comfort" | "distract" | "move" | "express";

export const WAVE_KINDS: { value: WaveKind; label: string; emoji: string }[] = [
  { value: "comfort", label: "Comfort", emoji: "🫂" },
  { value: "distract", label: "Distract", emoji: "🧩" },
  { value: "move", label: "Move", emoji: "🚶" },
  { value: "express", label: "Express", emoji: "📣" },
];

export type WaveActivity = { title: string; instructions: string };

export const WAVE_ACTIVITY_BANK: Record<WaveKind, WaveActivity[]> = {
  comfort: [
    {
      title: "Weight and warmth",
      instructions:
        "Wrap a blanket, jacket, or towel around your shoulders. Hold it closed at the front. Notice the weight of it, and how your breathing feels underneath it.",
    },
    {
      title: "Warm hands",
      instructions:
        "Hold something warm — a mug, your own hands cupped together, a warm cloth. Just notice the warmth moving into your palms. Nothing else to do.",
    },
    {
      title: "Steady pressure",
      instructions:
        "Press your palms together firmly in front of your chest and hold, like you're pushing against something solid. Notice the effort in your arms. Release slowly. Repeat.",
    },
  ],
  distract: [
    {
      title: "Count backward",
      instructions:
        "Count backward from 100 by 7s: 100, 93, 86… If you lose your place, that's fine — start again from wherever you land.",
    },
    {
      title: "Name everything",
      instructions:
        "Pick a colour. Find and name every object you can see in that colour, out loud or in your head, for as long as the timer runs.",
    },
    {
      title: "Song titles",
      instructions:
        "List every song you know all the words to. When you run out, start naming films instead. Keep going until the timer ends.",
    },
  ],
  move: [
    {
      title: "Shake it out",
      instructions:
        "Stand up. Shake out your hands and arms for 20 seconds, rest for 10, then shake again. Let your whole upper body move loosely.",
    },
    {
      title: "Slow walk",
      instructions:
        "Walk slowly to the nearest door or window and back. Notice your feet touching the floor with each step. Repeat the walk until the timer ends.",
    },
    {
      title: "Shoulder rolls",
      instructions:
        "Roll your shoulders slowly backward ten times, then forward ten times. Let your arms hang loose. Repeat for as long as the timer runs.",
    },
  ],
  express: [
    {
      title: "Say it plainly",
      instructions:
        "Say out loud, in one sentence, exactly what you're feeling right now — even if it's just one word. Say it again if you need to. There's no wrong way to do this.",
    },
    {
      title: "Get it onto paper",
      instructions:
        "Write down every word that describes this feeling, in any order, without worrying if it makes sense. Cross nothing out.",
    },
    {
      title: "Hum it out",
      instructions:
        "Hum, sing, or repeat one line of a song you know, over and over, for as long as the timer runs. Volume doesn't matter.",
    },
  ],
};

const ALL_KINDS: WaveKind[] = ["comfort", "distract", "move", "express"];

/** "Just pick for me" on the kind screen — date+user seeded, never random. */
export function pickKind(seedKey: string): WaveKind {
  return ALL_KINDS[seededIndex(seedKey, ALL_KINDS.length)];
}

/** The single activity shown for a round — date+user+kind seeded, reproducible. */
export function pickActivity(kind: WaveKind, seedKey: string): WaveActivity {
  const bank = WAVE_ACTIVITY_BANK[kind];
  return bank[seededIndex(seedKey, bank.length)];
}

export function targetLabel(value: WaveTarget): string {
  return WAVE_TARGETS.find((t) => t.value === value)?.label ?? value;
}
