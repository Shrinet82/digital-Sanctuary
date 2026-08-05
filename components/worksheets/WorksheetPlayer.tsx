"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { saveWorksheet } from "@/app/actions/worksheets";
import {
  shouldShowStep,
  type Answers,
  type AnswerValue,
  type ChoiceStep,
  type SafetyGateStep,
  type ScaleStep,
  type Step,
  type SummaryStep,
  type TextStep,
  type WorksheetTemplate,
} from "@/lib/worksheets/types";

/**
 * Renders ANY worksheet template, one step at a time.
 *
 * This is the whole engine: adding a worksheet means committing a JSON
 * file, not touching this component. Safety gates route to urgent help
 * deterministically — no model is consulted anywhere in this flow.
 */
export function WorksheetPlayer({
  template,
  onOpenUrgentHelp,
}: {
  template: WorksheetTemplate;
  onOpenUrgentHelp: () => void;
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Answers>({});
  const [index, setIndex] = useState(0);
  const [routed, setRouted] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Only steps whose branch conditions currently pass.
  const visible = useMemo(
    () => template.steps.filter((s) => shouldShowStep(s, answers)),
    [template.steps, answers]
  );

  const step = visible[Math.min(index, visible.length - 1)];
  const isLast = index >= visible.length - 1;

  function set(key: string, value: AnswerValue) {
    setAnswers((a) => ({ ...a, [key]: value }));
  }

  function next() {
    if (!isLast) setIndex((i) => i + 1);
  }

  function back() {
    if (index > 0) setIndex((i) => i - 1);
  }

  async function finish() {
    setSaving(true);
    setError(null);
    const res = await saveWorksheet({
      worksheetId: template.id,
      templateVersion: template.version,
      answers,
    });
    setSaving(false);
    if (res.ok) setSaved(true);
    else setError(res.error ?? "We couldn't save that. Your answers are still here.");
  }

  // ---------- safety routing ----------
  if (routed) {
    return (
      <div className="ds-card bg-coral-soft">
        <h2 className="text-xl text-[#B03A2E]">🛟 Let&apos;s get real support</h2>
        <p className="text-ink-soft mt-2">{routed}</p>
        <div className="flex gap-3 flex-wrap mt-5">
          <button
            onClick={onOpenUrgentHelp}
            className="ds-btn"
            style={{ background: "#E5484D", color: "#fff" }}
          >
            Open urgent support →
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className="ds-btn ds-btn-ghost"
          >
            Back to dashboard
          </button>
        </div>
        <p className="text-xs text-ink-soft mt-4">
          Nothing from this worksheet was saved.
        </p>
      </div>
    );
  }

  // ---------- saved ----------
  if (saved) {
    // Pick a follow-on by fixed threshold on the final rating — never a model.
    const summary = template.steps.find((s) => s.type === "summary") as
      | SummaryStep
      | undefined;
    const finalKey = summary?.compare?.[1];
    const finalRating =
      finalKey && typeof answers[finalKey] === "number"
        ? (answers[finalKey] as number)
        : null;

    const next =
      template.nextSteps?.find(
        (n) =>
          n.whenRatingAtOrAbove === undefined ||
          (finalRating !== null && finalRating >= n.whenRatingAtOrAbove)
      ) ?? null;

    return (
      <div className="ds-card">
        <div className="text-center">
          <span className="text-4xl">✓</span>
          <h2 className="text-2xl mt-2 mb-1">Saved privately</h2>
          <p className="text-ink-soft text-[15px]">
            That&apos;s yours alone. Well caught.
          </p>
        </div>

        {next && (
          <div className="mt-6 rounded-[16px] border-2.5 border-ink bg-gradient-to-br from-violet-soft to-coral-soft p-5">
            <span className="ds-pill bg-white">🧮 suggested next</span>
            <b className="block text-lg font-display mt-2.5">{next.label}</b>
            <p className="text-sm text-ink-soft mt-1.5 mb-4">{next.because}</p>
            <button
              onClick={() => router.push(`/modules/${next.moduleId}`)}
              className="ds-btn ds-btn-primary"
            >
              {next.label} →
            </button>
          </div>
        )}

        <div className="text-center mt-6">
          <button
            onClick={() => {
              router.push("/dashboard");
              router.refresh();
            }}
            className="text-sm font-bold text-ink-faint underline underline-offset-2"
          >
            {next ? "Not now — back to dashboard" : "Back to dashboard"}
          </button>
        </div>
      </div>
    );
  }

  const progress = Math.round(((index + 1) / visible.length) * 100);

  return (
    <div className="ds-card">
      {/* progress */}
      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <span className="ds-pill bg-mint text-[#0B5C41]">
          🧮 {template.framework} · step-by-step
        </span>
        <span className="text-sm text-ink-faint font-bold">
          {index + 1} of {visible.length}
        </span>
      </div>
      <div className="h-2.5 border-2 border-ink rounded-full overflow-hidden bg-surface-2 mb-6">
        <div
          className="h-full bg-gradient-to-r from-teal to-violet transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <StepView
        step={step}
        answers={answers}
        template={template}
        onSet={set}
        onRoute={(msg) => setRouted(msg)}
      />

      {error && (
        <p
          role="alert"
          className="text-sm font-semibold text-[#B03A2E] bg-coral-soft border-2 border-ink rounded-xl px-4 py-3 mt-4"
        >
          {error}
        </p>
      )}

      {/* nav */}
      <div className="flex gap-3 flex-wrap mt-7">
        {index > 0 && (
          <button onClick={back} className="ds-btn ds-btn-ghost">
            ← Back
          </button>
        )}
        {isLast ? (
          <button
            onClick={finish}
            disabled={saving}
            className="ds-btn ds-btn-primary disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save privately ✓"}
          </button>
        ) : (
          <button onClick={next} className="ds-btn ds-btn-primary">
            Next →
          </button>
        )}
        {step?.optional && !isLast && (
          <button onClick={next} className="ds-btn ds-btn-ghost">
            Skip this
          </button>
        )}
      </div>
    </div>
  );
}

/* ============================================================ */

function StepView({
  step,
  answers,
  template,
  onSet,
  onRoute,
}: {
  step: Step;
  answers: Answers;
  template: WorksheetTemplate;
  onSet: (key: string, value: AnswerValue) => void;
  onRoute: (message: string) => void;
}) {
  if (!step) return null;

  switch (step.type) {
    case "info":
      return (
        <div>
          <h2 className="text-xl mb-2">{step.title}</h2>
          <p className="text-ink-soft m-0">{step.body}</p>
        </div>
      );

    case "text":
    case "longtext": {
      const s = step as TextStep;
      const value = (answers[s.key] as string) ?? "";
      return (
        <div>
          <Prompt step={s} />
          {s.type === "longtext" ? (
            <textarea
              rows={4}
              value={value}
              onChange={(e) => onSet(s.key, e.target.value)}
              placeholder={s.placeholder}
              className="w-full border-2.5 border-ink rounded-[14px] px-4 py-3 bg-surface resize-y"
            />
          ) : (
            <input
              value={value}
              onChange={(e) => onSet(s.key, e.target.value)}
              placeholder={s.placeholder}
              className="w-full border-2.5 border-ink rounded-[14px] px-4 py-3 bg-surface"
            />
          )}
          <Examples step={s} onPick={(text) => onSet(s.key, text)} />
        </div>
      );
    }

    case "scale": {
      const s = step as ScaleStep;
      const min = s.min ?? 0;
      const max = s.max ?? 10;
      const value = (answers[s.key] as number) ?? Math.round((min + max) / 2);
      return (
        <div>
          <Prompt step={s} />
          <div className="flex justify-end mb-2">
            <span className="ds-pill bg-sand">{value}</span>
          </div>
          <input
            type="range"
            min={min}
            max={max}
            value={value}
            onChange={(e) => onSet(s.key, Number(e.target.value))}
            className="w-full h-3.5 rounded-full border-2 border-ink appearance-none cursor-pointer
                       bg-gradient-to-r from-mint via-violet-soft to-coral-soft
                       [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-7
                       [&::-webkit-slider-thumb]:h-7 [&::-webkit-slider-thumb]:rounded-full
                       [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-[3px]
                       [&::-webkit-slider-thumb]:border-ink [&::-webkit-slider-thumb]:shadow-pop-sm
                       [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6
                       [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white
                       [&::-moz-range-thumb]:border-[3px] [&::-moz-range-thumb]:border-ink"
          />
          <div className="flex justify-between text-xs text-ink-faint font-bold mt-1.5">
            <span>{s.lowLabel ?? min}</span>
            <span>{s.highLabel ?? max}</span>
          </div>
        </div>
      );
    }

    case "single_choice":
    case "multi_choice": {
      const s = step as ChoiceStep;
      const multi = s.type === "multi_choice";
      const current = answers[s.key];
      const selected: string[] = multi
        ? ((current as string[]) ?? [])
        : current
          ? [current as string]
          : [];

      const toggle = (opt: string) => {
        if (multi) {
          const next = selected.includes(opt)
            ? selected.filter((o) => o !== opt)
            : [...selected, opt];
          onSet(s.key, next);
        } else {
          onSet(s.key, selected[0] === opt ? null : opt);
        }
      };

      return (
        <div>
          <Prompt step={s} />
          <div className={multi ? "flex gap-2.5 flex-wrap" : "space-y-3"}>
            {s.options.map((opt) => {
              const on = selected.includes(opt);
              return (
                <button
                  key={opt}
                  onClick={() => toggle(opt)}
                  aria-pressed={on}
                  className={
                    multi
                      ? `border-2 border-ink rounded-full px-4 py-2.5 text-[14px] font-bold shadow-pop-sm transition-transform hover:-translate-y-px ${on ? "bg-violet text-white" : "bg-surface"}`
                      : `block w-full text-left border-2.5 border-ink rounded-[16px] px-5 py-4 text-[15.5px] font-bold shadow-pop-sm transition-transform hover:-translate-y-0.5 ${on ? "bg-violet-soft" : "bg-surface"}`
                  }
                >
                  {opt}
                </button>
              );
            })}
          </div>
          {s.allowOther && (
            <input
              placeholder="…or write your own"
              onBlur={(e) => {
                const v = e.target.value.trim();
                if (!v) return;
                if (multi) onSet(s.key, [...selected, v]);
                else onSet(s.key, v);
              }}
              className="w-full border-2.5 border-ink rounded-[14px] px-4 py-3 bg-surface mt-3"
            />
          )}
        </div>
      );
    }

    case "safety_gate": {
      const s = step as SafetyGateStep;
      return (
        <div>
          <div className="ds-pill bg-coral-soft text-[#B03A2E] mb-3">
            🛟 safety check · always first
          </div>
          <Prompt step={s} />
          <div className="space-y-3">
            <button
              onClick={() => onRoute(s.routeMessage)}
              className="block w-full text-left border-2.5 border-ink rounded-[16px] px-5 py-4 text-[15.5px] font-bold shadow-pop-sm bg-coral-soft transition-transform hover:-translate-y-0.5"
            >
              {s.yesLabel ?? "Yes, one of these applies"}
            </button>
            <button
              onClick={() => onSet(s.key, "no")}
              aria-pressed={answers[s.key] === "no"}
              className={`block w-full text-left border-2.5 border-ink rounded-[16px] px-5 py-4 text-[15.5px] font-bold shadow-pop-sm transition-transform hover:-translate-y-0.5 ${
                answers[s.key] === "no" ? "bg-mint" : "bg-surface"
              }`}
            >
              {s.noLabel ?? "No, none of these"}
            </button>
          </div>
          <p className="text-xs text-ink-faint mt-4">
            This check is a fixed rule, not a judgement — and never decided by
            AI.
          </p>
        </div>
      );
    }

    case "summary": {
      const s = step as SummaryStep;
      const [aKey, bKey] = s.compare ?? [];
      const a = aKey ? (answers[aKey] as number | undefined) : undefined;
      const b = bKey ? (answers[bKey] as number | undefined) : undefined;
      const moved = a !== undefined && b !== undefined ? a - b : null;

      return (
        <div>
          <h2 className="text-xl mb-3">That&apos;s the whole thing.</h2>

          {moved !== null && (
            <div
              className={`rounded-xl border-2 border-ink p-4 text-[15px] mb-4 ${
                moved > 0 ? "bg-mint" : "bg-surface-2"
              }`}
            >
              {moved > 0 ? (
                <>
                  It moved from <b>{a}</b> to <b>{b}</b> — down {moved}. Naming
                  it shifted something.
                </>
              ) : moved === 0 ? (
                <>
                  Still at <b>{b}</b>. That&apos;s okay — some thoughts loosen
                  slowly. Writing it down still counts.
                </>
              ) : (
                <>
                  It sits at <b>{b}</b> right now. Noticing that honestly is
                  worth more than forcing a better number.
                </>
              )}
            </div>
          )}

          <div className="rounded-xl border-2 border-dashed border-ink bg-white/70 p-4">
            <b className="text-sm">In your words</b>
            <ul className="list-none p-0 m-0 mt-2 space-y-2">
              {template.steps
                .filter(
                  (st) =>
                    st.key &&
                    answers[st.key] !== undefined &&
                    answers[st.key] !== null &&
                    answers[st.key] !== "" &&
                    st.type !== "safety_gate"
                )
                .map((st) => (
                  <li key={st.key} className="text-sm">
                    <span className="text-ink-faint">{st.prompt}</span>
                    <br />
                    <b>
                      {Array.isArray(answers[st.key!])
                        ? (answers[st.key!] as string[]).join(", ")
                        : String(answers[st.key!])}
                    </b>
                  </li>
                ))}
            </ul>
          </div>

          {s.aiRecap && (
            <p className="text-xs text-ink-faint mt-4">
              ✨ An optional plain-language recap of your own words is coming in
              a later phase — and you&apos;ll always approve it before anything
              saves.
            </p>
          )}
        </div>
      );
    }

    default:
      return null;
  }
}

/**
 * Tappable example answers.
 *
 * The blank box is where people give up. Tapping an example fills the field so
 * it can be edited instead of written from nothing — scaffolding, not an answer.
 */
function Examples({
  step,
  onPick,
}: {
  step: Step;
  onPick: (text: string) => void;
}) {
  const [open, setOpen] = useState(false);
  if (!step.examples?.length) return null;

  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="text-sm font-bold text-violet-deep underline underline-offset-2"
      >
        {open ? "Hide examples" : "💡 Stuck? See examples"}
      </button>
      {open && (
        <div className="mt-3 space-y-2">
          <p className="text-xs text-ink-faint m-0">
            Tap one to drop it in, then change it to fit you.
          </p>
          {step.examples.map((ex) => (
            <button
              key={ex}
              onClick={() => {
                onPick(ex);
                setOpen(false);
              }}
              className="block w-full text-left border-2 border-ink rounded-xl px-4 py-2.5 text-sm bg-surface-2 shadow-pop-sm transition-transform hover:-translate-y-px"
            >
              “{ex}”
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Prompt({ step }: { step: Step }) {
  return (
    <div className="mb-4">
      <h2 className="text-xl">{step.prompt}</h2>
      {step.help && (
        <p className="text-sm text-ink-faint mt-1.5 mb-0">{step.help}</p>
      )}
      {step.optional && (
        <span className="ds-pill bg-surface-2 mt-2">optional</span>
      )}
    </div>
  );
}
