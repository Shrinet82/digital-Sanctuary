"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Slider } from "@/components/Slider";
import { savePracticeSession } from "@/app/actions/practice";

type Phase = "in" | "hold" | "out";
const CYCLES = 6;
const TIMING: Record<Phase, number> = { in: 4000, hold: 2000, out: 6000 };
const COPY: Record<Phase, { label: string; word: string }> = {
  in: { label: "Breathe in, slowly…", word: "In" },
  hold: { label: "Hold…", word: "Hold" },
  out: { label: "Breathe out, longer…", word: "Out" },
};

export function GroundAndSettle() {
  const router = useRouter();
  const [stage, setStage] = useState<"before" | "running" | "after">("before");
  const [before, setBefore] = useState(5);
  const [after, setAfter] = useState(5);
  const [phase, setPhase] = useState<Phase>("in");
  const [cycle, setCycle] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Drive the breathing cycle.
  useEffect(() => {
    if (stage !== "running") return;
    if (cycle >= CYCLES) {
      setStage("after");
      return;
    }
    const next: Record<Phase, Phase> = { in: "hold", hold: "out", out: "in" };
    timer.current = setTimeout(() => {
      if (phase === "out") setCycle((c) => c + 1);
      setPhase(next[phase]);
    }, TIMING[phase]);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [stage, phase, cycle]);

  async function finish(saveIt: boolean) {
    if (!saveIt) {
      router.push("/dashboard");
      return;
    }
    setSaving(true);
    const res = await savePracticeSession({
      moduleId: "ground-and-settle",
      ratingBefore: before,
      ratingAfter: after,
      outcome: "done",
      wasHelpful: after < before,
    });
    setSaving(false);
    if (res.ok) setSaved(true);
  }

  if (stage === "before") {
    return (
      <div className="ds-card">
        <p className="font-bold text-sm mb-2">
          Before we start — how intense does it feel?{" "}
          <span className="text-ink-faint font-medium">(optional)</span>
        </p>
        <Slider
          id="before"
          label="Right now"
          lowLabel="Calm"
          highLabel="Very intense"
          value={before}
          onChange={setBefore}
        />
        <div className="flex gap-3 flex-wrap mt-4">
          <button
            onClick={() => {
              setStage("running");
              setPhase("in");
              setCycle(0);
            }}
            className="ds-btn ds-btn-primary"
          >
            Start breathing →
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className="ds-btn ds-btn-ghost"
          >
            Not now
          </button>
        </div>
        <p className="text-xs text-ink-faint mt-4">
          Nothing is saved unless you choose to save it.
        </p>
      </div>
    );
  }

  if (stage === "running") {
    const scale = phase === "in" ? 1.3 : phase === "hold" ? 1.3 : 0.85;
    return (
      <div className="ds-card text-center">
        <div className="grid place-items-center min-h-[280px]">
          <div
            aria-hidden
            className="w-44 h-44 rounded-full border-2.5 border-ink grid place-items-center text-white font-display font-extrabold text-lg shadow-pop"
            style={{
              background:
                "conic-gradient(from 200deg, #8B5CF6, #FF6B5E, #FFD84D, #2FC6B0, #8B5CF6)",
              transform: `scale(${scale})`,
              transition: `transform ${TIMING[phase]}ms ease-in-out`,
            }}
          >
            {COPY[phase].word}
          </div>
        </div>
        <p className="font-display font-extrabold text-xl mt-6" aria-live="polite">
          {COPY[phase].label}
        </p>
        <p className="text-sm text-ink-faint font-bold mt-1">
          Cycle {Math.min(cycle + 1, CYCLES)} of {CYCLES}
        </p>
        <button
          onClick={() => setStage("after")}
          className="ds-btn ds-btn-ghost mt-5"
        >
          Pause &amp; finish
        </button>
      </div>
    );
  }

  // after
  const diff = before - after;
  return (
    <div className="ds-card">
      <h2 className="text-xl mb-1">That&apos;s enough for now.</h2>
      <Slider
        id="after"
        label="How intense does it feel now?"
        lowLabel="Calm"
        highLabel="Very intense"
        value={after}
        onChange={setAfter}
      />

      <div
        className={`rounded-xl border-2 border-ink p-4 text-sm mt-2 ${
          diff > 0 ? "bg-mint" : "bg-surface-2"
        }`}
      >
        {diff > 0 ? (
          <>
            Intensity moved from <b>{before}</b> to <b>{after}</b> — down {diff}.
            That counts.
          </>
        ) : (
          <>
            Intensity is at <b>{after}</b>. That&apos;s okay — some days settle
            slower. You showed up, and that matters.
          </>
        )}
      </div>

      {saved ? (
        <div className="mt-5">
          <p className="font-bold text-sm mb-3">
            ✓ Saved privately to your check-ins.
          </p>
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
        <div className="flex gap-3 flex-wrap mt-5">
          <button
            onClick={() => finish(true)}
            disabled={saving}
            className="ds-btn ds-btn-primary disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save this check"}
          </button>
          <button onClick={() => finish(false)} className="ds-btn ds-btn-ghost">
            Discard &amp; leave
          </button>
        </div>
      )}
    </div>
  );
}
