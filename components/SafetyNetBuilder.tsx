"use client";

import { useState, useTransition } from "react";
import { saveSafetyNet, type SafetyNetData, type SafetyNetPerson } from "@/app/actions/safetynet";

/**
 * The calm version of you, writing instructions for the version of you in
 * trouble (§8). Built once, edited anytime, shown at every crisis exit.
 */
export function SafetyNetBuilder({ initial }: { initial: SafetyNetData | null }) {
  const [pending, startTransition] = useTransition();
  const [signs, setSigns] = useState(initial?.signs ?? "");
  const [thingsThatWorked, setThingsThatWorked] = useState(
    initial?.thingsThatWorked ?? ""
  );
  const [people, setPeople] = useState<SafetyNetPerson[]>(
    initial?.people?.length ? initial.people : [{ name: "", contact: "" }]
  );
  const [saved, setSaved] = useState(false);

  function updatePerson(i: number, patch: Partial<SafetyNetPerson>) {
    setPeople((prev) => prev.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
    setSaved(false);
  }

  function addPerson() {
    setPeople((prev) => [...prev, { name: "", contact: "" }]);
  }

  function removePerson(i: number) {
    setPeople((prev) => prev.filter((_, idx) => idx !== i));
  }

  function save() {
    const cleanPeople = people.filter((p) => p.name.trim() || p.contact.trim());
    startTransition(async () => {
      const res = await saveSafetyNet({
        signs: signs.trim() || null,
        thingsThatWorked: thingsThatWorked.trim() || null,
        people: cleanPeople,
      });
      if (res.ok) setSaved(true);
    });
  }

  return (
    <div className="space-y-5">
      <div className="ds-card">
        <label htmlFor="signs" className="block font-bold text-[15px] mb-1">
          What does it look like when I&apos;m heading downhill?
        </label>
        <p className="text-sm text-ink-faint mb-3">
          In your own words — the tells only you&apos;d notice.
        </p>
        <textarea
          id="signs"
          value={signs}
          onChange={(e) => {
            setSigns(e.target.value);
            setSaved(false);
          }}
          rows={3}
          placeholder="Stop replying to messages. Sleep goes. Skip meals."
          className="w-full border-2.5 border-ink rounded-[14px] px-4 py-3 bg-surface resize-y"
        />
      </div>

      <div className="ds-card">
        <label htmlFor="worked" className="block font-bold text-[15px] mb-1">
          Things that have worked
        </label>
        <p className="text-sm text-ink-faint mb-3">
          Not what should work — what actually has, before.
        </p>
        <textarea
          id="worked"
          value={thingsThatWorked}
          onChange={(e) => {
            setThingsThatWorked(e.target.value);
            setSaved(false);
          }}
          rows={3}
          placeholder="Walk to the shop. Cold shower. Call Ankit."
          className="w-full border-2.5 border-ink rounded-[14px] px-4 py-3 bg-surface resize-y"
        />
      </div>

      <div className="ds-card">
        <b className="block text-[15px] mb-1">People</b>
        <p className="text-sm text-ink-faint mb-3">
          Name and number. One tap to call, when it&apos;s shown to you later.
        </p>
        <div className="space-y-2.5">
          {people.map((p, i) => (
            <div key={i} className="flex gap-2 flex-wrap items-center">
              <input
                value={p.name}
                onChange={(e) => updatePerson(i, { name: e.target.value })}
                placeholder="Name"
                className="flex-1 min-w-[120px] border-2.5 border-ink rounded-[14px] px-3.5 py-2.5 bg-surface"
              />
              <input
                value={p.contact}
                onChange={(e) => updatePerson(i, { contact: e.target.value })}
                placeholder="Phone number"
                className="flex-1 min-w-[140px] border-2.5 border-ink rounded-[14px] px-3.5 py-2.5 bg-surface"
              />
              <button
                onClick={() => removePerson(i)}
                aria-label="Remove"
                className="text-ink-faint font-bold px-2"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button onClick={addPerson} className="ds-btn ds-btn-ghost mt-3 !py-2">
          + Add someone
        </button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={save}
          disabled={pending}
          className="ds-btn ds-btn-primary disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save my Safety Net"}
        </button>
        {saved && (
          <span className="text-sm font-bold text-[#0B5C41]">
            ✓ Saved. It&apos;ll show up whenever you tap &quot;Need urgent help?&quot;
          </span>
        )}
      </div>
    </div>
  );
}
