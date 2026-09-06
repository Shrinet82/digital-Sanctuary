# ✦ Digital Sanctuary

> A private, deterministic, no-AI web app for people living with anxiety, low mood, ADHD, or substance use — usually more than one at once.

**Status: v2 in progress.** The product is being rebuilt against [`digital-sanctuary-redesign.md`](./digital-sanctuary-redesign.md), which is the current source of truth for what this product is and why. Phases A (the Spine) and B (the Hold) of that plan's roadmap are complete; see [§19 of the redesign doc](./digital-sanctuary-redesign.md#19--roadmap) for what's next.

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
| The Ledger — Year Grid, day view, journal ladder rungs 0-3 | ✅ built |
| Deterministic recommender (§13's rule chain) | ✅ built |
| Safety Net (signs / what's worked / people / verified lines) | ✅ built |
| Ride the Wave, Card Deck, What's Blocking Me?, 5-4-3-2-1 | ✅ built |
| Patterns — day-3 first reflection, day-7 week reflection, what-helps-most, factor co-occurrence | ✅ built |
| Ground & Settle, Task Decomposer, One Small Action, Time Container, Priority Lens, Values to Action, Energy-Aware Week | ✅ built (pre-existing) |
| Substance-use Vault (consent-gated: Trigger Map, Mooring Lines, Lapse Review, Safety Gateway) | ✅ built (pre-existing) |
| Worksheet engine (4 templates: Thought Record, ABC Model, Behavioural Experiment, Opposite Action) | ✅ built (pre-existing) |
| Tracking/insights, export/delete | ✅ built (pre-existing) |
| AI, of any kind | ❌ removed entirely (was a narrow, guarded pilot in v1 — see §13 for why it's gone) |
| The 14-day Path, onboarding, journal rungs 4-5, Worry Sorter/Window, Before/After | ⏳ not yet built (Phase C) |
| Passcode lock, Vault Context Log, remaining catalog modules, clinical review | ⏳ not yet built (Phase D) |
| Hindi, local-only mode, offline-first | ⏳ not yet built (Phase E) |

If you're reading the code and something looks unfinished or half-wired, check the redesign doc's roadmap (§19) before assuming it's a bug — a lot of the catalog is intentionally sequenced, not missing.

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
