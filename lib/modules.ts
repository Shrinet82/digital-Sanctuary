/**
 * The module catalog.
 *
 * Metadata only — each module's behaviour lives in its own component.
 * `condition` groups them for the dashboard filter; `vault` marks modules
 * whose data lives in the separately-consented substance-use domain.
 */

export type ConditionGroup = "anxiety" | "low_mood" | "adhd" | "substance";

export type ModuleMeta = {
  id: string;
  title: string;
  emoji: string;
  group: ConditionGroup;
  /** Short label shown on cards. */
  condition: string;
  description: string;
  /** Shown behind "Why this may help". */
  why: string;
  /** True when this module writes to the substance-use vault. */
  vault?: boolean;
};

export const MODULE_LIST: ModuleMeta[] = [
  /* ---------------- anxiety ---------------- */
  {
    id: "ground-and-settle",
    title: "Ground & Settle",
    emoji: "🌊",
    group: "anxiety",
    condition: "Anxiety",
    description:
      "A short paced-breathing practice. Follow the circle; leave whenever you like.",
    why: "Slow, paced breathing with a longer exhale gently signals the body's calming system. It's a portable skill for high-arousal moments — not a cure, and you're in control the whole time. Adapted from paced-breathing and grounding practices in NHS and CCI anxiety self-help materials.",
  },

  /* ---------------- low mood ---------------- */
  {
    id: "one-small-action",
    title: "One Small Action",
    emoji: "🌱",
    group: "low_mood",
    condition: "Low mood",
    description:
      "One achievable, kind, or connecting action — sized for today, whatever today looks like.",
    why: "In low mood, motivation usually follows action rather than coming first. Doing one small, valued, or pleasant thing — and noticing how it felt — is the core of behavioural activation. Sizing it down protects against the all-or-nothing trap. Adapted from WHO Step-by-Step and CCI behavioural-activation approaches.",
  },
  {
    id: "values-to-action",
    title: "Values to Action",
    emoji: "🧡",
    group: "low_mood",
    condition: "Low mood",
    description:
      "Not what you should do — what matters to you. Then one tiny, voluntary step toward it.",
    why: "When mood is low, motivation is a trap but values still point somewhere. Turning something you care about into a two-minute act is the acting-on-your-values move from WHO's Doing What Matters in Times of Stress. The step stays small and voluntary on purpose.",
  },
  {
    id: "energy-aware-week",
    title: "Energy-Aware Week",
    emoji: "🗓️",
    group: "low_mood",
    condition: "Low mood",
    description:
      "A week planned from your real capacity, not an ideal one. Move or drop anything, no penalty.",
    why: "Balancing routine, necessary, pleasurable and restful activity rebuilds rhythm — but a rigid schedule sets you up to feel like a failure. Capacity is allowed to vary here, an empty day is a valid day, and nothing resets. Adapted from behavioural-activation weekly planning.",
  },

  /* ---------------- adhd ---------------- */
  {
    id: "task-decomposer",
    title: "Task Decomposer",
    emoji: "🪜",
    group: "adhd",
    condition: "ADHD",
    description:
      "Turn one goal into small, observable steps — starting with one under two minutes.",
    why: "Executive-function friction isn't laziness — it's a gap between intention and initiation. A concrete first step under two minutes lowers the activation cost, and a visible sequence offloads working memory. Neurodiversity-affirming by design; adapted from the Focus Forward ADHD Skills Group task-breakdown strategy.",
  },
  {
    id: "time-container",
    title: "Time Container",
    emoji: "⏳",
    group: "adhd",
    condition: "ADHD",
    description:
      "One block of focus with a soft start and a soft landing. The container does the holding.",
    why: "Making time visible externalises something ADHD brains often can't feel. A start ritual lowers the cost of beginning, and a finish ritual with a note to future-you protects working memory. Restarting is deliberately free — abandoning a timer usually ends the session, and it shouldn't. From the Focus Forward time-management materials.",
  },
  {
    id: "priority-lens",
    title: "Priority Lens",
    emoji: "🔍",
    group: "adhd",
    condition: "ADHD",
    description:
      "When everything feels urgent: sort each task through one lens and get a list of three, never a wall.",
    why: "The urgency/importance matrix and the 1-2-3 list cut a swarm of tasks down to at most three, ranked by rules you can see. 'Shrink' hands off to the Task Decomposer, and 'let go' is treated as a legitimate decision rather than a failure. Your worth is never scored here. From Focus Forward, Session 3.",
  },

  /* ---------------- substance use (vault) ---------------- */
  {
    id: "safety-gateway",
    title: "Safety Gateway",
    emoji: "🛟",
    group: "substance",
    condition: "Substance use",
    description:
      "A calm, always-available route to real help — emergency, overdose, withdrawal, and local services.",
    why: "In a dangerous moment nobody should be navigating an app. Routing here is decided by fixed rules and a verified local directory, never by AI, and it never tries to coach an emergency through a screen. Informed by the SAMHSA overdose prevention and response guidance.",
  },
  {
    id: "trigger-map",
    title: "Trigger & Support Map",
    emoji: "🧭",
    group: "substance",
    condition: "Substance use",
    vault: true,
    description:
      "Map what tends to come before an urge, pre-choose an alternative, and name who you'd contact.",
    why: "Making triggers visible and deciding your alternative in advance shortens the gap between urge and reaction. Your goal is yours — reduction, safer use, abstinence, reconnecting with care, or just learning are all equally valid here. Adapted from ATTC TRUST trigger work and CHARM harm-reduction planning.",
  },
  {
    id: "mooring-lines",
    title: "Mooring Lines",
    emoji: "⚓",
    group: "substance",
    condition: "Substance use",
    vault: true,
    description:
      "The small, steady things that hold you in place when the water gets rough.",
    why: "Recovery-support work tracks protective behaviours rather than use. Seeing which anchors are already in your life — sleep, meals, movement, contact, appointments — is more useful than any streak. Counts are days present, never a score, and a thin week is not a failed week. From the ATTC TRUST Mooring Lines chart.",
  },
  {
    id: "lapse-review",
    title: "Lapse Learning Review",
    emoji: "🔎",
    group: "substance",
    condition: "Substance use",
    vault: true,
    description:
      "A lapse is information, not a verdict. Ten gentle minutes to learn from it, then back to your plan.",
    why: "Reviewing context, warning signs, what helped, and one adjustment turns an event into something usable. There are no penalties, no streak resets and no 'back to day zero' here — because shame predicts hiding, and hiding predicts harm. Adapted from NICRO and CHARM lapse-prevention material.",
  },
];

export function getModule(id: string): ModuleMeta | undefined {
  return MODULE_LIST.find((m) => m.id === id);
}

export const GROUP_LABELS: { value: ConditionGroup | "all"; label: string; emoji: string }[] =
  [
    { value: "all", label: "All", emoji: "✨" },
    { value: "anxiety", label: "Anxiety", emoji: "🌊" },
    { value: "low_mood", label: "Low mood", emoji: "🌻" },
    { value: "adhd", label: "ADHD", emoji: "⚡" },
    { value: "substance", label: "Substance use", emoji: "🧭" },
  ];
