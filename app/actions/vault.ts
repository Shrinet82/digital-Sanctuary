"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActionResult = { ok: boolean; error?: string };

// Not exported: a "use server" module may only export async functions.
const CONSENT_TYPE = "substance_use_domain";
const CONSENT_VERSION = 1;

async function currentUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

/* ------------------------------------------------------------ */
/* Consent                                                       */
/* ------------------------------------------------------------ */

export async function getVaultConsent(): Promise<{
  granted: boolean;
  everGranted: boolean;
}> {
  const { supabase, user } = await currentUser();
  if (!user) return { granted: false, everGranted: false };

  const { data } = await supabase
    .from("consents")
    .select("revoked_at")
    .eq("consent_type", CONSENT_TYPE)
    .maybeSingle();

  return { granted: !!data && data.revoked_at === null, everGranted: !!data };
}

export async function grantVaultConsent(): Promise<ActionResult> {
  const { supabase, user } = await currentUser();
  if (!user) return { ok: false, error: "Please sign in first." };

  const { error } = await supabase.from("consents").upsert(
    {
      user_id: user.id,
      consent_type: CONSENT_TYPE,
      version: CONSENT_VERSION,
      granted_at: new Date().toISOString(),
      revoked_at: null,
    },
    { onConflict: "user_id,consent_type" }
  );

  if (error) return { ok: false, error: error.message };
  revalidatePath("/modules/trigger-map");
  revalidatePath("/dashboard");
  return { ok: true };
}

/** Freezes access without destroying anything. Reversible. */
export async function revokeVaultConsent(): Promise<ActionResult> {
  const { supabase, user } = await currentUser();
  if (!user) return { ok: false, error: "Please sign in first." };

  const { error } = await supabase
    .from("consents")
    .update({ revoked_at: new Date().toISOString() })
    .eq("consent_type", CONSENT_TYPE);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard");
  return { ok: true };
}

/** Permanent erasure of the vault only — the rest of the account stays. */
export async function deleteVaultData(): Promise<ActionResult> {
  const { supabase, user } = await currentUser();
  if (!user) return { ok: false, error: "Please sign in first." };

  const { error } = await supabase.rpc("delete_substance_use_data");
  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard");
  return { ok: true };
}

/* ------------------------------------------------------------ */
/* Trigger map                                                   */
/* ------------------------------------------------------------ */

export async function saveTriggerMap(input: {
  goal: string | null;
  internalTriggers: string[];
  externalTriggers: string[];
  chosenAlternative: string | null;
  supportContact: string | null;
}): Promise<ActionResult> {
  const { supabase, user } = await currentUser();
  if (!user) return { ok: false, error: "Please sign in first." };

  const { error } = await supabase.from("su_trigger_map").insert({
    user_id: user.id,
    goal: input.goal,
    internal_triggers: input.internalTriggers,
    external_triggers: input.externalTriggers,
    chosen_alternative: input.chosenAlternative,
    support_contact: input.supportContact,
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/* ------------------------------------------------------------ */
/* Mooring lines                                                 */
/* ------------------------------------------------------------ */

/** Monday of the current ISO week, as YYYY-MM-DD. */
function weekStart(): string {
  const d = new Date();
  const day = (d.getUTCDay() + 6) % 7; // Monday = 0
  d.setUTCDate(d.getUTCDate() - day);
  return d.toISOString().slice(0, 10);
}

export async function saveAnchor(
  anchorKey: string,
  daysPresent: number
): Promise<ActionResult> {
  const { supabase, user } = await currentUser();
  if (!user) return { ok: false, error: "Please sign in first." };

  const { error } = await supabase.from("su_mooring_anchors").upsert(
    {
      user_id: user.id,
      week_start: weekStart(),
      anchor_key: anchorKey,
      days_present: daysPresent,
    },
    { onConflict: "user_id,week_start,anchor_key" }
  );

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function getAnchors(): Promise<Record<string, number>> {
  const { supabase, user } = await currentUser();
  if (!user) return {};

  const { data } = await supabase
    .from("su_mooring_anchors")
    .select("anchor_key, days_present")
    .eq("week_start", weekStart());

  const out: Record<string, number> = {};
  for (const row of data ?? []) out[row.anchor_key] = row.days_present;
  return out;
}

/* ------------------------------------------------------------ */
/* Lapse review                                                  */
/* ------------------------------------------------------------ */

export async function saveLapseReview(input: {
  context: string | null;
  warningSigns: string[];
  whatHelped: string | null;
  oneAdjustment: string | null;
  wantsSupport: "yes" | "maybe" | "not_now" | null;
}): Promise<ActionResult> {
  const { supabase, user } = await currentUser();
  if (!user) return { ok: false, error: "Please sign in first." };

  const { error } = await supabase.from("su_lapse_review").insert({
    user_id: user.id,
    context: input.context,
    warning_signs: input.warningSigns,
    what_helped: input.whatHelped,
    one_adjustment: input.oneAdjustment,
    wants_support: input.wantsSupport,
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
