import { describe, expect, it } from "vitest";
import { seededIndex } from "./seed";

describe("seededIndex", () => {
  it("is deterministic for the same seed and bank size", () => {
    const a = seededIndex("2026-01-01:user-1", 10);
    const b = seededIndex("2026-01-01:user-1", 10);
    expect(a).toBe(b);
  });

  it("always returns an index within [0, bankSize)", () => {
    for (const seed of ["a", "2026-01-01", "2026-01-01:user-42", ""]) {
      const idx = seededIndex(seed, 7);
      expect(idx).toBeGreaterThanOrEqual(0);
      expect(idx).toBeLessThan(7);
    }
  });

  it("varies across different seeds (not a constant function)", () => {
    const values = new Set(
      Array.from({ length: 20 }, (_, i) => seededIndex(`seed-${i}`, 1000))
    );
    expect(values.size).toBeGreaterThan(1);
  });

  it("varies across different dates for the same user", () => {
    const a = seededIndex("2026-01-01:user-1", 40);
    const b = seededIndex("2026-01-02:user-1", 40);
    // Not guaranteed to differ for every pair, but for this fixed pair it does —
    // pinning the observed value guards against an accidental constant-hash regression.
    expect(a).not.toBe(b);
  });
});
