"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { grantVaultConsent } from "@/app/actions/vault";

/**
 * The consent gate for the substance-use domain.
 *
 * This is not a cookie banner. Without an active consent row, the vault
 * tables are unreadable at the database level — so this screen is the
 * genuine door, and the promise behind it is enforced in RLS.
 */
export function VaultGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function accept() {
    setError(null);
    startTransition(async () => {
      const res = await grantVaultConsent();
      if (res.ok) router.refresh();
      else setError(res.error ?? "Couldn't turn this on.");
    });
  }

  return (
    <div className="ds-card">
      <span className="ds-pill bg-mint text-[#0B5C41] mb-3">
        🔒 separately consented
      </span>
      <h2 className="text-2xl">This part is kept apart.</h2>
      <p className="text-ink-soft mt-3">
        Substance-use notes are the most sensitive thing this app can hold, so
        they live in their own space with their own switch. Here&apos;s exactly
        what that means:
      </p>

      <ul className="list-none p-0 m-0 mt-5 space-y-3">
        {[
          [
            "🔐",
            "Locked at the database, not just the screen",
            "Until you turn this on, these records literally cannot be read — not by the app, not by us.",
          ],
          [
            "🙈",
            "Never mixed into your general patterns",
            "This data stays out of your insights and trends unless you choose otherwise.",
          ],
          [
            "↩️",
            "You can switch it off again",
            "Turning it off hides everything immediately. Your entries are kept, not destroyed, so you can turn it back on later — or delete them for good.",
          ],
          [
            "⚖️",
            "No goal is judged here",
            "Reducing, using more safely, stopping, reconnecting with care, or just reading — all equally valid.",
          ],
        ].map(([emoji, title, body]) => (
          <li
            key={title}
            className="flex gap-3 border-2 border-ink rounded-[14px] p-4 bg-surface-2"
          >
            <span className="text-xl">{emoji}</span>
            <span>
              <b className="block text-[15px]">{title}</b>
              <span className="text-sm text-ink-soft">{body}</span>
            </span>
          </li>
        ))}
      </ul>

      <div className="rounded-[14px] border-2 border-dashed border-ink bg-white/70 p-4 text-sm text-ink-soft mt-5">
        <b className="text-ink">This is not treatment or medical advice.</b> It
        won&apos;t tell you how to use anything, and it never covers dosing,
        mixing, or detoxing. If something is urgent, the{" "}
        <b>Need urgent help?</b> button works whether or not you turn this on.
      </div>

      {error && (
        <p
          role="alert"
          className="text-sm font-semibold text-[#B03A2E] bg-coral-soft border-2 border-ink rounded-xl px-4 py-3 mt-4"
        >
          {error}
        </p>
      )}

      <div className="flex gap-3 flex-wrap mt-6">
        <button
          onClick={accept}
          disabled={pending}
          className="ds-btn ds-btn-primary disabled:opacity-60"
        >
          {pending ? "Turning on…" : "I understand — turn this on"}
        </button>
        <Link href="/dashboard" className="ds-btn ds-btn-ghost no-underline">
          Not now
        </Link>
      </div>
      <p className="text-xs text-ink-faint mt-4 mb-0">
        Choosing “not now” changes nothing and is not recorded as a decision
        about you.
      </p>

      <div className="hidden">{children}</div>
    </div>
  );
}
