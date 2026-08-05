"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { savePracticeSession, saveJournalEntry } from "@/app/actions/practice";

const OPTIONS = [
  { emoji: "🚿", kind: "Care", text: "Drink a glass of water / brush teeth" },
  { emoji: "🌤️", kind: "Activate", text: "Step outside for two minutes" },
  { emoji: "📩", kind: "Connect", text: "Send one short message to someone" },
  { emoji: "🧺", kind: "Achieve", text: "Tidy one small surface" },
  { emoji: "🎧", kind: "Pleasure", text: "Play one song I like" },
  { emoji: "🍵", kind: "Nourish", text: "Make a warm drink" },
];

/** Deliberately shame-free. There is no "failed" state, by design. */
const STATES = [
  { value: "done", emoji: "✅", label: "Done", note: "Lovely — that's a real win." },
  { value: "partly", emoji: "🌤️", label: "Partly done", note: "Partly counts fully. Well done." },
  { value: "moved", emoji: "➡️", label: "Moved it", note: "Moving it is a valid choice, not a failure." },
  { value: "not_today", emoji: "🌙", label: "Not today", note: "Resting is allowed. Tomorrow is open." },
] as const;

type Outcome = (typeof STATES)[number]["value"];

export function OneSmallAction() {
  const router = useRouter();
  const [chosen, setChosen] = useState<string | null>(null);
  const [own, setOwn] = useState("");
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function record(value: Outcome) {
    setOutcome(value);
    setSaving(true);
    await saveJournalEntry({
      worksheetId: "one-small-action",
      answers: { action: chosen, outcome: value },
    });
    const res = await savePracticeSession({
      moduleId: "one-small-action",
      outcome: value,
      wasHelpful: value === "done" || value === "partly",
    });
    setSaving(false);
    if (res.ok) setSaved(true);
  }

  const note = STATES.find((s) => s.value === outcome)?.note;

  return (
    <div className="ds-card">
      <p className="font-bold text-sm mb-3">Choose one that feels possible</p>
      <div className="grid gap-3 sm:grid-cols-3">
        {OPTIONS.map((o) => (
          <button
            key={o.text}
            onClick={() => setChosen(o.text)}
            aria-pressed={chosen === o.text}
            className={`border-2.5 border-ink rounded-[16px] p-4 text-center shadow-pop-sm transition-transform hover:-translate-y-0.5 ${
              chosen === o.text ? "bg-mint" : "bg-surface"
            }`}
          >
            <span className="grid place-items-center w-11 h-11 mx-auto rounded-xl bg-sand border-2 border-ink text-xl -rotate-3">
              {o.emoji}
            </span>
            <b className="block text-[15px] mt-2">{o.kind}</b>
            <span className="text-[13px] text-ink-faint">{o.text}</span>
          </button>
        ))}
      </div>

      <label htmlFor="own" className="block font-bold text-sm mt-6 mb-2">
        …or write your own
      </label>
      <div className="flex gap-3 flex-wrap">
        <input
          id="own"
          value={own}
          onChange={(e) => setOwn(e.target.value)}
          placeholder="e.g. reply to my landlord"
          className="flex-1 min-w-[200px] border-2.5 border-ink rounded-[14px] px-4 py-3 bg-surface"
        />
        <button
          onClick={() => own.trim() && setChosen(own.trim())}
          className="ds-btn ds-btn-ghost"
        >
          Use this
        </button>
      </div>

      {chosen && (
        <div className="mt-7 ds-card !shadow-pop-sm bg-mint">
          <span className="text-sm text-ink-faint">Your one action</span>
          <h3 className="text-xl mt-1">{chosen}</h3>

          {saved && note ? (
            <div className="mt-5">
              <p className="font-bold text-[15px] mb-3">{note}</p>
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
            <>
              <p className="font-bold mt-5 mb-1">
                How did it go? (whatever the answer — that&apos;s okay)
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                {STATES.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => record(s.value)}
                    disabled={saving}
                    aria-pressed={outcome === s.value}
                    className={`border-2.5 border-ink rounded-[14px] py-3.5 px-2 text-center text-[13.5px] font-extrabold shadow-pop-sm transition-transform hover:-translate-y-px disabled:opacity-60 ${
                      outcome === s.value ? "bg-violet text-white" : "bg-surface"
                    }`}
                  >
                    <span className="block text-xl mb-1">{s.emoji}</span>
                    {s.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
