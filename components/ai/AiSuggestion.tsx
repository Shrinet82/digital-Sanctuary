"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { logAiOutcome, requestAiSuggestion } from "@/app/actions/ai";
import type { AiTask } from "@/lib/ai/guard";

/**
 * Asks for a suggestion and shows it for approval.
 *
 * Nothing is applied automatically: the user accepts, edits, or discards.
 * A refusal that carries `escalate` shows a support route rather than an
 * error, because someone disclosing risk should meet help, not a red box.
 */
export function AiSuggestion({
  task,
  text,
  label = "✨ Make this smaller",
  onAccept,
}: {
  task: AiTask;
  text: string;
  label?: string;
  onAccept: (value: string) => void;
}) {
  const [pending, startTransition] = useTransition();
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [state, setState] = useState<
    | { kind: "idle" }
    | { kind: "off" }
    | { kind: "not_configured" }
    | { kind: "refused"; message: string; escalate: boolean }
    | { kind: "error"; message: string }
  >({ kind: "idle" });

  function ask() {
    setSuggestion(null);
    setState({ kind: "idle" });
    startTransition(async () => {
      const res = await requestAiSuggestion({ task, text });
      switch (res.status) {
        case "ok":
          setSuggestion(res.suggestion);
          setDraft(res.suggestion);
          break;
        case "off":
          setState({ kind: "off" });
          break;
        case "not_configured":
          setState({ kind: "not_configured" });
          break;
        case "refused":
          setState({
            kind: "refused",
            message: res.message,
            escalate: res.escalate,
          });
          break;
        default:
          setState({ kind: "error", message: res.message });
      }
    });
  }

  function accept() {
    const edited = draft.trim() !== suggestion?.trim();
    onAccept(draft.trim());
    void logAiOutcome(task, edited ? "edited" : "accepted");
    setSuggestion(null);
  }

  function discard() {
    void logAiOutcome(task, "discarded");
    setSuggestion(null);
  }

  return (
    <div className="mt-3">
      {!suggestion && (
        <button
          onClick={ask}
          disabled={pending || !text.trim()}
          className="ds-btn ds-btn-ghost !px-4 !py-2 !text-sm disabled:opacity-50"
        >
          {pending ? "Thinking…" : label}
        </button>
      )}

      {state.kind === "off" && (
        <div className="mt-3 rounded-[14px] border-2 border-dashed border-ink bg-white/70 p-4 text-sm text-ink-soft">
          AI suggestions are switched off — which is the default here. You can
          turn them on in{" "}
          <Link
            href="/insights"
            className="font-bold text-violet-deep underline underline-offset-2"
          >
            your settings
          </Link>
          . Everything works without them.
        </div>
      )}

      {state.kind === "not_configured" && (
        <div className="mt-3 rounded-[14px] border-2 border-dashed border-ink bg-white/70 p-4 text-sm text-ink-soft">
          The AI helper isn&apos;t connected yet, so there&apos;s nothing to
          suggest right now. Nothing else is affected.
        </div>
      )}

      {state.kind === "refused" && (
        <div
          className={`mt-3 rounded-[14px] border-2 border-ink p-4 text-sm ${
            state.escalate ? "bg-coral-soft" : "bg-surface-2"
          }`}
        >
          <p className="m-0 text-ink-soft">{state.message}</p>
          {state.escalate && (
            <Link
              href="/modules/safety-gateway"
              className="ds-btn !px-4 !py-2 !text-sm mt-3 no-underline inline-block"
              style={{ background: "#E5484D", color: "#fff" }}
            >
              Find real support →
            </Link>
          )}
        </div>
      )}

      {state.kind === "error" && (
        <p className="mt-3 text-sm text-ink-faint">{state.message}</p>
      )}

      {suggestion && (
        <div className="mt-3 rounded-[16px] border-2.5 border-ink bg-gradient-to-br from-violet-soft to-coral-soft p-5 shadow-pop-sm">
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <span className="ds-pill bg-white">✨ suggestion</span>
            <span className="text-xs text-ink-soft font-bold">
              nothing saves until you choose
            </span>
          </div>
          <textarea
            rows={2}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="w-full border-2.5 border-ink rounded-[14px] px-4 py-3 bg-white resize-y"
          />
          <p className="text-xs text-ink-soft mt-2 mb-0">
            Edit it freely — it&apos;s a starting point, not an answer.
          </p>
          <div className="flex gap-3 flex-wrap mt-4">
            <button
              onClick={accept}
              disabled={!draft.trim()}
              className="ds-btn ds-btn-primary !px-4 !py-2 !text-sm disabled:opacity-50"
            >
              Use this
            </button>
            <button
              onClick={discard}
              className="ds-btn ds-btn-line !px-4 !py-2 !text-sm"
            >
              No thanks
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
