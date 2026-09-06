/**
 * The Ledger — computing the Year Grid from raw check-in rows.
 *
 * Nothing here is stored: a day's "dominant" state is always derived from
 * that day's check-ins at read time (redesign §6.1). Multiple check-ins a
 * day are normal; the Year Grid shows one colour per day, the day view
 * shows all of them.
 */

import type { CheckInState } from "./checkin";

export type CheckInLite = {
  log_date: string;
  state: CheckInState;
  created_at: string;
};

export function groupByDate<T extends { log_date: string }>(
  rows: T[]
): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const r of rows) {
    const list = map.get(r.log_date) ?? [];
    list.push(r);
    map.set(r.log_date, list);
  }
  return map;
}

/**
 * The most frequent state among a day's check-ins. Ties are broken by
 * whichever tied state was checked in most recently — "how the day ended
 * up," not an arbitrary pick.
 */
export function dominantState(dayRows: CheckInLite[]): CheckInState | null {
  if (dayRows.length === 0) return null;
  if (dayRows.length === 1) return dayRows[0].state;

  const counts = new Map<CheckInState, number>();
  for (const r of dayRows) counts.set(r.state, (counts.get(r.state) ?? 0) + 1);

  let bestCount = 0;
  let tied: CheckInState[] = [];
  for (const [state, count] of counts) {
    if (count > bestCount) {
      bestCount = count;
      tied = [state];
    } else if (count === bestCount) {
      tied.push(state);
    }
  }
  if (tied.length === 1) return tied[0];

  const byRecency = [...dayRows].sort((a, b) =>
    b.created_at.localeCompare(a.created_at)
  );
  return byRecency.find((r) => tied.includes(r.state))?.state ?? tied[0];
}

export type YearCell = { date: string; state: CheckInState | null };

/** One cell per calendar day of `year`, from Jan 1 to Dec 31 (or today, if `year` is the current year). */
export function buildYearGrid(rows: CheckInLite[], year: number): YearCell[] {
  const byDate = groupByDate(rows);
  const out: YearCell[] = [];

  const today = new Date();
  const isCurrentYear = year === today.getUTCFullYear();
  const end = isCurrentYear
    ? today
    : new Date(Date.UTC(year, 11, 31));

  const cursor = new Date(Date.UTC(year, 0, 1));
  while (cursor <= end) {
    const key = cursor.toISOString().slice(0, 10);
    out.push({ date: key, state: dominantState(byDate.get(key) ?? []) });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return out;
}

/** Last `days` calendar days (inclusive of today), oldest first. */
export function buildRecentStrip(rows: CheckInLite[], days: number): YearCell[] {
  const byDate = groupByDate(rows);
  const out: YearCell[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    const key = d.toISOString().slice(0, 10);
    out.push({ date: key, state: dominantState(byDate.get(key) ?? []) });
  }
  return out;
}
