"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { saveCheckIn } from "@/app/actions/practice";
import { recommend, type Recommendation } from "@/lib/recommend";
import { getModule, groupLabel } from "@/lib/modules";
import {
  DEFAULT_CONTEXT_CHIPS,
  LOUDEST_OPTIONS,
  MAX_LOUDEST,
  STATES,
  WANT_OPTIONS,
  type CheckInState,
  type Loudest,
  type Want,
} from "@/lib/checkin";

type Screen = 0 | 1 | 2 | 3;

/** The state-based lane a recommended module belongs to (§10), for the subtitle pill. */
function laneFor(moduleId: string): string {
  const m = getModule(moduleId);
  return m ? groupLabel(m.group) : "";
}

function Chip({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={`border-2 border-ink rounded-full px-4 py-2.5 text-[14.5px] font-bold shadow-pop-sm transition-transform hover:-translate-y-px disabled:opacity-40 disabled:hover:translate-y-0 ${
        active ? "bg-violet text-white" : "bg-surface"
      }`}
    >
      {children}
    </button>
  );
}

export function CheckInFlow() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [screen, setScreen] = useState<Screen>(0);
  const [state, setState] = useState<CheckInState | null>(null);
  const [loudest, setLoudest] = useState<Loudest[]>([]);
  const [context, setContext] = useState<string[]>([]);

  const [result, setResult] = useState<Recommendation | null>(null);
  const [justLogged, setJustLogged] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleLoudest(v: Loudest) {
    setLoudest((prev) => {
      if (prev.includes(v)) return prev.filter((x) => x !== v);
      if (prev.length >= MAX_LOUDEST) return prev;
      return [...prev, v];
    });
  }

  function toggleContext(v: string) {
    setContext((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]
    );
  }

  function finish(want: Want | null) {
    if (!state) return;
    const checkIn = { state, loudest, context, want };

    startTransition(async () => {
      const res = await saveCheckIn(checkIn);
      if (!res.ok) setError(res.error ?? "We couldn't save that check-in.");
    });

    // "Just log it" (or nothing chosen) ends the flow here — the log is
    // valid on its own, and we never push an exercise on someone who
    // didn't ask for one (§5).
    if (want === null || want === "log") {
      setJustLogged(true);
      return;
    }
    setResult(recommend(checkIn));
  }

  if (result) {
    return (
      <div>
        <div className="ds-card bg-gradient-to-br from-violet-soft via-coral-soft to-sand">
          <div className="flex gap-2 flex-wrap mb-3">
            <span className="ds-pill bg-white">{laneFor(result.moduleId)}</span>
            <span className="ds-pill bg-mint text-[#0B5C41]">
              🧮 picked by transparent rules
            </span>
          </div>
          <h2 className="text-2xl">{result.title}</h2>
          <p className="text-ink-soft mt-2 max-w-[52ch]">{result.description}</p>

          <div className="bg-white/90 border-2 border-ink rounded-xl px-4 py-3 my-4 text-[14.5px] text-ink-soft shadow-pop-sm">
            <span className="text-violet-deep font-extrabold">“</span>{" "}
            {result.reason}
          </div>

          <Link
            href={`/modules/${result.moduleId}`}
            className="ds-btn ds-btn-primary no-underline"
          >
            Let&apos;s go →
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 mt-4">
          {result.alternatives.map((alt) => (
            <Link
              key={alt.moduleId}
              href={`/modules/${alt.moduleId}`}
              className="ds-card !p-4 flex items-center justify-between gap-4 no-underline text-ink hover:-translate-y-0.5 transition-transform"
            >
              <span>
                <b className="block text-[15px]">{alt.title}</b>
                <span className="text-sm text-ink-faint">{laneFor(alt.moduleId)}</span>
              </span>
              <span className="text-violet-deep text-xl font-extrabold">→</span>
            </Link>
          ))}
        </div>

        <p className="text-xs text-ink-faint mt-5">
          {pending
            ? "Saving your check-in…"
            : error
              ? error
              : "Saved privately to your account."}{" "}
          <button
            onClick={() => router.push("/dashboard")}
            className="underline underline-offset-2 font-bold"
          >
            Back to dashboard
          </button>
        </p>
      </div>
    );
  }

  if (justLogged) {
    return (
      <div className="ds-card">
        <span className="ds-pill bg-mint text-[#0B5C41] mb-3">✓ logged</span>
        <h2 className="text-2xl">That&apos;s it. It&apos;s logged.</h2>
        <p className="text-ink-soft mt-2 max-w-[48ch]">
          A check-in is a complete entry on its own — nothing else is
          required. It&apos;ll show up in your Ledger today.
        </p>
        <p className="text-xs text-ink-faint mt-4">
          {pending ? "Saving…" : error ?? "Saved privately to your account."}
        </p>
        <div className="flex gap-3 flex-wrap mt-5">
          <Link href="/ledger" className="ds-btn ds-btn-primary no-underline">
            See your Ledger →
          </Link>
          <button
            onClick={() => router.push("/dashboard")}
            className="ds-btn ds-btn-ghost"
          >
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ds-card">
      <div className="flex justify-between items-center flex-wrap gap-2 mb-5">
        <span className="ds-pill bg-mint text-[#0B5C41]">
          🧮 rule-based · no AI reads this
        </span>
        <span className="text-sm text-ink-faint">
          {screen + 1} of 4 — tap what fits, skip what doesn&apos;t
        </span>
      </div>

      {screen === 0 && (
        <fieldset>
          <legend className="font-bold text-lg mb-4">How are you, right now?</legend>
          <div className="grid grid-cols-5 gap-2.5">
            {STATES.map((s) => (
              <button
                key={s.value}
                type="button"
                aria-pressed={state === s.value}
                onClick={() => {
                  setState(s.value);
                  setScreen(1);
                }}
                className={`flex flex-col items-center gap-1.5 border-2.5 border-ink rounded-[14px] py-4 shadow-pop-sm transition-transform hover:-translate-y-0.5 ${
                  state === s.value ? "bg-violet-soft" : "bg-surface"
                }`}
              >
                <span className="text-3xl">{s.emoji}</span>
                <span className="text-[13px] font-bold">{s.label}</span>
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {screen === 1 && (
        <fieldset>
          <legend className="font-bold text-lg mb-1">
            What&apos;s loudest right now?
          </legend>
          <p className="text-sm text-ink-faint mb-4">
            Pick up to {MAX_LOUDEST}. Optional.
          </p>
          <div className="flex gap-2.5 flex-wrap">
            {LOUDEST_OPTIONS.map((l) => (
              <Chip
                key={l.value}
                active={loudest.includes(l.value)}
                disabled={
                  !loudest.includes(l.value) && loudest.length >= MAX_LOUDEST
                }
                onClick={() => toggleLoudest(l.value)}
              >
                {l.label}
              </Chip>
            ))}
          </div>
          <div className="flex gap-3 flex-wrap mt-6">
            <button onClick={() => setScreen(2)} className="ds-btn ds-btn-primary">
              Continue →
            </button>
            <button onClick={() => setScreen(0)} className="ds-btn ds-btn-ghost">
              ← Back
            </button>
          </div>
        </fieldset>
      )}

      {screen === 2 && (
        <fieldset>
          <legend className="font-bold text-lg mb-1">Anything going on?</legend>
          <p className="text-sm text-ink-faint mb-4">Optional context.</p>
          <div className="flex gap-2.5 flex-wrap">
            {DEFAULT_CONTEXT_CHIPS.map((c) => (
              <Chip
                key={c}
                active={context.includes(c)}
                onClick={() => toggleContext(c)}
              >
                {c}
              </Chip>
            ))}
          </div>
          <div className="flex gap-3 flex-wrap mt-6">
            <button onClick={() => setScreen(3)} className="ds-btn ds-btn-primary">
              Continue →
            </button>
            <button onClick={() => setScreen(1)} className="ds-btn ds-btn-ghost">
              ← Back
            </button>
          </div>
        </fieldset>
      )}

      {screen === 3 && (
        <fieldset>
          <legend className="font-bold text-lg mb-4">What would help?</legend>
          <div className="flex gap-2.5 flex-wrap">
            {WANT_OPTIONS.map((w) => (
              <Chip key={w.value} active={false} onClick={() => finish(w.value)}>
                {w.label}
              </Chip>
            ))}
          </div>
          <div className="flex gap-3 flex-wrap mt-6">
            <button onClick={() => setScreen(2)} className="ds-btn ds-btn-ghost">
              ← Back
            </button>
          </div>
        </fieldset>
      )}
    </div>
  );
}
