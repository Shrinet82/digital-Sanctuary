"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { dismissPath } from "@/app/actions/path";
import type { PathDay } from "@/lib/path";

/**
 * Today's Path content (§9). Fixed and identical for everyone at this day
 * number — never adaptive. "Skip" only dismisses this card; nothing it
 * points at was ever locked.
 */
export function PathCard({ day, content }: { day: number; content: PathDay }) {
  const [pending, startTransition] = useTransition();
  const [dismissed, setDismissed] = useState(false);

  function skip() {
    startTransition(async () => {
      await dismissPath();
      setDismissed(true);
    });
  }

  if (dismissed) return null;

  return (
    <div className="ds-card bg-gradient-to-br from-sand via-white to-mint">
      <div className="flex items-center gap-3 flex-wrap mb-3">
        <span className="ds-pill bg-white">Day {day} of 14</span>
        <button
          onClick={skip}
          disabled={pending}
          className="text-xs font-bold text-ink-faint underline underline-offset-2 ml-auto disabled:opacity-50"
        >
          Skip — show me everything
        </button>
      </div>
      <h3 className="text-xl">{content.title}</h3>
      <p className="text-ink-soft mt-2 mb-4">{content.blurb}</p>
      <Link href={content.cta.href} className="ds-btn ds-btn-primary no-underline">
        {content.cta.label} →
      </Link>
    </div>
  );
}
