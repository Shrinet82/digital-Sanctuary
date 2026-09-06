"use client";

import { useState } from "react";
import Link from "next/link";

const ITEMS = [
  "Phone in another room, or on silent and out of reach",
  "Water or a drink within reach",
  "Just one tab or app open",
  "Anything you'll need is already on the desk/table",
  "One-line note of anything distracting you, to deal with later",
];

/** An environment checklist before starting — friction removed before it's needed. */
export function FocusSetup() {
  const [checked, setChecked] = useState<Set<number>>(new Set());

  function toggle(i: number) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  return (
    <div className="ds-card">
      <p className="font-bold text-sm mb-4">
        Tap what&apos;s already true, or what you just did.
      </p>
      <ul className="list-none p-0 m-0 space-y-2.5">
        {ITEMS.map((item, i) => {
          const done = checked.has(i);
          return (
            <li key={i}>
              <button
                onClick={() => toggle(i)}
                aria-pressed={done}
                className={`w-full text-left flex items-center gap-3 border-2.5 border-ink rounded-[14px] px-4 py-3.5 shadow-pop-sm transition-transform hover:-translate-y-px ${
                  done ? "bg-mint" : "bg-surface"
                }`}
              >
                <span
                  className={`w-6 h-6 shrink-0 rounded-lg border-2.5 border-ink grid place-items-center text-sm font-extrabold ${
                    done ? "bg-yellow" : "bg-white"
                  }`}
                >
                  {done ? "✓" : ""}
                </span>
                <span className="text-[15px]">{item}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="text-xs text-ink-faint mt-4">
        No score for how many — even one fewer distraction helps.
      </p>
      <Link href="/modules/time-container" className="ds-btn ds-btn-primary no-underline mt-4">
        Start a focus block →
      </Link>
    </div>
  );
}
