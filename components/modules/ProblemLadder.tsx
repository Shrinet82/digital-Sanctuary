"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveJournalEntry, savePracticeSession } from "@/app/actions/practice";

type Stage = "whole" | "piece" | "move" | "done";

/** Vague dread → one doable move. A ladder down from the whole thing to one step. */
export function ProblemLadder() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("whole");
  const [whole, setWhole] = useState("");
  const [piece, setPiece] = useState("");
  const [move, setMove] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    await saveJournalEntry({
      worksheetId: "problem-ladder",
      answers: { whole, piece, move },
    });
    const res = await savePracticeSession({ moduleId: "problem-ladder", outcome: "done" });
    setSaving(false);
    if (res.ok) setSaved(true);
  }

  if (stage === "whole") {
    return (
      <div className="ds-card">
        <label className="block font-bold text-sm mb-2">
          What&apos;s the big vague thing hanging over you?
        </label>
        <p className="text-sm text-ink-faint mb-3">
          It doesn&apos;t need to make sense yet. Just name it.
        </p>
        <input
          value={whole}
          onChange={(e) => setWhole(e.target.value)}
          placeholder="e.g. the whole tax situation"
          className="w-full border-2.5 border-ink rounded-[14px] px-4 py-3 bg-surface"
        />
        <button
          onClick={() => whole.trim() && setStage("piece")}
          disabled={!whole.trim()}
          className="ds-btn ds-btn-primary mt-4 disabled:opacity-50"
        >
          Continue →
        </button>
      </div>
    );
  }

  if (stage === "piece") {
    return (
      <div className="ds-card">
        <div className="rounded-xl border-2 border-dashed border-ink bg-white/70 p-3 mb-4 text-sm">
          The whole thing: <b>{whole}</b>
        </div>
        <label className="block font-bold text-sm mb-2">
          Just one piece of it — not all of it. What&apos;s one part?
        </label>
        <input
          value={piece}
          onChange={(e) => setPiece(e.target.value)}
          placeholder="e.g. finding last year's documents"
          className="w-full border-2.5 border-ink rounded-[14px] px-4 py-3 bg-surface"
        />
        <button
          onClick={() => piece.trim() && setStage("move")}
          disabled={!piece.trim()}
          className="ds-btn ds-btn-primary mt-4 disabled:opacity-50"
        >
          Continue →
        </button>
      </div>
    );
  }

  if (stage === "move") {
    return (
      <div className="ds-card">
        <div className="rounded-xl border-2 border-dashed border-ink bg-white/70 p-3 mb-4 text-sm">
          One piece: <b>{piece}</b>
        </div>
        <label className="block font-bold text-sm mb-2">
          What&apos;s the smallest possible first move on just that piece?
        </label>
        <input
          value={move}
          onChange={(e) => setMove(e.target.value)}
          placeholder="e.g. open the folder where documents might be"
          className="w-full border-2.5 border-ink rounded-[14px] px-4 py-3 bg-surface"
        />
        <button
          onClick={() => move.trim() && setStage("done")}
          disabled={!move.trim()}
          className="ds-btn ds-btn-primary mt-4 disabled:opacity-50"
        >
          That&apos;s the move →
        </button>
      </div>
    );
  }

  // done
  return (
    <div className="ds-card">
      <span className="ds-pill bg-mint text-[#0B5C41] mb-3">from vague dread to one move</span>
      <h3 className="text-xl mb-4">{move}</h3>
      <p className="text-ink-soft text-sm mb-4">
        That&apos;s all this needs to be right now. The rest of &quot;{whole}&quot;
        can wait.
      </p>
      {saved ? (
        <button onClick={() => { router.push("/dashboard"); router.refresh(); }} className="ds-btn ds-btn-primary">
          Back to dashboard
        </button>
      ) : (
        <button onClick={save} disabled={saving} className="ds-btn ds-btn-primary disabled:opacity-60">
          {saving ? "Saving…" : "Save this"}
        </button>
      )}
    </div>
  );
}
