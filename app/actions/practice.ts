"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Mode, ModuleId } from "@/lib/recommend";

export type SaveResult = { ok: boolean; error?: string };

async function requireUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

/** Saves an optional 15-second check-in. Every field is skippable. */
export async function saveCheckIn(input: {
  distress: number | null;
  energy: number | null;
  attention: number | null;
  urge: number | null;
  mode: Mode | null;
}): Promise<SaveResult> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Please sign in first." };

  const { error } = await supabase.from("daily_checkins").insert({
    user_id: user.id,
    distress: input.distress,
    energy: input.energy,
    attention: input.attention,
    urge: input.urge,
    mode: input.mode,
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard");
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
