/**
 * The Path — redesign §9. A fixed, authored, identical-for-everyone
 * 14-day sequence. Not adaptive, not personalised — that would be
 * guessing. Solves the cold-start problem: a full catalog on day one is
 * paralysing for a product built to fight paralysis.
 *
 * The Path only controls what's *offered* on Today — it never locks
 * anything. Every route here is reachable directly at any time, Path or
 * no Path; skipping it loses nothing.
 */

export type PathDay = {
  day: number;
  title: string;
  blurb: string;
  cta: { label: string; href: string };
};

export const PATH: PathDay[] = [
  {
    day: 1,
    title: "Start here",
    blurb: "One check-in, then one calm thing to try. That's the whole loop.",
    cta: { label: "Try Ground & Settle", href: "/modules/ground-and-settle" },
  },
  {
    day: 2,
    title: "This is building something",
    blurb:
      "Every check-in adds a square to your Year Grid. It never resets, and a gap is just a gap.",
    cta: { label: "See your Ledger", href: "/ledger" },
  },
  {
    day: 3,
    title: "Your first reflection",
    blurb: "Three days is enough to show you something real about yourself.",
    cta: { label: "See your patterns", href: "/insights" },
  },
  {
    day: 4,
    title: "One small action",
    blurb: "Not a big plan — one achievable, kind, or connecting thing, sized for today.",
    cta: { label: "Try One Small Action", href: "/modules/one-small-action" },
  },
  {
    day: 5,
    title: "Build your Safety Net",
    blurb:
      "Write it while things are steady: what heading downhill looks like, what's worked before, who to call.",
    cta: { label: "Build my Safety Net", href: "/safety-net" },
  },
  {
    day: 6,
    title: "Practice riding a wave",
    blurb:
      "Learn this one before you need it — a timed container for an urge or spike, so it's familiar when it counts.",
    cta: { label: "Try Ride the Wave", href: "/modules/ride-the-wave" },
  },
  {
    day: 7,
    title: "Your first week, looked back at",
    blurb: "A full week logged. Worth seeing the shape of it.",
    cta: { label: "See your week", href: "/insights" },
  },
  {
    day: 8,
    title: "The Card Deck",
    blurb:
      "Sixty seconds, no typing. Framed plainly: this is self-affirmation, not treatment.",
    cta: { label: "Try the Card Deck", href: "/modules/card-deck" },
  },
  {
    day: 9,
    title: "Break a task down",
    blurb: "One goal, turned into steps — starting with one under two minutes.",
    cta: { label: "Try Task Decomposer", href: "/modules/task-decomposer" },
  },
  {
    day: 10,
    title: "One more rung on the ladder",
    blurb: "You've tapped a state and a chip. Today, try one sentence — it's already prompted for you.",
    cta: { label: "Open today in your Ledger", href: "/ledger" },
  },
  {
    day: 11,
    title: "Values, not motivation",
    blurb: "Not what you should do — what matters to you. Then one tiny, voluntary step toward it.",
    cta: { label: "Try Values to Action", href: "/modules/values-to-action" },
  },
  {
    day: 12,
    title: "A container for focus",
    blurb: "A visible timer, a soft start, a soft landing. Restarting is always free.",
    cta: { label: "Try Time Container", href: "/modules/time-container" },
  },
  {
    day: 13,
    title: "The full Toolkit",
    blurb:
      "Everything was reachable the whole time — now you know what's actually in it.",
    cta: { label: "Browse the Toolkit", href: "/toolkit" },
  },
  {
    day: 14,
    title: "Your first fortnight",
    blurb:
      "That's fourteen days. The Path ends here, on purpose — a finite thing you can finish, not a forever obligation. Everything stays exactly where it was.",
    cta: { label: "See everything", href: "/toolkit" },
  },
];

/**
 * Which calendar day of the Path a user is on, from their signup date.
 * Day 1 is the day they signed up. Returns null once they're past day 14 —
 * the Path has nothing left to offer past that point.
 */
export function pathDayNumber(createdAt: string, now: Date = new Date()): number | null {
  const start = new Date(createdAt);
  const startUtc = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate());
  const nowUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const elapsedDays = Math.floor((nowUtc - startUtc) / 86_400_000);
  const day = elapsedDays + 1;
  return day >= 1 && day <= 14 ? day : null;
}

export function pathContentForDay(day: number): PathDay | undefined {
  return PATH.find((p) => p.day === day);
}
