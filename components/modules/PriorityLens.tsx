"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { saveJournalEntry, savePracticeSession } from "@/app/actions/practice";

type Lens = "now" | "schedule" | "shrink" | "letgo";

const LENSES: { key: Lens; label: string; emoji: string }[] = [
  { key: "now", label: "Now", emoji: "⚡" },
  { key: "schedule", label: "Schedule", emoji: "🗓️" },
  { key: "shrink", label: "Shrink", emoji: "🪜" },
  { key: "letgo", label: "Let go", emoji: "🕊️" },
];

type Task = { text: string; lens: Lens | null };

export function PriorityLens() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [draft, setDraft] = useState("");
  const [saved, setSaved] = useState(false);

  function add() {
    const t = draft.trim();
    if (!t) return;
    setTasks((prev) => [...prev, { text: t, lens: null }]);
    setDraft("");
  }

  function setLens(i: number, lens: Lens) {
    setTasks((prev) =>
      prev.map((t, idx) =>
        idx === i ? { ...t, lens: t.lens === lens ? null : lens } : t
      )
    );
  }

  const now = tasks.filter((t) => t.lens === "now").slice(0, 3);
  const shrink = tasks.filter((t) => t.lens === "shrink");
  const letgo = tasks.filter((t) => t.lens === "letgo");
  const sorted = tasks.some((t) => t.lens !== null);

  async function save() {
    await saveJournalEntry({
      worksheetId: "priority-lens",
      answers: { tasks },
    });
    const res = await savePracticeSession({
      moduleId: "priority-lens",
      outcome: "done",
      wasHelpful: true,
    });
    if (res.ok) setSaved(true);
  }

  return (
    <div className="ds-card">
      <label htmlFor="task" className="block font-bold text-sm mb-2">
        What&apos;s on your plate?
      </label>
      <div className="flex gap-3 flex-wrap">
        <input
          id="task"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder="Add one task, then press Enter"
          className="flex-1 min-w-[200px] border-2.5 border-ink rounded-[14px] px-4 py-3 bg-surface"
        />
        <button onClick={add} className="ds-btn ds-btn-ghost">
          + Add
        </button>
      </div>

      {tasks.length === 0 && (
        <p className="text-sm text-ink-faint mt-4 mb-0">
          Dump them all in first — getting them out of your head is half of it.
        </p>
      )}

      {tasks.length > 0 && (
        <div className="mt-6 space-y-3">
          {tasks.map((t, i) => (
            <div
              key={i}
              className="border-2.5 border-ink rounded-[14px] p-4 bg-surface shadow-pop-sm"
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <b className="text-[15px]">{t.text}</b>
                <button
                  onClick={() => setTasks((p) => p.filter((_, x) => x !== i))}
                  className="text-xs font-bold text-ink-faint underline underline-offset-2"
                >
                  remove
                </button>
              </div>
              <div className="flex gap-2 flex-wrap mt-3">
                {LENSES.map((l) => (
                  <button
                    key={l.key}
                    onClick={() => setLens(i, l.key)}
                    aria-pressed={t.lens === l.key}
                    className={`border-2 border-ink rounded-full px-3.5 py-1.5 text-[13px] font-bold shadow-pop-sm transition-transform hover:-translate-y-px ${
                      t.lens === l.key ? "bg-violet text-white" : "bg-surface"
                    }`}
                  >
                    {l.emoji} {l.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {sorted && (
        <div className="mt-7 rounded-[16px] border-2.5 border-ink bg-violet-soft p-5">
          <span className="ds-pill bg-mint text-[#0B5C41]">
            🧮 your 1-2-3 list — three at most, always
          </span>
          {now.length > 0 ? (
            <ol className="mt-3 pl-6 font-bold space-y-1.5">
              {now.map((t, i) => (
                <li key={i}>{t.text}</li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-ink-soft mt-3 mb-0">
              Nothing under ⚡ Now yet — and honestly, that might be the correct
              answer today.
            </p>
          )}

          {shrink.length > 0 && (
            <p className="text-sm text-ink-soft mt-4 mb-0">
              🪜 {shrink.length} task{shrink.length > 1 ? "s" : ""} to shrink —
              send {shrink.length > 1 ? "them" : "it"} to the{" "}
              <Link
                href="/modules/task-decomposer"
                className="font-extrabold text-violet-deep underline underline-offset-2"
              >
                Task Decomposer
              </Link>
              .
            </p>
          )}
          {letgo.length > 0 && (
            <p className="text-sm text-ink-soft mt-2 mb-0">
              🕊️ Letting {letgo.length > 1 ? "those" : "that"} go is a decision,
              not a defeat.
            </p>
          )}

          {saved ? (
            <div className="mt-5">
              <p className="font-bold text-sm mb-3">✓ Saved privately.</p>
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
            <button onClick={save} className="ds-btn ds-btn-primary mt-5">
              Save this list
            </button>
          )}
        </div>
      )}
    </div>
  );
}
