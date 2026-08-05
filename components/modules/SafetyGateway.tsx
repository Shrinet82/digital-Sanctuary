"use client";

import { useState } from "react";

export type Resource = {
  service_type: string;
  name: string;
  contact: string;
  hours: string | null;
  languages: string | null;
  is_emergency: boolean;
  source_url: string | null;
  verified_at: string | null;
};

const ROUTES = [
  {
    key: "overdose",
    emoji: "🚑",
    title: "I think someone has overdosed",
    guidance:
      "Call emergency services now. Stay with them, put them on their side if they're unconscious, and if naloxone is available and you know how to use it, use it. A screen cannot manage an overdose — a person can.",
    urgent: true,
  },
  {
    key: "withdrawal",
    emoji: "⚠️",
    title: "I'm worried about withdrawal",
    guidance:
      "Stopping alcohol or benzodiazepines suddenly can be medically dangerous — this is a doctor's job, not an app's. Please contact a clinician or urgent care rather than trying to manage it alone.",
    urgent: true,
  },
  {
    key: "unsafe",
    emoji: "🆘",
    title: "I don't feel safe right now",
    guidance:
      "You deserve a person, not a worksheet. The lines below are staffed by trained humans, free and around the clock.",
    urgent: true,
  },
  {
    key: "support",
    emoji: "🧑‍⚕️",
    title: "I want to find support near me",
    guidance:
      "Nothing urgent — just looking for treatment, harm-reduction services, or someone to talk to.",
    urgent: false,
  },
  {
    key: "info",
    emoji: "📄",
    title: "I want reliable information",
    guidance:
      "We link out to public-health sources rather than writing our own guidance, so what you read is authoritative and current.",
    urgent: false,
  },
];

/**
 * Deterministic safety routing. Fixed options, fixed guidance, verified
 * directory rows — no model is consulted, and nothing here is generated.
 */
export function SafetyGateway({ resources }: { resources: Resource[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const route = ROUTES.find((r) => r.key === selected);

  const emergency = resources.filter((r) => r.is_emergency);
  const lines = resources.filter(
    (r) => r.service_type === "crisis_line" || r.service_type === "helpline"
  );

  return (
    <div>
      <div className="ds-card bg-coral-soft">
        <span className="ds-pill bg-white text-[#B03A2E]">
          🧮 deterministic routing · never AI
        </span>
        <p className="text-ink-soft text-[15px] mt-3 mb-4">
          Tell us roughly what&apos;s happening and we&apos;ll point you at the
          right kind of help. Nothing you tap here is saved.
        </p>
        <div className="space-y-3">
          {ROUTES.map((r) => (
            <button
              key={r.key}
              onClick={() => setSelected(r.key === selected ? null : r.key)}
              aria-pressed={selected === r.key}
              className={`block w-full text-left border-2.5 border-ink rounded-[16px] px-5 py-4 shadow-pop-sm transition-transform hover:-translate-y-0.5 ${
                selected === r.key ? "bg-white" : "bg-surface"
              }`}
            >
              <b className="text-[15.5px]">
                <span className="mr-2">{r.emoji}</span>
                {r.title}
              </b>
            </button>
          ))}
        </div>
      </div>

      {route && (
        <div
          className={`ds-card mt-4 ${route.urgent ? "bg-coral-soft" : "bg-mint"}`}
        >
          <h3 className="text-lg">{route.title}</h3>
          <p className="text-[15px] text-ink-soft mt-2">{route.guidance}</p>

          {route.urgent && emergency.length > 0 && (
            <div className="mt-4 space-y-2.5">
              {emergency.map((r) => (
                <div
                  key={r.name}
                  className="border-2.5 border-ink rounded-[14px] p-4 bg-white"
                >
                  <b className="block text-[15px]">🚨 {r.name}</b>
                  <span className="font-display font-extrabold text-2xl">
                    {r.contact}
                  </span>
                  {r.hours && (
                    <span className="block text-xs text-ink-faint mt-1">
                      {r.hours}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {lines.length > 0 && (
            <div className="mt-4 space-y-2.5">
              {lines.map((r) => (
                <div
                  key={r.name}
                  className="border-2 border-ink rounded-[14px] p-4 bg-white"
                >
                  <b className="block text-[15px]">{r.name}</b>
                  <span className="font-display font-extrabold text-lg">
                    {r.contact}
                  </span>
                  <span className="block text-xs text-ink-faint mt-1">
                    {[r.hours, r.languages].filter(Boolean).join(" · ")}
                  </span>
                  {r.source_url && (
                    <a
                      href={r.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-violet-deep underline underline-offset-2 mt-1 inline-block"
                    >
                      official source ↗
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}

          {resources.length === 0 && (
            <div className="mt-4 border-2 border-dashed border-ink rounded-[14px] p-4 bg-white/70 text-sm text-ink-soft">
              We don&apos;t have verified local numbers for your region yet, so
              we&apos;d rather show nothing than show something wrong. Please
              search for your national emergency number and mental-health
              helpline, or ask a GP or pharmacist.
            </div>
          )}
        </div>
      )}

      <div className="rounded-2xl border-2 border-dashed border-ink bg-white/70 p-5 text-sm text-ink-soft flex gap-3 mt-5">
        <span>ℹ️</span>
        <p className="m-0">
          Every number here is checked against an official source and dated. We
          never invent a helpline, and we never give instructions about using,
          dosing, mixing, or detoxing.
        </p>
      </div>
    </div>
  );
}
