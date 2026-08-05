"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveJournalEntry, savePracticeSession } from "@/app/actions/practice";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Empty is first on purpose: a blank day is a valid day. */
const BLOCKS = [
  { key: "", label: "Empty", emoji: "", color: "bg-surface" },
  { key: "routine", label: "Routine", emoji: "🔵", color: "bg-[#DCEBFB]" },
  { key: "care", label: "Care", emoji: "🟡", color: "bg-sand" },
  { key: "pleasure", label: "Pleasure", emoji: "🟣", color: "bg-violet-soft" },
  { key: "connect", label: "Connect", emoji: "🟢", color: "bg-mint" },
  { key: "rest", label: "Rest", emoji: "🌙", color: "bg-surface-2" },
];

export function EnergyAwareWeek() {
  const router = useRouter();
  const todayIdx = (new Date().getDay() + 6) % 7;
  const [week, setWeek] = useState<number[]>(Array(7).fill(0));
  const [saved, setSaved] = useState(false);

  function cycle(i: number) {
    setWeek((w) => w.map((v, idx) => (idx === i ? (v + 1) % BLOCKS.length : v)));
  }

  const filled = week.filter((v) => v !== 0).length;

  async function save() {
    await saveJournalEntry({
      worksheetId: "energy-aware-week",
      answers: {
        week: week.map((v, i) => ({ day: DAYS[i], block: BLOCKS[v].key })),
      },
    });
    const res = await savePracticeSession({
      moduleId: "energy-aware-week",
      outcome: "done",
      wasHelpful: true,
    });
    if (res.ok) setSaved(true);
  }

  return (
    <div className="ds-card">
      <div className="flex gap-2 flex-wrap mb-4">
        {BLOCKS.filter((b) => b.key).map((b) => (
          <span key={b.key} className={`ds-pill ${b.color}`}>
            {b.emoji} {b.label}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {DAYS.map((d, i) => {
          const block = BLOCKS[week[i]];
          return (
            <button
              key={d}
              onClick={() => cycle(i)}
              className={`border-2.5 border-ink rounded-xl py-3 px-1 min-h-[92px] shadow-pop-sm transition-transform hover:-translate-y-px ${block.color} ${
                i === todayIdx ? "ring-2 ring-violet ring-offset-2" : ""
              }`}
              aria-label={`${d}: ${block.label}`}
            >
              <span className="block text-[10px] font-extrabold text-ink-faint tracking-wide">
                {d.toUpperCase()}
              </span>
              <span className="block text-xl mt-2">{block.emoji || "·"}</span>
              {block.key && (
                <span className="block text-[10px] font-bold mt-1">
                  {block.label}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <p className="text-sm text-ink-soft mt-5">
        Tap a day to cycle through the blocks. Capacity is allowed to vary —{" "}
        <b>an empty day is a valid day</b>, and you can move or drop anything
        without penalty.
      </p>

      {saved ? (
        <div className="mt-5">
          <p className="font-bold text-sm mb-3">
            ✓ Saved. Nothing here locks you in.
          </p>
          <button
            onClick={() => {
              router.push("/dashboard");
              router.refresh();
            }}
            className="ds-btn ds-btn-primary"
          >
            Back to dashboard
          </button>
        </div>
      ) : (
        <div className="flex gap-3 flex-wrap mt-5">
          <button onClick={save} className="ds-btn ds-btn-primary">
            Save my week
          </button>
          <button
            onClick={() => setWeek(Array(7).fill(0))}
            className="ds-btn ds-btn-ghost"
          >
            Clear
          </button>
          {filled === 0 && (
            <span className="text-xs text-ink-faint self-center">
              An empty week is a real answer too.
            </span>
          )}
        </div>
      )}
    </div>
  );
}
