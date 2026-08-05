"use client";

import { useEffect } from "react";

/**
 * The urgent-support dialog. Shared by the header button and by any
 * worksheet safety_gate that routes here.
 *
 * Routing to this dialog is always decided by fixed rules — never by a model.
 */
export function UrgentHelpDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Urgent support"
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-5"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-surface border-2.5 border-ink rounded-3xl shadow-pop-lg max-w-lg w-full p-7 max-h-[90vh] overflow-auto">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-xl text-[#B03A2E]">🛟 Urgent support</h2>
          <button
            onClick={onClose}
            className="text-sm font-bold underline underline-offset-2"
          >
            Close ✕
          </button>
        </div>
        <p className="text-ink-soft mt-3 text-sm">
          If you&apos;re in immediate danger or thinking about harming yourself,
          please reach a person now. A digital tool can&apos;t keep you safe —
          these routes can.
        </p>
        <ul className="mt-4 space-y-2 text-sm list-none p-0">
          <li className="rounded-xl border-2 border-ink p-3">
            <b>📞 Emergency services</b> — life-threatening danger, overdose, or
            injury → call your local emergency number now.
          </li>
          <li className="rounded-xl border-2 border-ink p-3">
            <b>💬 Crisis line / text</b> — trained humans, 24/7. A verified,
            region-specific line will appear here.
          </li>
          <li className="rounded-xl border-2 border-ink p-3">
            <b>🧑‍⚕️ Talk to a professional</b> — your GP, therapist, or a local
            service.
          </li>
        </ul>
        <p className="text-xs text-ink-faint mt-4">
          Routing is chosen by fixed safety rules and a clinician-approved local
          directory — never decided by an AI.
        </p>
      </div>
    </div>
  );
}
