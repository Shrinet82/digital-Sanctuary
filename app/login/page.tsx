import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";
import { UrgentHelpButton } from "@/components/UrgentHelpButton";

export const metadata = { title: "Sign in · Digital Sanctuary" };

export default function LoginPage() {
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
        <span className="ds-pill bg-yellow -rotate-1 mb-4">✦ welcome back</span>
        <h1 className="text-3xl mb-2">Good to see you.</h1>
        <p className="text-ink-soft mb-6">
          Sign in to pick up where you left off. Everything you&apos;ve saved is
          private to you.
        </p>
        <AuthForm mode="signin" />
      </section>
    </main>
  );
}
