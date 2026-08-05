import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { getAllWorksheets } from "@/lib/worksheets/registry";

export const metadata = { title: "Worksheets · Digital Sanctuary" };

export default function WorksheetsPage() {
  const worksheets = getAllWorksheets();

  return (
    <main className="max-w-3xl mx-auto px-6">
      <AppHeader />

      <section className="py-8">
        <span className="ds-pill bg-yellow -rotate-1 mb-4">
          ✦ guided worksheets
        </span>
        <h1 className="text-3xl sm:text-4xl max-w-[18ch]">
          Proven exercises, <span className="ds-hl">one prompt at a time.</span>
        </h1>
        <p className="text-ink-soft text-lg mt-4 max-w-[56ch]">
          These are the classic CBT and DBT worksheets, rebuilt as guided steps
          instead of a page of boxes. Everything you write stays private.
        </p>

        <div className="grid gap-4 mt-8">
          {worksheets.map((w) => (
            <Link
              key={w.id}
              href={`/worksheets/${w.id}`}
              className="ds-card no-underline text-ink hover:-translate-y-0.5 transition-transform"
            >
              <div className="flex gap-2 flex-wrap mb-2">
                <span className="ds-pill bg-violet-soft text-violet-deep">
                  {w.framework}
                </span>
                <span className="ds-pill bg-surface-2">{w.condition}</span>
                <span className="ds-pill bg-mint text-[#0B5C41]">
                  {w.steps.length} steps
                </span>
              </div>
              <b className="block text-xl font-display">{w.name}</b>
              <p className="text-sm text-ink-soft mt-1.5 mb-0">{w.lede}</p>
            </Link>
          ))}
        </div>

        <div className="rounded-2xl border-2 border-dashed border-ink bg-white/70 p-5 text-sm text-ink-soft flex gap-3 mt-8">
          <span>🔒</span>
          <p className="m-0">
            Nothing saves until you reach the end and choose to save. Your
            answers are visible only to you.
          </p>
        </div>
      </section>
    </main>
  );
}
