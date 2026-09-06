/**
 * The Card Deck — redesign §11 / §17.
 *
 * Cognitive Bias Modification's formal trial evidence didn't hold up under
 * later, better trials (grade C in the evidence register). Decision, made
 * with the consulting psychiatrist: ship it, but frame it to the user as
 * self-affirmation, never as treatment. The UI copy carries that framing —
 * this file only holds the content and the deterministic selection.
 *
 * There is no "correct" swipe. `register` groups cards by theme for variety
 * across sessions; it is not a right answer the user is scored against.
 */
import { seededIndex } from "./seed";

export type CardTheme =
  | "perfectionism"
  | "catastrophising"
  | "self_blame"
  | "mind_reading"
  | "all_or_nothing";

export type Card = { text: string; theme: CardTheme };

export const CARD_BANK: Card[] = [
  // perfectionism
  { text: "If I can't do it perfectly there's no point.", theme: "perfectionism" },
  { text: "I've done hard things before.", theme: "perfectionism" },
  { text: "Good enough, done, beats perfect, unfinished.", theme: "perfectionism" },
  { text: "One mistake undoes everything I've done right.", theme: "perfectionism" },
  { text: "Progress doesn't have to look impressive to count.", theme: "perfectionism" },
  { text: "I should be better at this by now.", theme: "perfectionism" },

  // catastrophising
  { text: "This one bad moment means everything is falling apart.", theme: "catastrophising" },
  { text: "Most of what I worry about doesn't happen.", theme: "catastrophising" },
  { text: "I can handle hard things one piece at a time.", theme: "catastrophising" },
  { text: "This feeling is a fact about how things will go.", theme: "catastrophising" },
  { text: "Feeling this doesn't mean it's true.", theme: "catastrophising" },
  { text: "If this goes wrong, it'll be unbearable.", theme: "catastrophising" },

  // self-blame
  { text: "Everyone can tell I'm struggling.", theme: "self_blame" },
  { text: "Struggling with something hard isn't a character flaw.", theme: "self_blame" },
  { text: "This is my fault, all of it.", theme: "self_blame" },
  { text: "I'm allowed to be having a hard time.", theme: "self_blame" },
  { text: "A good day doesn't erase the hard ones, and neither does a hard one erase the good.", theme: "self_blame" },
  { text: "I should have known better.", theme: "self_blame" },

  // mind-reading
  { text: "They're judging me right now.", theme: "mind_reading" },
  { text: "I don't actually know what anyone else is thinking.", theme: "mind_reading" },
  { text: "People are mostly thinking about themselves, not me.", theme: "mind_reading" },
  { text: "Silence from someone means they're upset with me.", theme: "mind_reading" },
  { text: "I can ask, instead of guessing.", theme: "mind_reading" },
  { text: "My worst guess about what they think usually isn't right.", theme: "mind_reading" },

  // all-or-nothing
  { text: "If I can't do all of it, I shouldn't start.", theme: "all_or_nothing" },
  { text: "Some is better than none.", theme: "all_or_nothing" },
  { text: "Either I'm fine or I'm a complete mess — there's no in between.", theme: "all_or_nothing" },
  { text: "Most days are somewhere in the middle, and that's normal.", theme: "all_or_nothing" },
  { text: "Missing one day undoes all the others.", theme: "all_or_nothing" },
  { text: "One off day doesn't cancel the rest.", theme: "all_or_nothing" },
];

export const DECK_SIZE = 15;

/**
 * Deterministic per-day deck: a stable shuffle of the full bank, seeded by
 * date (+user when known), then the first DECK_SIZE. Same day, same person,
 * same deck — reproducible and testable, never random (§13).
 */
export function dailyDeck(seedKey: string): Card[] {
  const withKeys = CARD_BANK.map((card, i) => ({
    card,
    key: seededIndex(`${seedKey}:${i}`, 1_000_000),
  }));
  withKeys.sort((a, b) => a.key - b.key);
  return withKeys.slice(0, DECK_SIZE).map((w) => w.card);
}
