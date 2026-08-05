"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveJournalEntry, savePracticeSession } from "@/app/actions/practice";

const VALUES: {
  key: string;
  label: string;
  emoji: string;
  actions: string[];
}[] = [
  {
    key: "connection",
    label: "Connection",
    emoji: "🫶",
    actions: [
      "Send one “thinking of you” message",
      "Sit somewhere people are, for five minutes",
      "Reply properly to one person",
    ],
  },
  {
    key: "health",
    label: "Health",
    emoji: "🌿",
    actions: [
      "Drink a full glass of water",
      "Step outside for two minutes",
      "Stretch anything for sixty seconds",
    ],
  },
  {
    key: "creativity",
    label: "Creativity",
    emoji: "🎨",
    actions: [
      "Doodle for three minutes, badly",
      "Save one idea to a note",
      "Rearrange one small corner",
    ],
  },
  {
    key: "learning",
    label: "Learning",
    emoji: "📚",
    actions: [
      "Read one paragraph of anything",
      "Watch one short explainer",
      "Ask one question out loud",
    ],
  },
  {
    key: "kindness",
    label: "Kindness",
    emoji: "💛",
    actions: [
      "Thank one person, specifically",
      "Do a two-minute favour nobody asked for",
      "Rest without earning it first",
    ],
  },
  {
    key: "nature",
    label: "Nature",
    emoji: "🌤️",
    actions: [
      "Look at the sky for a full minute",
      "Touch one plant, tree, or patch of grass",
      "Open a window and just listen",
    ],
  },
];

export function ValuesToAction() {
  const router = useRouter();
  const [value, setValue] = useState<string | null>(null);
  const [action, setAction] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const chosen = VALUES.find((v) => v.key === value);

  async function save(outcome: "done" | "not_today") {
    await saveJournalEntry({
      worksheetId: "values-to-action",
      answers: { value, action, outcome },
    });
    const res = await savePracticeSession({
      moduleId: "values-to-action",
      outcome,
      wasHelpful: outcome === "done",
    });
    if (res.ok) setSaved(true);
  }

  return (
    <div className="ds-card">
      <p className="font-bold text-sm mb-3">
        Something that still matters, even on hard days
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        {VALUES.map((v) => (
          <button
            key={v.key}
            onClick={() => {
              setValue(v.key);
              setAction(null);
            }}
            aria-pressed={value === v.key}
            className={`border-2.5 border-ink rounded-[16px] p-4 text-center shadow-pop-sm transition-transform hover:-translate-y-0.5 ${
              value === v.key ? "bg-mint" : "bg-surface"
            }`}
          >
            <span className="grid place-items-center w-11 h-11 mx-auto rounded-xl bg-sand border-2 border-ink text-xl -rotate-3">
              {v.emoji}
            </span>
            <b className="block text-[15px] mt-2">{v.label}</b>
          </button>
        ))}
      </div>

      {chosen && !saved && (
        <div className="mt-7">
          <p className="font-bold text-sm mb-3">
            One tiny step — pick whatever feels possible
          </p>
          <div className="space-y-3">
            {chosen.actions.map((a) => (
              <button
                key={a}
                onClick={() => setAction(a)}
                aria-pressed={action === a}
                className={`block w-full text-left border-2.5 border-ink rounded-[16px] px-5 py-4 shadow-pop-sm transition-transform hover:-translate-y-0.5 ${
                  action === a ? "bg-violet-soft" : "bg-surface"
                }`}
              >
                <b className="text-[15px]">{a}</b>
                <span className="block text-[13px] text-ink-faint mt-0.5">
                  ≈ 2 minutes · entirely voluntary
                </span>
              </button>
            ))}
          </div>

          {action && (
            <div className="mt-6 rounded-[16px] border-2.5 border-ink bg-mint p-5">
              <span className="text-sm text-ink-faint">Your step</span>
              <h3 className="text-lg mt-1">{action}</h3>
              <div className="flex gap-3 flex-wrap mt-4">
                <button
                  onClick={() => save("done")}
                  className="ds-btn ds-btn-primary"
                >
                  I did it
                </button>
                <button
                  onClick={() => save("not_today")}
                  className="ds-btn ds-btn-ghost"
                >
                  Not today
                </button>
              </div>
              <p className="text-xs text-ink-soft mt-4 mb-0">
                Both answers are fine. Choosing not to is still a choice you made
                on purpose.
              </p>
            </div>
          )}
        </div>
      )}

      {saved && (
        <div className="mt-7 rounded-[16px] border-2.5 border-ink bg-mint p-5">
          <b className="block text-[15px]">
            ✓ Saved. One act of what matters — that was the whole assignment.
          </b>
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
      )}
    </div>
  );
}
