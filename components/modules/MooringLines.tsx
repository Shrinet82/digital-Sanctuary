"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveAnchor } from "@/app/actions/vault";

const ANCHORS = [
  { key: "sleep", emoji: "😴", label: "Sleep in some kind of rhythm" },
  { key: "meals", emoji: "🍜", label: "Regular meals" },
  { key: "movement", emoji: "🚶", label: "Movement or fresh air" },
  { key: "peer", emoji: "🫂", label: "Peer or group contact" },
  { key: "appointment", emoji: "🧑‍⚕️", label: "An appointment kept" },
  { key: "structure", emoji: "🧩", label: "A structured activity" },
];

export function MooringLines({ initial }: { initial: Record<string, number> }) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, number>>(initial);
  const [, startTransition] = useTransition();
  const [note, setNote] = useState<string | null>(null);

  function bump(key: string) {
    const next = ((values[key] ?? 0) + 1) % 8;
    setValues((v) => ({ ...v, [key]: next }));
    startTransition(async () => {
      const res = await saveAnchor(key, next);
      setNote(res.ok ? "Saved" : (res.error ?? "Couldn't save"));
      setTimeout(() => setNote(null), 1500);
    });
  }

  const total = Object.values(values).reduce((a, b) => a + b, 0);

  return (
    <div className="ds-card">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="font-bold text-sm m-0">This week</p>
        {note && (
          <span className="text-xs font-bold text-ink-faint">{note}</span>
        )}
      </div>
      <p className="text-sm text-ink-soft mt-1.5">
        Tap to count the days each one showed up. These are counts, not scores —
        nothing here is graded and nothing resets.
      </p>

      <div className="mt-5 space-y-3">
        {ANCHORS.map((a) => {
          const days = values[a.key] ?? 0;
          return (
            <div
              key={a.key}
              className="flex items-center gap-3 border-2.5 border-ink rounded-[14px] p-4 bg-surface shadow-pop-sm"
            >
              <span className="grid place-items-center w-10 h-10 shrink-0 rounded-xl bg-mint border-2 border-ink text-lg -rotate-3">
                {a.emoji}
              </span>
              <span className="flex-1">
                <b className="block text-[15px]">{a.label}</b>
                <span className="text-[13px] text-ink-faint">
                  {days === 0
                    ? "not this week"
                    : `${days} day${days === 1 ? "" : "s"}`}
                </span>
              </span>
              <button
                onClick={() => bump(a.key)}
                className="ds-btn ds-btn-ghost !px-4 !py-2 !text-sm min-w-[52px]"
                aria-label={`${a.label}: ${days} days, tap to change`}
              >
                {days}
              </button>
            </div>
          );
        })}
      </div>

      <div
        className={`rounded-[14px] border-2 border-ink p-4 text-sm mt-5 ${
          total === 0 ? "bg-surface-2" : "bg-mint"
        }`}
      >
        {total === 0 ? (
          <>
            Nothing logged yet this week — and a thin week is <b>not</b> a failed
            week. One anchor at one day still counts.
          </>
        ) : (
          <>
            That&apos;s <b>{total}</b> anchor-day{total === 1 ? "" : "s"} holding
            you this week. Whatever the number, it&apos;s more than none.
          </>
        )}
      </div>

      <button
        onClick={() => {
          router.push("/dashboard");
          router.refresh();
        }}
        className="ds-btn ds-btn-primary mt-5"
      >
        Done for now
      </button>
      <p className="text-xs text-ink-faint mt-4 mb-0">
        Saved as you go. Counts reset with the calendar week, not as a penalty.
      </p>
    </div>
  );
}
