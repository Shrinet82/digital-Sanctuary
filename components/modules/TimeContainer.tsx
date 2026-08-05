"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { savePracticeSession } from "@/app/actions/practice";

const RITUAL_START = [
  "Water within reach",
  "Phone out of sight",
  "One tab / one thing open",
];

export function TimeContainer() {
  const router = useRouter();
  const [minutes, setMinutes] = useState(15);
  const [stage, setStage] = useState<"setup" | "running" | "done">("setup");
  const [left, setLeft] = useState(0);
  const [total, setTotal] = useState(0);
  const [running, setRunning] = useState(true);
  const [ritual, setRitual] = useState<Set<number>>(new Set());
  const [landed, setLanded] = useState(false);
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (stage !== "running") return;
    tick.current = setInterval(() => {
      setLeft((l) => {
        if (!running) return l;
        if (l <= 1) {
          setStage("done");
          return 0;
        }
        return l - 1;
      });
    }, 1000);
    return () => {
      if (tick.current) clearInterval(tick.current);
    };
  }, [stage, running]);

  function start() {
    const secs = minutes * 60;
    setTotal(secs);
    setLeft(secs);
    setRunning(true);
    setStage("running");
  }

  async function finish() {
    const res = await savePracticeSession({
      moduleId: "time-container",
      outcome: left === 0 ? "done" : "partly",
      wasHelpful: true,
    });
    if (res.ok) setSaved(true);
  }

  if (stage === "setup") {
    return (
      <div className="ds-card">
        <p className="font-bold text-sm mb-2">How long feels doable?</p>
        <div className="flex gap-2.5 flex-wrap">
          {[10, 15, 25].map((m) => (
            <button
              key={m}
              onClick={() => setMinutes(m)}
              aria-pressed={minutes === m}
              className={`border-2 border-ink rounded-full px-5 py-2.5 text-sm font-bold shadow-pop-sm transition-transform hover:-translate-y-px ${
                minutes === m ? "bg-violet text-white" : "bg-surface"
              }`}
            >
              {m} min
            </button>
          ))}
        </div>

        <p className="font-bold text-sm mt-6 mb-2">
          Start ritual{" "}
          <span className="text-ink-faint font-medium">
            (tap each — 30 seconds total)
          </span>
        </p>
        <div className="space-y-2.5">
          {RITUAL_START.map((r, i) => {
            const on = ritual.has(i);
            return (
              <button
                key={r}
                onClick={() =>
                  setRitual((s) => {
                    const n = new Set(s);
                    if (n.has(i)) n.delete(i);
                    else n.add(i);
                    return n;
                  })
                }
                aria-pressed={on}
                className={`w-full text-left flex items-center gap-3 border-2.5 border-ink rounded-[14px] p-3.5 shadow-pop-sm transition-transform hover:-translate-y-px ${
                  on ? "bg-mint" : "bg-surface"
                }`}
              >
                <span
                  className={`w-6 h-6 shrink-0 rounded-lg border-2.5 border-ink grid place-items-center text-sm font-extrabold ${
                    on ? "bg-yellow" : "bg-white"
                  }`}
                >
                  {on ? "✓" : ""}
                </span>
                <b className="text-[15px]">{r}</b>
              </button>
            );
          })}
        </div>

        <button onClick={start} className="ds-btn ds-btn-primary mt-5">
          Start the container →
        </button>
        <p className="text-xs text-ink-faint mt-4 mb-0">
          The ritual is optional. Starting is the whole win.
        </p>
      </div>
    );
  }

  if (stage === "running") {
    const m = Math.floor(left / 60);
    const s = left % 60;
    const pct = total > 0 ? 100 * (1 - left / total) : 0;
    return (
      <div className="ds-card text-center">
        <div
          className="font-display font-extrabold tracking-tight"
          style={{ fontSize: "clamp(56px,12vw,88px)" }}
          aria-live="off"
        >
          {m}:{String(s).padStart(2, "0")}
        </div>
        <div className="h-4 border-2.5 border-ink rounded-full overflow-hidden bg-surface-2 max-w-md mx-auto mt-3">
          <div
            className="h-full bg-gradient-to-r from-teal to-violet transition-all duration-1000"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-sm text-ink-soft mt-4">
          You&apos;re in the container. Drifting is normal — just come back once.
        </p>
        <div className="flex gap-3 flex-wrap justify-center mt-5">
          <button
            onClick={() => setRunning((r) => !r)}
            className="ds-btn ds-btn-ghost"
          >
            {running ? "Pause" : "Resume"}
          </button>
          <button
            onClick={() => {
              setLeft(total);
              setRunning(true);
            }}
            className="ds-btn ds-btn-line"
          >
            ↻ Restart gently
          </button>
          <button onClick={() => setStage("done")} className="ds-btn ds-btn-line">
            Finish now
          </button>
        </div>
        <p className="text-xs text-ink-faint mt-4 mb-0">
          Restarting costs nothing. It never counts against you.
        </p>
      </div>
    );
  }

  // done
  return (
    <div className="ds-card">
      <h2 className="text-xl mb-1">Container closed. 🎈</h2>
      <p className="text-ink-soft text-[15px]">
        However far you got, the showing-up part happened. Let&apos;s land it.
      </p>

      <button
        onClick={() => setLanded((l) => !l)}
        aria-pressed={landed}
        className={`w-full text-left flex items-center gap-3 border-2.5 border-ink rounded-[14px] p-3.5 shadow-pop-sm mt-4 transition-transform hover:-translate-y-px ${
          landed ? "bg-mint" : "bg-surface"
        }`}
      >
        <span
          className={`w-6 h-6 shrink-0 rounded-lg border-2.5 border-ink grid place-items-center text-sm font-extrabold ${
            landed ? "bg-yellow" : "bg-white"
          }`}
        >
          {landed ? "✓" : ""}
        </span>
        <b className="text-[15px]">Stand, stretch, unclench the jaw</b>
      </button>

      <label htmlFor="note" className="block font-bold text-sm mt-5 mb-2">
        Note for future-you: what&apos;s the very next step?
      </label>
      <input
        id="note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="e.g. section 2 is half done — start at the table"
        className="w-full border-2.5 border-ink rounded-[14px] px-4 py-3 bg-surface"
      />

      {saved ? (
        <div className="mt-5">
          <p className="font-bold text-sm mb-3">✓ Saved. Future-you says thanks.</p>
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
          <button onClick={finish} className="ds-btn ds-btn-primary">
            Save this block
          </button>
          <button
            onClick={() => {
              setStage("setup");
              setRitual(new Set());
              setNote("");
            }}
            className="ds-btn ds-btn-ghost"
          >
            Another container
          </button>
        </div>
      )}
    </div>
  );
}
