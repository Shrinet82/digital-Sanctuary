"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveJournalEntry, savePracticeSession } from "@/app/actions/practice";
import { WORRY_WINDOW_TIMES, refocusPrompt, type WorryWindowTime } from "@/lib/worry";

const today = () => new Date().toISOString().slice(0, 10);

/** Stimulus-control worry postponement (Borkovec) — park it, don't fight it. */
export function WorryWindow() {
  const router = useRouter();
  const [worry, setWorry] = useState("");
  const [when, setWhen] = useState<WorryWindowTime | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function park(chosen: WorryWindowTime) {
    setWhen(chosen);
    setSaving(true);
    saveJournalEntry({
      worksheetId: "worry-window",
      answers: { worry: worry.trim() || null, when: chosen },
    });
    savePracticeSession({ moduleId: "worry-window", outcome: "done" }).then((res) => {
      setSaving(false);
      if (res.ok) setSaved(true);
    });
  }

  if (when) {
    return (
      <div className="ds-card">
        <span className="ds-pill bg-mint text-[#0B5C41] mb-4">✓ parked</span>
        <h2 className="text-2xl mb-2">It&apos;s parked.</h2>
        <p className="text-ink-soft mb-4">
          {WORRY_WINDOW_TIMES.find((t) => t.value === when)?.label} — that&apos;s
          when you meant to come back to it.{" "}
          <b>We won&apos;t remind you</b> — there&apos;s no notification system
          for that yet — but it&apos;s saved in your Ledger, exactly as you
          wrote it, whenever you want it.
        </p>
        <div className="rounded-xl border-2 border-ink p-4 bg-sand">
          <span className="text-xs font-bold text-ink-faint block mb-1">
            Something for meanwhile
          </span>
          <p className="m-0">{refocusPrompt(`${today()}:worry-window`)}</p>
        </div>
        <p className="text-xs text-ink-faint mt-4">
          {saving ? "Saving…" : saved ? "Saved privately." : ""}
        </p>
        <button
          onClick={() => {
            router.push("/dashboard");
            router.refresh();
          }}
          className="ds-btn ds-btn-primary mt-4"
        >
          Back to dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="ds-card">
      <label htmlFor="worry" className="block font-bold text-sm mb-2">
        What&apos;s the worry? <span className="text-ink-faint font-medium">(optional)</span>
      </label>
      <input
        id="worry"
        value={worry}
        onChange={(e) => setWorry(e.target.value)}
        placeholder="Write it down, or leave this blank."
        className="w-full border-2.5 border-ink rounded-[14px] px-4 py-3 bg-surface"
      />

      <fieldset className="mt-6">
        <legend className="font-bold text-sm mb-3">
          When do you want to come back to it?
        </legend>
        <div className="flex gap-2.5 flex-wrap">
          {WORRY_WINDOW_TIMES.map((t) => (
            <button
              key={t.value}
              onClick={() => park(t.value)}
              className="border-2 border-ink rounded-full px-4 py-2.5 text-[14.5px] font-bold bg-surface shadow-pop-sm transition-transform hover:-translate-y-px"
            >
              {t.label}
            </button>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
