import "jsr:@supabase/functions-js/edge-runtime.d.ts";

/**
 * ai-assist — the ONLY place this product talks to a language model.
 *
 * Hard constraints (docs/09-safety-and-privacy.md):
 *   * three allowlisted tasks, nothing else
 *   * the guard runs before the model AND on its output
 *   * output is schema-constrained and length-capped
 *   * nothing is written to the database here — the client shows the
 *     suggestion and the user decides
 *   * if no provider key is configured, we degrade gracefully instead of
 *     failing loudly: the product must be fully usable with AI off
 */

type AiTask = "reword_task" | "recap_worksheet" | "summarise_entries";
const ALLOWED_TASKS: AiTask[] = [
  "reword_task",
  "recap_worksheet",
  "summarise_entries",
];

/* ------------------------------------------------------------------ */
/* Guard — duplicated deliberately.                                     */
/* This function must be safe on its own, even if called directly.      */
/* Keep in sync with lib/ai/guard.ts.                                   */
/* ------------------------------------------------------------------ */
const RULES: { reason: string; escalate?: boolean; patterns: RegExp[] }[] = [
  {
    reason: "risk_to_self",
    escalate: true,
    patterns: [
      /\b(kill|killing|end)\s+(myself|my life)\b/i,
      /\bsuicid/i,
      /\bself[-\s]?harm/i,
      /\b(cut|cutting|hurt|hurting)\s+myself\b/i,
      /\bwant\s+to\s+die\b/i,
      /\bdon'?t\s+want\s+to\s+(be\s+here|live|wake up)\b/i,
      /\boverdos/i,
      /\bno\s+reason\s+to\s+live\b/i,
    ],
  },
  {
    reason: "risk_to_others",
    escalate: true,
    patterns: [
      /\b(hurt|harm|kill)\s+(him|her|them|someone|people)\b/i,
      /\b(he|she|they)\s+(hits?|hurts?|beats?)\s+me\b/i,
      /\bnot\s+safe\s+at\s+home\b/i,
    ],
  },
  {
    reason: "medication_or_dosing",
    patterns: [
      /\b(dose|dosage|dosing|milligram)/i,
      /\d\s*(mg|mcg|ml)\b/i,
      /\bmg\b/i,
      /\b(should i|can i|safe to)\s+(take|stop|skip|double|halve)\b/i,
      /\b(taper|tapering|titrat)/i,
      /\b(ssri|benzo|benzodiazepine|antidepressant|adderall|ritalin|xanax|valium|methadone|buprenorphine|naltrexone)\b/i,
      /\bmix(ing)?\s+(it\s+)?with\b/i,
    ],
  },
  {
    reason: "withdrawal_or_detox",
    patterns: [
      /\b(detox|withdrawal|withdraw(ing)?|coming off|quit(ting)? cold turkey)\b/i,
    ],
  },
  {
    reason: "diagnosis_request",
    patterns: [
      /\b(do i have|am i)\s+(adhd|autistic|bipolar|depressed|depression|anxiety|ocd|ptsd|borderline)\b/i,
      /\bdiagnos/i,
      /\bwhat'?s\s+wrong\s+with\s+me\b/i,
    ],
  },
  {
    reason: "therapy_request",
    patterns: [
      /\b(be|act as|pretend to be)\s+my\s+(therapist|counsellor|counselor|psychiatrist|doctor)\b/i,
      /\btherapy\s+session\b/i,
    ],
  },
];

function guardInput(text: string, task: string) {
  if (!ALLOWED_TASKS.includes(task as AiTask)) {
    return { allow: false, reason: "task_not_allowlisted" };
  }
  const t = (text ?? "").trim();
  if (!t) return { allow: false, reason: "empty_input" };
  if (t.length > 1000) return { allow: false, reason: "input_too_long" };
  for (const rule of RULES) {
    if (rule.patterns.some((p) => p.test(t))) {
      return { allow: false, reason: rule.reason, escalate: rule.escalate };
    }
  }
  return { allow: true };
}

function guardOutput(text: string) {
  const t = (text ?? "").trim();
  if (!t || t.length > 600) {
    return { allow: false, reason: "output_shape_invalid" };
  }
  const clinical = [
    /\b(dose|dosage|prescrib)/i,
    /\d\s*(mg|mcg|ml)\b/i,
    /\bmg\b/i,
    /\byou\s+(have|may have|might have)\s+(adhd|depression|anxiety|bipolar|ptsd|ocd)\b/i,
    /\bdiagnos/i,
    /\bas\s+your\s+(therapist|doctor)\b/i,
  ];
  if (clinical.some((p) => p.test(t))) {
    return { allow: false, reason: "output_contained_clinical_content" };
  }
  return { allow: true };
}

/* ------------------------------------------------------------------ */
/* Prompts — narrow, and repeated in the system message so the model    */
/* is told the same thing the guard enforces.                           */
/* ------------------------------------------------------------------ */
const SYSTEM = `You help inside a mental-health self-management app.

You may ONLY do the single task you are given. You rephrase or summarise the
user's OWN words. You never add advice, never diagnose, never mention
medication, dosage, withdrawal, or treatment, and never present yourself as a
clinician or therapist.

Style: plain, warm, concrete, second person. No praise, no cheerleading, no
emoji, no preamble. Never imply the user is failing or behind.

Reply with ONLY the requested text. No quotes, no labels, no explanation.`;

const TASK_PROMPTS: Record<AiTask, (input: string) => string> = {
  reword_task: (input) =>
    `Rewrite this task as ONE concrete first physical step that takes under two minutes. Start with a verb. Maximum 15 words.\n\nTask: ${input}`,
  recap_worksheet: (input) =>
    `Summarise the person's own worksheet answers below in 2 short sentences, using their words where possible. Do not interpret, advise, or add anything new.\n\nAnswers: ${input}`,
  summarise_entries: (input) =>
    `Summarise these journal notes neutrally in 2 short sentences. Describe only what is written. Do not interpret or advise.\n\nNotes: ${input}`,
};

const MAX_TOKENS = 200;

Deno.serve(async (req: Request) => {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, content-type, apikey",
    "Content-Type": "application/json",
  };

  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const { task, input } = await req.json();

    // 1. Guard BEFORE the model.
    const verdict = guardInput(input, task);
    if (!verdict.allow) {
      return new Response(
        JSON.stringify({
          ok: false,
          refused: true,
          reason: verdict.reason,
          escalate: verdict.escalate ?? false,
        }),
        { status: 200, headers: cors }
      );
    }

    // 2. No provider configured → degrade gracefully, never error out.
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ ok: false, notConfigured: true }),
        { status: 200, headers: cors }
      );
    }

    const model = Deno.env.get("AI_MODEL") ?? "gpt-4o-mini";

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        max_tokens: MAX_TOKENS,
        temperature: 0.4,
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: TASK_PROMPTS[task as AiTask](input) },
        ],
      }),
    });

    if (!res.ok) {
      return new Response(
        JSON.stringify({ ok: false, error: "provider_error" }),
        { status: 200, headers: cors }
      );
    }

    const data = await res.json();
    const suggestion: string = data?.choices?.[0]?.message?.content ?? "";

    // 3. Guard the model's output too.
    const outVerdict = guardOutput(suggestion);
    if (!outVerdict.allow) {
      return new Response(
        JSON.stringify({ ok: false, refused: true, reason: outVerdict.reason }),
        { status: 200, headers: cors }
      );
    }

    return new Response(
      JSON.stringify({ ok: true, suggestion: suggestion.trim(), model }),
      { status: 200, headers: cors }
    );
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "bad_request" }), {
      status: 200,
      headers: cors,
    });
  }
});
