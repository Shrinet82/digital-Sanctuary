"use client";

import { useState } from "react";
import Link from "next/link";
import {
  GROUP_LABELS,
  MODULE_LIST,
  type ConditionGroup,
} from "@/lib/modules";

const ICON_BG: Record<ConditionGroup, string> = {
  anxiety: "bg-coral-soft",
  low_mood: "bg-sand",
  adhd: "bg-violet-soft",
  substance: "bg-mint",
};

/**
 * The Today grid with condition filters.
 *
 * Eleven modules at once is exactly the cognitive overload the research warns
 * about, so filtering is progressive disclosure — not decoration.
 */
export function ModuleGrid() {
  const [group, setGroup] = useState<ConditionGroup | "all">("all");
  const shown = MODULE_LIST.filter((m) => group === "all" || m.group === group);

  return (
    <>
      <div className="flex gap-2.5 flex-wrap mb-4">
        {GROUP_LABELS.map((g) => (
          <button
            key={g.value}
            onClick={() => setGroup(g.value)}
            aria-pressed={group === g.value}
            className={`border-2 border-ink rounded-full px-4 py-2 text-[13.5px] font-bold shadow-pop-sm transition-transform hover:-translate-y-px ${
              group === g.value ? "bg-violet text-white" : "bg-surface"
            }`}
          >
            {g.emoji} {g.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {shown.map((m) => (
          <Link
            key={m.id}
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
              <span className="text-sm text-ink-faint">{m.condition}</span>
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}
