import Link from "next/link";
import { UrgentHelpButton } from "@/components/UrgentHelpButton";
import { SessionCatcher } from "@/components/SessionCatcher";

export default function Home() {
  return (
    <main className="max-w-5xl mx-auto px-6">
      <SessionCatcher />
      {/* Top bar */}
      <header className="flex items-center gap-4 py-4">
        <div className="flex items-center gap-3 font-display font-extrabold text-lg">
          <span className="grid place-items-center w-9 h-9 rounded-xl bg-coral text-white border-2.5 border-ink shadow-pop-sm -rotate-6">
            ✦
          </span>
          Digital Sanctuary
        </div>
        <div className="flex-1" />
        <Link
          href="/login"
          className="text-sm font-bold text-ink-soft no-underline hover:underline underline-offset-2"
        >
          Sign in
        </Link>
        <UrgentHelpButton />
      </header>

      {/* Hero */}
      <section className="py-14">
        <span className="ds-pill bg-yellow -rotate-1 mb-5">
          ✦ Phase 0 · foundations
        </span>
        <h1 className="text-4xl sm:text-5xl max-w-[17ch]">
          One calm home for <span className="ds-hl">how you actually feel.</span>
        </h1>
        <p className="text-lg text-ink-soft max-w-[58ch] mt-5">
          Anxiety, low mood, ADHD, and substance use — met with one small,
          helpful next step at a time. This is the app shell; the modules land
          next.
        </p>

        <div className="flex gap-3 flex-wrap mt-7">
          <Link href="/signup" className="ds-btn ds-btn-primary no-underline">
            Create an account →
          </Link>
          <Link href="/login" className="ds-btn ds-btn-ghost no-underline">
            Sign in
          </Link>
        </div>
      </section>

      {/* Design-system proof */}
      <section className="py-6">
        <h2 className="text-2xl mb-4">The design system is live</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="ds-card">
            <span className="ds-pill bg-violet-soft text-violet-deep">Violet</span>
            <p className="mt-3 text-sm text-ink-soft">
              Primary actions and focus states.
            </p>
          </div>
          <div className="ds-card">
            <span className="ds-pill bg-teal-soft text-teal">Teal &amp; mint</span>
            <p className="mt-3 text-sm text-ink-soft">
              Calm, grounding, and success states.
            </p>
          </div>
          <div className="ds-card">
            <span className="ds-pill bg-coral-soft text-coral">Coral</span>
            <p className="mt-3 text-sm text-ink-soft">
              Decorative accents — never used for emergency red.
            </p>
          </div>
        </div>
      </section>

      {/* Boundary note */}
      <section className="py-8">
        <div className="rounded-2xl border-2 border-dashed border-ink bg-white/70 p-5 text-sm text-ink-soft flex gap-3">
          <span>🛟</span>
          <p className="m-0">
            <b className="text-ink">
              This is education and skills-practice, not diagnosis or treatment.
            </b>{" "}
            If you are in danger or thinking of harming yourself, use the{" "}
            <b>Need urgent help?</b> button at any time. Digital Sanctuary does
            not replace professional or emergency care.
          </p>
        </div>
      </section>

      <footer className="border-t-2.5 border-ink mt-10 py-7 text-sm text-ink-faint font-semibold">
        Digital Sanctuary ✦ evidence-based under the hood, human on the surface.
      </footer>
    </main>
  );
}
