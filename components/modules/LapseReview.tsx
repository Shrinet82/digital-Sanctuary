"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { saveLapseReview } from "@/app/actions/vault";

const SIGNS = [
  "Skipped meals",
  "Poor sleep",
  "Isolating",
  "Conflict with someone",
  "Payday",
  "Boredom",
  "“Just this once” thoughts",
  "Stopped my routine",
  "Felt overwhelmed",
];

export function LapseReview() {
  const router = useRouter();
  const [context, setContext] = useState("");
  const [signs, setSigns] = useState<string[]>([]);
  const [helped, setHelped] = useState("");
  const [adjustment, setAdjustment] = useState("");
  const [support, setSupport] = useState<"yes" | "maybe" | "not_now" | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setError(null);
    const res = await saveLapseReview({
      context: context.trim() || null,
      warningSigns: signs,
      whatHelped: helped.trim() || null,
      oneAdjustment: adjustment.trim() || null,
      wantsSupport: support,
    });
    if (res.ok) setSaved(true);
    else setError(res.error ?? "Couldn't save that.");
  }

  if (saved) {
    return (
      <div className="ds-card bg-mint">
        <b className="block text-[15px]">✓ Saved. Back to your plan.</b>
        <p className="text-sm text-ink-soft mt-2">
          Nothing was reset and nothing counts against you. You looked at it
          honestly, which is the hard part.
        </p>
        <div className="flex gap-3 flex-wrap mt-4">
          {(support === "yes" || support === "maybe") && (
            <Link
              href="/modules/safety-gateway"
              className="ds-btn ds-btn-primary no-underline"
            >
              See support options →
            </Link>
          )}
          <button
            onClick={() => {
              router.push("/dashboard");
              router.refresh();
            }}
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
      <div className="rounded-[14px] border-2 border-ink bg-mint p-4 text-sm mb-6">
        A lapse is <b>information, not a verdict</b>. Nothing here resets, and
        there&apos;s no “day zero” in this app.
      </div>

      <label htmlFor="context" className="block font-bold text-sm mb-2">
        What was happening just before?{" "}
        <span className="text-ink-faint font-medium">(context, place, mood)</span>
      </label>
      <textarea
        id="context"
        rows={2}
        value={context}
        onChange={(e) => setContext(e.target.value)}
        placeholder="e.g. Friday night, alone after a rough call"
        className="w-full border-2.5 border-ink rounded-[14px] px-4 py-3 bg-surface resize-y"
      />

      <p className="font-bold text-sm mt-6 mb-2">
        Any warning signs, looking back?
      </p>
      <div className="flex gap-2 flex-wrap">
        {SIGNS.map((s) => {
          const on = signs.includes(s);
          return (
            <button
              key={s}
              onClick={() =>
                setSigns((prev) =>
                  prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
                )
              }
              aria-pressed={on}
              className={`border-2 border-ink rounded-full px-3.5 py-2 text-[13.5px] font-bold shadow-pop-sm transition-transform hover:-translate-y-px ${
                on ? "bg-violet text-white" : "bg-surface"
              }`}
            >
              {s}
            </button>
          );
        })}
      </div>

      <label htmlFor="helped" className="block font-bold text-sm mt-6 mb-2">
        What helped, even a little?
      </label>
      <textarea
        id="helped"
        rows={2}
        value={helped}
        onChange={(e) => setHelped(e.target.value)}
        placeholder="e.g. I texted J afterwards instead of hiding it"
        className="w-full border-2.5 border-ink rounded-[14px] px-4 py-3 bg-surface resize-y"
      />

      <label htmlFor="adjust" className="block font-bold text-sm mt-6 mb-2">
        One thing to adjust — <span className="text-ink-faint font-medium">not ten</span>
      </label>
      <input
        id="adjust"
        value={adjustment}
        onChange={(e) => setAdjustment(e.target.value)}
        placeholder="e.g. eat before Friday evenings"
        className="w-full border-2.5 border-ink rounded-[14px] px-4 py-3 bg-surface"
      />

      <p className="font-bold text-sm mt-6 mb-2">
        Would extra support help right now?
      </p>
      <div className="flex gap-2.5 flex-wrap">
        {(
          [
            ["yes", "Yes"],
            ["maybe", "Maybe"],
            ["not_now", "Not right now"],
          ] as const
        ).map(([v, label]) => (
          <button
            key={v}
            onClick={() => setSupport(support === v ? null : v)}
            aria-pressed={support === v}
            className={`border-2 border-ink rounded-full px-4 py-2.5 text-sm font-bold shadow-pop-sm transition-transform hover:-translate-y-px ${
              support === v ? "bg-violet text-white" : "bg-surface"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {(support === "yes" || support === "maybe") && (
        <div className="rounded-[14px] border-2 border-ink bg-coral-soft p-4 text-sm mt-4">
          Good. You&apos;ll get support options right after saving — and{" "}
          <b>Need urgent help?</b> at the top works right now if it can&apos;t
          wait.
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="text-sm font-semibold text-[#B03A2E] bg-coral-soft border-2 border-ink rounded-xl px-4 py-3 mt-4"
        >
          {error}
        </p>
      )}

      <div className="flex gap-3 flex-wrap mt-7">
        <button onClick={save} className="ds-btn ds-btn-primary">
          Save &amp; return to plan
        </button>
        <button
          onClick={() => router.push("/dashboard")}
          className="ds-btn ds-btn-ghost"
        >
          Discard
        </button>
      </div>
    </div>
  );
}
