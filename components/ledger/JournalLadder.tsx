"use client";

import { useState, useTransition } from "react";
import { saveDailyJournalRung, type DailyJournalAnswers } from "@/app/actions/journal";

/**
 * The gradual journal, rungs 2-3 (§6.2). Rungs 0-1 (a tapped state, tapped
 * context chips) are already satisfied by the day's check-ins — this only
 * offers the next rung up, and only after the one below it is done. Rungs
 * 4-5 (guided fields, the free page) land in a later phase.
 */
export function JournalLadder({
  logDate,
  initial,
  prompt,
}: {
  logDate: string;
  initial: DailyJournalAnswers | null;
  prompt: string;
}) {
  const [pending, startTransition] = useTransition();
  const [word, setWord] = useState(initial?.word ?? "");
  const [sentence, setSentence] = useState(initial?.sentence ?? "");
  const [savedWord, setSavedWord] = useState(Boolean(initial?.word));
  const [savedSentence, setSavedSentence] = useState(Boolean(initial?.sentence));
  const [editingWord, setEditingWord] = useState(false);
  const [editingSentence, setEditingSentence] = useState(false);

  function commitWord() {
    if (!word.trim()) return;
    startTransition(async () => {
      await saveDailyJournalRung(logDate, { word: word.trim() });
      setSavedWord(true);
      setEditingWord(false);
    });
  }

  function commitSentence() {
    if (!sentence.trim()) return;
    startTransition(async () => {
      await saveDailyJournalRung(logDate, { sentence: sentence.trim() });
      setSavedSentence(true);
      setEditingSentence(false);
    });
  }

  return (
    <div className="ds-card">
      <b className="block mb-1">Your words for this day</b>
      <p className="text-sm text-ink-faint mb-4">
        Every rung here is a complete entry on its own. Stop wherever feels right.
      </p>

      {/* Rung 2 — one word */}
      {savedWord && !editingWord ? (
        <div className="flex items-center justify-between gap-3 border-b-2 border-dashed border-ink/20 pb-3 mb-3">
          <span>
            <span className="text-xs text-ink-faint block">One word</span>
            <b>{word}</b>
          </span>
          <button
            onClick={() => setEditingWord(true)}
            className="text-xs font-bold underline underline-offset-2 text-ink-faint"
          >
            Edit
          </button>
        </div>
      ) : (
        <div className="mb-4">
          <label className="block font-bold text-sm mb-2">
            One word for today?
          </label>
          <div className="flex gap-2 flex-wrap">
            <input
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder="tired"
              className="flex-1 min-w-[160px] border-2.5 border-ink rounded-[14px] px-4 py-2.5 bg-surface"
            />
            <button
              onClick={commitWord}
              disabled={pending || !word.trim()}
              className="ds-btn ds-btn-primary disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Rung 3 — one prompted sentence. Only offered after rung 2. */}
      {savedWord &&
        (savedSentence && !editingSentence ? (
          <div className="flex items-start justify-between gap-3">
            <span>
              <span className="text-xs text-ink-faint block">{prompt}</span>
              <b>{sentence}</b>
            </span>
            <button
              onClick={() => setEditingSentence(true)}
              className="text-xs font-bold underline underline-offset-2 text-ink-faint shrink-0"
            >
              Edit
            </button>
          </div>
        ) : (
          <div>
            <label className="block font-bold text-sm mb-2">{prompt}</label>
            <div className="flex gap-2 flex-wrap">
              <input
                value={sentence}
                onChange={(e) => setSentence(e.target.value)}
                placeholder="One sentence is plenty."
                className="flex-1 min-w-[160px] border-2.5 border-ink rounded-[14px] px-4 py-2.5 bg-surface"
              />
              <button
                onClick={commitSentence}
                disabled={pending || !sentence.trim()}
                className="ds-btn ds-btn-primary disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        ))}
    </div>
  );
}
