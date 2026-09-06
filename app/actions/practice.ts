"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ModuleId } from "@/lib/recommend";
import type { CheckIn } from "@/lib/checkin";

export type SaveResult = { ok: boolean; error?: string };

async function requireUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

/**
 * Saves a check-in. Only `state` is ever required — everything else is
 * whatever the user tapped, which may be nothing. This IS the day's log
 * entry (§5/§6): it writes straight into the Ledger, no separate step.
 */
export async function saveCheckIn(input: CheckIn): Promise<SaveResult> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Please sign in first." };

  const { error } = await supabase.from("check_ins").insert({
    user_id: user.id,
    state: input.state,
    loudest: input.loudest,
    context: input.context,
    want: input.want,
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/ledger");
  return { ok: true };
}

/**
 * Records a completed module.
 * `outcome` is deliberately shame-free: done | partly | moved | not_today.
 */
export async function savePracticeSession(input: {
  moduleId: ModuleId;
  ratingBefore?: number | null;
  ratingAfter?: number | null;
  outcome?: "done" | "partly" | "moved" | "not_today" | null;
  wasHelpful?: boolean | null;
}): Promise<SaveResult> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Please sign in first." };

  const { error } = await supabase.from("practice_sessions").insert({
    user_id: user.id,
    module_id: input.moduleId,
    rating_before: input.ratingBefore ?? null,
    rating_after: input.ratingAfter ?? null,
    outcome: input.outcome ?? null,
    was_helpful: input.wasHelpful ?? null,
    completed_at: new Date().toISOString(),
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard");
  return { ok: true };
}

/** Saves a private journal entry (used by the Task Decomposer plan). */
export async function saveJournalEntry(input: {
  worksheetId: string;
  answers: Record<string, unknown>;
  body?: string | null;
}): Promise<SaveResult> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Please sign in first." };

  const { error } = await supabase.from("journal_entries").insert({
    user_id: user.id,
    worksheet_id: input.worksheetId,
    answers: input.answers,
    body: input.body ?? null,
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard");
  return { ok: true };
}
