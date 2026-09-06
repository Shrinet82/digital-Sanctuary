import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { MODULE_LIST } from "@/lib/modules";
import { recommend } from "@/lib/recommend";
import type { CheckInState, Loudest, Want } from "@/lib/checkin";
import { ModuleGrid } from "@/components/ModuleGrid";
import { getAllWorksheets } from "@/lib/worksheets/registry";
import { WeekStrip } from "@/components/ledger/WeekStrip";
import { buildRecentStrip, type CheckInLite } from "@/lib/ledger";
import { firstReflection, weekReflection } from "@/lib/patterns";
import { pathContentForDay, pathDayNumber } from "@/lib/path";
import { PathCard } from "@/components/PathCard";

export const metadata = { title: "Your dashboard · Digital Sanctuary" };

const OUTCOME_COPY: Record<string, string> = {
  done: "Done",
  partly: "Partly done",
  moved: "Moved",
  not_today: "Not today",
};

function timeAgo(iso: string) {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return days === 1 ? "yesterday" : `${days}d ago`;
}

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const since7 = new Date();
  since7.setDate(since7.getDate() - 6);

  const [
    { data: profile },
    { data: latestCheckIn },
    { data: sessions },
    { data: weekCheckIns },
    { data: reflectionCheckIns },
  ] = await Promise.all([
      supabase
        .from("profiles")
        .select("display_name, path_dismissed")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("check_ins")
        .select("state, loudest, context, want, created_at")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("practice_sessions")
        .select("module_id, outcome, rating_before, rating_after, started_at")
        .order("started_at", { ascending: false })
        .limit(5),
      supabase
        .from("check_ins")
        .select("log_date, state, created_at")
        .gte("log_date", since7.toISOString().slice(0, 10))
        .order("created_at", { ascending: true }),
      supabase
        .from("check_ins")
        .select("log_date, state, context")
        .order("log_date", { ascending: true }),
    ]);

  const name = profile?.display_name?.trim() || null;
  const worksheets = getAllWorksheets();
  const pathDay = profile?.path_dismissed || !user.created_at ? null : pathDayNumber(user.created_at);
  const pathContent = pathDay ? pathContentForDay(pathDay) : undefined;

  const reflectionRows = (reflectionCheckIns ?? []) as {
    log_date: string;
    state: CheckInState;
    context: string[];
  }[];
  const reflection = weekReflection(reflectionRows, 0) ?? firstReflection(reflectionRows);

  const hasCheckIn = Boolean(latestCheckIn);

  // Same deterministic engine as the check-in page.
  const reco = hasCheckIn
    ? recommend(
        {
          state: latestCheckIn!.state as CheckInState,
          loudest: (latestCheckIn!.loudest ?? []) as Loudest[],
          context: (latestCheckIn!.context ?? []) as string[],
          want: (latestCheckIn!.want as Want | null) ?? null,
        },
        `${new Date().toISOString().slice(0, 10)}:${user.id}`
      )
    : recommend(
        { state: "flat", loudest: [], context: [], want: null },
        `${new Date().toISOString().slice(0, 10)}:${user.id}`
      );

  const history = sessions ?? [];
  const weekCells = buildRecentStrip((weekCheckIns ?? []) as CheckInLite[], 7);

  return (
    <main className="max-w-4xl mx-auto px-6">
      <AppHeader />

      <section className="py-8">
        <span className="ds-pill bg-yellow -rotate-1 mb-4">✦ your space</span>
        <h1 className="text-3xl sm:text-4xl">
          {name ? `Hey ${name}.` : "Hey."}{" "}
          <span className="ds-hl">One move at a time.</span>
        </h1>
        <p className="text-ink-soft mt-4 max-w-[56ch]">
          {hasCheckIn
            ? `Based on your check-in ${timeAgo(latestCheckIn!.created_at)}.`
            : "Do a 15-second check-in and this becomes yours."}
        </p>
        <Link href="/checkin" className="ds-btn ds-btn-ghost no-underline mt-5">
          {hasCheckIn ? "New check-in" : "Start a check-in →"}
        </Link>
      </section>

      {pathDay && pathContent && (
        <section className="pb-8">
          <PathCard day={pathDay} content={pathContent} />
        </section>
      )}

      {/* LEDGER strip */}
      <section className="pb-8">
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <h2 className="text-xl">📔 This week</h2>
          <Link
            href="/ledger"
            className="text-sm font-bold text-violet-deep underline underline-offset-2 ml-auto"
          >
            Open your Ledger →
          </Link>
        </div>
        <WeekStrip cells={weekCells} />
      </section>

      {/* NOW */}
      <section className="pb-2">
        <div className="flex items-center gap-3 mb-3">
          <h2 className="text-xl">⚡ Now</h2>
          <span className="ds-pill bg-sand rotate-1">one primary action</span>
        </div>
        <div className="ds-card bg-gradient-to-br from-violet-soft via-coral-soft to-sand">
          <div className="flex gap-2 flex-wrap mb-3">
            <span className="ds-pill bg-white">{reco.condition}</span>
            <span className="ds-pill bg-mint text-[#0B5C41]">
              🧮 picked by transparent rules
            </span>
          </div>
          <h3 className="text-2xl">{reco.title}</h3>
          <p className="text-ink-soft mt-2 max-w-[52ch]">{reco.description}</p>
          <div className="bg-white/90 border-2 border-ink rounded-xl px-4 py-3 my-4 text-[14.5px] text-ink-soft shadow-pop-sm">
            <span className="text-violet-deep font-extrabold">“</span>{" "}
            {hasCheckIn ? (
              reco.reason
            ) : (
              <>
                You haven&apos;t checked in yet — here&apos;s a calm place to
                start.{" "}
                <Link
                  href="/checkin"
                  className="font-extrabold text-violet-deep"
                >
                  Do the 15-second check-in
                </Link>{" "}
                to personalise this.
              </>
            )}
          </div>
          <Link
            href={`/modules/${reco.moduleId}`}
            className="ds-btn ds-btn-primary no-underline"
          >
            Let&apos;s go →
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 mt-4">
          {reco.alternatives.map((alt) => (
            <Link
              key={alt.moduleId}
              href={`/modules/${alt.moduleId}`}
              className="ds-card !p-4 flex items-center justify-between gap-4 no-underline text-ink hover:-translate-y-0.5 transition-transform"
            >
              <span>
                <b className="block text-[15px]">{alt.title}</b>
                <span className="text-sm text-ink-faint">{alt.condition}</span>
              </span>
              <span className="text-violet-deep text-xl font-extrabold">→</span>
            </Link>
          ))}
        </div>
      </section>

      {/* TODAY */}
      <section className="py-8">
        <div className="flex items-center gap-3 mb-3">
          <h2 className="text-xl">🧰 Today</h2>
          <span className="ds-pill bg-sand rotate-1">
            your pace · nothing is required
          </span>
        </div>
        <ModuleGrid />
      </section>

      {/* WORKSHEETS */}
      <section className="pb-8">
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <h2 className="text-xl">📓 Guided worksheets</h2>
          <span className="ds-pill bg-sand rotate-1">one prompt at a time</span>
          <Link
            href="/worksheets"
            className="text-sm font-bold text-violet-deep underline underline-offset-2 ml-auto"
          >
            See all {worksheets.length} →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {worksheets.slice(0, 4).map((w) => (
            <Link
              key={w.id}
              href={`/worksheets/${w.id}`}
              className="ds-card !p-5 no-underline text-ink hover:-translate-y-0.5 transition-transform"
            >
              <div className="flex gap-2 flex-wrap mb-2">
                <span className="ds-pill bg-violet-soft text-violet-deep">
                  {w.framework}
                </span>
                <span className="ds-pill bg-mint text-[#0B5C41]">
                  {w.steps.length} steps
                </span>
              </div>
              <b className="block text-[15px]">{w.name}</b>
              <span className="text-sm text-ink-faint">{w.condition}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* REFLECTION */}
      <section className="pb-4">
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <h2 className="text-xl">🔮 Private reflection</h2>
          <span className="ds-pill bg-sand rotate-1">for your eyes only</span>
          <Link
            href="/insights"
            className="text-sm font-bold text-violet-deep underline underline-offset-2 ml-auto"
          >
            See your patterns →
          </Link>
        </div>
        {reflection && (
          <Link
            href="/insights"
            className="ds-card !p-4 block no-underline text-ink bg-gradient-to-br from-violet-soft via-white to-mint mb-4 hover:-translate-y-0.5 transition-transform"
          >
            <span className="text-sm font-bold">{reflection}</span>
          </Link>
        )}
        <div className="ds-card">
          <b className="block mb-1">Recent practice</b>
          {history.length === 0 ? (
            <p className="text-sm text-ink-faint m-0">
              Nothing here yet. Once you&apos;ve tried a module it&apos;ll show
              up — and none of it is a score.
            </p>
          ) : (
            <ul className="list-none p-0 m-0 mt-3">
              {history.map((s, i) => {
                const label =
                  MODULE_LIST.find((m) => m.id === s.module_id)?.title ??
                  worksheets.find((w) => w.id === s.module_id)?.name ??
                  s.module_id;
                const moved =
                  s.rating_before !== null && s.rating_after !== null
                    ? s.rating_before - s.rating_after
                    : null;
                return (
                  <li
                    key={i}
                    className="flex items-center justify-between gap-3 flex-wrap border-b-2 border-line/10 last:border-0 py-2.5"
                  >
                    <span className="font-bold text-[15px]">{label}</span>
                    <span className="flex items-center gap-2 flex-wrap">
                      {moved !== null && moved > 0 && (
                        <span className="ds-pill bg-mint text-[#0B5C41]">
                          eased by {moved}
                        </span>
                      )}
                      {s.outcome && (
                        <span className="ds-pill bg-surface-2">
                          {OUTCOME_COPY[s.outcome] ?? s.outcome}
                        </span>
                      )}
                      <span className="text-xs text-ink-faint font-bold">
                        {timeAgo(s.started_at)}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      <section className="py-4">
        <div className="rounded-2xl border-2 border-dashed border-ink bg-white/70 p-5 text-sm text-ink-soft flex gap-3">
          <span>🔒</span>
          <p className="m-0">
            Signed in as <b className="text-ink">{user.email}</b>. Journals and
            check-ins are private by default — no streaks, no scores, nothing
            shared.
          </p>
        </div>
      </section>

      <footer className="border-t-2.5 border-ink mt-6 py-7 text-sm text-ink-faint font-semibold">
        Digital Sanctuary ✦ evidence-based under the hood, human on the surface.
      </footer>
    </main>
  );
}
