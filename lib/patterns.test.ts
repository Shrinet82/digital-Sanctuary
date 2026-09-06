import { describe, expect, it } from "vitest";
import { firstReflection, weekReflection, type DayLog } from "./patterns";
import type { CheckInState } from "./checkin";

function day(log_date: string, state: CheckInState, context: string[] = []): DayLog {
  return { log_date, state, context };
}

describe("firstReflection (§12 — day 3 through day 6)", () => {
  it("says nothing before 3 distinct days are logged", () => {
    expect(firstReflection([day("2026-01-01", "flat"), day("2026-01-02", "okay")])).toBeNull();
  });

  it("hands off to weekReflection once 7 days are logged", () => {
    const days = Array.from({ length: 7 }, (_, i) => day(`2026-01-0${i + 1}`, "okay"));
    expect(firstReflection(days)).toBeNull();
  });

  it("counts distinct days once there are 3-6, describing states low-to-high", () => {
    const text = firstReflection([
      day("2026-01-01", "flat"),
      day("2026-01-02", "flat"),
      day("2026-01-03", "okay"),
    ]);
    expect(text).toContain("three days logged");
    expect(text).toContain("Two were flat");
    expect(text).toContain("one was okay");
  });

  it("collapses multiple check-ins on the same log_date into one day", () => {
    const text = firstReflection([
      day("2026-01-01", "flat"),
      day("2026-01-01", "good"), // second check-in same day — dominant state wins, not double-counted
      day("2026-01-02", "okay"),
      day("2026-01-03", "okay"),
    ]);
    expect(text).toMatch(/^three days logged/);
  });

  it("never states a co-occurrence as causal — only 'noted', never 'because' or 'caused'", () => {
    const text = firstReflection([
      day("2026-01-01", "flat"),
      day("2026-01-02", "flat"),
      day("2026-01-03", "good", ["Moved"]),
    ])!;
    expect(text.toLowerCase()).not.toMatch(/because|caused|due to/);
    expect(text).toContain('"moved" noted');
  });
});

describe("weekReflection (§12 — day 7+)", () => {
  it("says nothing before 7 distinct days", () => {
    const days = Array.from({ length: 6 }, (_, i) => day(`2026-01-0${i + 1}`, "okay"));
    expect(weekReflection(days, 0)).toBeNull();
  });

  it("summarises the most recent 7 days once there are at least 7", () => {
    const days = Array.from({ length: 10 }, (_, i) =>
      day(`2026-01-${String(i + 1).padStart(2, "0")}`, "good")
    );
    const text = weekReflection(days, 3);
    expect(text).toContain("A week logged");
    expect(text).toContain("Seven were good");
    expect(text).toContain("three time");
  });

  it("omits the practice line when nothing was practiced", () => {
    const days = Array.from({ length: 7 }, (_, i) => day(`2026-01-0${i + 1}`, "flat"));
    const text = weekReflection(days, 0)!;
    expect(text).not.toMatch(/time/);
  });
});
