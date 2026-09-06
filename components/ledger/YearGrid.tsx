import Link from "next/link";
import { STATE_COLOR, stateLabel, type CheckInState } from "@/lib/checkin";
import type { YearCell } from "@/lib/ledger";

/**
 * The hero image of the Ledger (§16). Empty days are pale, not red — this
 * replaces streaks entirely, so a gap must never read as a warning.
 */
export function YearGrid({ cells }: { cells: YearCell[] }) {
  return (
    <div
      className="grid gap-[3px]"
      style={{ gridTemplateColumns: "repeat(auto-fill, minmax(11px, 1fr))" }}
    >
      {cells.map((cell) => (
        <Link
          key={cell.date}
          href={`/ledger/${cell.date}`}
          title={
            cell.state
              ? `${cell.date} — ${stateLabel(cell.state as CheckInState)}`
              : `${cell.date} — no check-in`
          }
          className={`aspect-square rounded-[3px] border border-ink/70 hover:border-ink hover:scale-125 transition-transform ${
            cell.state ? STATE_COLOR[cell.state as CheckInState] : "bg-surface-2/50"
          }`}
        />
      ))}
    </div>
  );
}
