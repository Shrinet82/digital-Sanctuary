import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { ModuleGrid } from "@/components/ModuleGrid";

export const metadata = { title: "Your Toolkit · Digital Sanctuary" };

export default async function ToolkitPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <main className="max-w-4xl mx-auto px-6">
      <AppHeader />

      <section className="py-8">
        <span className="ds-pill bg-yellow -rotate-1 mb-4">🧰 the Toolkit</span>
        <h1 className="text-3xl sm:text-4xl">
          Everything, <span className="ds-hl">whenever you want it.</span>
        </h1>
        <p className="text-ink-soft mt-4 max-w-[56ch]">
          Nothing here was ever locked — the check-in just offers one thing
          at a time so you&apos;re never picking from a wall of options.
          Browse the rest whenever you like.
        </p>
      </section>

      <section className="pb-10">
        <ModuleGrid />
      </section>

      <footer className="border-t-2.5 border-ink py-7 text-sm text-ink-faint font-semibold">
        Digital Sanctuary ✦ evidence-based under the hood, human on the surface.
      </footer>
    </main>
  );
}
