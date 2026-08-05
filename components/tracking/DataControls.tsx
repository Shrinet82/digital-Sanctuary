"use client";

import { useState, useTransition } from "react";
import { deleteMyAccount, exportMyData } from "@/app/actions/tracking";

/** Export and delete. Both must always work — see docs/09-safety-and-privacy.md. */
export function DataControls() {
  const [busy, startTransition] = useTransition();
  const [status, setStatus] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [typed, setTyped] = useState("");

  function handleExport() {
    setStatus(null);
    startTransition(async () => {
      const res = await exportMyData();
      if (!res.ok) {
        setStatus(res.error);
        return;
      }
      const blob = new Blob([JSON.stringify(res.data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `digital-sanctuary-export-${new Date()
        .toISOString()
        .slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setStatus("Downloaded. That file is yours.");
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const res = await deleteMyAccount();
      if (res && !res.ok) setStatus(res.error ?? "Couldn't delete the account.");
    });
  }

  return (
    <div className="ds-card">
      <h3 className="text-lg">Your data</h3>
      <p className="text-sm text-ink-soft mt-1.5">
        Everything here belongs to you. Take it with you, or erase it — no
        questions, no retention tricks.
      </p>

      <div className="flex gap-3 flex-wrap mt-5">
        <button
          onClick={handleExport}
          disabled={busy}
          className="ds-btn ds-btn-ghost disabled:opacity-60"
        >
          {busy ? "Working…" : "📦 Download everything"}
        </button>
        {!confirming && (
          <button
            onClick={() => setConfirming(true)}
            className="ds-btn ds-btn-line"
          >
            Delete my account
          </button>
        )}
      </div>

      {status && (
        <p role="status" className="text-sm font-bold mt-4 mb-0">
          {status}
        </p>
      )}

      {confirming && (
        <div className="mt-5 rounded-[16px] border-2.5 border-ink bg-coral-soft p-5">
          <b className="block text-[15px]">
            This deletes everything, permanently.
          </b>
          <p className="text-sm text-ink-soft mt-1.5">
            Your journals, check-ins, worksheets and account will be gone and
            can&apos;t be recovered. If you might want your notes later, download
            them first.
          </p>
          <label htmlFor="confirm" className="block text-sm font-bold mt-4 mb-2">
            Type <span className="font-mono">delete</span> to confirm
          </label>
          <input
            id="confirm"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            className="w-full border-2.5 border-ink rounded-[14px] px-4 py-3 bg-surface"
            placeholder="delete"
          />
          <div className="flex gap-3 flex-wrap mt-4">
            <button
              onClick={handleDelete}
              disabled={typed.trim().toLowerCase() !== "delete" || busy}
              className="ds-btn disabled:opacity-50"
              style={{ background: "#E5484D", color: "#fff" }}
            >
              {busy ? "Deleting…" : "Delete permanently"}
            </button>
            <button
              onClick={() => {
                setConfirming(false);
                setTyped("");
              }}
              className="ds-btn ds-btn-ghost"
            >
              Keep my account
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
