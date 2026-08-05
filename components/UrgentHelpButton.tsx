"use client";

import { useState } from "react";

/**
 * Always-on urgent-help control. Present on every screen.
 * Routing here is deterministic + clinician-directory backed — never AI.
 * This is the Phase 0 shell; the real localized directory arrives in Phase 5.
 */
export function UrgentHelpButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 border-2.5 border-ink rounded-full bg-coral-soft text-[#B03A2E] px-4 py-2 text-sm font-bold shadow-pop-sm"
      >
        <span className="w-2 h-2 rounded-full bg-[#B03A2E]" />
        Need urgent help?
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-5"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="bg-surface border-2.5 border-ink rounded-3xl shadow-pop-lg max-w-lg w-full p-7">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-xl text-[#B03A2E]">🛟 Urgent support</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-sm font-bold underline underline-offset-2"
              >
                Close ✕
              </button>
            </div>
            <p className="text-ink-soft mt-3 text-sm">
              If you&apos;re in immediate danger or thinking about harming
              yourself, please reach a person now. A digital tool can&apos;t keep
              you safe — these routes can.
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="rounded-xl border-2 border-ink p-3">
                <b>📞 Emergency services</b> — life-threatening danger, overdose,
                or injury → call your local emergency number now.
              </li>
              <li className="rounded-xl border-2 border-ink p-3">
                <b>💬 Crisis line / text</b> — trained humans, 24/7. A verified,
                region-specific line will appear here.
              </li>
              <li className="rounded-xl border-2 border-ink p-3">
                <b>🧑‍⚕️ Talk to a professional</b> — your GP, therapist, or a
                local service.
              </li>
            </ul>
            <p className="text-xs text-ink-faint mt-4">
              Routing is chosen by fixed safety rules and a clinician-approved
              local directory — never decided by an AI.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
