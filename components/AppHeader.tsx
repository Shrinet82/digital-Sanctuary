import Link from "next/link";
import { UrgentHelpButton } from "@/components/UrgentHelpButton";
import { signOut } from "@/app/auth/actions";

/** Shared top bar. The urgent-help control is present on every screen, always. */
export function AppHeader({ showSignOut = true }: { showSignOut?: boolean }) {
  return (
    <header className="flex items-center gap-4 py-4 flex-wrap">
      <Link
        href="/dashboard"
        className="flex items-center gap-3 font-display font-extrabold text-base no-underline text-ink"
      >
        <span className="grid place-items-center w-9 h-9 rounded-xl bg-coral text-white border-2.5 border-ink shadow-pop-sm -rotate-6">
          ✦
        </span>
        Digital Sanctuary
      </Link>
      <div className="flex-1" />
      <UrgentHelpButton />
      {showSignOut && (
        <form action={signOut}>
          <button className="text-sm font-bold text-ink-soft underline underline-offset-2">
            Sign out
          </button>
        </form>
      )}
    </header>
  );
}
