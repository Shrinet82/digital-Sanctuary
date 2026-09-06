"use server";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { hashPasscode, isValidPasscodeFormat, verifyPasscodeHash } from "@/lib/passcode-hash";
import type { ActionResult } from "./vault";

const UNLOCK_COOKIE = "ds_unlock";
const UNLOCK_SECONDS = 15 * 60;

async function currentUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

function setUnlockCookie() {
  cookies().set(UNLOCK_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: UNLOCK_SECONDS,
    path: "/",
  });
}

/**
 * Server-only gate check for pages that hold the Ledger or the Vault.
 * If no passcode is set, the feature is off and everything is
 * unlocked by definition — it's opt-in, not a default barrier.
 */
export async function passcodeGateStatus(): Promise<{
  hasPasscode: boolean;
  unlocked: boolean;
}> {
  const { supabase, user } = await currentUser();
  if (!user) return { hasPasscode: false, unlocked: true };

  const { data } = await supabase
    .from("profiles")
    .select("passcode_hash")
    .eq("id", user.id)
    .maybeSingle();

  const hasPasscode = Boolean(data?.passcode_hash);
  if (!hasPasscode) return { hasPasscode: false, unlocked: true };

  const unlocked = cookies().get(UNLOCK_COOKIE)?.value === "1";
  return { hasPasscode: true, unlocked };
}

export async function hasPasscodeSet(): Promise<boolean> {
  const { supabase, user } = await currentUser();
  if (!user) return false;
  const { data } = await supabase
    .from("profiles")
    .select("passcode_hash")
    .eq("id", user.id)
    .maybeSingle();
  return Boolean(data?.passcode_hash);
}

export async function setPasscode(pin: string): Promise<ActionResult> {
  const { supabase, user } = await currentUser();
  if (!user) return { ok: false, error: "Please sign in first." };
  if (!isValidPasscodeFormat(pin)) {
    return { ok: false, error: "Use 4 to 6 digits." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ passcode_hash: hashPasscode(pin) })
    .eq("id", user.id);

  if (error) return { ok: false, error: error.message };
  setUnlockCookie();
  return { ok: true };
}

export async function clearPasscode(currentPin: string): Promise<ActionResult> {
  const { supabase, user } = await currentUser();
  if (!user) return { ok: false, error: "Please sign in first." };

  const { data } = await supabase
    .from("profiles")
    .select("passcode_hash")
    .eq("id", user.id)
    .maybeSingle();

  if (data?.passcode_hash && !verifyPasscodeHash(currentPin, data.passcode_hash)) {
    return { ok: false, error: "That's not the right passcode." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ passcode_hash: null })
    .eq("id", user.id);

  if (error) return { ok: false, error: error.message };
  cookies().delete(UNLOCK_COOKIE);
  return { ok: true };
}

export async function verifyPasscode(pin: string): Promise<ActionResult> {
  const { supabase, user } = await currentUser();
  if (!user) return { ok: false, error: "Please sign in first." };

  const { data } = await supabase
    .from("profiles")
    .select("passcode_hash")
    .eq("id", user.id)
    .maybeSingle();

  if (!data?.passcode_hash) return { ok: true }; // nothing to unlock

  if (!verifyPasscodeHash(pin, data.passcode_hash)) {
    return { ok: false, error: "That's not the right passcode." };
  }

  setUnlockCookie();
  return { ok: true };
}

/** Manual re-lock, e.g. before handing your phone to someone else. */
export async function lockNow(): Promise<ActionResult> {
  cookies().delete(UNLOCK_COOKIE);
  return { ok: true };
}
