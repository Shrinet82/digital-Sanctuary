import Link from "next/link";
import {
  GROUP_LABELS,
  MODULE_LIST,
  groupLabel,
  type ConditionGroup,
  type ModuleMeta,
} from "@/lib/modules";

const ICON_BG: Record<ConditionGroup, string> = {
  right_now: "bg-coral-soft",
  racing_thoughts: "bg-teal-soft",
  low_mood: "bg-sand",
  cant_start: "bg-violet-soft",
  substance: "bg-mint",
};

function ModuleCard({ m }: { m: ModuleMeta }) {
  return (
    <Link
      href={`/modules/${m.id}`}
      className="ds-card !p-5 flex items-start gap-4 no-underline text-ink hover:-translate-y-0.5 transition-transform"
    >
      <span
        className={`grid place-items-center w-11 h-11 shrink-0 rounded-xl border-2 border-ink text-xl -rotate-3 ${ICON_BG[m.group]}`}
      >
        {m.emoji}
      </span>
      <span>
        <b className="block text-[15px]">
          {m.title}
          {m.vault && (
            <span className="ml-1.5 text-[11px] font-bold text-ink-faint">
              🔒
            </span>
          )}
        </b>
        <span className="text-sm text-ink-faint">{groupLabel(m.group)}</span>
      </span>
    </Link>
  );
}

/**
 * The Today grid, with lanes from §10 — state-based, not diagnosis-based.
 *
 * Always renders every lane as its own headed section — no flat,
 * undifferentiated "all" view, and no filter that hides the rest. A flat
 * ~20-card scroll (or a filter that disappears everything else) is exactly
 * the cognitive load the check-in flow was built to avoid. The pills are
 * jump-links to a section, nothing more — no active/selected state to
 * track, since there's nothing to filter.
 */
export function ModuleGrid() {
  return (
    <>
      <div className="flex gap-2.5 flex-wrap mb-4">
        {GROUP_LABELS.map((g) => (
          <a
            key={g.value}
            href={`#lane-${g.value}`}
            className="border-2 border-ink rounded-full px-4 py-2 text-[13.5px] font-bold shadow-pop-sm bg-surface no-underline text-ink transition-transform hover:-translate-y-px inline-block"
          >
            {g.emoji} {g.label}
          </a>
        ))}
      </div>

      <div className="space-y-7">
        {GROUP_LABELS.map((lane) => {
          const modules = MODULE_LIST.filter((m) => m.group === lane.value);
          if (modules.length === 0) return null;
          return (
            <div key={lane.value} id={`lane-${lane.value}`}>
              <h3 className="flex items-center gap-2 text-base font-extrabold mb-3">
                <span aria-hidden>{lane.emoji}</span>
                {lane.label}
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {modules.map((m) => (
                  <ModuleCard key={m.id} m={m} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
