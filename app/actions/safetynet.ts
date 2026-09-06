"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "./vault";

export type SafetyNetPerson = { name: string; contact: string };

export type SafetyNetData = {
  signs: string | null;
  thingsThatWorked: string | null;
  people: SafetyNetPerson[];
};

async function currentUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function getSafetyNet(): Promise<SafetyNetData | null> {
  const { supabase, user } = await currentUser();
  if (!user) return null;

  const { data } = await supabase
    .from("safety_net")
    .select("signs, things_that_worked, people")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data) return null;
  return {
    signs: data.signs,
    thingsThatWorked: data.things_that_worked,
    people: (data.people as SafetyNetPerson[]) ?? [],
  };
}

/** Built once, edited anytime — always the calm version of you writing to the version in trouble (§8). */
export async function saveSafetyNet(input: SafetyNetData): Promise<ActionResult> {
  const { supabase, user } = await currentUser();
  if (!user) return { ok: false, error: "Please sign in first." };

  const { error } = await supabase.from("safety_net").upsert(
    {
      user_id: user.id,
      signs: input.signs,
      things_that_worked: input.thingsThatWorked,
      people: input.people,
    },
    { onConflict: "user_id" }
  );

  if (error) return { ok: false, error: error.message };
  revalidatePath("/safety-net");
  return { ok: true };
}
