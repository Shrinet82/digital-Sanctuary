"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Answers } from "@/lib/worksheets/types";

export type SaveResult = { ok: boolean; error?: string };

/**
 * Persists a completed worksheet.
 *
 * Writes to two places, on purpose:
 *  - journal_entries   → the user's own words (private, retention-controlled)
 *  - practice_sessions → the before/after numbers that power trend views
 *
 * Both rows record `template_version`, so if we improve a worksheet later,
 * old entries still remember exactly which wording the user saw.
 */
export async function saveWorksheet(input: {
  worksheetId: string;
  templateVersion: number;
  answers: Answers;
  /** Optional pair of scale keys to store as before/after. */
  compare?: [string, string];
}): Promise<SaveResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in first." };

  const { error: journalError } = await supabase.from("journal_entries").insert({
    user_id: user.id,
    worksheet_id: input.worksheetId,
    template_version: input.templateVersion,
    answers: input.answers,
  });
  if (journalError) return { ok: false, error: journalError.message };

  // Pull out a before/after pair if the template collected one, so the
  // worksheet shows up in trends alongside the other modules.
  const numeric = Object.entries(input.answers).filter(
    ([, v]) => typeof v === "number"
  ) as [string, number][];
  const before = numeric.find(([k]) => k.endsWith("_before"))?.[1] ?? null;
  const after = numeric.find(([k]) => k.endsWith("_after"))?.[1] ?? null;

  const { error: sessionError } = await supabase
    .from("practice_sessions")
    .insert({
      user_id: user.id,
      module_id: input.worksheetId,
      template_version: input.templateVersion,
      rating_before: before,
      rating_after: after,
      outcome: "done",
      was_helpful:
        before !== null && after !== null ? after < before : null,
      completed_at: new Date().toISOString(),
    });
  if (sessionError) return { ok: false, error: sessionError.message };

  revalidatePath("/dashboard");
  return { ok: true };
}
