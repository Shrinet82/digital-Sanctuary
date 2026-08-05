"use client";

import { useState } from "react";
import Link from "next/link";
import { WorksheetPlayer } from "./WorksheetPlayer";
import { UrgentHelpDialog } from "@/components/UrgentHelpDialog";
import type { WorksheetTemplate } from "@/lib/worksheets/types";

/**
 * Client wrapper so a safety_gate inside the player can open the same
 * urgent-help dialog used in the header.
 */
export function WorksheetShell({ template }: { template: WorksheetTemplate }) {
  const [urgentOpen, setUrgentOpen] = useState(false);

  return (
    <>
      <WorksheetPlayer
        template={template}
        onOpenUrgentHelp={() => setUrgentOpen(true)}
      />
      <UrgentHelpDialog open={urgentOpen} onClose={() => setUrgentOpen(false)} />

      <details className="mt-6 border-2 border-dashed border-ink rounded-[16px] p-4 bg-white/70">
        <summary className="cursor-pointer font-extrabold text-sm text-violet-deep">
          👀 Why this may help
        </summary>
        <p className="text-[15px] text-ink-soft mt-3 mb-0">{template.why}</p>
      </details>

      <div className="mt-6">
        <Link
          href="/dashboard"
          className="text-sm text-ink-faint font-bold underline underline-offset-2"
        >
          ↩ Leave this worksheet — nothing is saved until you finish
        </Link>
      </div>
    </>
  );
}
