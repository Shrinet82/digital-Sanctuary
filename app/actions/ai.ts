"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { guardInput, guardOutput, type AiTask } from "@/lib/ai/guard";

export type AiResult =
  | { status: "ok"; suggestion: string }
  | { status: "off" }
  | { status: "not_configured" }
  | { status: "refused"; message: string; escalate: boolean }
  | { status: "error"; message: string };

/**
 * The only path from the app to a language model.
 *
 * Order matters: opt-in check → local guard → edge function (which guards
 * again) → output guard. Nothing is written to the user's data here; the
 * suggestion is returned for them to accept, edit, or discard.
 */
export async function requestAiSuggestion(input: {
  task: AiTask;
  text: string;
}): Promise<AiResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: "Please sign in first." };

  // 1. Opt-in check — AI is off unless the user turned it on.
  const { data: profile } = await supabase
    .from("profiles")
    .select("ai_enabled")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.ai_enabled) return { status: "off" };

  // 2. Guard locally before anything leaves the server.
  const verdict = guardInput(input.text, input.task);
  if (!verdict.allow) {
    await logUsage(user.id, input.task, "refused_by_guard", verdict.reason);
    return {
      status: "refused",
      message: verdict.message,
      escalate: verdict.escalate ?? false,
    };
  }

  // 3. Call the edge function (which runs the same guard independently).
  try {
    const { data, error } = await supabase.functions.invoke("ai-assist", {
      body: { task: input.task, input: input.text },
    });

    if (error) {
      await logUsage(user.id, input.task, "error");
      return { status: "error", message: "That didn't work just now." };
    }

    if (data?.notConfigured) return { status: "not_configured" };

    if (data?.refused) {
      await logUsage(user.id, input.task, "refused_by_guard", data.reason);
      return {
        status: "refused",
        message:
          "I've held that one back — it strays somewhere this app shouldn't go.",
        escalate: Boolean(data.escalate),
      };
    }

    if (!data?.ok || typeof data.suggestion !== "string") {
      await logUsage(user.id, input.task, "error");
      return { status: "error", message: "That didn't come back usable." };
    }

    // 4. Guard the output once more on our side.
    const outVerdict = guardOutput(data.suggestion);
    if (!outVerdict.allow) {
      await logUsage(user.id, input.task, "refused_by_guard", outVerdict.reason);
      return { status: "refused", message: outVerdict.message, escalate: false };
    }

    return { status: "ok", suggestion: data.suggestion };
  } catch {
    await logUsage(user.id, input.task, "error");
    return { status: "error", message: "That didn't work just now." };
  }
}

/** Records what the user did with a suggestion. Never stores the text. */
export async function logAiOutcome(
  task: AiTask,
  outcome: "accepted" | "edited" | "discarded"
): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await logUsage(user.id, task, outcome);
}

async function logUsage(
  userId: string,
  task: string,
  outcome: string,
  refusalReason?: string
) {
  const supabase = createClient();
  await supabase.from("ai_usage_log").insert({
    user_id: userId,
    task,
    outcome,
    refusal_reason: refusalReason ?? null,
  });
}

/** The global on/off switch. */
export async function setAiEnabled(
  enabled: boolean
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in first." };

  const { error } = await supabase
    .from("profiles")
    .update({ ai_enabled: enabled })
    .eq("id", user.id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/insights");
  revalidatePath("/modules/task-decomposer");
  return { ok: true };
}
