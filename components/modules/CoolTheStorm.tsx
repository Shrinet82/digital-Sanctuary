"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Slider } from "@/components/Slider";
import { savePracticeSession } from "@/app/actions/practice";

type Stage = "before" | "breathe" | "move" | "release" | "after";

/** DBT-derived: paced breathing + slow movement + release. No physical shock, ever. */
export function CoolTheStorm() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("before");
  const [before, setBefore] = useState(5);
  const [after, setAfter] = useState(5);
  const [seconds, setSeconds] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (stage !== "breathe" && stage !== "move") return;
    setSeconds(stage === "breathe" ? 30 : 20);
  }, [stage]);

  useEffect(() => {
    if (stage !== "breathe" && stage !== "move") return;
    if (seconds <= 0) {
      setStage(stage === "breathe" ? "move" : "release");
      return;
    }
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [stage, seconds]);

  async function finish(saveIt: boolean) {
    if (!saveIt) {
      router.push("/dashboard");
      return;
    }
    setSaving(true);
    const res = await savePracticeSession({
      moduleId: "cool-the-storm",
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
        <p className="font-bold text-sm mb-2">Before we start — how big is the storm right now?</p>
        <Slider id="before" label="Right now" lowLabel="Calm" highLabel="Overwhelming" value={before} onChange={setBefore} />
        <button onClick={() => setStage("breathe")} className="ds-btn ds-btn-primary mt-2">
          Start →
        </button>
      </div>
    );
  }

  if (stage === "breathe" || stage === "move") {
    const copy =
      stage === "breathe"
        ? { title: "Slow your breathing", body: "In for 4, hold for 2, out for 6. Let the exhale be longer than the in-breath." }
        : { title: "Move, slowly", body: "Roll your shoulders, shake out your hands, sway gently side to side. Nothing sharp, nothing fast." };
    return (
      <div className="ds-card text-center">
        <span className="font-display font-extrabold text-4xl block mb-4">{seconds}s</span>
        <h3 className="text-xl mb-2">{copy.title}</h3>
        <p className="text-ink-soft max-w-[40ch] mx-auto">{copy.body}</p>
        <button
          onClick={() => setStage(stage === "breathe" ? "move" : "release")}
          className="ds-btn ds-btn-ghost mt-6"
        >
          Skip ahead
        </button>
      </div>
    );
  }

  if (stage === "release") {
    return (
      <div className="ds-card text-center">
        <h3 className="text-xl mb-3">Let the breath out, long and slow.</h3>
        <p className="text-ink-soft max-w-[40ch] mx-auto mb-6">
          One more long exhale. Let your shoulders drop with it.
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
      <Slider id="after" label="How big is the storm now?" lowLabel="Calm" highLabel="Overwhelming" value={after} onChange={setAfter} />
      <div className={`rounded-xl border-2 border-ink p-4 text-sm mt-2 ${diff > 0 ? "bg-mint" : "bg-surface-2"}`}>
        {diff > 0 ? (
          <>It moved from <b>{before}</b> to <b>{after}</b> — down {diff}.</>
        ) : (
          <>It&apos;s at <b>{after}</b>. Storms don&apos;t always pass on schedule — you still rode part of it out.</>
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
