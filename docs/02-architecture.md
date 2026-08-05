# 2 · Architecture

A modern, boring-in-a-good-way stack. One language front-to-back (TypeScript), generous free tiers, scales from a laptop to thousands of users without re-architecting.

## The frontend

| Piece | Plain terms |
|-------|-------------|
| **Next.js 14** (App Router) | The React framework that renders pages fast and handles routing — the app feels instant. |
| **TypeScript** | JavaScript with guardrails; catches bugs before users do. |
| **Tailwind CSS** | Keeps the candy neo-brutalist look consistent everywhere without CSS chaos. |

This is everything the user sees and taps — dashboard, modules, buttons.

## The backend — Supabase

| Piece | Plain terms |
|-------|-------------|
| **Auth** | Login, signup, passwords, Google sign-in. |
| **Postgres** | The database where every check-in and journal entry lives. |
| **Row-Level Security (RLS)** | The rule that makes it *impossible* for one user to see another's data. |
| **Storage** | Audio files (breathing tracks) and user exports. |
| **Edge Functions** | Small server programs for the few AI features and the guest→account merge. |

Supabase **is** the backend — there's no separate server for us to build, secure, and pay for. The security rule lives right next to the data, so it can't be bypassed by an app bug.

## How one tap travels through the system

Example: you finish a breathing exercise and rate your calm 7/10.

```
1. You tap "Save"        → in the browser (Next.js)
2. Supabase client       → sends it with your login token
3. RLS checks            → "is this really your row?" ✓
4. Postgres saves        → into practice_sessions
5. Trend updates         → next time you open insights
```

## Hosting & deployment

- **Vercel** hosts the Next.js app. Every push to `main` on GitHub auto-deploys the live site. Free tier is plenty to launch.
- **GitHub** (`Shrinet82/digital-Sanctuary`) is the single source of truth for all code.
- **Supabase** runs the database in the cloud; a local copy is used for development.

## Supabase environment

- **Account:** `Supabase 2`
- **Organization:** `Mad82-ops`
- **Project:** none yet — **Phase 0 creates the project** inside `Mad82-ops` (pick a region close to primary users; store keys in Vercel + local `.env`, never commit them).

## Planned repo structure (from Phase 0)

```
app/                    Next.js routes (dashboard, modules, auth)
components/             UI: CheckIn, SafetyGate, SkillCard, WorksheetPlayer, …
lib/                    Supabase client, rule engine, helpers
content/worksheets/     JSON worksheet templates (ABC, Behavioural Experiment, …)
supabase/migrations/    SQL: tables + RLS policies
```

## Frontend component library (shared, content-driven)

`CheckIn`, `SafetyGate`, `SkillCard`, `GuidedFlow`, `SingleChoice`, `Scale`, `Timer`, `PlanBuilder`, `PrivateJournal`, `TrendView`, `ResourceLink`, `ExitAndSupport`, `WorksheetPlayer`. Each accepts content/template IDs — this prevents every worksheet from becoming bespoke code.
