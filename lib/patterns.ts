/**
 * Patterns — redesign §12. Reflection, not prediction: describes, never
 * diagnoses, forecasts, or advises.
 *
 * "Day 3 — first reflection. Deliberately modest, deliberately early" is
 * the specific rule this file exists for: getting *something* back by the
 * third logged day is what stops the app dying in week one. It stays live
 * until day 7 takes over with the fuller week view.
 */
import { dominantState, groupByDate } from "./ledger";
import { STATE_ORDER, stateLabel, type CheckInState } from "./checkin";

export type DayLog = { log_date: string; state: CheckInState; context: string[] };

const NUMBER_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven"];
function numberWord(n: number): string {
  return NUMBER_WORDS[n] ?? String(n);
}

function capitalize(s: string): string {
  return s.length ? s[0].toUpperCase() + s.slice(1) : s;
}

/** One row per distinct logged day: dominant state + that day's context chips, oldest first. */
export function distinctDays(rows: { log_date: string; state: CheckInState; context: string[] }[]): DayLog[] {
  const byDate = groupByDate(rows);
  const dates = [...byDate.keys()].sort();
  return dates.map((date) => {
    const dayRows = byDate.get(date)!;
    const state = dominantState(dayRows) as CheckInState;
    const context = [...new Set(dayRows.flatMap((r) => r.context ?? []))];
    return { log_date: date, state, context };
  });
}

function describeCounts(days: DayLog[]): string {
  const counts = new Map<CheckInState, number>();
  for (const d of days) counts.set(d.state, (counts.get(d.state) ?? 0) + 1);

  // Stable order: roughest to best, so the sentence reads in one direction.
  const parts = STATE_ORDER.filter((s) => counts.has(s)).map((s) => {
    const n = counts.get(s)!;
    return `${numberWord(n)} ${n === 1 ? "was" : "were"} ${stateLabel(s).toLowerCase()}`;
  });

  if (parts.length === 1) return capitalize(`${parts[0]}.`);
  const last = parts[parts.length - 1];
  const rest = parts.slice(0, -1).join(", ");
  return capitalize(`${rest}, and ${last}.`);
}

/**
 * The day-3 first reflection. Shown once 3+ distinct days are logged, until
 * day 7 (weekReflection takes over from there). Purely descriptive — the
 * optional detail clause states what co-occurred, never that it caused
 * anything, matching §12's rule that this page never implies causation.
 */
export function firstReflection(rows: { log_date: string; state: CheckInState; context: string[] }[]): string | null {
  const days = distinctDays(rows);
  if (days.length < 3 || days.length >= 7) return null;

  const summary = describeCounts(days);

  // The single best-state day, if it also has a context chip worth naming.
  const best = [...days].sort(
    (a, b) => STATE_ORDER.indexOf(b.state) - STATE_ORDER.indexOf(a.state)
  )[0];

  let detail = "";
  if (best.context.length > 0) {
    detail = ` The ${stateLabel(best.state).toLowerCase()} day had "${best.context[0].toLowerCase()}" noted.`;
  }

  return `${numberWord(days.length)} days logged. ${summary}${detail}`;
}

/** The day-7 handoff: the grid strip, states counted, modules done. */
export function weekReflection(
  rows: { log_date: string; state: CheckInState; context: string[] }[],
  practiceCount: number
): string | null {
  const days = distinctDays(rows);
  if (days.length < 7) return null;

  const summary = describeCounts(days.slice(-7));
  const practiceLine =
    practiceCount > 0
      ? ` You tried something ${numberWord(practiceCount)} time${practiceCount === 1 ? "" : "s"} this week.`
      : "";

  return `A week logged. ${summary}${practiceLine}`;
}
