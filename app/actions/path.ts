"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "./vault";

/** "Show me everything now" — the Path only ever controls what's offered, never what's reachable. */
export async function dismissPath(): Promise<ActionResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in first." };

  const { error } = await supabase
    .from("profiles")
    .update({ path_dismissed: true })
    .eq("id", user.id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard");
  return { ok: true };
}
