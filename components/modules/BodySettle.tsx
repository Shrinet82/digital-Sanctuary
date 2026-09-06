"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Slider } from "@/components/Slider";
import { savePracticeSession } from "@/app/actions/practice";

const GROUPS = [
  { name: "Hands & arms", cue: "Make fists, tense your arms. Hold." },
  { name: "Shoulders", cue: "Raise your shoulders toward your ears. Hold." },
  { name: "Face", cue: "Scrunch your whole face tight. Hold." },
  { name: "Stomach", cue: "Tighten your stomach like bracing for a poke. Hold." },
  { name: "Legs", cue: "Press your feet into the floor, tense your legs. Hold." },
];

/** Progressive muscle release — tense, then let go, one group at a time. */
export function BodySettle() {
  const router = useRouter();
  const [stage, setStage] = useState<"before" | number | "release" | "after">("before");
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
      moduleId: "body-settle",
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
          Before we start — how tense does your body feel?
        </p>
        <Slider id="before" label="Right now" lowLabel="Loose" highLabel="Very tense" value={before} onChange={setBefore} />
        <button onClick={() => setStage(0)} className="ds-btn ds-btn-primary mt-2">
          Start →
        </button>
      </div>
    );
  }

  if (typeof stage === "number") {
    const group = GROUPS[stage];
    return (
      <div className="ds-card text-center">
        <span className="ds-pill bg-sand rotate-1 mb-4">
          {stage + 1} of {GROUPS.length}
        </span>
        <h3 className="text-xl mb-3">{group.name}</h3>
        <p className="text-lg max-w-[36ch] mx-auto mb-6">{group.cue}</p>
        <button
          onClick={() => setStage(stage + 1 >= GROUPS.length ? "release" : stage + 1)}
          className="ds-btn ds-btn-primary"
        >
          Now let it go →
        </button>
      </div>
    );
  }

  if (stage === "release") {
    return (
      <div className="ds-card text-center">
        <h3 className="text-xl mb-3">Let everything go, all at once.</h3>
        <p className="text-ink-soft max-w-[40ch] mx-auto mb-6">
          Shake out your hands, drop your shoulders, unclench your jaw.
          Notice the difference between tense and loose.
        </p>
        <button onClick={() => setStage("after")} className="ds-btn ds-btn-primary">
          Done →
        </button>
      </div>
    );
  }

  // after
  const diff = before - after;
  return (
    <div className="ds-card">
      <h2 className="text-xl mb-1">That&apos;s the full pass.</h2>
      <Slider id="after" label="How tense does your body feel now?" lowLabel="Loose" highLabel="Very tense" value={after} onChange={setAfter} />
      <div className={`rounded-xl border-2 border-ink p-4 text-sm mt-2 ${diff > 0 ? "bg-mint" : "bg-surface-2"}`}>
        {diff > 0 ? (
          <>Tension moved from <b>{before}</b> to <b>{after}</b> — down {diff}.</>
        ) : (
          <>Tension is at <b>{after}</b>. That&apos;s okay — some days it takes longer to unwind.</>
        )}
      </div>
      {saved ? (
        <button onClick={() => { router.push("/dashboard"); router.refresh(); }} className="ds-btn ds-btn-primary mt-5">
          Back to dashboard
        </button>
      ) : (
        <div className="flex gap-3 flex-wrap mt-5">
          <button onClick={() => finish(true)} disabled={saving} className="ds-btn ds-btn-primary disabled:opacity-60">
            {saving ? "Saving…" : "Save this check"}
          </button>
          <button onClick={() => finish(false)} className="ds-btn ds-btn-ghost">Discard &amp; leave</button>
        </div>
      )}
    </div>
  );
}
