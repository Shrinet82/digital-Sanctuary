"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { clearPasscode, lockNow, setPasscode } from "@/app/actions/passcode";

/**
 * Set, change, or remove the Ledger/Vault passcode (§14). Honest about
 * what it is: a screen-lock, not encryption — your login and RLS are what
 * actually protect the data.
 */
export function PasscodeSettings({ initialHasPasscode }: { initialHasPasscode: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [hasPasscode, setHasPasscode] = useState(initialHasPasscode);
  const [mode, setMode] = useState<"idle" | "set" | "remove">("idle");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  function startSet() {
    setMode("set");
    setPin("");
    setConfirmPin("");
    setError(null);
  }

  function submitSet() {
    setError(null);
    if (pin !== confirmPin) {
      setError("Those two don't match.");
      return;
    }
    startTransition(async () => {
      const res = await setPasscode(pin);
      if (res.ok) {
        setHasPasscode(true);
        setMode("idle");
        setStatus("Passcode set. The Ledger and Vault are unlocked for now.");
      } else {
        setError(res.error ?? "Couldn't set that passcode.");
      }
    });
  }

  function submitRemove() {
    setError(null);
    startTransition(async () => {
      const res = await clearPasscode(pin);
      if (res.ok) {
        setHasPasscode(false);
        setMode("idle");
        setPin("");
        setStatus("Passcode removed. The Ledger and Vault are open by default again.");
      } else {
        setError(res.error ?? "Couldn't remove that.");
      }
    });
  }

  function relock() {
    startTransition(async () => {
      await lockNow();
      setStatus("Locked. You'll need your passcode next time you open the Ledger or Vault.");
      router.refresh();
    });
  }

  return (
    <div className="ds-card">
      <h3 className="text-lg">🔒 Passcode lock</h3>
      <p className="text-sm text-ink-soft mt-1.5 mb-4">
        A screen-lock for the Ledger and the Vault, separate from your
        account login — for a shared device, or handing your phone to
        someone else. This isn&apos;t encryption; your login and database
        rules are what actually protect your data.
      </p>

      {mode === "idle" && (
        <div className="flex gap-3 flex-wrap">
          {hasPasscode ? (
            <>
              <button onClick={relock} disabled={pending} className="ds-btn ds-btn-ghost disabled:opacity-60">
                Lock now
              </button>
              <button onClick={() => setMode("remove")} className="ds-btn ds-btn-line">
                Remove passcode
              </button>
            </>
          ) : (
            <button onClick={startSet} className="ds-btn ds-btn-primary">
              Set a passcode
            </button>
          )}
        </div>
      )}

      {mode === "set" && (
        <div className="space-y-3">
          <input
            type="password"
            inputMode="numeric"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="New passcode (4-6 digits)"
            className="w-full border-2.5 border-ink rounded-[14px] px-4 py-2.5 bg-surface"
          />
          <input
            type="password"
            inputMode="numeric"
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="Confirm passcode"
            className="w-full border-2.5 border-ink rounded-[14px] px-4 py-2.5 bg-surface"
          />
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={submitSet}
              disabled={pending || pin.length < 4 || confirmPin.length < 4}
              className="ds-btn ds-btn-primary disabled:opacity-50"
            >
              {pending ? "Saving…" : "Save passcode"}
            </button>
            <button onClick={() => setMode("idle")} className="ds-btn ds-btn-ghost">
              Cancel
            </button>
          </div>
        </div>
      )}

      {mode === "remove" && (
        <div className="space-y-3">
          <input
            type="password"
            inputMode="numeric"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="Enter your current passcode"
            className="w-full border-2.5 border-ink rounded-[14px] px-4 py-2.5 bg-surface"
          />
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={submitRemove}
              disabled={pending || pin.length < 4}
              className="ds-btn disabled:opacity-50"
              style={{ background: "#E5484D", color: "#fff" }}
            >
              {pending ? "Removing…" : "Remove passcode"}
            </button>
            <button onClick={() => setMode("idle")} className="ds-btn ds-btn-ghost">
              Cancel
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-sm font-bold text-[#B03A2E] mt-3">{error}</p>}
      {status && <p className="text-sm font-bold mt-3">{status}</p>}
    </div>
  );
}
