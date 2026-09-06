import { describe, expect, it } from "vitest";
import { PATH, pathContentForDay, pathDayNumber } from "./path";

describe("pathDayNumber", () => {
  const now = new Date("2026-01-15T12:00:00Z");

  it("is day 1 on the signup day itself", () => {
    expect(pathDayNumber("2026-01-15T03:00:00Z", now)).toBe(1);
  });

  it("counts calendar days elapsed, not hours", () => {
    expect(pathDayNumber("2026-01-14T23:59:00Z", now)).toBe(2);
    expect(pathDayNumber("2026-01-08T00:00:00Z", now)).toBe(8);
  });

  it("returns 14 on exactly the last day of the Path", () => {
    expect(pathDayNumber("2026-01-02T00:00:00Z", now)).toBe(14);
  });

  it("returns null once past day 14 — the Path has nothing left to offer", () => {
    expect(pathDayNumber("2026-01-01T00:00:00Z", now)).toBeNull();
  });

  it("returns null rather than a negative day for a (nonsensical) future signup timestamp", () => {
    expect(pathDayNumber("2026-01-20T00:00:00Z", now)).toBeNull();
  });
});

describe("PATH content", () => {
  it("has exactly 14 days, numbered 1 through 14 with no gaps", () => {
    expect(PATH.map((p) => p.day)).toEqual(Array.from({ length: 14 }, (_, i) => i + 1));
  });

  it("every day has a non-empty title, blurb, and a resolvable-looking href", () => {
    for (const day of PATH) {
      expect(day.title.length).toBeGreaterThan(0);
      expect(day.blurb.length).toBeGreaterThan(0);
      expect(day.cta.href.startsWith("/")).toBe(true);
    }
  });

  it("pathContentForDay looks up the right day", () => {
    expect(pathContentForDay(5)?.title).toBe("Build your Safety Net");
    expect(pathContentForDay(99)).toBeUndefined();
  });
});
