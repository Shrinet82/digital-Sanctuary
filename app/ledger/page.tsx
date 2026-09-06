import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { YearGrid } from "@/components/ledger/YearGrid";
import { buildYearGrid, type CheckInLite } from "@/lib/ledger";
import { STATES } from "@/lib/checkin";

export const metadata = { title: "Your Ledger · Digital Sanctuary" };

export default async function LedgerPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const year = new Date().getUTCFullYear();
  const { data: checkIns } = await supabase
    .from("check_ins")
    .select("log_date, state, created_at")
    .gte("log_date", `${year}-01-01`)
    .order("created_at", { ascending: true });

  const cells = buildYearGrid((checkIns ?? []) as CheckInLite[], year);
  const loggedDays = cells.filter((c) => c.state !== null).length;

  return (
    <main className="max-w-4xl mx-auto px-6">
      <AppHeader />

      <section className="py-8">
        <span className="ds-pill bg-yellow -rotate-1 mb-4">📔 your Ledger</span>
        <h1 className="text-3xl sm:text-4xl">
          {year}. <span className="ds-hl">{loggedDays} days logged.</span>
        </h1>
        <p className="text-ink-soft mt-4 max-w-[56ch]">
          No streaks. Empty squares are just empty — not a broken chain. Tap
          any day to see it.
        </p>
      </section>

      <section className="pb-8">
        <YearGrid cells={cells} />

        <div className="flex gap-4 flex-wrap items-center mt-5 text-xs text-ink-faint font-bold">
          <span>Rough</span>
          {STATES.map((s) => (
            <span
              key={s.value}
              className="w-3.5 h-3.5 rounded-[3px] border border-ink/70 inline-block"
              style={{
                backgroundColor: {
                  rough: "#FF6B5E",
                  low: "#FFEBAE",
                  flat: "#F5EBDD",
                  okay: "#CDF3EA",
                  good: "#2FC6B0",
                }[s.value],
              }}
            />
          ))}
          <span>Good</span>
        </div>
      </section>

      <section className="pb-10">
        <Link
          href="/checkin"
          className="ds-btn ds-btn-primary no-underline"
        >
          New check-in →
        </Link>
      </section>

      <footer className="border-t-2.5 border-ink py-7 text-sm text-ink-faint font-semibold">
        Digital Sanctuary ✦ your memory, kept for you.
      </footer>
    </main>
  );
}
