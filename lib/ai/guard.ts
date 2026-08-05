/**
 * The AI safety guard.
 *
 * Runs BEFORE any model is contacted, and again on the way back. This is a
 * deterministic gate, not a prompt instruction — a model cannot be talked out
 * of a rule that runs outside it.
 *
 * Design notes:
 *  - Risk content does NOT get a refusal message. It gets deterministic
 *    escalation to real help, because a person disclosing risk should meet a
 *    support route, not an error.
 *  - We fail CLOSED: anything ambiguous is refused. A missed suggestion costs
 *    nothing; a wrong one could cost a lot.
 *  - Categories are logged, never the user's text.
 */

export type AiTask = "reword_task" | "recap_worksheet" | "summarise_entries";

export const ALLOWED_TASKS: AiTask[] = [
  "reword_task",
  "recap_worksheet",
  "summarise_entries",
];

export type GuardVerdict =
  | { allow: true }
  | {
      allow: false;
      /** Category only — never echoes the user's words. */
      reason: string;
      /** Shown to the user in plain language. */
      message: string;
      /** Risk content routes to help rather than showing a refusal. */
      escalate?: boolean;
    };

/** Patterns that must never reach a model, grouped by why. */
const RULES: {
  reason: string;
  message: string;
  escalate?: boolean;
  patterns: RegExp[];
}[] = [
  {
    reason: "risk_to_self",
    escalate: true,
    message:
      "What you've written sounds heavy, and it deserves a person rather than a suggestion box.",
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
    message:
      "That's not something to work through in an exercise. Please reach real support.",
    patterns: [
      /\b(hurt|harm|kill)\s+(him|her|them|someone|people)\b/i,
      /\bhe|she|they\s+(hits?|hurts?|beats?)\s+me\b/i,
      /\bnot\s+safe\s+at\s+home\b/i,
    ],
  },
  {
    reason: "medication_or_dosing",
    message:
      "Anything about medication or doses needs a prescriber or pharmacist, not this app — so I won't guess at it.",
    patterns: [
      /\b(dose|dosage|dosing|milligram)/i,
      // NOTE: "40mg" has no word boundary between the digit and the m, so a
      // leading \b would miss it entirely. Match the unit directly.
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
    message:
      "Withdrawal and detox can be medically serious, so that's a clinician's job. There's a route to real help in the Safety Gateway.",
    patterns: [
      /\b(detox|withdrawal|withdraw(ing)?|coming off|quit(ting)? cold turkey)\b/i,
    ],
  },
  {
    reason: "diagnosis_request",
    message:
      "This app doesn't diagnose — it can't, and pretending otherwise would be worse than useless. A clinician can actually assess you.",
    patterns: [
      /\b(do i have|am i)\s+(adhd|autistic|bipolar|depressed|depression|anxiety|ocd|ptsd|borderline)\b/i,
      /\bdiagnos/i,
      /\bwhat'?s\s+wrong\s+with\s+me\b/i,
    ],
  },
  {
    reason: "therapy_request",
    message:
      "I can tidy up your own words, but I'm not a therapist and won't pretend to be one.",
    patterns: [
      /\b(be|act as|pretend to be)\s+my\s+(therapist|counsellor|counselor|psychiatrist|doctor)\b/i,
      /\btherapy\s+session\b/i,
    ],
  },
];

/**
 * Checks user-supplied text before it is sent anywhere.
 * Fails closed: empty or oversized input is refused too.
 */
export function guardInput(text: string, task: AiTask): GuardVerdict {
  if (!ALLOWED_TASKS.includes(task)) {
    return {
      allow: false,
      reason: "task_not_allowlisted",
      message: "That isn't something this app's AI is allowed to do.",
    };
  }

  const trimmed = text?.trim() ?? "";

  if (trimmed.length === 0) {
    return {
      allow: false,
      reason: "empty_input",
      message: "There's nothing to work with yet.",
    };
  }

  // Cap input: long free-text is more likely to contain sensitive disclosure,
  // and none of the three allowed tasks need much.
  if (trimmed.length > 1000) {
    return {
      allow: false,
      reason: "input_too_long",
      message:
        "That's longer than these small suggestions are meant for. Try a shorter piece.",
    };
  }

  for (const rule of RULES) {
    if (rule.patterns.some((p) => p.test(trimmed))) {
      return {
        allow: false,
        reason: rule.reason,
        message: rule.message,
        escalate: rule.escalate,
      };
    }
  }

  return { allow: true };
}

/**
 * Checks the model's response before it is shown.
 * Catches a model that ignored its instructions.
 */
export function guardOutput(text: string): GuardVerdict {
  const trimmed = text?.trim() ?? "";

  if (trimmed.length === 0 || trimmed.length > 600) {
    return {
      allow: false,
      reason: "output_shape_invalid",
      message: "That suggestion didn't come back in a usable shape.",
    };
  }

  // The model must not have produced clinical content either.
  const clinical = [
    /\b(dose|dosage|prescrib)/i,
    /\d\s*(mg|mcg|ml)\b/i,
    /\bmg\b/i,
    /\byou\s+(have|may have|might have)\s+(adhd|depression|anxiety|bipolar|ptsd|ocd)\b/i,
    /\bdiagnos/i,
    /\bas\s+your\s+(therapist|doctor)\b/i,
  ];
  if (clinical.some((p) => p.test(trimmed))) {
    return {
      allow: false,
      reason: "output_contained_clinical_content",
      message: "That suggestion strayed somewhere it shouldn't, so I've dropped it.",
    };
  }

  return { allow: true };
}
