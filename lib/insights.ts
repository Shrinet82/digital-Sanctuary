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

export type SessionRow = {
  module_id: string;
  outcome: string | null;
  rating_before: number | null;
  rating_after: number | null;
  was_helpful: boolean | null;
  started_at: string;
};

export type CheckInRow = {
  distress: number | null;
  energy: number | null;
  created_at: string;
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
  /** Mean distress that day, if any check-in recorded it. */
  distress: number | null;
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

    const dayCheckIns = checkIns.filter(
      (c) => c.created_at.slice(0, 10) === key && c.distress !== null
    );
    const distress =
      dayCheckIns.length > 0
        ? Math.round(
            (dayCheckIns.reduce((a, c) => a + (c.distress as number), 0) /
              dayCheckIns.length) *
              10
          ) / 10
        : null;

    out.push({
      date: key,
      label: d.toLocaleDateString(undefined, { weekday: "short" }),
      distress,
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
 * Compares mean distress on days a factor was high vs low.
 * Descriptive only — deliberately worded to avoid implying causation.
 */
export function factorObservations(
  checkIns: CheckInRow[],
  factors: FactorRow[]
): Observation[] {
  const observations: Observation[] = [];

  // Mean distress per day.
  const distressByDay = new Map<string, number[]>();
  for (const c of checkIns) {
    if (c.distress === null) continue;
    const key = c.created_at.slice(0, 10);
    const list = distressByDay.get(key) ?? [];
    list.push(c.distress);
    distressByDay.set(key, list);
  }
  const dayMean = (key: string) => {
    const list = distressByDay.get(key);
    if (!list?.length) return null;
    return list.reduce((a, b) => a + b, 0) / list.length;
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
      .map((r) => ({ value: r.value as number, distress: dayMean(r.log_date) }))
      .filter((p) => p.distress !== null) as {
      value: number;
      distress: number;
    }[];

    if (paired.length < MIN_SAMPLE) continue;

    const median = [...paired].sort((a, b) => a.value - b.value)[
      Math.floor(paired.length / 2)
    ].value;

    const high = paired.filter((p) => p.value >= median);
    const low = paired.filter((p) => p.value < median);
    if (high.length < 2 || low.length < 2) continue;

    const meanOf = (arr: typeof paired) =>
      arr.reduce((a, p) => a + p.distress, 0) / arr.length;
    const diff = meanOf(low) - meanOf(high);

    // Ignore differences too small to mean anything.
    if (Math.abs(diff) < 1) continue;

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
