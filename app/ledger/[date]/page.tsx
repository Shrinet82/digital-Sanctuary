import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { JournalLadder } from "@/components/ledger/JournalLadder";
import { getDailyJournal } from "@/app/actions/journal";
import { promptForDate } from "@/lib/journal-prompts";
import { MODULE_LIST } from "@/lib/modules";
import { getAllWorksheets } from "@/lib/worksheets/registry";
import {
  loudestLabel,
  stateEmoji,
  stateLabel,
  WANT_OPTIONS,
  type CheckInState,
} from "@/lib/checkin";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const OUTCOME_COPY: Record<string, string> = {
  done: "Done",
  partly: "Partly done",
  moved: "Moved",
  not_today: "Not today",
};

function adjacentDate(date: string, deltaDays: number): string {
  const d = new Date(date + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + deltaDays);
  return d.toISOString().slice(0, 10);
}

export default async function LedgerDayPage({
  params,
}: {
  params: { date: string };
}) {
  const { date } = params;
  if (!DATE_RE.test(date)) notFound();

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dayStart = `${date}T00:00:00.000Z`;
  const dayEnd = `${adjacentDate(date, 1)}T00:00:00.000Z`;

  const [{ data: checkIns }, { data: sessions }, journal] = await Promise.all([
    supabase
      .from("check_ins")
      .select("state, loudest, context, want, created_at")
      .eq("log_date", date)
      .order("created_at", { ascending: true }),
    supabase
      .from("practice_sessions")
      .select("module_id, outcome, rating_before, rating_after, was_helpful, started_at")
      .gte("started_at", dayStart)
      .lt("started_at", dayEnd)
      .order("started_at", { ascending: true }),
    getDailyJournal(date),
  ]);

  const worksheets = getAllWorksheets();
  const labelFor = (moduleId: string) =>
    MODULE_LIST.find((m) => m.id === moduleId)?.title ??
    worksheets.find((w) => w.id === moduleId)?.name ??
    moduleId;

  const rows = checkIns ?? [];
  const niceDate = new Date(date + "T00:00:00Z").toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <main className="max-w-3xl mx-auto px-6">
      <AppHeader />

      <section className="py-8">
        <div className="flex items-center gap-3 flex-wrap mb-3">
          <Link
            href={`/ledger/${adjacentDate(date, -1)}`}
            className="ds-btn ds-btn-ghost !py-1.5 !px-3 no-underline"
          >
            ← Prev
          </Link>
          <Link href="/ledger" className="text-sm font-bold underline underline-offset-2">
            Year
          </Link>
          <Link
            href={`/ledger/${adjacentDate(date, 1)}`}
            className="ds-btn ds-btn-ghost !py-1.5 !px-3 no-underline"
          >
            Next →
          </Link>
        </div>
        <h1 className="text-3xl sm:text-4xl">{niceDate}</h1>
      </section>

      {/* Check-ins */}
      <section className="pb-8">
        <h2 className="text-xl mb-3">Check-ins</h2>
        {rows.length === 0 ? (
          <div className="ds-card">
            <p className="text-sm text-ink-faint m-0">
              No check-in this day. That&apos;s just a gap, not a failure.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {rows.map((c, i) => (
              <div key={i} className="ds-card !p-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-2xl">{stateEmoji(c.state as CheckInState)}</span>
                  <b>{stateLabel(c.state as CheckInState)}</b>
                  <span className="text-xs text-ink-faint ml-auto">
                    {new Date(c.created_at).toLocaleTimeString(undefined, {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                {(c.loudest?.length ?? 0) > 0 && (
                  <div className="flex gap-1.5 flex-wrap mt-2.5">
                    {(c.loudest as string[]).map((l) => (
                      <span key={l} className="ds-pill bg-violet-soft text-violet-deep">
                        {loudestLabel(l)}
                      </span>
                    ))}
                  </div>
                )}
                {(c.context?.length ?? 0) > 0 && (
                  <div className="flex gap-1.5 flex-wrap mt-2">
                    {(c.context as string[]).map((ctx) => (
                      <span key={ctx} className="ds-pill bg-surface-2">
                        {ctx}
                      </span>
                    ))}
                  </div>
                )}
                {c.want && (
                  <p className="text-sm text-ink-faint mt-2 mb-0">
                    Wanted:{" "}
                    <b className="text-ink">
                      {WANT_OPTIONS.find((w) => w.value === c.want)?.label ?? c.want}
                    </b>
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Journal ladder */}
      <section className="pb-8">
        <JournalLadder logDate={date} initial={journal} prompt={promptForDate(date)} />
      </section>

      {/* Modules done that day */}
      <section className="pb-10">
        <h2 className="text-xl mb-3">What you did</h2>
        {!sessions || sessions.length === 0 ? (
          <div className="ds-card">
            <p className="text-sm text-ink-faint m-0">Nothing logged for this day.</p>
          </div>
        ) : (
          <ul className="list-none p-0 m-0 space-y-2.5">
            {sessions.map((s, i) => {
              const moved =
                s.rating_before !== null && s.rating_after !== null
                  ? s.rating_before - s.rating_after
                  : null;
              return (
                <li
                  key={i}
                  className="ds-card !p-4 flex items-center justify-between gap-3 flex-wrap"
                >
                  <b>{labelFor(s.module_id)}</b>
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
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <footer className="border-t-2.5 border-ink py-7 text-sm text-ink-faint font-semibold">
        Digital Sanctuary ✦ your memory, kept for you.
      </footer>
    </main>
  );
}
