/**
 * The Worksheet Template format.
 *
 * A worksheet is DATA, not code. One player component renders any template,
 * so adding a new CBT/DBT worksheet means committing a JSON file — no new
 * app code. See docs/05-worksheet-engine.md.
 */

export type StepType =
  | "info"
  | "text"
  | "longtext"
  | "scale"
  | "single_choice"
  | "multi_choice"
  | "safety_gate"
  | "summary";

type BaseStep = {
  type: StepType;
  /** Where this step's answer is stored in the saved answers object. */
  key?: string;
  /** The question shown to the user. */
  prompt?: string;
  /** Smaller helper text under the prompt. */
  help?: string;
  /**
   * Tappable example answers.
   *
   * A blank box is the point where people give up — especially when anxious or
   * low. Examples are scaffolding: tapping one drops it into the field so it can
   * be edited rather than written from nothing. They are never saved as-is
   * unless the user leaves them.
   */
  examples?: string[];
  /** Skippable steps show a "Skip this" control. */
  optional?: boolean;
  /**
   * Only show this step when a previous answer matches.
   * e.g. { key: "did_it", equals: "yes" }
   */
  branch?: { key: string; equals: string | number | boolean };
};

export type InfoStep = BaseStep & {
  type: "info";
  title: string;
  body: string;
};

export type TextStep = BaseStep & {
  type: "text" | "longtext";
  key: string;
  prompt: string;
  placeholder?: string;
};

export type ScaleStep = BaseStep & {
  type: "scale";
  key: string;
  prompt: string;
  min?: number;
  max?: number;
  lowLabel?: string;
  highLabel?: string;
};

export type ChoiceStep = BaseStep & {
  type: "single_choice" | "multi_choice";
  key: string;
  prompt: string;
  options: string[];
  /** Allow the user to write their own option too. */
  allowOther?: boolean;
};

export type SafetyGateStep = BaseStep & {
  type: "safety_gate";
  key: string;
  prompt: string;
  /** Shown as the "yes, this applies" answer. */
  yesLabel?: string;
  noLabel?: string;
  /** Only "route_urgent_help" is supported — deliberately not configurable. */
  onYes: "route_urgent_help";
  /** Explains why we're routing, in plain language. */
  routeMessage: string;
};

export type SummaryStep = BaseStep & {
  type: "summary";
  /** Two scale keys to compare, e.g. ["belief_before", "belief_after"]. */
  compare?: [string, string];
  /** Offer an optional, user-approved plain-language recap. Phase 6. */
  aiRecap?: boolean;
};

export type Step =
  | InfoStep
  | TextStep
  | ScaleStep
  | ChoiceStep
  | SafetyGateStep
  | SummaryStep;

/**
 * What to offer after the worksheet, so finishing doesn't land in a void.
 * Chosen by a fixed threshold on the final rating — never by a model.
 */
export type NextStep = {
  /** Compare against the second key of the summary's `compare` pair. */
  whenRatingAtOrAbove?: number;
  moduleId: string;
  label: string;
  /** Plain-language reason, shown to the user. */
  because: string;
};

export type WorksheetTemplate = {
  id: string;
  version: number;
  name: string;
  framework: "CBT" | "DBT" | "ACT" | "behavioural_activation";
  condition: string;
  lede: string;
  /** Shown behind the "Why this may help" disclosure. */
  why: string;
  steps: Step[];
  /** Optional follow-on suggestions, evaluated top-down. */
  nextSteps?: NextStep[];
};

export type AnswerValue = string | number | string[] | null;
export type Answers = Record<string, AnswerValue>;

/** Steps that don't collect an answer. */
export function isDisplayStep(step: Step): boolean {
  return step.type === "info" || step.type === "summary";
}

/** Evaluates a step's `branch` condition against answers collected so far. */
export function shouldShowStep(step: Step, answers: Answers): boolean {
  if (!step.branch) return true;
  return answers[step.branch.key] === step.branch.equals;
}
