import Link from "next/link";
import { STATE_COLOR, stateEmoji, type CheckInState } from "@/lib/checkin";
import type { YearCell } from "@/lib/ledger";

/** The last 7 days, shown on Today. A small taste of the Ledger, not a streak. */
export function WeekStrip({ cells }: { cells: YearCell[] }) {
  return (
    <div className="flex gap-2">
      {cells.map((cell) => {
        const day = new Date(cell.date + "T00:00:00Z").toLocaleDateString(undefined, {
          weekday: "narrow",
          timeZone: "UTC",
        });
        return (
          <Link
            key={cell.date}
            href={`/ledger/${cell.date}`}
            title={cell.date}
            className={`flex flex-col items-center gap-1 flex-1 rounded-xl border-2 border-ink py-2.5 shadow-pop-sm transition-transform hover:-translate-y-0.5 ${
              cell.state ? STATE_COLOR[cell.state as CheckInState] : "bg-surface-2/50"
            }`}
          >
            <span className="text-[11px] font-extrabold text-ink-soft">{day}</span>
            <span className="text-lg leading-none">
              {cell.state ? stateEmoji(cell.state as CheckInState) : "·"}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
