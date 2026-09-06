import { describe, expect, it } from "vitest";
import { RUNG3_PROMPTS, promptForDate } from "./journal-prompts";

describe("promptForDate (§6.2 rung 3 — reproducible, never random)", () => {
  it("day N always shows the same prompt", () => {
    expect(promptForDate("2026-05-01")).toBe(promptForDate("2026-05-01"));
  });

  it("only ever returns a prompt from the bank", () => {
    for (const date of ["2026-01-01", "2026-12-31", "2027-02-14"]) {
      expect(RUNG3_PROMPTS).toContain(promptForDate(date));
    }
  });

  it("varies across different days", () => {
    const prompts = new Set(
      Array.from({ length: RUNG3_PROMPTS.length }, (_, i) =>
        promptForDate(`2026-01-${String((i % 28) + 1).padStart(2, "0")}`)
      )
    );
    expect(prompts.size).toBeGreaterThan(1);
  });
});
