import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { FactorLogger } from "@/components/tracking/FactorLogger";
import { DataControls } from "@/components/tracking/DataControls";
import { AiSettings } from "@/components/ai/AiSettings";
import { MODULES } from "@/lib/recommend";
import { getAllWorksheets } from "@/lib/worksheets/registry";
import {
  factorObservations,
  notEnoughYet,
  weeklyShape,
  whatHelpsMost,
  MIN_SAMPLE,
  type CheckInRow,
  type FactorRow,
  type SessionRow,
} from "@/lib/insights";

export const metadata = { title: "Your patterns · Digital Sanctuary" };

export default async function InsightsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const since = new Date();
  since.setDate(since.getDate() - 30);
  const sinceIso = since.toISOString();

  const [{ data: profile }, { data: checkIns }, { data: sessions }, { data: factors }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("tracked_factors, ai_enabled")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("daily_checkins")
        .select("distress, energy, created_at")
        .gte("created_at", sinceIso)
        .order("created_at"),
      supabase
        .from("practice_sessions")
        .select(
          "module_id, outcome, rating_before, rating_after, was_helpful, started_at"
        )
        .gte("started_at", sinceIso)
        .order("started_at"),
      supabase
        .from("mood_factors")
        .select("log_date, factor_key, value")
        .gte("log_date", sinceIso.slice(0, 10))
        .order("log_date"),
    ]);

  const checkInRows = (checkIns ?? []) as CheckInRow[];
  const sessionRows = (sessions ?? []) as SessionRow[];
  const factorRows = (factors ?? []) as FactorRow[];

  const worksheets = getAllWorksheets();
  const labelFor = (id: string) =>
    MODULES[id as keyof typeof MODULES]?.title ??
    worksheets.find((w) => w.id === id)?.name ??
    id;

  const bars = weeklyShape(checkInRows, sessionRows);
  const helps = whatHelpsMost(sessionRows);
  const observations = factorObservations(checkInRows, factorRows);

  const today = new Date().toISOString().slice(0, 10);
  const todayValues: Record<string, number> = {};
  for (const f of factorRows) {
    if (f.log_date === today && f.value !== null) {
      todayValues[f.factor_key] = Number(f.value);
    }
  }

  const loggedDays = new Set(factorRows.map((f) => f.log_date)).size;
  const maxDistress = Math.max(...bars.map((b) => b.distress ?? 0), 1);

  return (
    <main className="max-w-3xl mx-auto px-6">
      <AppHeader />

      <section className="py-8">
        <span className="ds-pill bg-yellow -rotate-1 mb-4">
          ✦ private reflection
        </span>
        <h1 className="text-3xl sm:text-4xl max-w-[20ch]">
          Your own notes, <span className="ds-hl">read back to you.</span>
        </h1>
        <p className="text-ink-soft text-lg mt-4 max-w-[58ch]">
          No streaks. No scores. No good days and bad days. Just what you
          recorded, described honestly — and only where there&apos;s enough of it
          to mean something.
        </p>
      </section>

      {/* Today's logging */}
      <section className="pb-8">
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <h2 className="text-xl">🩺 Keeping an eye on things</h2>
          <span className="ds-pill bg-sand rotate-1">optional</span>
        </div>
        <FactorLogger
          tracked={profile?.tracked_factors ?? []}
          todayValues={todayValues}
        />
      </section>

      {/* Weekly shape */}
      <section className="pb-8">
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <h2 className="text-xl">📉 The last week</h2>
          <span className="ds-pill bg-mint text-[#0B5C41]">
            🧮 your numbers only
          </span>
        </div>
        <div className="ds-card">
          {checkInRows.length === 0 ? (
            <p className="text-sm text-ink-faint m-0">
              No check-ins yet this week.{" "}
              <Link
                href="/checkin"
                className="font-bold text-violet-deep underline underline-offset-2"
              >
                A 15-second check-in
              </Link>{" "}
              is all it takes to start this off.
            </p>
          ) : (
            <>
              <p className="text-sm text-ink-soft mt-0 mb-4">
                How intense things felt, day by day. A gap just means you
                didn&apos;t check in — that isn&apos;t a missed day.
              </p>
              <div className="flex items-end gap-2 h-36 px-1">
                {bars.map((b) => (
                  <div key={b.date} className="flex-1 flex flex-col items-center gap-2">
                    <div className="flex-1 w-full flex items-end">
                      {b.distress === null ? (
                        <div className="w-full h-1.5 rounded-full bg-surface-2 border-2 border-dashed border-ink/25" />
                      ) : (
                        <div
                          className="w-full rounded-t-lg border-2 border-ink bg-gradient-to-t from-teal to-violet shadow-pop-sm"
                          style={{
                            height: `${Math.max((b.distress / maxDistress) * 100, 8)}%`,
                          }}
                          title={`${b.distress} on ${b.date}`}
                        />
                      )}
                    </div>
                    <span className="text-[11px] font-bold text-ink-faint">
                      {b.label}
                    </span>
                    {b.practices > 0 && (
                      <span
                        className="text-[10px] font-bold"
                        title={`${b.practices} practice${b.practices === 1 ? "" : "s"}`}
                      >
                        {"·".repeat(Math.min(b.practices, 3))}
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-ink-faint mt-4 mb-0">
                Taller means it felt more intense that day. Dots underneath mark
                a practice — presence, not performance.
              </p>
            </>
          )}
        </div>
      </section>

      {/* What helps me most */}
      <section className="pb-8">
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <h2 className="text-xl">✨ What seems to help you</h2>
          <span className="ds-pill bg-sand rotate-1">not a leaderboard</span>
        </div>
        <div className="ds-card">
          {helps.length === 0 ? (
            <p className="text-sm text-ink-faint m-0">
              Nothing to show yet. Once you&apos;ve used a few modules this
              becomes your own map of what works for you.
            </p>
          ) : (
            <>
              <ul className="list-none p-0 m-0">
                {helps.map((h) => (
                  <li
                    key={h.moduleId}
                    className="flex items-center justify-between gap-3 flex-wrap border-b-2 border-line/10 last:border-0 py-3"
                  >
                    <span className="font-bold text-[15px]">
                      {labelFor(h.moduleId)}
                    </span>
                    <span className="flex items-center gap-2 flex-wrap">
                      {h.averageEase !== null && h.averageEase > 0 && (
                        <span className="ds-pill bg-mint text-[#0B5C41]">
                          eased by {h.averageEase} on average
                        </span>
                      )}
                      <span className="text-xs text-ink-faint font-bold">
                        used {h.timesUsed}×
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-ink-faint mt-4 mb-0">
                Ordered by how much things eased, from your own before/after
                ratings. Something being lower here doesn&apos;t make it worse —
                different tools are for different days.
              </p>
            </>
          )}
        </div>
      </section>

      {/* Observations */}
      <section className="pb-8">
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <h2 className="text-xl">🔍 Things you might notice</h2>
          <span className="ds-pill bg-mint text-[#0B5C41]">
            🧮 rules, not guesses
          </span>
        </div>
        <div className="ds-card">
          {observations.length === 0 ? (
            <p className="text-sm text-ink-faint m-0">
              {notEnoughYet(loggedDays)}
            </p>
          ) : (
            <ul className="list-none p-0 m-0 space-y-4">
              {observations.map((o, i) => (
                <li key={i}>
                  <b className="block text-[15px]">{o.text}</b>
                  <span className="text-xs text-ink-faint">{o.basis}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="rounded-xl border-2 border-dashed border-ink bg-white/70 p-4 text-xs text-ink-soft mt-5">
            These are descriptions of your own notes, worked out by fixed rules
            you can see — never predictions, never a diagnosis, and never
            generated by AI. Anything based on fewer than {MIN_SAMPLE} days
            isn&apos;t shown at all.
          </div>
        </div>
      </section>

      {/* AI settings */}
      <section className="pb-8">
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <h2 className="text-xl">✨ AI, on your terms</h2>
          <span className="ds-pill bg-sand rotate-1">off by default</span>
        </div>
        <AiSettings enabled={profile?.ai_enabled ?? false} />
      </section>

      {/* Data controls */}
      <section className="pb-10">
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <h2 className="text-xl">🔒 Yours to keep or erase</h2>
        </div>
        <DataControls />
      </section>

      <footer className="border-t-2.5 border-ink py-7 text-sm text-ink-faint font-semibold">
        Digital Sanctuary ✦ evidence-based under the hood, human on the surface.
      </footer>
    </main>
  );
}
