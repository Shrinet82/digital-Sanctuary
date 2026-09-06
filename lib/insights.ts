/**
 * The insights engine.
 *
 * HARD RULES (docs/08-tracking-and-insights.md):
 *   * No streaks, scores, or pass/fail days. Ever.
 *   * Every observation is computed from the user's OWN numbers by a
 *     transparent rule, and states the sample it came from.
 *   * We describe, we never diagnose, predict, or claim causation.
 *   * If there isn't enough data, we say so instead of inventing a pattern.
 */

import { getFactor } from "./factors";
import { dominantState } from "./ledger";
import type { CheckInState } from "./checkin";

export type SessionRow = {
  module_id: string;
  outcome: string | null;
  rating_before: number | null;
  rating_after: number | null;
  was_helpful: boolean | null;
  started_at: string;
};

export type CheckInRow = {
  log_date: string;
  state: CheckInState;
  context: string[];
  created_at: string;
};

/** Internal-only ordering for comparisons below — never shown to the user as a number. */
const SEVERITY: Record<CheckInState, number> = {
  rough: 0,
  low: 1,
  flat: 2,
  okay: 3,
  good: 4,
};

export type FactorRow = {
  log_date: string;
  factor_key: string;
  value: number | null;
};

/** Minimum observations before we'll describe a pattern at all. */
export const MIN_SAMPLE = 4;

/* ------------------------------------------------------------ */
/* What helps me most                                            */
/* ------------------------------------------------------------ */

export type HelpfulEntry = {
  moduleId: string;
  timesUsed: number;
  timesHelpful: number;
  /** Mean drop in rating, when before/after were both recorded. */
  averageEase: number | null;
};

export function whatHelpsMost(sessions: SessionRow[]): HelpfulEntry[] {
  const byModule = new Map<string, SessionRow[]>();
  for (const s of sessions) {
    const list = byModule.get(s.module_id) ?? [];
    list.push(s);
    byModule.set(s.module_id, list);
  }

  const entries: HelpfulEntry[] = [];
  for (const [moduleId, rows] of byModule) {
    const eased = rows
      .filter((r) => r.rating_before !== null && r.rating_after !== null)
      .map((r) => (r.rating_before as number) - (r.rating_after as number));

    entries.push({
      moduleId,
      timesUsed: rows.length,
      timesHelpful: rows.filter((r) => r.was_helpful === true).length,
      averageEase:
        eased.length > 0
          ? Math.round((eased.reduce((a, b) => a + b, 0) / eased.length) * 10) / 10
          : null,
    });
  }

  // Most-eased first, then most-used. Not a leaderboard — a memory aid.
  return entries.sort((a, b) => {
    const ea = a.averageEase ?? -Infinity;
    const eb = b.averageEase ?? -Infinity;
    if (eb !== ea) return eb - ea;
    return b.timesUsed - a.timesUsed;
  });
}

/* ------------------------------------------------------------ */
/* Weekly shape (soft bars, no pass/fail)                        */
/* ------------------------------------------------------------ */

export type DayBar = {
  date: string;
  label: string;
  /** That day's dominant state (§6.1), if any check-in recorded one. */
  state: CheckInState | null;
  /** How many practices happened that day. Presence, not performance. */
  practices: number;
};

export function weeklyShape(
  checkIns: CheckInRow[],
  sessions: SessionRow[],
  days = 7
): DayBar[] {
  const out: DayBar[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);

    const dayCheckIns = checkIns.filter((c) => c.log_date === key);

    out.push({
      date: key,
      label: d.toLocaleDateString(undefined, { weekday: "short" }),
      state: dominantState(dayCheckIns),
      practices: sessions.filter((s) => s.started_at.slice(0, 10) === key).length,
    });
  }
  return out;
}

/* ------------------------------------------------------------ */
/* Gentle observations                                           */
/* ------------------------------------------------------------ */

export type Observation = {
  text: string;
  /** Always shown, so the user can see the rule that produced this. */
  basis: string;
};

/**
 * Compares dominant-state severity on days a factor was high vs low.
 * Descriptive only — deliberately worded to avoid implying causation.
 */
export function factorObservations(
  checkIns: CheckInRow[],
  factors: FactorRow[]
): Observation[] {
  const observations: Observation[] = [];

  // Dominant state per day, converted to an internal severity number purely
  // so we can compare "high factor days" vs "low factor days" — never shown
  // to the user as a number.
  const byDay = new Map<string, CheckInRow[]>();
  for (const c of checkIns) {
    const list = byDay.get(c.log_date) ?? [];
    list.push(c);
    byDay.set(c.log_date, list);
  }
  const dayMean = (key: string) => {
    const rows = byDay.get(key);
    if (!rows?.length) return null;
    const state = dominantState(rows);
    return state ? SEVERITY[state] : null;
  };

  const byFactor = new Map<string, FactorRow[]>();
  for (const f of factors) {
    if (f.value === null) continue;
    const list = byFactor.get(f.factor_key) ?? [];
    list.push(f);
    byFactor.set(f.factor_key, list);
  }

  for (const [key, rows] of byFactor) {
    const factor = getFactor(key);
    if (!factor) continue;

    // Only use days where we have both a factor value and a check-in.
    const paired = rows
      .map((r) => ({ value: r.value as number, severity: dayMean(r.log_date) }))
      .filter((p) => p.severity !== null) as {
      value: number;
      severity: number;
    }[];

    if (paired.length < MIN_SAMPLE) continue;

    const median = [...paired].sort((a, b) => a.value - b.value)[
      Math.floor(paired.length / 2)
    ].value;

    const high = paired.filter((p) => p.value >= median);
    const low = paired.filter((p) => p.value < median);
    if (high.length < 2 || low.length < 2) continue;

    // Severity runs low-to-high as rough→good, so "high factor days felt
    // easier" means their mean severity is the bigger of the two.
    const meanOf = (arr: typeof paired) =>
      arr.reduce((a, p) => a + p.severity, 0) / arr.length;
    const diff = meanOf(high) - meanOf(low);

    // Ignore differences too small to mean anything.
    if (Math.abs(diff) < 0.5) continue;

    const easier = diff > 0;
    const direction = factor.higherIsBetter === false ? !easier : easier;

    observations.push({
      text: direction
        ? `On days with more ${factor.label.toLowerCase()}, you tended to rate things as feeling easier.`
        : `On days with more ${factor.label.toLowerCase()}, you tended to rate things as feeling harder.`,
      basis: `Based on ${paired.length} days where you logged both. A description of your own notes — not a cause, and not a medical claim.`,
    });
  }

  return observations;
}

/** Honest empty-state copy, so we never fake a pattern. */
export function notEnoughYet(count: number): string {
  const needed = Math.max(0, MIN_SAMPLE - count);
  if (count === 0) {
    return "Nothing here yet. Once you've logged a few days, this fills in — and it'll only ever describe your own notes back to you.";
  }
  return `${count} day${count === 1 ? "" : "s"} logged. Around ${needed} more and patterns start being worth showing — before that, anything here would just be noise.`;
}
