import { describe, expect, it } from "vitest";
import { recommend, MODULES } from "./recommend";
import type { CheckIn } from "./checkin";

/** A blank check-in, overridden per test — mirrors "just log it" with nothing loud. */
function checkIn(overrides: Partial<CheckIn>): CheckIn {
  return { state: "okay", loudest: [], context: [], want: null, ...overrides };
}

describe("recommend — the deterministic rule chain (§13)", () => {
  it("rule 2: rough + craving → Ride the Wave, before the plain rough rule", () => {
    const r = recommend(checkIn({ state: "rough", loudest: ["craving"] }));
    expect(r.moduleId).toBe("ride-the-wave");
  });

  it("rule 3: rough on its own → Ground & Settle", () => {
    const r = recommend(checkIn({ state: "rough" }));
    expect(r.moduleId).toBe("ground-and-settle");
  });

  it("rule 4: want=urge → Ride the Wave, even when the state isn't rough", () => {
    const r = recommend(checkIn({ state: "flat", want: "urge" }));
    expect(r.moduleId).toBe("ride-the-wave");
  });

  it("rule 5: want=calm → Ground & Settle", () => {
    const r = recommend(checkIn({ want: "calm" }));
    expect(r.moduleId).toBe("ground-and-settle");
  });

  it("rule 6: want=start → What's Blocking Me?", () => {
    const r = recommend(checkIn({ want: "start" }));
    expect(r.moduleId).toBe("whats-blocking-me");
  });

  it("rule 7: want=lift → One Small Action", () => {
    const r = recommend(checkIn({ want: "lift" }));
    expect(r.moduleId).toBe("one-small-action");
  });

  it("rule 8: loudest includes can't-start → Task Decomposer", () => {
    const r = recommend(checkIn({ loudest: ["cant_start"] }));
    expect(r.moduleId).toBe("task-decomposer");
  });

  it("rule 9: loudest includes anxious → Card Deck", () => {
    const r = recommend(checkIn({ loudest: ["anxious"] }));
    expect(r.moduleId).toBe("card-deck");
  });

  it("rule 10: want=surprise is deterministic for a fixed seed", () => {
    const ci = checkIn({ want: "surprise" });
    const a = recommend(ci, "2026-01-01:user-1");
    const b = recommend(ci, "2026-01-01:user-1");
    expect(a.moduleId).toBe(b.moduleId);
  });

  it("rule 10: want=surprise varies by seed", () => {
    const ci = checkIn({ want: "surprise" });
    const picks = new Set(
      Array.from({ length: 15 }, (_, i) => recommend(ci, `2026-01-0${(i % 9) + 1}:user-1`).moduleId)
    );
    expect(picks.size).toBeGreaterThan(1);
  });

  it("rule 11: fallback when nothing else matched → One Small Action", () => {
    const r = recommend(checkIn({}));
    expect(r.moduleId).toBe("one-small-action");
  });

  it("every rule fires before the fallback when its condition holds, regardless of order in the object", () => {
    // Rough should win over a "want=lift" that would otherwise match rule 7 —
    // proves rule 3 really is evaluated before rule 7, not just reachable.
    const r = recommend(checkIn({ state: "rough", want: "lift" }));
    expect(r.moduleId).toBe("ground-and-settle");
  });

  it("every recommendation carries a non-empty reason and at most 2 alternatives, all resolvable modules", () => {
    const cases: CheckIn[] = [
      checkIn({ state: "rough", loudest: ["craving"] }),
      checkIn({ state: "rough" }),
      checkIn({ want: "urge" }),
      checkIn({ want: "calm" }),
      checkIn({ want: "start" }),
      checkIn({ want: "lift" }),
      checkIn({ loudest: ["cant_start"] }),
      checkIn({ loudest: ["anxious"] }),
      checkIn({ want: "surprise" }),
      checkIn({}),
    ];
    for (const ci of cases) {
      const r = recommend(ci, "2026-01-01:user-1");
      expect(r.reason.length).toBeGreaterThan(0);
      expect(r.alternatives.length).toBeLessThanOrEqual(2);
      expect(MODULES[r.moduleId]).toBeDefined();
      for (const alt of r.alternatives) {
        expect(MODULES[alt.moduleId]).toBeDefined();
      }
    }
  });
});
