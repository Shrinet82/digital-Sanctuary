"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveJournalEntry, savePracticeSession } from "@/app/actions/practice";
import { AiSuggestion } from "@/components/ai/AiSuggestion";

const BLOCKERS = [
  "Getting started",
  "Too big / overwhelmed",
  "Time blindness",
  "Can't prioritise",
  "Keep getting distracted",
  "Emotional friction",
];

type Step = { text: string; hint: string; twoMinute?: boolean };

/**
 * DETERMINISTIC step skeleton. Phase 6 may optionally reword step *text*
 * via the narrow AI allowlist — the structure below never comes from a model,
 * and the first step is always observable and under two minutes.
 */
function buildSteps(goal: string): Step[] {
  const g = goal.trim() || "the task";
  return [
    {
      text: "Put the one thing you need where you can see it",
      hint: "materials in reach",
      twoMinute: true,
    },
    { text: `Open or lay out what "${g}" needs`, hint: "reduce it to one screen or page" },
    { text: "Do the smallest visible piece", hint: "e.g. fill just the first field" },
    { text: "Set a 10-minute timer and continue", hint: "stop when it rings — that's a win" },
    { text: "Park the rest with a note for next time", hint: "protect working memory" },
  ];
}

export function TaskDecomposer() {
  const router = useRouter();
  const [blocker, setBlocker] = useState<string | null>(null);
  const [goal, setGoal] = useState("");
  const [steps, setSteps] = useState<Step[] | null>(null);
  const [done, setDone] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function toggle(i: number) {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  async function savePlan() {
    if (!steps) return;
    setSaving(true);
    await saveJournalEntry({
      worksheetId: "task-decomposer",
      answers: {
        blocker,
        goal,
        steps: steps.map((s) => s.text),
        completed: Array.from(done).map((i) => steps[i]?.text),
      },
    });
    const res = await savePracticeSession({
      moduleId: "task-decomposer",
      outcome: done.size === 0 ? "partly" : "done",
      wasHelpful: done.size > 0,
    });
    setSaving(false);
    if (res.ok) setSaved(true);
  }

  return (
    <div className="ds-card">
      <fieldset>
        <legend className="font-bold text-sm mb-2">
          What&apos;s blocking you right now?
        </legend>
        <div className="flex gap-2.5 flex-wrap">
          {BLOCKERS.map((b) => (
            <button
              key={b}
              type="button"
              aria-pressed={blocker === b}
              onClick={() => setBlocker(blocker === b ? null : b)}
              className={`border-2 border-ink rounded-full px-4 py-2.5 text-[14.5px] font-bold shadow-pop-sm transition-transform hover:-translate-y-px ${
                blocker === b ? "bg-violet text-white" : "bg-surface"
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </fieldset>

      <label htmlFor="goal" className="block font-bold text-sm mt-6 mb-2">
        What&apos;s the task or outcome?
      </label>
      <input
        id="goal"
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
        placeholder="e.g. submit the reimbursement form"
        className="w-full border-2.5 border-ink rounded-[14px] px-4 py-3 bg-surface"
      />

      <AiSuggestion
        task="reword_task"
        text={goal}
        label="✨ Shrink this for me"
        onAccept={(v) => setGoal(v)}
      />

      <div className="flex gap-3 flex-wrap items-center mt-5">
        <button
          onClick={() => setSteps(buildSteps(goal))}
          className="ds-btn ds-btn-primary"
        >
          Break it into steps →
        </button>
        <span className="text-xs text-ink-faint max-w-[36ch]">
          Deterministic skeleton — the first step is always observable and under
          two minutes.
        </span>
      </div>

      {steps && (
        <div className="mt-7">
          <span className="ds-pill bg-mint text-[#0B5C41] mb-3">
            🧮 deterministic skeleton
          </span>
          <ul className="list-none p-0 m-0 mt-3">
            {steps.map((s, i) => {
              const isDone = done.has(i);
              return (
                <li key={i} className="mb-3">
                  <button
                    onClick={() => toggle(i)}
                    aria-pressed={isDone}
                    className={`w-full text-left flex gap-3 items-start p-4 border-2.5 border-ink rounded-[14px] shadow-pop-sm transition-transform hover:-translate-y-px ${
                      isDone
                        ? "bg-mint"
                        : s.twoMinute
                          ? "bg-gradient-to-br from-violet-soft to-coral-soft"
                          : "bg-surface"
                    }`}
                  >
                    <span
                      className={`w-6 h-6 shrink-0 mt-0.5 rounded-lg border-2.5 border-ink grid place-items-center text-sm font-extrabold ${
                        isDone ? "bg-yellow" : "bg-white"
                      }`}
                    >
                      {isDone ? "✓" : ""}
                    </span>
                    <span>
                      <b className="text-[15px]">
                        {i + 1}. {s.text}
                        {s.twoMinute && (
                          <span className="ml-2 text-[11px] font-extrabold bg-yellow border-2 border-ink rounded-full px-2 py-0.5 inline-block">
                            ≈ 2 MIN
                          </span>
                        )}
                      </b>
                      <span className="block text-[13px] text-ink-faint mt-0.5">
                        {s.hint}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {saved ? (
            <div className="mt-4">
              <p className="font-bold text-sm mb-3">✓ Plan saved privately.</p>
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
            <div className="flex gap-3 flex-wrap mt-4">
              <button
                onClick={savePlan}
                disabled={saving}
                className="ds-btn ds-btn-primary disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save plan"}
              </button>
              <button
                onClick={() => setSteps(buildSteps(goal))}
                className="ds-btn ds-btn-ghost"
              >
                ↻ Another way
              </button>
            </div>
          )}
          <p className="text-xs text-ink-faint mt-4">
            Tap a step to check it. Nothing here is a deadline, and stopping
            early is fine.
          </p>
        </div>
      )}
    </div>
  );
}
