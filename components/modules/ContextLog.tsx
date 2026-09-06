"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveContextLogEntry, type ContextLogEntry } from "@/app/actions/vault";

/**
 * Optional private context logging — never procurement details. There is
 * deliberately no field here for substance, amount, source, or cost; only
 * the surrounding context someone might notice a pattern in.
 */
export function ContextLog({ initial }: { initial: ContextLogEntry[] }) {
  const router = useRouter();
  const [setting, setSetting] = useState("");
  const [mood, setMood] = useState("");
  const [peoplePresent, setPeoplePresent] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    const res = await saveContextLogEntry({
      setting: setting.trim() || null,
      mood: mood.trim() || null,
      peoplePresent: peoplePresent.trim() || null,
      note: note.trim() || null,
    });
    setSaving(false);
    if (res.ok) setSaved(true);
  }

  return (
    <div className="space-y-5">
      <div className="ds-card">
        <p className="text-xs font-bold text-ink-faint mb-4 uppercase tracking-wide">
          Never asked here: what, how much, or where from
        </p>

        {saved ? (
          <div>
            <p className="font-bold text-sm mb-3">✓ Saved privately to your vault.</p>
            <button
              onClick={() => {
                setSetting("");
                setMood("");
                setPeoplePresent("");
                setNote("");
                setSaved(false);
                router.refresh();
              }}
              className="ds-btn ds-btn-ghost"
            >
              Log another
            </button>
          </div>
        ) : (
          <>
            <label className="block font-bold text-sm mb-2">Setting</label>
            <input
              value={setting}
              onChange={(e) => setSetting(e.target.value)}
              placeholder="e.g. at home, alone"
              className="w-full border-2.5 border-ink rounded-[14px] px-4 py-2.5 bg-surface mb-4"
            />
            <label className="block font-bold text-sm mb-2">Mood beforehand</label>
            <input
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              placeholder="e.g. flat, restless"
              className="w-full border-2.5 border-ink rounded-[14px] px-4 py-2.5 bg-surface mb-4"
            />
            <label className="block font-bold text-sm mb-2">Who was around</label>
            <input
              value={peoplePresent}
              onChange={(e) => setPeoplePresent(e.target.value)}
              placeholder="e.g. alone, with a friend"
              className="w-full border-2.5 border-ink rounded-[14px] px-4 py-2.5 bg-surface mb-4"
            />
            <label className="block font-bold text-sm mb-2">
              Anything else <span className="text-ink-faint font-medium">(optional)</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full border-2.5 border-ink rounded-[14px] px-4 py-3 bg-surface resize-y"
            />
            <button
              onClick={save}
              disabled={saving}
              className="ds-btn ds-btn-primary disabled:opacity-60 mt-4"
            >
              {saving ? "Saving…" : "Save entry"}
            </button>
          </>
        )}
      </div>

      {initial.length > 0 && (
        <div className="ds-card">
          <b className="block mb-3 text-sm">Recent entries</b>
          <ul className="list-none p-0 m-0 space-y-3">
            {initial.map((e, i) => (
              <li key={i} className="border-b-2 border-dashed border-ink/15 last:border-0 pb-3 last:pb-0">
                <span className="text-xs text-ink-faint block mb-1">
                  {new Date(e.created_at).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
                <span className="flex gap-2 flex-wrap text-sm">
                  {e.setting && <span className="ds-pill bg-surface-2">{e.setting}</span>}
                  {e.mood && <span className="ds-pill bg-surface-2">{e.mood}</span>}
                  {e.peoplePresent && <span className="ds-pill bg-surface-2">{e.peoplePresent}</span>}
                </span>
                {e.note && <p className="text-sm mt-2 mb-0">{e.note}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
