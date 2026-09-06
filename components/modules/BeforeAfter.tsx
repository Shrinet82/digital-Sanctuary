"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Slider } from "@/components/Slider";
import { saveJournalEntry, savePracticeSession } from "@/app/actions/practice";

type Stage = "pick" | "before" | "doing" | "after";

/** Behavioural activation, made visible: watch doing lift you, in your own numbers. */
export function BeforeAfter() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("pick");
  const [action, setAction] = useState("");
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
    await saveJournalEntry({
      worksheetId: "before-after",
      answers: { action, mood_before: before, mood_after: after },
    });
    const res = await savePracticeSession({
      moduleId: "before-after",
      ratingBefore: before,
      ratingAfter: after,
      outcome: "done",
      wasHelpful: after > before,
    });
    setSaving(false);
    if (res.ok) setSaved(true);
  }

  if (stage === "pick") {
    return (
      <div className="ds-card">
        <label htmlFor="action" className="block font-bold text-sm mb-2">
          What&apos;s one thing you could do in the next few minutes?
        </label>
        <input
          id="action"
          value={action}
          onChange={(e) => setAction(e.target.value)}
          placeholder="e.g. make tea, step outside, text a friend"
          className="w-full border-2.5 border-ink rounded-[14px] px-4 py-3 bg-surface"
        />
        <p className="text-xs text-ink-faint mt-3">
          It doesn&apos;t need to sound impressive — small and doable beats big
          and abandoned.
        </p>
        <button
          onClick={() => action.trim() && setStage("before")}
          disabled={!action.trim()}
          className="ds-btn ds-btn-primary mt-4 disabled:opacity-50"
        >
          Continue →
        </button>
      </div>
    );
  }

  if (stage === "before") {
    return (
      <div className="ds-card">
        <p className="font-bold text-sm mb-1">Before you do it —</p>
        <p className="text-ink-soft text-sm mb-4">
          How&apos;s your mood right now? No wrong answer.
        </p>
        <Slider
          id="before"
          label="Right now"
          lowLabel="Low"
          highLabel="Good"
          value={before}
          onChange={setBefore}
        />
        <div className="flex gap-3 flex-wrap mt-4">
          <button onClick={() => setStage("doing")} className="ds-btn ds-btn-primary">
            I&apos;m going to do it →
          </button>
          <button onClick={() => router.push("/dashboard")} className="ds-btn ds-btn-ghost">
            Not now
          </button>
        </div>
      </div>
    );
  }

  if (stage === "doing") {
    return (
      <div className="ds-card text-center">
        <span className="ds-pill bg-mint text-[#0B5C41] mb-4">your action</span>
        <h3 className="text-2xl mb-4">{action}</h3>
        <p className="text-ink-soft mb-6">
          Go do it now. Come back whenever it&apos;s done — there&apos;s no
          timer here.
        </p>
        <button onClick={() => setStage("after")} className="ds-btn ds-btn-primary">
          I did it (or tried) →
        </button>
      </div>
    );
  }

  // after
  const diff = after - before;
  return (
    <div className="ds-card">
      <h2 className="text-xl mb-1">How&apos;s your mood now?</h2>
      <Slider
        id="after"
        label="Right now"
        lowLabel="Low"
        highLabel="Good"
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
            Mood moved from <b>{before}</b> to <b>{after}</b> — up {diff}.
            That&apos;s doing lifting mood, not the other way round.
          </>
        ) : (
          <>
            Mood is at <b>{after}</b>. Doing something doesn&apos;t always
            move the number right away — you still did it, and that counts.
          </>
        )}
      </div>

      {saved ? (
        <div className="mt-5">
          <p className="font-bold text-sm mb-3">✓ Saved privately.</p>
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
