"use client";

import { useEffect } from "react";
import Link from "next/link";
import type { SafetyNetData } from "@/app/actions/safetynet";
import type { Resource } from "@/components/modules/SafetyGateway";
import { firstPhone } from "@/lib/phone";

/**
 * The urgent-support dialog. Shared by the header button and by any
 * worksheet safety_gate that routes here.
 *
 * Routing to this dialog is always decided by fixed rules — never by a
 * model. When the user has built a Safety Net (§8), it's shown here
 * verbatim, in their own words, above the generic routes. "Lines" is
 * always the live, verified local_resources directory — never hardcoded.
 */
export function UrgentHelpDialog({
  open,
  onClose,
  safetyNet = null,
  resources = [],
}: {
  open: boolean;
  onClose: () => void;
  safetyNet?: SafetyNetData | null;
  resources?: Resource[];
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

  const emergency = resources.filter((r) => r.is_emergency);
  const lines = resources.filter(
    (r) => r.service_type === "crisis_line" || r.service_type === "helpline"
  );
  const hasSafetyNet =
    safetyNet &&
    (safetyNet.signs || safetyNet.thingsThatWorked || safetyNet.people.length > 0);

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

        {hasSafetyNet && (
          <div className="mt-4 border-2.5 border-ink rounded-2xl p-4 bg-violet-soft space-y-3">
            <b className="text-sm">Your Safety Net</b>
            {safetyNet!.signs && (
              <p className="text-sm m-0">
                <span className="text-ink-faint block text-xs">
                  What this looks like for you
                </span>
                {safetyNet!.signs}
              </p>
            )}
            {safetyNet!.thingsThatWorked && (
              <p className="text-sm m-0">
                <span className="text-ink-faint block text-xs">
                  What&apos;s worked before
                </span>
                {safetyNet!.thingsThatWorked}
              </p>
            )}
            {safetyNet!.people.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-ink-faint block text-xs">People</span>
                {safetyNet!.people.map((p, i) => (
                  <a
                    key={i}
                    href={`tel:${p.contact.replace(/\s+/g, "")}`}
                    className="flex items-center justify-between gap-3 border-2 border-ink rounded-xl px-3 py-2 bg-white no-underline text-ink"
                  >
                    <b className="text-sm">{p.name || "Call"}</b>
                    <span className="font-display font-extrabold">{p.contact}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {!hasSafetyNet && (
          <p className="text-xs text-ink-faint mt-3">
            <Link href="/safety-net" className="font-bold underline underline-offset-2">
              Build your Safety Net
            </Link>{" "}
            while things are steady, and it&apos;ll show up here, in your own words.
          </p>
        )}

        <ul className="mt-4 space-y-2 text-sm list-none p-0">
          <li className="rounded-xl border-2 border-ink p-3">
            <b>📞 Emergency services</b>
            {emergency.length > 0 ? (
              <div className="mt-2 space-y-2">
                {emergency.map((r) => (
                  <div key={r.name} className="flex items-center justify-between gap-3">
                    <span>{r.name}</span>
                    <a
                      href={`tel:${firstPhone(r.contact)}`}
                      className="font-display font-extrabold text-lg"
                    >
                      {r.contact}
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              " — life-threatening danger, overdose, or injury → call your local emergency number now."
            )}
          </li>
          <li className="rounded-xl border-2 border-ink p-3">
            <b>💬 Crisis line / text</b> — trained humans, 24/7.
            {lines.length > 0 ? (
              <div className="mt-2 space-y-2">
                {lines.map((r) => (
                  <div key={r.name}>
                    <div className="flex items-center justify-between gap-3">
                      <span>{r.name}</span>
                      <a
                        href={`tel:${firstPhone(r.contact)}`}
                        className="font-display font-extrabold"
                      >
                        {r.contact}
                      </a>
                    </div>
                    {(r.hours || r.languages) && (
                      <span className="block text-xs text-ink-faint">
                        {[r.hours, r.languages].filter(Boolean).join(" · ")}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              " We don't have a verified line for your region yet."
            )}
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
