"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveJournalEntry, savePracticeSession } from "@/app/actions/practice";
import { dailyDeck } from "@/lib/card-deck";

const today = () => new Date().toISOString().slice(0, 10);

/**
 * Tap Discard / Keep rather than a drag gesture — same one-tap-per-card
 * speed without needing a gesture library, and friendlier to keyboards
 * and screen readers. The swipe language stays in the visual metaphor.
 */
export function CardDeck() {
  const router = useRouter();
  const [deck] = useState(() => dailyDeck(today()));
  const [index, setIndex] = useState(0);
  const [kept, setKept] = useState<string[]>([]);
  const [discarded, setDiscarded] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const card = deck[index];
  const done = index >= deck.length;

  function act(keep: boolean) {
    if (!card) return;
    if (keep) setKept((k) => [...k, card.text]);
    else setDiscarded((d) => [...d, card.text]);
    setIndex((i) => i + 1);
  }

  function finish() {
    setSaving(true);
    savePracticeSession({
      moduleId: "card-deck",
      outcome: "done",
      wasHelpful: kept.length > 0,
    }).then((res) => {
      setSaving(false);
      if (res.ok) setSaved(true);
    });
    saveJournalEntry({
      worksheetId: "card-deck",
      answers: { kept, discarded },
    });
  }

  if (!done) {
    return (
      <div className="ds-card">
        <div className="flex items-center justify-between mb-4">
          <span className="ds-pill bg-sand rotate-1">
            not treatment — a quick, honest ritual
          </span>
          <span className="text-sm text-ink-faint font-bold">
            {index + 1} / {deck.length}
          </span>
        </div>

        <div className="min-h-[180px] flex items-center justify-center border-2.5 border-ink rounded-[20px] bg-gradient-to-br from-violet-soft via-white to-sand shadow-pop p-8 text-center">
          <p className="text-xl font-display font-extrabold leading-snug m-0">
            {card.text}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-5">
          <button
            onClick={() => act(false)}
            className="ds-btn !bg-surface border-2.5 border-ink shadow-pop-sm py-4"
          >
            ← Discard
          </button>
          <button
            onClick={() => act(true)}
            className="ds-btn ds-btn-primary py-4"
          >
            Keep →
          </button>
        </div>
        <p className="text-xs text-ink-faint mt-4">
          There's no wrong answer here — keep or discard whatever feels
          right to you, right now.
        </p>
      </div>
    );
  }

  return (
    <div className="ds-card">
      <h2 className="text-2xl mb-1">That&apos;s the deck.</h2>
      <p className="text-ink-soft mt-2 mb-4">
        You kept {kept.length}, discarded {discarded.length}. This isn&apos;t
        a score — it's a moment of reminding yourself what you already know.
        Nothing here claims to have changed how you think.
      </p>

      {kept.length > 0 && (
        <div className="rounded-xl border-2 border-dashed border-ink bg-white/70 p-4 mb-4">
          <b className="text-sm block mb-2">What you kept</b>
          <ul className="list-none p-0 m-0 space-y-1.5">
            {kept.map((t, i) => (
              <li key={i} className="text-sm">
                {t}
              </li>
            ))}
          </ul>
        </div>
      )}

      {saved ? (
        <button
          onClick={() => {
            router.push("/dashboard");
            router.refresh();
          }}
          className="ds-btn ds-btn-primary"
        >
          Back to dashboard
        </button>
      ) : (
        <button
          onClick={finish}
          disabled={saving}
          className="ds-btn ds-btn-primary disabled:opacity-60"
        >
          {saving ? "Saving…" : "Done"}
        </button>
      )}
    </div>
  );
}
