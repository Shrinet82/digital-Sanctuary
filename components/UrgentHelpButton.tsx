"use client";

import { useState } from "react";
import { UrgentHelpDialog } from "./UrgentHelpDialog";
import type { SafetyNetData } from "@/app/actions/safetynet";
import type { Resource } from "@/components/modules/SafetyGateway";

/**
 * Always-on urgent-help control. Present on every screen, by design.
 */
export function UrgentHelpButton({
  safetyNet = null,
  resources = [],
}: {
  safetyNet?: SafetyNetData | null;
  resources?: Resource[];
}) {
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
      <UrgentHelpDialog
        open={open}
        onClose={() => setOpen(false)}
        safetyNet={safetyNet}
        resources={resources}
      />
    </>
  );
}
