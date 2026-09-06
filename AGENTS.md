# 🧭 AGENTS.md — Context Sweep

**Purpose:** everything a new contributor (human or AI agent) needs to understand this project in one read, before touching anything. If you read only one file, read this one — then read [`digital-sanctuary-redesign.md`](./digital-sanctuary-redesign.md), which is the actual product spec.

---

## 1. What we're building (one paragraph)

Digital Sanctuary is a web app for people living with **overlapping** mental-health conditions — anxiety, low mood, ADHD, and substance use. It is being rebuilt against a v2 spec (`digital-sanctuary-redesign.md`) that replaces the original v1 plan wholesale. The core loop: a tap-first check-in that **is** the day's log entry, one deterministic next-step suggestion, a Ledger that accumulates without ever resetting, and reflections that describe your own patterns back to you. No AI, anywhere.

## 2. The prime directives (do not violate)

1. **Deterministic by design.** Every recommendation, every crisis route, comes from a rule you can point to in the code (`lib/recommend.ts`, `lib/checkin.ts`). There is no model anywhere in this app — the v1 AI pilot was removed entirely in the v2 rebuild, along with the regex guard it required.
2. **Tap before type.** The check-in and every "gradual journal" rung are designed so a rung is a complete entry on its own — nobody is forced to write to be understood.
3. **Never grade a person.** No streaks, scores, percentages, or "you missed N days," anywhere in the UI or the copy.
4. **Nothing resets.** The Ledger's Year Grid accumulates; a gap is a gap, not a broken chain.
5. **Safety is deterministic and always reachable.** The "Need urgent help?" control is on every authenticated screen; a user's own Safety Net (signs / what's worked / people) plus a verified local directory show there — never a model's guess.
6. **Education, not treatment.** Never claim to diagnose or cure.
7. **Privacy by default.** Journals and check-ins are private. Export and delete are one tap.
8. **Substance-use vault.** Data lives in a separately-consented domain, enforced by Postgres RLS — unreadable even to its owner without an active, unrevoked consent row.
9. **We invent no methods.** Every module implements a named, published, trialled protocol, graded in the evidence register (redesign doc §17). Grade D doesn't ship; grade C ships only with explicit, honest framing (see the Card Deck for the worked example).

## 3. The architecture in 5 lines

- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind, hosted on Vercel.
- **Backend:** Supabase — email/password Auth (no Google OAuth or guest mode despite what older docs say), Postgres, Row-Level Security.
- **Security model:** every user-owned table has an RLS policy scoping access to `auth.uid() = user_id`. Vault tables add a second gate: `has_substance_use_consent()`.
- **Tests:** Vitest over the pure-function core — the recommender, the Ledger's day-aggregation, Patterns' reflection copy, and every seeded content picker. CI (`.github/workflows/ci.yml`) runs typecheck + tests + build on every push/PR.
- **Design system:** "candy neo-brutalism" — cream dot-grid canvas, thick ink borders, hard offset shadows, a fixed candy palette (violet/coral/teal/yellow). Deliberately no dark mode. See redesign doc §16.

## 4. Where things actually stand (check this before assuming something's missing)

Read [`README.md`](./README.md)'s "What's actually built right now" table — it's kept current. Short version: Phases A through D are done — the full module catalog, the 14-day Path, passcode lock, and the Vault's Context Log all exist, and the founder has signed off on the therapy content and evidence register (§17) in consultation with the consulting psychiatrist, recorded in `docs/HANDOFFS.md`. Hindi and local-only/offline mode were considered and are permanently out of scope (§18) — don't build toward either. What's left is Phase E's ongoing crisis-directory growth (add more verified regional helplines to `local_resources` over time — no new mechanism, just more rows) and the still-open §18 items (self-harm scope, distribution).

## 5. The check-in, in one paragraph

Four screens, one required: a bean state (rough/low/flat/okay/good), up to three "loudest" feelings, optional context chips, and what would help. "Just log it" ends the flow immediately — the log is valid with zero exercises attached. It writes to `check_ins`, which is also what the Ledger's Year Grid reads: each day's colour is that day's *dominant* state, computed at read time in `lib/ledger.ts`, never stored. See `lib/checkin.ts` for the full taxonomy and `components/CheckInFlow.tsx` for the flow itself.

## 6. The recommender, in one paragraph

`lib/recommend.ts` is a single ordered rule chain over `{ state, loudest, want }` — first match wins, every result carries a plain-language `reason` string shown verbatim to the user. "Surprise me" and every other day-to-day-varying pick in the app (journal prompts, Card Deck's daily deck, Ride the Wave's activity choice) uses the same deterministic seed function (`lib/seed.ts`): `hash(date + userId) % bankSize`. Reproducible, testable, never actually random.

## 7. Where things live in this repo

- `digital-sanctuary-redesign.md` — the v2 spec. Read this for *why*, not just *what*.
- `README.md` — setup, tech stack, and the current build-status table.
- `docs/01`–`11` — **v1 planning docs, superseded.** Kept for history; don't treat as current.
- `app/` — routes. `app/actions/*.ts` — server actions (all real, no stubs).
- `components/modules/*` — one component per Toolkit module. `lib/modules.ts` is the catalog (id, group, evidence-graded "why" copy).
- `components/ledger/*`, `lib/ledger.ts`, `lib/patterns.ts` — the Ledger and Patterns.
- `content/worksheets/*.json` — worksheet templates (data, not code — see `lib/worksheets/`).
- `supabase/migrations/` — schema, in order. Never edit an already-applied migration; add a new one.
- `lib/*.test.ts` — the test suite, next to the code it tests.

## 8. Glossary (plain terms)

- **RLS (Row-Level Security):** database rule that makes it impossible to read another user's data.
- **The Ledger:** the Year Grid + day view + gradual journal. The product's memory.
- **The gradual journal / rungs:** a ladder from "tapped a state" (rung 0) up to a free page (rung 5, not yet built) — every rung is a complete entry, nobody faces a blank page by default.
- **Behavioural activation:** doing one small valued/pleasant action to lift low mood — action before motivation. (One Small Action, Values to Action.)
- **Urge surfing:** treating an urge as a wave that peaks and passes regardless of action — the mechanism behind Ride the Wave.
- **Harm reduction:** meeting someone at their own goal (reduce / safer use / abstain / just learning) without ranking them.
- **Deterministic:** decided by fixed, inspectable rules — never by a model, because there isn't one.
