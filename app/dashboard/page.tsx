import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";
import { UrgentHelpButton } from "@/components/UrgentHelpButton";

export const metadata = { title: "Your dashboard · Digital Sanctuary" };

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle();

  const name = profile?.display_name?.trim() || null;

  return (
    <main className="max-w-4xl mx-auto px-6">
      {/* Top bar */}
      <header className="flex items-center gap-4 py-4 flex-wrap">
        <div className="flex items-center gap-3 font-display font-extrabold text-base">
          <span className="grid place-items-center w-9 h-9 rounded-xl bg-coral text-white border-2.5 border-ink shadow-pop-sm -rotate-6">
            ✦
          </span>
          Digital Sanctuary
        </div>
        <div className="flex-1" />
        <UrgentHelpButton />
        <form action={signOut}>
          <button className="text-sm font-bold text-ink-soft underline underline-offset-2">
            Sign out
          </button>
        </form>
      </header>

      {/* Greeting */}
      <section className="py-8">
        <span className="ds-pill bg-yellow -rotate-1 mb-4">
          ✦ phase 1 · your space
        </span>
        <h1 className="text-3xl sm:text-4xl">
          {name ? `Hey ${name}.` : "Hey."}{" "}
          <span className="ds-hl">One move at a time.</span>
        </h1>
        <p className="text-ink-soft mt-4 max-w-[56ch]">
          Your account is live and everything you save here is private to you.
          The check-in and modules arrive in Phase 2 — this is your space
          waiting for them.
        </p>
      </section>

      {/* NOW */}
      <section className="pb-2">
        <div className="flex items-center gap-3 mb-3">
          <h2 className="text-xl">⚡ Now</h2>
          <span className="ds-pill bg-sand rotate-1">one primary action</span>
        </div>
        <div className="ds-card bg-gradient-to-br from-violet-soft via-coral-soft to-sand">
          <span className="ds-pill bg-mint text-[#0B5C41]">
            🧮 picked by transparent rules
          </span>
          <h3 className="text-2xl mt-3">Your check-in lands next</h3>
          <p className="text-ink-soft mt-2 max-w-[52ch]">
            Soon this card will read your 15-second check-in and offer the one
            smallest helpful thing — always showing you why it chose it.
          </p>
          <button
            disabled
            className="ds-btn ds-btn-primary mt-4 opacity-60 cursor-not-allowed"
          >
            Coming in Phase 2
          </button>
        </div>
      </section>

      {/* TODAY */}
      <section className="py-6">
        <div className="flex items-center gap-3 mb-3">
          <h2 className="text-xl">🧰 Today</h2>
          <span className="ds-pill bg-sand rotate-1">
            your pace · nothing is required
          </span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { icon: "🌊", name: "Ground & Settle", note: "Anxiety · breathing" },
            { icon: "🪜", name: "Task Decomposer", note: "ADHD · break it down" },
            { icon: "🌱", name: "One Small Action", note: "Low mood · activation" },
            { icon: "💭", name: "Thought Record", note: "Anxiety · CBT worksheet" },
          ].map((m) => (
            <div
              key={m.name}
              className="ds-card !p-5 flex items-start gap-4 opacity-70"
            >
              <span className="grid place-items-center w-11 h-11 rounded-xl bg-mint border-2 border-ink text-xl -rotate-3">
                {m.icon}
              </span>
              <div>
                <b className="block text-[15px]">{m.name}</b>
                <span className="text-sm text-ink-faint">{m.note}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* REFLECTION */}
      <section className="py-4">
        <div className="flex items-center gap-3 mb-3">
          <h2 className="text-xl">🔮 Private reflection</h2>
          <span className="ds-pill bg-sand rotate-1">for your eyes only</span>
        </div>
        <div className="ds-card !p-5 opacity-70">
          <b>What helps me most</b>
          <p className="text-sm text-ink-faint mt-1 mb-0">
            Once you&apos;ve used a few modules, this becomes your own private
            map of what actually works — never a score, never a diagnosis.
          </p>
        </div>
      </section>

      <section className="py-6">
        <div className="rounded-2xl border-2 border-dashed border-ink bg-white/70 p-5 text-sm text-ink-soft flex gap-3">
          <span>🔒</span>
          <p className="m-0">
            Signed in as <b className="text-ink">{user.email}</b>. Journals and
            check-ins are private by default and you can export or delete
            everything at any time.
          </p>
        </div>
      </section>

      <footer className="border-t-2.5 border-ink mt-6 py-7 text-sm text-ink-faint font-semibold">
        Digital Sanctuary ✦ evidence-based under the hood, human on the surface.
      </footer>
    </main>
  );
}
