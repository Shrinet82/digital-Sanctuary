"use client";

import { useState, useTransition } from "react";
import { logFactor, setTrackedFactors } from "@/app/actions/tracking";
import { FACTORS, factorValueLabel, getFactor, type Factor } from "@/lib/factors";

export function FactorLogger({
  tracked,
  todayValues,
}: {
  tracked: string[];
  todayValues: Record<string, number>;
}) {
  const [keys, setKeys] = useState<string[]>(tracked);
  const [values, setValues] = useState<Record<string, number>>(todayValues);
  const [picking, setPicking] = useState(tracked.length === 0);
  const [, startTransition] = useTransition();
  const [note, setNote] = useState<string | null>(null);

  function toggleTracked(key: string) {
    const next = keys.includes(key)
      ? keys.filter((k) => k !== key)
      : [...keys, key];
    setKeys(next);
    startTransition(async () => {
      await setTrackedFactors(next);
    });
  }

  function save(factor: Factor, value: number | null) {
    setValues((v) => {
      const next = { ...v };
      if (value === null) delete next[factor.key];
      else next[factor.key] = value;
      return next;
    });
    startTransition(async () => {
      const res = await logFactor({ factorKey: factor.key, value });
      setNote(res.ok ? "Saved" : (res.error ?? "Couldn't save that"));
      setTimeout(() => setNote(null), 1800);
    });
  }

  if (picking) {
    return (
      <div className="ds-card">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h3 className="text-lg">What would you like to keep an eye on?</h3>
          {keys.length > 0 && (
            <button
              onClick={() => setPicking(false)}
              className="ds-btn ds-btn-primary ds-btn-sm !px-4 !py-2 !text-sm"
            >
              Done
            </button>
          )}
        </div>
        <p className="text-sm text-ink-soft mt-2">
          Pick only what you actually care about — tracking everything is its own
          kind of burden. You can change this any time, and nothing is required.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 mt-5">
          {FACTORS.map((f) => {
            const on = keys.includes(f.key);
            return (
              <button
                key={f.key}
                onClick={() => toggleTracked(f.key)}
                aria-pressed={on}
                className={`flex items-center gap-3 text-left border-2.5 border-ink rounded-[16px] p-4 shadow-pop-sm transition-transform hover:-translate-y-0.5 ${
                  on ? "bg-mint" : "bg-surface"
                }`}
              >
                <span className="grid place-items-center w-10 h-10 rounded-xl bg-sand border-2 border-ink text-lg -rotate-3">
                  {f.emoji}
                </span>
                <span>
                  <b className="block text-[15px]">{f.label}</b>
                  {f.help && (
                    <span className="text-[13px] text-ink-faint">{f.help}</span>
                  )}
                </span>
                {on && <span className="ml-auto font-extrabold">✓</span>}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="ds-card">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h3 className="text-lg">Today</h3>
        <div className="flex items-center gap-3">
          {note && (
            <span className="text-xs font-bold text-ink-faint">{note}</span>
          )}
          <button
            onClick={() => setPicking(true)}
            className="text-sm font-bold text-violet-deep underline underline-offset-2"
          >
            Change what I track
          </button>
        </div>
      </div>
      <p className="text-sm text-ink-soft mt-1.5">
        Log what you feel like logging. A blank day is a valid day.
      </p>

      <div className="mt-5 space-y-5">
        {keys.map((key) => {
          const factor = getFactor(key);
          if (!factor) return null;
          const value = values[key];
          const has = value !== undefined;

          return (
            <div key={key} className="border-b-2 border-line/10 last:border-0 pb-5 last:pb-0">
              <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
                <span className="font-bold text-[15px]">
                  <span className="mr-2">{factor.emoji}</span>
                  {factor.label}
                </span>
                <span className="flex items-center gap-2">
                  {has && (
                    <span className="ds-pill bg-sand">
                      {factorValueLabel(factor, value)}
                    </span>
                  )}
                  {has && (
                    <button
                      onClick={() => save(factor, null)}
                      className="text-xs font-bold text-ink-faint underline underline-offset-2"
                    >
                      clear
                    </button>
                  )}
                </span>
              </div>

              {factor.kind === "yesno" ? (
                <div className="flex gap-2.5">
                  {[
                    { v: 1, label: "Yes" },
                    { v: 0, label: "No" },
                  ].map((o) => (
                    <button
                      key={o.v}
                      onClick={() => save(factor, o.v)}
                      aria-pressed={value === o.v}
                      className={`border-2 border-ink rounded-full px-5 py-2 text-sm font-bold shadow-pop-sm transition-transform hover:-translate-y-px ${
                        value === o.v ? "bg-violet text-white" : "bg-surface"
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              ) : (
                <input
                  type="range"
                  min={factor.min ?? 0}
                  max={factor.max ?? 10}
                  value={value ?? Math.round(((factor.max ?? 10) - (factor.min ?? 0)) / 2)}
                  onChange={(e) => save(factor, Number(e.target.value))}
                  className="w-full h-3.5 rounded-full border-2 border-ink appearance-none cursor-pointer
                             bg-gradient-to-r from-mint via-violet-soft to-coral-soft
                             [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-7
                             [&::-webkit-slider-thumb]:h-7 [&::-webkit-slider-thumb]:rounded-full
                             [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-[3px]
                             [&::-webkit-slider-thumb]:border-ink [&::-webkit-slider-thumb]:shadow-pop-sm
                             [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6
                             [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white
                             [&::-moz-range-thumb]:border-[3px] [&::-moz-range-thumb]:border-ink"
                />
              )}
              {factor.help && !has && (
                <p className="text-xs text-ink-faint mt-1.5 mb-0">{factor.help}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
