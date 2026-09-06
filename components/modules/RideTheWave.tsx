"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { saveJournalEntry, savePracticeSession } from "@/app/actions/practice";
import {
  WAVE_DURATIONS,
  WAVE_KINDS,
  WAVE_TARGETS,
  pickActivity,
  pickKind,
  targetLabel,
  type WaveActivity,
  type WaveDuration,
  type WaveKind,
  type WaveTarget,
} from "@/lib/ride-the-wave";

type Stage = "target" | "duration" | "kind" | "running" | "after";
type Result = "gone" | "quieter" | "still_here";

const today = () => new Date().toISOString().slice(0, 10);

export function RideTheWave() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("target");
  const [round, setRound] = useState(0);
  const [target, setTarget] = useState<WaveTarget | null>(null);
  const [duration, setDuration] = useState<WaveDuration | null>(null);
  const [kind, setKind] = useState<WaveKind | null>(null);
  const [activity, setActivity] = useState<WaveActivity | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);

  function chooseKind(k: WaveKind) {
    const resolved = k;
    setKind(resolved);
    setActivity(pickActivity(resolved, `${today()}:${resolved}:${round}`));
    setSecondsLeft((duration ?? 5) * 60);
    setStage("running");
  }

  function chooseSurprise() {
    const resolved = pickKind(`${today()}:${round}`);
    chooseKind(resolved);
  }

  useEffect(() => {
    if (stage !== "running") return;
    if (secondsLeft <= 0) {
      setStage("after");
      return;
    }
    tick.current = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => {
      if (tick.current) clearTimeout(tick.current);
    };
  }, [stage, secondsLeft]);

  function recordResult(value: Result) {
    setResult(value);
    setSaving(true);
    savePracticeSession({
      moduleId: "ride-the-wave",
      outcome: value === "gone" ? "done" : value === "quieter" ? "partly" : "not_today",
      wasHelpful: value === "gone" || value === "quieter" ? true : null,
    }).then((res) => {
      setSaving(false);
      if (res.ok) setSaved(true);
    });
    saveJournalEntry({
      worksheetId: "ride-the-wave",
      answers: { target, duration, kind, activity: activity?.title, result: value },
    });
  }

  function ridAgain() {
    setRound((r) => r + 1);
    setResult(null);
    setSaved(false);
    setStage("kind");
  }

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  const totalSeconds = (duration ?? 5) * 60;
  const progress = totalSeconds > 0 ? 1 - secondsLeft / totalSeconds : 0;

  if (stage === "target") {
    return (
      <div className="ds-card">
        <p className="text-sm text-ink-soft mb-1">
          An urge is a wave — strongest right when it starts, and it passes
          whether or not you act on it. You don&apos;t have to fight it. You
          have to outlast it.
        </p>
        <fieldset className="mt-5">
          <legend className="font-bold text-lg mb-3">What are you riding?</legend>
          <div className="flex gap-2.5 flex-wrap">
            {WAVE_TARGETS.map((t) => (
              <button
                key={t.value}
                onClick={() => {
                  setTarget(t.value);
                  setStage("duration");
                }}
                className="border-2 border-ink rounded-full px-4 py-2.5 text-[14.5px] font-bold bg-surface shadow-pop-sm transition-transform hover:-translate-y-px"
              >
                {t.label}
              </button>
            ))}
          </div>
        </fieldset>
      </div>
    );
  }

  if (stage === "duration") {
    return (
      <div className="ds-card">
        <legend className="font-bold text-lg mb-3 block">
          How long have you got?
        </legend>
        <div className="flex gap-2.5 flex-wrap">
          {WAVE_DURATIONS.map((d) => (
            <button
              key={d.value}
              onClick={() => {
                setDuration(d.value);
                setStage("kind");
              }}
              className="border-2.5 border-ink rounded-[14px] px-6 py-4 font-display font-extrabold text-lg bg-surface shadow-pop-sm transition-transform hover:-translate-y-0.5"
            >
              {d.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setStage("target")}
          className="ds-btn ds-btn-ghost mt-5"
        >
          ← Back
        </button>
      </div>
    );
  }

  if (stage === "kind") {
    return (
      <div className="ds-card">
        <legend className="font-bold text-lg mb-3 block">What kind of thing?</legend>
        <div className="grid grid-cols-2 gap-3">
          {WAVE_KINDS.map((k) => (
            <button
              key={k.value}
              onClick={() => chooseKind(k.value)}
              className="flex items-center gap-2.5 border-2.5 border-ink rounded-[14px] px-4 py-3.5 bg-surface shadow-pop-sm transition-transform hover:-translate-y-0.5"
            >
              <span className="text-xl">{k.emoji}</span>
              <b className="text-[15px]">{k.label}</b>
            </button>
          ))}
        </div>
        <button
          onClick={chooseSurprise}
          className="ds-btn ds-btn-primary mt-4 w-full"
        >
          ✨ Just pick for me
        </button>
      </div>
    );
  }

  if (stage === "running" && activity) {
    return (
      <div className="ds-card text-center">
        <span className="ds-pill bg-mint text-[#0B5C41] mb-4">
          riding: {target ? targetLabel(target) : ""}
        </span>
        <div className="grid place-items-center min-h-[220px]">
          <div
            aria-hidden
            className="w-40 h-40 rounded-full border-2.5 border-ink grid place-items-center font-display font-extrabold text-3xl shadow-pop"
            style={{
              background: `conic-gradient(#2FC6B0 ${progress * 360}deg, #E9DFFD 0deg)`,
            }}
          >
            <span className="bg-surface rounded-full w-28 h-28 grid place-items-center border-2 border-ink">
              {mm}:{ss}
            </span>
          </div>
        </div>
        <h3 className="text-xl mt-6">{activity.title}</h3>
        <p className="text-ink-soft mt-2 max-w-[48ch] mx-auto">
          {activity.instructions}
        </p>
        <button
          onClick={() => setStage("after")}
          className="ds-btn ds-btn-ghost mt-6"
        >
          Finish now
        </button>
      </div>
    );
  }

  // after
  return (
    <div className="ds-card">
      <h2 className="text-2xl mb-1">You rode it out.</h2>
      {result === null ? (
        <>
          <p className="text-ink-soft mt-2 mb-5">How is it now?</p>
          <div className="grid grid-cols-3 gap-3">
            {(
              [
                { value: "gone", label: "Gone", emoji: "☀️" },
                { value: "quieter", label: "Quieter", emoji: "🌤️" },
                { value: "still_here", label: "Still here", emoji: "🌊" },
              ] as const
            ).map((r) => (
              <button
                key={r.value}
                onClick={() => recordResult(r.value)}
                className="border-2.5 border-ink rounded-[14px] py-4 text-center shadow-pop-sm transition-transform hover:-translate-y-px bg-surface"
              >
                <span className="block text-2xl mb-1">{r.emoji}</span>
                <b className="text-[14px]">{r.label}</b>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="mt-4">
          {result === "still_here" ? (
            <>
              <p className="text-ink-soft mb-4">
                Still here is allowed. It doesn&apos;t mean this didn&apos;t
                help — some waves are just longer. You don&apos;t have to
                decide anything else right now.
              </p>
              <div className="flex gap-3 flex-wrap">
                <button onClick={ridAgain} className="ds-btn ds-btn-primary">
                  Ride another round →
                </button>
                <Link href="/safety-net" className="ds-btn ds-btn-ghost no-underline">
                  See my Safety Net
                </Link>
              </div>
            </>
          ) : (
            <>
              <p className="font-bold text-[15px] mb-4">
                {result === "gone"
                  ? "That counts, fully."
                  : "Quieter counts too — you didn't have to make it disappear."}
              </p>
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() => {
                    router.push("/dashboard");
                    router.refresh();
                  }}
                  className="ds-btn ds-btn-primary"
                >
                  Back to dashboard
                </button>
                <button onClick={ridAgain} className="ds-btn ds-btn-ghost">
                  Ride again
                </button>
              </div>
            </>
          )}
          <p className="text-xs text-ink-faint mt-4">
            {saving ? "Saving…" : saved ? "Saved privately." : ""}
          </p>
        </div>
      )}
    </div>
  );
}
