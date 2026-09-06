"use client";

import { useState } from "react";
import Link from "next/link";
import { WORRY_ROUTES, type WorryRoute } from "@/lib/worry";

/**
 * The user classifies their own worry — this never guesses at what kind
 * of worry it is. It just routes on the answer they give (§10).
 */
export function WorrySorter() {
  const [worry, setWorry] = useState("");
  const [route, setRoute] = useState<WorryRoute | null>(null);

  return (
    <div className="ds-card">
      <label htmlFor="worry" className="block font-bold text-sm mb-2">
        What&apos;s on your mind? <span className="text-ink-faint font-medium">(optional)</span>
      </label>
      <input
        id="worry"
        value={worry}
        onChange={(e) => setWorry(e.target.value)}
        placeholder="e.g. the thing I said in that meeting"
        className="w-full border-2.5 border-ink rounded-[14px] px-4 py-3 bg-surface"
      />

      <fieldset className="mt-6">
        <legend className="font-bold text-sm mb-3">Which one fits best?</legend>
        <div className="space-y-2.5">
          {WORRY_ROUTES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRoute(r.value)}
              aria-pressed={route === r.value}
              className={`block w-full text-left border-2.5 border-ink rounded-[16px] px-5 py-4 shadow-pop-sm transition-transform hover:-translate-y-0.5 ${
                route === r.value ? "bg-violet-soft" : "bg-surface"
              }`}
            >
              <b className="text-[15px]">{r.label}</b>
            </button>
          ))}
        </div>
      </fieldset>

      {route === "actionable" && (
        <div className="ds-card !shadow-pop-sm bg-mint mt-5">
          <p className="text-ink-soft text-[15px] mb-4">
            Worth turning this into an actual step, rather than just
            circling it in your head.
          </p>
          <Link href="/modules/task-decomposer" className="ds-btn ds-btn-primary no-underline">
            Break it into steps →
          </Link>
        </div>
      )}

      {route === "uncertain" && (
        <div className="ds-card !shadow-pop-sm bg-mint mt-5">
          <p className="text-ink-soft text-[15px] mb-4">
            When there's nothing to actually do right now, holding onto it
            just tires you out. Worth parking it to a set time instead.
          </p>
          <Link href="/modules/worry-window" className="ds-btn ds-btn-primary no-underline">
            Park this worry →
          </Link>
        </div>
      )}

      {route === "needs_help" && (
        <div className="ds-card !shadow-pop-sm bg-coral-soft mt-5">
          <p className="text-ink-soft text-[15px] mb-4">
            This isn&apos;t something a worksheet should try to hold. Use the{" "}
            <b>Need urgent help?</b> button at the top of the screen, or open
            your Safety Net for what&apos;s worked before and who to call.
          </p>
          <Link href="/safety-net" className="ds-btn ds-btn-primary no-underline">
            Open my Safety Net →
          </Link>
        </div>
      )}
    </div>
  );
}
