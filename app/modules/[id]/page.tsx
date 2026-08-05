import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { MODULE_LIST, getModule } from "@/lib/modules";
import { getAnchors, getVaultConsent } from "@/app/actions/vault";

import { GroundAndSettle } from "@/components/modules/GroundAndSettle";
import { TaskDecomposer } from "@/components/modules/TaskDecomposer";
import { OneSmallAction } from "@/components/modules/OneSmallAction";
import { TimeContainer } from "@/components/modules/TimeContainer";
import { PriorityLens } from "@/components/modules/PriorityLens";
import { ValuesToAction } from "@/components/modules/ValuesToAction";
import { EnergyAwareWeek } from "@/components/modules/EnergyAwareWeek";
import { SafetyGateway, type Resource } from "@/components/modules/SafetyGateway";
import { TriggerMap } from "@/components/modules/TriggerMap";
import { MooringLines } from "@/components/modules/MooringLines";
import { LapseReview } from "@/components/modules/LapseReview";
import { VaultGate } from "@/components/modules/VaultGate";

const GROUP_STYLE: Record<string, string> = {
  anxiety: "bg-coral-soft text-[#B03A2E]",
  low_mood: "bg-sand text-[#8A5B00]",
  adhd: "bg-violet-soft text-violet-deep",
  substance: "bg-mint text-[#0B5C41]",
};

export function generateStaticParams() {
  return MODULE_LIST.map((m) => ({ id: m.id }));
}

export function generateMetadata({ params }: { params: { id: string } }) {
  const m = getModule(params.id);
  return { title: m ? `${m.title} · Digital Sanctuary` : "Module" };
}

export default async function ModulePage({
  params,
}: {
  params: { id: string };
}) {
  const meta = getModule(params.id);
  if (!meta) notFound();

  // Vault modules need active consent before their data is even readable.
  let consented = true;
  if (meta.vault) {
    const consent = await getVaultConsent();
    consented = consent.granted;
  }

  // Safety Gateway needs the verified directory.
  let resources: Resource[] = [];
  if (meta.id === "safety-gateway") {
    const supabase = createClient();
    const { data } = await supabase
      .from("local_resources")
      .select(
        "service_type, name, contact, hours, languages, is_emergency, source_url, verified_at"
      )
      .eq("region", "IN")
      .order("sort_order");
    resources = (data ?? []) as Resource[];
  }

  let anchors: Record<string, number> = {};
  if (meta.id === "mooring-lines" && consented) {
    anchors = await getAnchors();
  }

  return (
    <main className="max-w-2xl mx-auto px-6">
      <AppHeader />

      <section className="py-8">
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href="/dashboard"
            className="grid place-items-center w-10 h-10 rounded-xl bg-surface border-2.5 border-ink shadow-pop-sm font-extrabold no-underline text-ink"
            aria-label="Back to dashboard"
          >
            ←
          </Link>
          <span
            className={`ds-pill uppercase tracking-wide ${GROUP_STYLE[meta.group]}`}
          >
            {meta.condition}
          </span>
          {meta.vault && (
            <span className="ds-pill bg-surface-2">🔒 extra-private</span>
          )}
        </div>

        <h1 className="text-3xl mt-4">
          <span className="mr-2">{meta.emoji}</span>
          {meta.title}
        </h1>
        <p className="text-ink-soft text-lg mt-3 max-w-[58ch]">
          {meta.description}
        </p>

        <div className="mt-6">
          {meta.vault && !consented ? (
            <VaultGate>{null}</VaultGate>
          ) : (
            <>
              {meta.id === "ground-and-settle" && <GroundAndSettle />}
              {meta.id === "task-decomposer" && <TaskDecomposer />}
              {meta.id === "one-small-action" && <OneSmallAction />}
              {meta.id === "time-container" && <TimeContainer />}
              {meta.id === "priority-lens" && <PriorityLens />}
              {meta.id === "values-to-action" && <ValuesToAction />}
              {meta.id === "energy-aware-week" && <EnergyAwareWeek />}
              {meta.id === "safety-gateway" && (
                <SafetyGateway resources={resources} />
              )}
              {meta.id === "trigger-map" && <TriggerMap />}
              {meta.id === "mooring-lines" && <MooringLines initial={anchors} />}
              {meta.id === "lapse-review" && <LapseReview />}
            </>
          )}
        </div>

        <details className="mt-6 border-2 border-dashed border-ink rounded-[16px] p-4 bg-white/70">
          <summary className="cursor-pointer font-extrabold text-sm text-violet-deep">
            👀 Why this may help
          </summary>
          <p className="text-[15px] text-ink-soft mt-3 mb-0">{meta.why}</p>
        </details>

        <div className="mt-6">
          <Link
            href="/dashboard"
            className="text-sm text-ink-faint font-bold underline underline-offset-2"
          >
            ↩ Leave this exercise — nothing is lost
          </Link>
        </div>
      </section>
    </main>
  );
}
