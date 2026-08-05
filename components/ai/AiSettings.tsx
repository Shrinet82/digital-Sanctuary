"use client";

import { useState, useTransition } from "react";
import { setAiEnabled } from "@/app/actions/ai";

export function AiSettings({ enabled }: { enabled: boolean }) {
  const [on, setOn] = useState(enabled);
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = !on;
    setOn(next);
    startTransition(async () => {
      const res = await setAiEnabled(next);
      if (!res.ok) setOn(!next);
    });
  }

  return (
    <div className="ds-card">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3 className="text-lg">✨ AI suggestions</h3>
          <p className="text-sm text-ink-soft mt-1.5 mb-0 max-w-[52ch]">
            Off by default, and the app is complete without them. When on, AI
            can do exactly three things — all with your own words, all shown to
            you before anything is saved.
          </p>
        </div>
        <button
          onClick={toggle}
          disabled={pending}
          role="switch"
          aria-checked={on}
          className={`shrink-0 w-16 h-9 rounded-full border-2.5 border-ink shadow-pop-sm transition-colors relative disabled:opacity-60 ${
            on ? "bg-violet" : "bg-surface-2"
          }`}
        >
          <span
            className={`absolute top-0.5 w-7 h-7 rounded-full bg-white border-2 border-ink transition-all ${
              on ? "left-[30px]" : "left-0.5"
            }`}
          />
        </button>
      </div>

      <ul className="list-none p-0 m-0 mt-5 space-y-2.5">
        {[
          ["✍️", "Reword your task into a smaller first step"],
          ["📝", "Recap your own worksheet answers in plain language"],
          ["🗂️", "Summarise notes you wrote, neutrally"],
        ].map(([e, t]) => (
          <li key={t} className="flex gap-3 items-start text-sm">
            <span>{e}</span>
            <span>{t}</span>
          </li>
        ))}
      </ul>

      <div className="rounded-[14px] border-2 border-dashed border-ink bg-white/70 p-4 text-sm text-ink-soft mt-5">
        <b className="text-ink">It will never</b> diagnose you, assess risk,
        discuss medication or dosage, advise on withdrawal, or act as a
        therapist. Those are blocked by fixed rules that run{" "}
        <i>outside</i> the model, before it&apos;s even contacted — so it
        can&apos;t be talked around them.
      </div>

      <p className="text-xs text-ink-faint mt-4 mb-0">
        We record that a suggestion happened and whether you kept it — never
        what you wrote or what it said.
      </p>
    </div>
  );
}
