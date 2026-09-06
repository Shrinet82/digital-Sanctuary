import { describe, expect, it } from "vitest";
import { CARD_BANK, DECK_SIZE, dailyDeck } from "./card-deck";

describe("dailyDeck", () => {
  it("returns exactly DECK_SIZE cards, all drawn from the bank with no duplicates", () => {
    const deck = dailyDeck("2026-01-01:user-1");
    expect(deck.length).toBe(DECK_SIZE);
    const texts = new Set(deck.map((c) => c.text));
    expect(texts.size).toBe(DECK_SIZE);
    for (const card of deck) {
      expect(CARD_BANK.some((c) => c.text === card.text)).toBe(true);
    }
  });

  it("is deterministic: same seed, same day → identical deck and order", () => {
    const a = dailyDeck("2026-03-14:user-7");
    const b = dailyDeck("2026-03-14:user-7");
    expect(a).toEqual(b);
  });

  it("varies the deck across different seeds", () => {
    const a = dailyDeck("2026-01-01:user-1");
    const b = dailyDeck("2026-06-15:user-2");
    expect(a).not.toEqual(b);
  });
});
