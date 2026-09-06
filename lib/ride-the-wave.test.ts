import { describe, expect, it } from "vitest";
import { WAVE_ACTIVITY_BANK, WAVE_KINDS, pickActivity, pickKind } from "./ride-the-wave";

const FORBIDDEN = /\b(cold|ice|pain|hurt|pinch|snap|rubber band|shock)\b/i;

describe("Ride the Wave activity bank (§7 content rules)", () => {
  it("contains nothing involving pain, cold shock, or sensory punishment", () => {
    for (const activities of Object.values(WAVE_ACTIVITY_BANK)) {
      for (const activity of activities) {
        expect(activity.instructions).not.toMatch(FORBIDDEN);
        expect(activity.title).not.toMatch(FORBIDDEN);
      }
    }
  });

  it("has at least one activity for every kind", () => {
    for (const kind of WAVE_KINDS) {
      expect(WAVE_ACTIVITY_BANK[kind.value].length).toBeGreaterThan(0);
    }
  });
});

describe("pickActivity / pickKind", () => {
  it("pickActivity is deterministic for a fixed seed", () => {
    const a = pickActivity("comfort", "2026-01-01:comfort:0");
    const b = pickActivity("comfort", "2026-01-01:comfort:0");
    expect(a).toEqual(b);
  });

  it("pickKind always returns one of the four defined kinds", () => {
    const kinds = new Set(WAVE_KINDS.map((k) => k.value));
    for (let round = 0; round < 10; round++) {
      expect(kinds.has(pickKind(`2026-01-01:${round}`))).toBe(true);
    }
  });
});
