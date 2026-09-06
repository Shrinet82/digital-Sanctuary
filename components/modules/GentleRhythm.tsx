"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveJournalEntry, savePracticeSession } from "@/app/actions/practice";

const ANCHORS = [
  { emoji: "☀️", label: "One thing after waking", hint: "even just opening a curtain" },
  { emoji: "🍽️", label: "One proper meal", hint: "sitting down, if you can" },
  { emoji: "🌳", label: "One moment outside", hint: "a doorway counts" },
  { emoji: "🌙", label: "One wind-down thing", hint: "whatever tells your body the day's done" },
];

/** Rebuilding routine without a rigid schedule — pick anchors, not a timetable. */
export function GentleRhythm() {
  const router = useRouter();
  const [chosen, setChosen] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function toggle(label: string) {
    setChosen((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }

  async function save() {
    setSaving(true);
    await saveJournalEntry({
      worksheetId: "gentle-rhythm",
      answers: { anchors: Array.from(chosen) },
    });
    const res = await savePracticeSession({
      moduleId: "gentle-rhythm",
      outcome: chosen.size > 0 ? "done" : "not_today",
      wasHelpful: chosen.size > 0,
    });
    setSaving(false);
    if (res.ok) setSaved(true);
  }

  return (
    <div className="ds-card">
      <p className="font-bold text-sm mb-1">
        Not a schedule — just pick what you&apos;ll aim for today.
      </p>
      <p className="text-sm text-ink-faint mb-4">
        No times attached. Any number, including zero, is a real answer.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {ANCHORS.map((a) => {
          const active = chosen.has(a.label);
          return (
            <button
              key={a.label}
              onClick={() => toggle(a.label)}
              aria-pressed={active}
              className={`text-left border-2.5 border-ink rounded-[16px] p-4 shadow-pop-sm transition-transform hover:-translate-y-0.5 ${
                active ? "bg-mint" : "bg-surface"
              }`}
            >
              <span className="text-xl">{a.emoji}</span>
              <b className="block text-[15px] mt-1.5">{a.label}</b>
              <span className="text-[13px] text-ink-faint">{a.hint}</span>
            </button>
          );
        })}
      </div>

      {saved ? (
        <div className="mt-5">
          <p className="font-bold text-sm mb-3">✓ Saved. No penalty either way, tomorrow.</p>
          <button onClick={() => { router.push("/dashboard"); router.refresh(); }} className="ds-btn ds-btn-primary">
            Back to dashboard
          </button>
        </div>
      ) : (
        <button onClick={save} disabled={saving} className="ds-btn ds-btn-primary disabled:opacity-60 mt-5">
          {saving ? "Saving…" : "Save today's aim"}
        </button>
      )}
    </div>
  );
}
