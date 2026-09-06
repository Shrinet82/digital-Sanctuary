import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { SafetyNetBuilder } from "@/components/SafetyNetBuilder";
import { getSafetyNet } from "@/app/actions/safetynet";

export const metadata = { title: "Your Safety Net · Digital Sanctuary" };

export default async function SafetyNetPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const safetyNet = await getSafetyNet();

  return (
    <main className="max-w-2xl mx-auto px-6">
      <AppHeader />

      <section className="py-8">
        <span className="ds-pill bg-yellow -rotate-1 mb-4">🧷 your Safety Net</span>
        <h1 className="text-3xl sm:text-4xl">
          The calm version of you,{" "}
          <span className="ds-hl">writing to the one in trouble.</span>
        </h1>
        <p className="text-ink-soft mt-4 max-w-[56ch]">
          Build this while things are steady. It&apos;ll show up, exactly as you
          wrote it, at every crisis exit — plus verified lines for your region,
          added automatically.
        </p>
      </section>

      <section className="pb-10">
        <SafetyNetBuilder initial={safetyNet} />
      </section>

      <footer className="border-t-2.5 border-ink py-7 text-sm text-ink-faint font-semibold">
        Digital Sanctuary ✦ nothing here is shared, ever.
      </footer>
    </main>
  );
}
