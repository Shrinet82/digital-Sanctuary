"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Slider } from "@/components/Slider";
import { savePracticeSession } from "@/app/actions/practice";

const STEPS = [
  { count: 5, sense: "see", prompt: "Name 5 things you can see around you." },
  { count: 4, sense: "feel", prompt: "Name 4 things you can feel — texture, temperature, weight." },
  { count: 3, sense: "hear", prompt: "Name 3 things you can hear right now." },
  { count: 2, sense: "smell", prompt: "Name 2 things you can smell." },
  { count: 1, sense: "taste", prompt: "Name 1 thing you can taste, or notice in your mouth." },
];

/** Sensory grounding — widely practised, grade C, no red flags (§17). Tap-through by design. */
export function FiveSenses() {
  const router = useRouter();
  const [stage, setStage] = useState<"before" | number | "after">("before");
  const [before, setBefore] = useState(5);
  const [after, setAfter] = useState(5);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function finish(saveIt: boolean) {
    if (!saveIt) {
      router.push("/dashboard");
      return;
    }
    setSaving(true);
    const res = await savePracticeSession({
      moduleId: "grounding-54321",
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
        <button onClick={() => setStage(0)} className="ds-btn ds-btn-primary mt-2">
          Start →
        </button>
      </div>
    );
  }

  if (typeof stage === "number") {
    const step = STEPS[stage];
    return (
      <div className="ds-card text-center">
        <span className="ds-pill bg-sand rotate-1 mb-4">
          {stage + 1} of {STEPS.length}
        </span>
        <div className="min-h-[160px] flex flex-col items-center justify-center gap-3">
          <span className="font-display font-extrabold text-5xl">{step.count}</span>
          <p className="text-lg max-w-[36ch]">{step.prompt}</p>
        </div>
        <p className="text-xs text-ink-faint mb-4">
          Say them out loud or just to yourself — nothing to type here.
        </p>
        <button
          onClick={() =>
            setStage(stage + 1 >= STEPS.length ? "after" : stage + 1)
          }
          className="ds-btn ds-btn-primary"
        >
          Got them →
        </button>
      </div>
    );
  }

  // after
  const diff = before - after;
  return (
    <div className="ds-card">
      <h2 className="text-xl mb-1">That&apos;s the five senses done.</h2>
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
          </>
        ) : (
          <>Intensity is at <b>{after}</b>. That&apos;s okay — you still did it.</>
        )}
      </div>

      {saved ? (
        <button
          onClick={() => {
            router.push("/dashboard");
            router.refresh();
          }}
          className="ds-btn ds-btn-primary mt-5"
        >
          Back to dashboard
        </button>
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
