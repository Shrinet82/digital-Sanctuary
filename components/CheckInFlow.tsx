"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Slider } from "@/components/Slider";
import { saveCheckIn } from "@/app/actions/practice";
import {
  MODE_LABELS,
  recommend,
  type Mode,
  type Recommendation,
} from "@/lib/recommend";

export function CheckInFlow() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [distress, setDistress] = useState<number | null>(null);
  const [energy, setEnergy] = useState<number | null>(null);
  const [attention, setAttention] = useState<number | null>(null);
  const [urge, setUrge] = useState<number | null>(null);
  const [mode, setMode] = useState<Mode | null>(null);

  const [result, setResult] = useState<Recommendation | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    const checkIn = { distress, energy, attention, urge, mode };
    // Rules run locally and instantly — the save is just persistence.
    setResult(recommend(checkIn));
    setError(null);
    startTransition(async () => {
      const res = await saveCheckIn(checkIn);
      if (!res.ok) setError(res.error ?? "We couldn't save that check-in.");
    });
  }

  if (result) {
    return (
      <div>
        <div className="ds-card bg-gradient-to-br from-violet-soft via-coral-soft to-sand">
          <div className="flex gap-2 flex-wrap mb-3">
            <span className="ds-pill bg-white">{result.condition}</span>
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
                <span className="text-sm text-ink-faint">{alt.condition}</span>
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

  return (
    <div className="ds-card">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <span className="ds-pill bg-mint text-[#0B5C41]">
          🧮 rule-based · no AI reads this
        </span>
        <span className="text-sm text-ink-faint">
          skip anything that isn&apos;t it today
        </span>
      </div>

      <Slider
        id="distress"
        label="How intense does it feel right now?"
        lowLabel="Calm"
        highLabel="Very intense"
        value={distress}
        onChange={setDistress}
      />
      <Slider
        id="energy"
        label="Energy"
        lowLabel="Running on empty"
        highLabel="Plenty"
        value={energy}
        onChange={setEnergy}
      />
      <Slider
        id="attention"
        label="Attention & focus"
        lowLabel="Scattered / stuck"
        highLabel="Clear"
        value={attention}
        onChange={setAttention}
      />
      <Slider
        id="urge"
        label="Any urge or craving?"
        lowLabel="None"
        highLabel="Strong"
        value={urge}
        onChange={setUrge}
      />

      <fieldset className="mt-6">
        <legend className="font-bold text-sm mb-2">
          Right now I mostly want to…
        </legend>
        <div className="flex gap-2.5 flex-wrap">
          {MODE_LABELS.map((m) => (
            <button
              key={m.value}
              type="button"
              aria-pressed={mode === m.value}
              onClick={() => setMode(mode === m.value ? null : m.value)}
              className={`border-2 border-ink rounded-full px-4 py-2.5 text-[14.5px] font-bold shadow-pop-sm transition-transform hover:-translate-y-px ${
                mode === m.value ? "bg-violet text-white" : "bg-surface"
              }`}
            >
              <span className="mr-1.5">{m.emoji}</span>
              {m.label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="flex gap-3 flex-wrap mt-7">
        <button onClick={handleSubmit} className="ds-btn ds-btn-primary">
          Show me what might help ✨
        </button>
        <Link href="/dashboard" className="ds-btn ds-btn-ghost no-underline">
          Skip
        </Link>
      </div>
    </div>
  );
}
