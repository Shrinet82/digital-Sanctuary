"use client";

import { useState } from "react";
import Link from "next/link";
import { MODULES } from "@/lib/recommend";

const FRICTIONS: { text: string; moduleId: string; reason: string }[] = [
  {
    text: "I don't know where to start",
    moduleId: "task-decomposer",
    reason: "Not knowing where to start usually means the task needs breaking into a smaller first move.",
  },
  {
    text: "It's too big — everything feels urgent",
    moduleId: "priority-lens",
    reason: "When everything feels urgent, sorting through one lens cuts it down to a list of three.",
  },
  {
    text: "I know what to do but can't make myself",
    moduleId: "time-container",
    reason: "A visible container with a soft start often lowers the cost of beginning more than willpower does.",
  },
  {
    text: "I have no energy for this today",
    moduleId: "energy-aware-week",
    reason: "Worth planning from your real capacity today, rather than pushing through on an empty tank.",
  },
];

/**
 * The entry point for the "I can't start" lane (§10) — names the friction,
 * routes to the right built tool. Not an exercise itself, so nothing here
 * is saved; it's a triage screen, same spirit as the recommender.
 */
export function WhatsBlockingMe() {
  const [chosen, setChosen] = useState<(typeof FRICTIONS)[number] | null>(null);
  const target = chosen ? MODULES[chosen.moduleId] : null;

  return (
    <div className="ds-card">
      <fieldset>
        <legend className="font-bold text-lg mb-4">
          What&apos;s blocking you right now?
        </legend>
        <div className="space-y-2.5">
          {FRICTIONS.map((f) => (
            <button
              key={f.text}
              onClick={() => setChosen(f)}
              aria-pressed={chosen?.text === f.text}
              className={`block w-full text-left border-2.5 border-ink rounded-[16px] px-5 py-4 shadow-pop-sm transition-transform hover:-translate-y-0.5 ${
                chosen?.text === f.text ? "bg-violet-soft" : "bg-surface"
              }`}
            >
              <b className="text-[15px]">{f.text}</b>
            </button>
          ))}
        </div>
      </fieldset>

      {target && chosen && (
        <div className="ds-card !shadow-pop-sm bg-mint mt-5">
          <div className="bg-white/90 border-2 border-ink rounded-xl px-4 py-3 mb-4 text-[14.5px] text-ink-soft shadow-pop-sm">
            <span className="text-violet-deep font-extrabold">“</span>{" "}
            {chosen.reason}
          </div>
          <h3 className="text-xl">{target.title}</h3>
          <p className="text-ink-soft mt-1 mb-4">{target.description}</p>
          <Link
            href={`/modules/${target.moduleId}`}
            className="ds-btn ds-btn-primary no-underline"
          >
            Let&apos;s go →
          </Link>
        </div>
      )}
    </div>
  );
}
