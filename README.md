# ✦ Digital Sanctuary

> A private, deterministic, no-AI web app for people living with anxiety, low mood, ADHD, or substance use — usually more than one at once.

**Status: v2 largely built.** The product has been rebuilt against [`digital-sanctuary-redesign.md`](./digital-sanctuary-redesign.md), which is the current source of truth for what this product is and why. Phases A through D of that plan's roadmap are complete — the full module catalog, the Path, passcode lock, and the Vault are all in place, and the therapy content + evidence register have the founder's sign-off (see §17). What's left is Phase E's ongoing crisis-directory growth and the still-open items in §18. See [§19](./digital-sanctuary-redesign.md#19--roadmap).

---

## What this is

Digital Sanctuary does three things:

1. **Holds you through a bad moment** — open it in distress, be doing something useful within fifteen seconds.
2. **Remembers your days without asking much of you** — the check-in *is* the day's log entry, tap-first, no separate tracker to maintain.
3. **Shows you your own patterns** — what actually helps *you*, learned from what you did, not guessed at.

Nothing in it grades you. Nothing resets. Nothing guesses — every recommendation traces to a rule you can read in [`lib/recommend.ts`](./lib/recommend.ts).

**This is education and skills-practice, not diagnosis or treatment.** Crisis routing is deterministic, always visible, and never decided by a model — because there is no model. See §13 and §17 of the redesign doc for the full determinism and evidence policy.

---

## What's actually built right now

| Area | Status |
|---|---|
| Auth (email/password) | ✅ built |
| Tap-first check-in (bean → loudest → context → want) | ✅ built |
| The Ledger — Year Grid, day view, full journal ladder (rungs 0-5) | ✅ built |
| Deterministic recommender (§13's rule chain) | ✅ built |
| Safety Net (signs / what's worked / people / verified lines) | ✅ built |
| The 14-day Path + the Toolkit page | ✅ built |
| Passcode lock on the Ledger and the Vault | ✅ built |
| Full Toolkit — every catalog module in §10 has working code: Ground & Settle, Ride the Wave, Body Settle, Cool the Storm, 5-4-3-2-1, What's Blocking Me?, Task Decomposer, Priority Lens, Time Container, Energy-Aware Week, Focus Setup, One Small Action, Values to Action, Before/After, Gentle Rhythm, Opposite Action, Card Deck, Worry Sorter, Worry Window, Thought Record, ABC Model, Behavioural Experiment, Problem Ladder, and the Vault (Safety Gateway, Trigger Map, Mooring Lines, Lapse Review, Context Log) | ✅ built |
| Patterns — day-3 first reflection, day-7 week reflection, what-helps-most, factor co-occurrence | ✅ built |
| Tracking/insights, export/delete | ✅ built |
| AI, of any kind | ❌ removed entirely (was a narrow, guarded pilot in v1 — see §13 for why it's gone) |
| Clinical sign-off on the therapy content + evidence register (§17) | ✅ done — recorded in `docs/HANDOFFS.md`, not published on the site |
| Hindi | ❌ not building — permanent decision, see §18 |
| Local-only / offline mode | ❌ not building — this is a website, not a native app, see §18 |
| Crisis directory | ✅ national lines + 6 verified regional/NGO helplines; growing over time as more are sourced and verified (§19 Phase E) |
| "My Goal, My Direction" as a standalone module | ⏳ not built — the catalog itself treats Trigger Map's own goal picker as already covering this |

If you're reading the code and something looks unfinished or half-wired, check the redesign doc's roadmap (§19) before assuming it's a bug.

---

## 🧱 Tech stack

| Layer | Choice |
|-------|--------|
| Frontend | **Next.js 14** (App Router) + **TypeScript** + **Tailwind CSS** |
| Backend | **Supabase** — Auth, Postgres, Row-Level Security |
| Tests | **Vitest** — unit tests over the deterministic core (recommender, Ledger, Patterns, seeded content selection) |
| CI | **GitHub Actions** — typecheck, test, build on every push/PR to `main` |
| Hosting | Vercel (auto-deploy on push to `main`) |

No Google OAuth, no guest mode — despite what older docs in this repo say. Email/password only, for now.

---

## Running it locally

```bash
npm install
cp .env.example .env.local   # fill in your Supabase project's URL + anon key
npm run dev
```

```bash
npm run typecheck   # tsc --noEmit
npm test            # vitest run
npm run build       # production build
```

Database schema lives in [`supabase/migrations/`](./supabase/migrations/), applied in order. `content/worksheets/*.json` holds the worksheet templates — dropping a new one in is enough to register it, no code change needed.

---

## ⚠️ Important boundaries

- **Zero AI.** Every suggestion is authored or rule-based. See `digital-sanctuary-redesign.md` §13.
- **No streaks, scores, or shame mechanics.** Completion states are done / partly / moved / not_today — never "failed."
- **Substance-use data** lives behind a consent gate enforced in Postgres RLS, not just the UI — the rows are unreadable even to their owner without an active consent record.
- **We invent no methods.** Every module implements a named, published, trialled protocol — see the evidence register in §17.
- **Export and delete are one tap, never buried.**

---

## 📚 Other documentation in this repo

`docs/01` through `docs/11` are the **v1 planning docs** — written before this rebuild and largely superseded by `digital-sanctuary-redesign.md`. They're kept for history, not as current instructions; where they conflict with the redesign doc or the code, the redesign doc wins. [`AGENTS.md`](./AGENTS.md) has been updated to reflect v2 and is the right starting point for a new contributor.
