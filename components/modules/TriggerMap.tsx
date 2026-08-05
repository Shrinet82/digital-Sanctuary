"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { saveTriggerMap } from "@/app/actions/vault";

const GOALS = [
  { key: "reduction", label: "Use less", emoji: "📉" },
  { key: "safer_use", label: "Use more safely", emoji: "🛡️" },
  { key: "abstinence", label: "Stop", emoji: "🚫" },
  { key: "reconnect_care", label: "Reconnect with care", emoji: "🧑‍⚕️" },
  { key: "just_learning", label: "Just reading for now", emoji: "📖" },
];

const INTERNAL = ["Stress", "Boredom", "Loneliness", "Anger", "Tiredness", "Celebration", "Anxiety", "Numbness"];
const EXTERNAL = ["A certain place", "Payday", "After work", "A specific person", "Weekends", "Seeing it", "Certain music", "Being alone at night"];
const ALTERNATIVES = [
  "Message a support",
  "Step outside",
  "Cold water on my face",
  "Play a game",
  "Eat something",
  "Five minutes of breathing",
  "Put on a specific playlist",
  "Go somewhere with people",
];

export function TriggerMap() {
  const router = useRouter();
  const [goal, setGoal] = useState<string | null>(null);
  const [internal, setInternal] = useState<string[]>([]);
  const [external, setExternal] = useState<string[]>([]);
  const [alternative, setAlternative] = useState<string | null>(null);
  const [contact, setContact] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = (list: string[], set: (v: string[]) => void, item: string) =>
    set(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);

  async function save() {
    setError(null);
    const res = await saveTriggerMap({
      goal,
      internalTriggers: internal,
      externalTriggers: external,
      chosenAlternative: alternative,
      supportContact: contact.trim() || null,
    });
    if (res.ok) setSaved(true);
    else setError(res.error ?? "Couldn't save that.");
  }

  if (saved) {
    return (
      <div className="ds-card bg-mint">
        <b className="block text-[15px]">
          ✓ Saved to your separate, extra-private space.
        </b>
        <p className="text-sm text-ink-soft mt-2">
          Only you can see this, and it stays out of your general patterns.
        </p>
        <div className="flex gap-3 flex-wrap mt-4">
          <Link
            href="/modules/mooring-lines"
            className="ds-btn ds-btn-primary no-underline"
          >
            Mooring Lines →
          </Link>
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
      <div className="rounded-[14px] border-2 border-ink bg-coral-soft p-4 text-sm mb-6">
        <b>Urgent help is always one tap away</b> (top of the screen). This is
        planning support only — never advice about using, dosing, or withdrawal.
        Stopping alcohol or benzodiazepines suddenly can be dangerous and is a
        medical matter.
      </div>

      <p className="font-bold text-sm mb-3">
        What&apos;s your goal right now? Yours to choose — none ranks above
        another.
      </p>
      <div className="flex gap-2.5 flex-wrap">
        {GOALS.map((g) => (
          <button
            key={g.key}
            onClick={() => setGoal(goal === g.key ? null : g.key)}
            aria-pressed={goal === g.key}
            className={`border-2 border-ink rounded-full px-4 py-2.5 text-[14px] font-bold shadow-pop-sm transition-transform hover:-translate-y-px ${
              goal === g.key ? "bg-violet text-white" : "bg-surface"
            }`}
          >
            {g.emoji} {g.label}
          </button>
        ))}
      </div>

      <p className="font-bold text-sm mt-7 mb-2">
        Internal triggers{" "}
        <span className="text-ink-faint font-medium">(what&apos;s going on inside)</span>
      </p>
      <div className="flex gap-2 flex-wrap">
        {INTERNAL.map((t) => (
          <Chip
            key={t}
            label={t}
            on={internal.includes(t)}
            onClick={() => toggle(internal, setInternal, t)}
          />
        ))}
      </div>

      <p className="font-bold text-sm mt-6 mb-2">
        External triggers{" "}
        <span className="text-ink-faint font-medium">(what&apos;s going on around you)</span>
      </p>
      <div className="flex gap-2 flex-wrap">
        {EXTERNAL.map((t) => (
          <Chip
            key={t}
            label={t}
            on={external.includes(t)}
            onClick={() => toggle(external, setExternal, t)}
          />
        ))}
      </div>

      <p className="font-bold text-sm mt-7 mb-2">
        One thing I could reach for instead
      </p>
      <div className="flex gap-2 flex-wrap">
        {ALTERNATIVES.map((a) => (
          <Chip
            key={a}
            label={a}
            on={alternative === a}
            onClick={() => setAlternative(alternative === a ? null : a)}
          />
        ))}
      </div>

      <label htmlFor="contact" className="block font-bold text-sm mt-7 mb-2">
        Someone I could contact{" "}
        <span className="text-ink-faint font-medium">
          (your choice — never shared with anyone)
        </span>
      </label>
      <input
        id="contact"
        value={contact}
        onChange={(e) => setContact(e.target.value)}
        placeholder="e.g. my sister, my peer group, my key worker"
        className="w-full border-2.5 border-ink rounded-[14px] px-4 py-3 bg-surface"
      />

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
          Save my map
        </button>
        <Link
          href="/modules/safety-gateway"
          className="ds-btn ds-btn-ghost no-underline"
        >
          Open Safety Gateway
        </Link>
      </div>
    </div>
  );
}

function Chip({
  label,
  on,
  onClick,
}: {
  label: string;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className={`border-2 border-ink rounded-full px-3.5 py-2 text-[13.5px] font-bold shadow-pop-sm transition-transform hover:-translate-y-px ${
        on ? "bg-violet text-white" : "bg-surface"
      }`}
    >
      {label}
    </button>
  );
}
