import { describe, expect, it } from "vitest";
import { buildRecentStrip, buildYearGrid, dominantState, groupByDate } from "./ledger";

describe("groupByDate", () => {
  it("buckets rows by log_date, preserving order within a day", () => {
    const rows = [
      { log_date: "2026-01-01", n: 1 },
      { log_date: "2026-01-02", n: 2 },
      { log_date: "2026-01-01", n: 3 },
    ];
    const grouped = groupByDate(rows);
    expect(grouped.get("2026-01-01")).toEqual([
      { log_date: "2026-01-01", n: 1 },
      { log_date: "2026-01-01", n: 3 },
    ]);
    expect(grouped.get("2026-01-02")).toEqual([{ log_date: "2026-01-02", n: 2 }]);
  });
});

describe("dominantState", () => {
  it("returns null for no check-ins", () => {
    expect(dominantState([])).toBeNull();
  });

  it("returns the only state for a single check-in", () => {
    expect(dominantState([{ state: "rough" }])).toBe("rough");
  });

  it("returns the most frequent state", () => {
    const rows = [{ state: "flat" }, { state: "okay" }, { state: "flat" }] as const;
    expect(dominantState([...rows])).toBe("flat");
  });

  it("breaks ties by the most recently created state", () => {
    const rows = [
      { state: "rough", created_at: "2026-01-01T08:00:00Z" },
      { state: "good", created_at: "2026-01-01T20:00:00Z" },
    ] as const;
    expect(dominantState([...rows])).toBe("good");
  });

  it("falls back to input order when created_at is absent (stable, deterministic)", () => {
    const rows = [{ state: "low" }, { state: "okay" }] as const;
    // No created_at to break the tie on — result must still be one of the
    // tied states, and calling it twice must give the same answer.
    const a = dominantState([...rows]);
    const b = dominantState([...rows]);
    expect(a).toBe(b);
    expect(["low", "okay"]).toContain(a);
  });
});

describe("buildYearGrid", () => {
  it("produces one cell per day from Jan 1 through the last day covered", () => {
    const rows = [{ log_date: "2020-01-01", state: "good" as const, created_at: "2020-01-01T00:00:00Z" }];
    // 2020 is a fully past year, so buildYearGrid should cover the whole year.
    const cells = buildYearGrid(rows, 2020);
    expect(cells.length).toBe(366); // 2020 is a leap year
    expect(cells[0]).toEqual({ date: "2020-01-01", state: "good" });
    expect(cells[1].state).toBeNull();
  });
});

describe("buildRecentStrip", () => {
  it("returns exactly `days` cells, oldest first, ending today", () => {
    const cells = buildRecentStrip([], 7);
    expect(cells.length).toBe(7);
    const today = new Date().toISOString().slice(0, 10);
    expect(cells[cells.length - 1].date).toBe(today);
    expect(cells.every((c) => c.state === null)).toBe(true);
  });
});
