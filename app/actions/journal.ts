"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { SaveResult } from "./practice";

const DAILY_JOURNAL_ID = "daily-journal";

async function requireUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

export type DailyJournalAnswers = { word?: string; sentence?: string };

/** The Ledger day view's one journal entry for that day (rungs 2-3), if any. */
export async function getDailyJournal(
  logDate: string
): Promise<DailyJournalAnswers | null> {
  const { supabase, user } = await requireUser();
  if (!user) return null;

  const { data } = await supabase
    .from("journal_entries")
    .select("answers")
    .eq("worksheet_id", DAILY_JOURNAL_ID)
    .eq("log_date", logDate)
    .maybeSingle();

  return (data?.answers as DailyJournalAnswers | undefined) ?? null;
}

/**
 * Climbs the journal ladder one rung at a time (§6.2): a word, then a
 * sentence. Never overwrites a rung the user already filled unless they're
 * explicitly editing it — merges into whatever's there for that day.
 */
export async function saveDailyJournalRung(
  logDate: string,
  patch: DailyJournalAnswers
): Promise<SaveResult> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Please sign in first." };

  const { data: existing } = await supabase
    .from("journal_entries")
    .select("id, answers")
    .eq("worksheet_id", DAILY_JOURNAL_ID)
    .eq("log_date", logDate)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("journal_entries")
      .update({ answers: { ...(existing.answers as object), ...patch } })
      .eq("id", existing.id);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await supabase.from("journal_entries").insert({
      user_id: user.id,
      worksheet_id: DAILY_JOURNAL_ID,
      log_date: logDate,
      answers: patch,
    });
    if (error) return { ok: false, error: error.message };
  }

  revalidatePath(`/ledger/${logDate}`);
  return { ok: true };
}
