import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";
import { UrgentHelpButton } from "@/components/UrgentHelpButton";

export const metadata = { title: "Create an account · Digital Sanctuary" };

export default function SignUpPage() {
  return (
    <main className="max-w-md mx-auto px-6">
      <header className="flex items-center gap-4 py-4">
        <Link href="/" className="flex items-center gap-3 font-display font-extrabold text-base no-underline text-ink">
          <span className="grid place-items-center w-9 h-9 rounded-xl bg-coral text-white border-2.5 border-ink shadow-pop-sm -rotate-6">
            ✦
          </span>
          Digital Sanctuary
        </Link>
        <div className="flex-1" />
        <UrgentHelpButton />
      </header>

      <section className="py-8">
        <span className="ds-pill bg-yellow -rotate-1 mb-4">✦ no pressure</span>
        <h1 className="text-3xl mb-2">Make it yours.</h1>
        <p className="text-ink-soft mb-6">
          An account keeps your history so you can see what actually helps you.
          Private by default — you can export or delete everything, anytime.
        </p>
        <AuthForm mode="signup" />

        <div className="mt-6 rounded-2xl border-2 border-dashed border-ink bg-white/70 p-4 text-xs text-ink-soft flex gap-3">
          <span>🔒</span>
          <p className="m-0">
            We store the minimum we can. Your journals and check-ins are visible
            only to you — enforced by the database itself, not just the app.
          </p>
        </div>
      </section>
    </main>
  );
}
