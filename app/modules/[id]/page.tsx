import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { GroundAndSettle } from "@/components/modules/GroundAndSettle";
import { TaskDecomposer } from "@/components/modules/TaskDecomposer";
import { OneSmallAction } from "@/components/modules/OneSmallAction";

type ModuleMeta = {
  title: string;
  condition: string;
  conditionClass: string;
  lede: string;
  why: string;
};

const META: Record<string, ModuleMeta> = {
  "ground-and-settle": {
    title: "Ground & Settle",
    condition: "Anxiety",
    conditionClass: "bg-coral-soft text-[#B03A2E]",
    lede: "A paced-breathing practice. Follow the circle: it grows as you breathe in, holds, then shrinks as you breathe out.",
    why: "Slow, paced breathing with a longer exhale gently signals the body's calming system. It's a portable skill for high-arousal moments — not a cure, and you're in control the whole time. Adapted from paced-breathing and grounding practices in NHS and CCI anxiety self-help materials.",
  },
  "task-decomposer": {
    title: "Task Decomposer",
    condition: "ADHD · executive function",
    conditionClass: "bg-violet-soft text-violet-deep",
    lede: "Naming what's blocking you comes first — then we turn one goal into observable micro-steps, starting with something under two minutes.",
    why: "Executive-function friction isn't laziness — it's a gap between intention and initiation. A concrete first step under two minutes lowers the activation cost, and a visible sequence offloads working memory. Neurodiversity-affirming by design; adapted from the Focus Forward ADHD Skills Group task-breakdown strategy.",
  },
  "one-small-action": {
    title: "One Small Action",
    condition: "Low mood",
    conditionClass: "bg-sand text-[#8A5B00]",
    lede: "Not a to-do list — just one action, sized for today. There's no failure state here.",
    why: "In low mood, motivation usually follows action rather than coming first. Doing one small, valued, or pleasant thing — and noticing how it felt — is the core of behavioural activation. Sizing it down protects against the all-or-nothing trap. Adapted from WHO Step-by-Step and CCI behavioural-activation approaches.",
  },
};

export function generateStaticParams() {
  return Object.keys(META).map((id) => ({ id }));
}

export default function ModulePage({ params }: { params: { id: string } }) {
  const meta = META[params.id];
  if (!meta) notFound();

  return (
    <main className="max-w-2xl mx-auto px-6">
      <AppHeader />

      <section className="py-8">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="grid place-items-center w-10 h-10 rounded-xl bg-surface border-2.5 border-ink shadow-pop-sm font-extrabold no-underline text-ink"
            aria-label="Back to dashboard"
          >
            ←
          </Link>
          <span
            className={`ds-pill uppercase tracking-wide ${meta.conditionClass}`}
          >
            {meta.condition}
          </span>
        </div>

        <h1 className="text-3xl mt-4">{meta.title}</h1>
        <p className="text-ink-soft text-lg mt-3 max-w-[58ch]">{meta.lede}</p>

        <div className="mt-6">
          {params.id === "ground-and-settle" && <GroundAndSettle />}
          {params.id === "task-decomposer" && <TaskDecomposer />}
          {params.id === "one-small-action" && <OneSmallAction />}
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
