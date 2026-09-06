"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { verifyPasscode } from "@/app/actions/passcode";

/**
 * The screen shown instead of real Ledger/Vault content when a passcode
 * is set and the unlock cookie isn't present. The caller (a Server
 * Component) never fetches the real data in this case — this isn't a
 * visual overlay on top of data that's already been sent to the browser.
 */
export function PasscodeLock({ area }: { area: string }) {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = await verifyPasscode(pin);
      if (res.ok) {
        setPin("");
        router.refresh();
      } else {
        setError(res.error ?? "That's not the right passcode.");
      }
    });
  }

  return (
    <div className="ds-card max-w-sm mx-auto text-center">
      <span className="text-3xl block mb-3">🔒</span>
      <h2 className="text-xl mb-1">{area} is locked</h2>
      <p className="text-sm text-ink-soft mb-5">Enter your passcode to open it.</p>
      <input
        type="password"
        inputMode="numeric"
        autoFocus
        value={pin}
        onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder="••••"
        className="w-full text-center text-2xl tracking-[0.4em] border-2.5 border-ink rounded-[14px] px-4 py-3 bg-surface"
      />
      {error && <p className="text-sm font-bold text-[#B03A2E] mt-3">{error}</p>}
      <button
        onClick={submit}
        disabled={pending || pin.length < 4}
        className="ds-btn ds-btn-primary disabled:opacity-50 mt-4 w-full"
      >
        {pending ? "Checking…" : "Unlock"}
      </button>
    </div>
  );
}
