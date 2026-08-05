"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type ActionResult = { ok: boolean; error?: string };

/** Log (or update) today's value for one factor. */
export async function logFactor(input: {
  factorKey: string;
  value: number | null;
  note?: string | null;
}): Promise<ActionResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in first." };

  const today = new Date().toISOString().slice(0, 10);

  // Clearing a value removes the row rather than storing a null.
  if (input.value === null) {
    const { error } = await supabase
      .from("mood_factors")
      .delete()
      .eq("user_id", user.id)
      .eq("log_date", today)
      .eq("factor_key", input.factorKey);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/insights");
    return { ok: true };
  }

  const { error } = await supabase.from("mood_factors").upsert(
    {
      user_id: user.id,
      log_date: today,
      factor_key: input.factorKey,
      value: input.value,
      note: input.note ?? null,
    },
    { onConflict: "user_id,log_date,factor_key" }
  );

  if (error) return { ok: false, error: error.message };
  revalidatePath("/insights");
  return { ok: true };
}

/** Choose which factors to track. Empty array is valid — tracking is optional. */
export async function setTrackedFactors(keys: string[]): Promise<ActionResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in first." };

  const { error } = await supabase
    .from("profiles")
    .update({ tracked_factors: keys })
    .eq("id", user.id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/insights");
  return { ok: true };
}

/** Everything we hold about the signed-in user, as JSON. */
export async function exportMyData(): Promise<
  { ok: true; data: unknown } | { ok: false; error: string }
> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in first." };

  const { data, error } = await supabase.rpc("export_my_data");
  if (error) return { ok: false, error: error.message };
  return { ok: true, data };
}

/**
 * Irreversibly deletes the signed-in user's account and all their data.
 * The database function is scoped to auth.uid(), so this can only ever
 * delete the caller.
 */
export async function deleteMyAccount(): Promise<ActionResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in first." };

  const { error } = await supabase.rpc("delete_my_account");
  if (error) return { ok: false, error: error.message };

  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/?deleted=1");
}
