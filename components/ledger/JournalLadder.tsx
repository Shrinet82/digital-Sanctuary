"use client";

import { useState, useTransition } from "react";
import {
  saveDailyJournalRung,
  type DailyJournalAnswers,
  type GuidedFields,
} from "@/app/actions/journal";

const EMPTY_GUIDED: GuidedFields = { whatHappened: "", bodyFelt: "", friendAdvice: "" };

/**
 * The gradual journal, rungs 2-5 (§6.2). Rungs 0-1 (a tapped state, tapped
 * context chips) are already satisfied by the day's check-ins. Each rung
 * is offered only after the one below it is saved, and every rung is a
 * complete, valid entry on its own — nobody is nagged to climb further.
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
  const [guided, setGuided] = useState<GuidedFields>(initial?.guided ?? EMPTY_GUIDED);
  const [freePage, setFreePage] = useState(initial?.freePage ?? "");

  const [savedWord, setSavedWord] = useState(Boolean(initial?.word));
  const [savedSentence, setSavedSentence] = useState(Boolean(initial?.sentence));
  const [savedGuided, setSavedGuided] = useState(Boolean(initial?.guided));
  const [savedFreePage, setSavedFreePage] = useState(Boolean(initial?.freePage));

  const [editingWord, setEditingWord] = useState(false);
  const [editingSentence, setEditingSentence] = useState(false);
  const [editingGuided, setEditingGuided] = useState(false);
  const [editingFreePage, setEditingFreePage] = useState(false);

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

  function commitGuided() {
    if (!guided.whatHappened.trim() && !guided.bodyFelt.trim() && !guided.friendAdvice.trim())
      return;
    startTransition(async () => {
      await saveDailyJournalRung(logDate, { guided });
      setSavedGuided(true);
      setEditingGuided(false);
    });
  }

  function commitFreePage() {
    if (!freePage.trim()) return;
    startTransition(async () => {
      await saveDailyJournalRung(logDate, { freePage: freePage.trim() });
      setSavedFreePage(true);
      setEditingFreePage(false);
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
      {savedWord && (
        <div className={savedSentence && !editingSentence ? "border-b-2 border-dashed border-ink/20 pb-3 mb-3" : "mb-4"}>
          {savedSentence && !editingSentence ? (
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
          )}
        </div>
      )}

      {/* Rung 4 — three fixed guided fields. Only offered after rung 3. */}
      {savedSentence && (
        <div className={savedGuided && !editingGuided ? "border-b-2 border-dashed border-ink/20 pb-3 mb-3" : "mb-4"}>
          {savedGuided && !editingGuided ? (
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <span className="text-xs text-ink-faint block">A bit more</span>
                <p className="text-sm m-0">
                  <span className="text-ink-faint">What happened — </span>
                  {guided.whatHappened}
                </p>
                <p className="text-sm m-0">
                  <span className="text-ink-faint">In the body — </span>
                  {guided.bodyFelt}
                </p>
                <p className="text-sm m-0">
                  <span className="text-ink-faint">To a friend — </span>
                  {guided.friendAdvice}
                </p>
              </div>
              <button
                onClick={() => setEditingGuided(true)}
                className="text-xs font-bold underline underline-offset-2 text-ink-faint shrink-0"
              >
                Edit
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="font-bold text-sm m-0">A little more, if you want it</p>
              <div>
                <label className="block text-sm text-ink-faint mb-1">
                  What happened today?
                </label>
                <input
                  value={guided.whatHappened}
                  onChange={(e) => setGuided((g) => ({ ...g, whatHappened: e.target.value }))}
                  className="w-full border-2.5 border-ink rounded-[14px] px-4 py-2.5 bg-surface"
                />
              </div>
              <div>
                <label className="block text-sm text-ink-faint mb-1">
                  What did it feel like in your body?
                </label>
                <input
                  value={guided.bodyFelt}
                  onChange={(e) => setGuided((g) => ({ ...g, bodyFelt: e.target.value }))}
                  className="w-full border-2.5 border-ink rounded-[14px] px-4 py-2.5 bg-surface"
                />
              </div>
              <div>
                <label className="block text-sm text-ink-faint mb-1">
                  One thing you&apos;d tell a friend in the same spot?
                </label>
                <input
                  value={guided.friendAdvice}
                  onChange={(e) => setGuided((g) => ({ ...g, friendAdvice: e.target.value }))}
                  className="w-full border-2.5 border-ink rounded-[14px] px-4 py-2.5 bg-surface"
                />
              </div>
              <button
                onClick={commitGuided}
                disabled={pending}
                className="ds-btn ds-btn-primary disabled:opacity-50"
              >
                Save
              </button>
            </div>
          )}
        </div>
      )}

      {/* Rung 5 — the free page. Only offered after rung 4. */}
      {savedGuided &&
        (savedFreePage && !editingFreePage ? (
          <div className="flex items-start justify-between gap-3">
            <span>
              <span className="text-xs text-ink-faint block">The free page</span>
              <span className="whitespace-pre-wrap">{freePage}</span>
            </span>
            <button
              onClick={() => setEditingFreePage(true)}
              className="text-xs font-bold underline underline-offset-2 text-ink-faint shrink-0"
            >
              Edit
            </button>
          </div>
        ) : (
          <div>
            <label className="block font-bold text-sm mb-2">
              Anything else — a blank page, if you want it.
            </label>
            <textarea
              value={freePage}
              onChange={(e) => setFreePage(e.target.value)}
              rows={5}
              placeholder="Write whatever you want. Nothing here is prompted."
              className="w-full border-2.5 border-ink rounded-[14px] px-4 py-3 bg-surface resize-y"
            />
            <button
              onClick={commitFreePage}
              disabled={pending || !freePage.trim()}
              className="ds-btn ds-btn-primary disabled:opacity-50 mt-2"
            >
              Save
            </button>
          </div>
        ))}
    </div>
  );
}
