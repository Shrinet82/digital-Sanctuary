/**
 * The module catalog.
 *
 * Metadata only — each module's behaviour lives in its own component.
 *
 * Groups are STATE-based, not diagnosis-based (redesign §10): "Nobody opens
 * an app thinking 'I'd like an ADHD intervention.' They think 'I can't
 * start.'" Substance use is the one deliberate exception — it's genuinely
 * condition-specific (consent-gated, separate content), not a state.
 *
 * There is deliberately no separate `condition` label field. Card subtitles
 * and the module-detail pill both derive their text from `group` via
 * `groupLabel()` below, so there is exactly one place that can drift —
 * this file previously had a second, hand-written label per module that
 * silently reintroduced diagnosis language ("Anxiety", "ADHD") after the
 * v2 rewrite. Single source of truth now.
 */

export type ConditionGroup =
  | "right_now"
  | "racing_thoughts"
  | "low_mood"
  | "cant_start"
  | "substance";

export type ModuleMeta = {
  id: string;
  title: string;
  emoji: string;
  group: ConditionGroup;
  description: string;
  /** Shown behind "Why this may help". */
  why: string;
  /** True when this module writes to the substance-use vault. */
  vault?: boolean;
};

export const MODULE_LIST: ModuleMeta[] = [
  /* ---------------- 🌊 right now (I can't calm down) ---------------- */
  {
    id: "ground-and-settle",
    title: "Ground & Settle",
    emoji: "🌊",
    group: "right_now",
    description:
      "A short paced-breathing practice. Follow the circle; leave whenever you like.",
    why: "Slow, paced breathing with a longer exhale gently signals the body's calming system. It's a portable skill for high-arousal moments — not a cure, and you're in control the whole time. Adapted from paced-breathing and grounding practices in NHS and CCI anxiety self-help materials.",
  },
  {
    id: "body-settle",
    title: "Body Settle",
    emoji: "🧘",
    group: "right_now",
    description:
      "Progressive muscle release — tense one group at a time, then let it all go.",
    why: "Deliberately tensing and releasing muscle groups gives the body a concrete signal to downshift, and it's something to *do* rather than just think your way calm. Standard behavioural relaxation training component. Evidence grade B.",
  },
  {
    id: "cool-the-storm",
    title: "Cool the Storm",
    emoji: "🌪️",
    group: "right_now",
    description:
      "Paced breathing, slow movement, and a long release — no physical shock, ever.",
    why: "Combines paced breathing with slow movement, both DBT-derived distress-tolerance components. Deliberately excludes any cold/physical-shock techniques that circulate in this space — those are substitution, not regulation. Evidence grade B.",
  },
  {
    id: "ride-the-wave",
    title: "Ride the Wave",
    emoji: "🌊",
    group: "right_now",
    description:
      "A timed container for an urge or spike — something to do while it passes, not a plan for later.",
    why: "An urge is strongest right when it starts, and it passes whether or not you act on it. Urge surfing gives you something concrete to do for exactly as long as it takes. Adapted from Marlatt & Gordon's Relapse Prevention (1985) — established within relapse-prevention packages, weaker studied as a standalone piece (evidence grade B). Nothing in the activity bank involves pain, cold, or discomfort — that's substitution, not regulation.",
  },
  {
    id: "grounding-54321",
    title: "5-4-3-2-1",
    emoji: "🖐️",
    group: "right_now",
    description:
      "A guided sensory countdown — five things you see, down to one thing you taste.",
    why: "Widely practised sensory grounding. The formal evidence for it is thin (evidence grade C), but it's ubiquitous, has no red flags, and needs no equipment or writing — so it ships as a normal toolkit item, no hedging needed.",
  },

  /* ---------------- 🌀 racing thoughts (my head won't stop) ---------------- */
  {
    id: "worry-sorter",
    title: "Worry Sorter",
    emoji: "🗂️",
    group: "racing_thoughts",
    description:
      "You classify the worry — actionable, uncertain, or needs real help — and get routed accordingly.",
    why: "Worry classification is a core move in GAD protocols: most worry-time goes to things that either have an obvious next action or genuinely can't be resolved by more thinking. You decide which is which; the app only routes on your answer. Evidence grade B.",
  },
  {
    id: "worry-window",
    title: "Worry Window",
    emoji: "🪟",
    group: "racing_thoughts",
    description:
      "Park a worry to a set time you choose, with something small to refocus on meanwhile.",
    why: "Stimulus-control worry postponement (Borkovec) — deciding when you'll think about something reduces how much it intrudes right now, without pretending it isn't there. Evidence grade B. Note: there's no reminder system yet, so this only works if you check back yourself.",
  },
  {
    id: "problem-ladder",
    title: "Problem Ladder",
    emoji: "🪜",
    group: "racing_thoughts",
    description:
      "Vague dread, narrowed down: the whole thing → one piece → one doable move.",
    why: "Vague dread is paralysing partly because it's vague — naming the whole thing, then one piece of it, then one move on that piece, converts an unmanageable feeling into a concrete next action. Same family as CBT problem-solving, evidence grade B.",
  },
  {
    id: "card-deck",
    title: "Card Deck",
    emoji: "🃏",
    group: "racing_thoughts",
    description:
      "Swipe away unhelpful self-talk, keep the supportive. Sixty seconds, no typing.",
    why: "This maps to Cognitive Bias Modification, whose formal trial evidence didn't hold up under later, better trials (evidence grade C). Decided with the consulting psychiatrist: it ships anyway, framed plainly to you as self-affirmation, never as treatment — a quick, honest ritual of reminding yourself what you already know, not a claim that swiping changes how you think.",
  },

  /* ---------------- 🌻 low mood (I feel nothing / everything's heavy) ---------------- */
  {
    id: "one-small-action",
    title: "One Small Action",
    emoji: "🌱",
    group: "low_mood",
    description:
      "One achievable, kind, or connecting action — sized for today, whatever today looks like.",
    why: "In low mood, motivation usually follows action rather than coming first. Doing one small, valued, or pleasant thing — and noticing how it felt — is the core of behavioural activation. Sizing it down protects against the all-or-nothing trap. Adapted from WHO Step-by-Step and CCI behavioural-activation approaches.",
  },
  {
    id: "values-to-action",
    title: "Values to Action",
    emoji: "🧡",
    group: "low_mood",
    description:
      "Not what you should do — what matters to you. Then one tiny, voluntary step toward it.",
    why: "When mood is low, motivation is a trap but values still point somewhere. Turning something you care about into a two-minute act is the acting-on-your-values move from WHO's Doing What Matters in Times of Stress. The step stays small and voluntary on purpose.",
  },
  {
    id: "before-after",
    title: "Before / After",
    emoji: "📈",
    group: "low_mood",
    description:
      "Rate your mood, do one small thing, rate it again — watch doing lift mood, in your own numbers.",
    why: "Behavioural activation's core claim — action before motivation — made visible in your own before/after numbers rather than just asserted. Evidence grade A.",
  },
  {
    id: "gentle-rhythm",
    title: "Gentle Rhythm",
    emoji: "🌤️",
    group: "low_mood",
    description:
      "Rebuild routine without a rigid schedule — pick anchors for today, no times attached.",
    why: "Depression erodes routine, but a rigid timetable just adds a new way to feel like you failed. Anchoring on a few loose, unscheduled touchpoints rebuilds rhythm without the all-or-nothing trap. Behavioural-activation adjacent, evidence grade B.",
  },
  {
    id: "energy-aware-week",
    title: "Energy-Aware Week",
    emoji: "🗓️",
    group: "low_mood",
    description:
      "A week planned from your real capacity, not an ideal one. Move or drop anything, no penalty.",
    why: "Balancing routine, necessary, pleasurable and restful activity rebuilds rhythm — but a rigid schedule sets you up to feel like a failure. Capacity is allowed to vary here, an empty day is a valid day, and nothing resets. Adapted from behavioural-activation weekly planning.",
  },

  /* ---------------- ⚡ can't start (I can't start) ---------------- */
  {
    id: "focus-setup",
    title: "Focus Setup",
    emoji: "🧹",
    group: "cant_start",
    description:
      "An environment checklist before you start — friction removed before it's needed.",
    why: "Executive-function friction often comes from the environment, not willpower — clearing it in advance costs less than fighting distraction mid-task. Same Focus Forward tradition as the rest of this lane.",
  },
  {
    id: "whats-blocking-me",
    title: "What's Blocking Me?",
    emoji: "🚧",
    group: "cant_start",
    description:
      "Name the friction and get routed straight to the tool built for it. The entry point for this whole lane.",
    why: "Nobody opens an app thinking 'I need an executive-function intervention' — they think 'I can't start.' Naming the specific friction and routing deterministically avoids handing someone eleven options when starting anything is already the problem. Draws on the same Focus Forward ADHD Skills Group approach behind Task Decomposer, Priority Lens, and Time Container.",
  },
  {
    id: "task-decomposer",
    title: "Task Decomposer",
    emoji: "🪜",
    group: "cant_start",
    description:
      "Turn one goal into small, observable steps — starting with one under two minutes.",
    why: "Executive-function friction isn't laziness — it's a gap between intention and initiation. A concrete first step under two minutes lowers the activation cost, and a visible sequence offloads working memory. Neurodiversity-affirming by design; adapted from the Focus Forward ADHD Skills Group task-breakdown strategy.",
  },
  {
    id: "time-container",
    title: "Time Container",
    emoji: "⏳",
    group: "cant_start",
    description:
      "One block of focus with a soft start and a soft landing. The container does the holding.",
    why: "Making time visible externalises something ADHD brains often can't feel. A start ritual lowers the cost of beginning, and a finish ritual with a note to future-you protects working memory. Restarting is deliberately free — abandoning a timer usually ends the session, and it shouldn't. From the Focus Forward time-management materials.",
  },
  {
    id: "priority-lens",
    title: "Priority Lens",
    emoji: "🔍",
    group: "cant_start",
    description:
      "When everything feels urgent: sort each task through one lens and get a list of three, never a wall.",
    why: "The urgency/importance matrix and the 1-2-3 list cut a swarm of tasks down to at most three, ranked by rules you can see. 'Shrink' hands off to the Task Decomposer, and 'let go' is treated as a legitimate decision rather than a failure. Your worth is never scored here. From Focus Forward, Session 3.",
  },

  /* ---------------- 🧭 substance use (I want to use) — the one exception, genuinely condition-specific ---------------- */
  {
    id: "safety-gateway",
    title: "Safety Gateway",
    emoji: "🛟",
    group: "substance",
    description:
      "A calm, always-available route to real help — emergency, overdose, withdrawal, and local services.",
    why: "In a dangerous moment nobody should be navigating an app. Routing here is decided by fixed rules and a verified local directory, never by AI, and it never tries to coach an emergency through a screen. Informed by the SAMHSA overdose prevention and response guidance.",
  },
  {
    id: "trigger-map",
    title: "Trigger & Support Map",
    emoji: "🧭",
    group: "substance",
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
    vault: true,
    description:
      "The small, steady things that hold you in place when the water gets rough.",
    why: "Recovery-support work tracks protective behaviours rather than use. Seeing which anchors are already in your life — sleep, meals, movement, contact, appointments — is more useful than any streak. Counts are days present, never a score, and a thin week is not a failed week. From the ATTC TRUST Mooring Lines chart.",
  },
  {
    id: "context-log",
    title: "Context Log",
    emoji: "📝",
    group: "substance",
    vault: true,
    description:
      "Optional private notes on setting, mood, and who was around. Never what, how much, or where from.",
    why: "Context — where you were, how you felt, who was present — is what makes a pattern visible over time. This deliberately has no field for substance, amount, or source: that's not what this log is for, and never will be.",
  },
  {
    id: "lapse-review",
    title: "Lapse Learning Review",
    emoji: "🔎",
    group: "substance",
    vault: true,
    description:
      "A lapse is information, not a verdict. Ten gentle minutes to learn from it, then back to your plan.",
    why: "Reviewing context, warning signs, what helped, and one adjustment turns an event into something usable. There are no penalties, no streak resets and no 'back to day zero' here — because shame predicts hiding, and hiding predicts harm. Adapted from NICRO and CHARM lapse-prevention material.",
  },
];

export function getModule(id: string): ModuleMeta | undefined {
  return MODULE_LIST.find((m) => m.id === id);
}

/**
 * State-based lanes (§10) — the section headers/jump-links and every
 * module/recommendation subtitle in the app all read from this one list,
 * so there's nowhere else for a diagnosis label to sneak back in.
 *
 * No "all" entry: the Toolkit always shows every lane, each in its own
 * section — there's no flat, undifferentiated view to opt into or out of.
 */
export const GROUP_LABELS: { value: ConditionGroup; label: string; emoji: string }[] =
  [
    { value: "right_now", label: "Right now", emoji: "🌊" },
    { value: "racing_thoughts", label: "Racing thoughts", emoji: "🌀" },
    { value: "low_mood", label: "Low mood", emoji: "🌻" },
    { value: "cant_start", label: "Can't start", emoji: "⚡" },
    { value: "substance", label: "Substance use", emoji: "🧭" },
  ];

export function groupLabel(group: ConditionGroup): string {
  return GROUP_LABELS.find((g) => g.value === group)?.label ?? group;
}
