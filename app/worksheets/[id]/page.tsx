import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { WorksheetShell } from "@/components/worksheets/WorksheetShell";
import { getAllWorksheets, getWorksheet } from "@/lib/worksheets/registry";

export function generateStaticParams() {
  return getAllWorksheets().map((w) => ({ id: w.id }));
}

export function generateMetadata({ params }: { params: { id: string } }) {
  const w = getWorksheet(params.id);
  return { title: w ? `${w.name} · Digital Sanctuary` : "Worksheet" };
}

export default function WorksheetPage({ params }: { params: { id: string } }) {
  const template = getWorksheet(params.id);
  if (!template) notFound();

  return (
    <main className="max-w-2xl mx-auto px-6">
      <AppHeader />

      <section className="py-8">
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href="/worksheets"
            className="grid place-items-center w-10 h-10 rounded-xl bg-surface border-2.5 border-ink shadow-pop-sm font-extrabold no-underline text-ink"
            aria-label="Back to worksheets"
          >
            ←
          </Link>
          <span className="ds-pill bg-violet-soft text-violet-deep uppercase tracking-wide">
            {template.framework}
          </span>
          <span className="ds-pill bg-surface-2">{template.condition}</span>
        </div>

        <h1 className="text-3xl mt-4">{template.name}</h1>
        <p className="text-ink-soft text-lg mt-3 max-w-[58ch]">
          {template.lede}
        </p>

        <div className="mt-6">
          <WorksheetShell template={template} />
        </div>
      </section>
    </main>
  );
}
