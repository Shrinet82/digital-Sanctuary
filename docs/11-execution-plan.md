# 11 · Execution Plan — how we actually build this

This is the *working* plan: not just what each phase contains, but **how we do it together** — who does what, in what order, and how we know a step is truly done. Pairs with [docs/10-roadmap.md](./10-roadmap.md) (the what) — this is the how.

## Who does what

| | 🤖 Agent (me) | 🙋 You + IDE agent |
|---|---|---|
| Code | Write + commit to `main`, verified-buildable | Review, tweak locally, QA |
| Database | Author SQL migrations; apply via Supabase MCP | Approve; watch data in dashboard |
| Supabase | Create project, run SQL, deploy Edge Functions (MCP) | Own dashboard settings |
| Vercel | — (no dashboard access) | Env vars, redeploys, domains |
| Secrets | Commit `.env.example` only | Put real keys in Vercel/Supabase |
| Verify | `typecheck` + `next build` in sandbox before every push | Confirm live deploy + real-device feel |

## The working rhythm (repeated every task)

```
1. Agent writes code locally  →  2. Agent runs typecheck + next build (must pass)
        ↓                                        ↓
6. On to next task   ←  5. You QA the live URL  ←  4. Vercel auto-deploys  ←  3. Agent commits to main
```

Every commit that needs your hands ends with a **🙋 NEEDS YOU:** note, mirrored in [docs/HANDOFFS.md](./HANDOFFS.md).

## Definition of Done (applies to every phase)

- ✅ `npm run typecheck` and `npm run build` pass.
- ✅ Live URL shows the new work.
- ✅ No secret is committed; `.env.example` updated if new vars appear.
- ✅ Safety + privacy rules from [docs/09](./09-safety-and-privacy.md) upheld (RLS on new tables, urgent-help intact, no AI risk decisions).
- ✅ HANDOFFS.md updated.

---

## ✅ Phase 0 — Foundations — DONE
Scaffolded Next.js 14 + TS + Tailwind, candy neo-brutalist design system, live on Vercel at https://digital-sanctuary-black.vercel.app.

---

## Phase 1 — Database + Email Auth
**Goal:** a real user can sign up with email, log in, and land on a private dashboard; the database exists with security locked on.

**Steps**
1. 🤖 Write SQL migrations: `profiles`, `daily_checkins`, `practice_sessions`, `journal_entries` + the `own_rows_only` RLS policy pattern. Commit under `supabase/migrations/`.
2. 🤖 Create the Supabase project in `Mad82-ops` (MCP) and apply the migrations.
3. 🙋 **NEEDS YOU:** paste the project's `NEXT_PUBLIC_SUPABASE_URL` + anon key into Vercel env vars (and confirm Email provider is on).
4. 🤖 Build auth: sign-up, log-in, log-out pages + Next.js middleware for session refresh; wire `lib/supabase` clients.
5. 🤖 Build the dashboard shell (Now / Today / Reflection regions) behind auth, with the always-on urgent-help button.
6. 🤖 Auto-create a `profiles` row on first sign-in.

**✓ Acceptance:** you can sign up, log out, log back in, and see your own empty dashboard. A second account sees nothing of the first (RLS proven).

## Phase 2 — Check-in + 3 core modules (with real saving)
**Goal:** the app becomes genuinely useful and *remembers*.

**Steps**
1. 🤖 15-second check-in UI → saves to `daily_checkins`.
2. 🤖 Port the rules-based recommendation engine (one primary + two alternatives, with the "why").
3. 🤖 Ground & Settle (breathing timer + before/after rating → `practice_sessions`).
4. 🤖 Task Decomposer (deterministic steps; AI wording deferred to Phase 6).
5. 🤖 One Small Action (behavioural activation with done/partly/moved/not-today).
6. 🙋 **NEEDS YOU:** QA on a phone — does a saved session persist across a refresh and a re-login?

**✓ Acceptance:** do a breathing session today → it's in your history tomorrow.

## Phase 3 — The Worksheet Engine
**Goal:** adding a worksheet becomes writing a JSON file, not code.

**Steps**
1. 🤖 `worksheet_templates` table + migration.
2. 🤖 Build `<WorksheetPlayer>` rendering all step types (`text`, `longtext`, `scale`, `single_choice`, `multi_choice`, `info`, `safety_gate`, `summary`) with branching + optional AI-recap flag.
3. 🤖 Author 3 templates as JSON in `content/worksheets/`: ABC Model, Behavioural Experiment, Thought Record.
4. 🤖 Save results to `journal_entries` + `practice_sessions`, tagged with template version.
5. 🙋 **NEEDS YOU:** sanity-check the wording of the worksheets reads warmly.

**✓ Acceptance:** a new worksheet can be added by committing a JSON file — zero new app code.

## Phase 4 — Tracking & insights
**Goal:** the Bearable/Moodfit half — gentle, streak-free reflection.

**Steps**
1. 🤖 `mood_factors` table + logging UI (sleep, meds, movement, custom).
2. 🤖 Streak-free weekly trend views (rules-based, no scores).
3. 🤖 "What helps me most" cross-module view (excludes substance-use vault by default).
4. 🤖 Export (download JSON) + delete-account flow.
5. 🙋 **NEEDS YOU:** confirm the trend view feels honest and non-shaming after a week of real use.

**✓ Acceptance:** a week of use produces a gentle, honest trend view; export + delete work end-to-end.

## Phase 5 — Substance-use vault + full module set
**Goal:** the sensitive domain, safely isolated, plus the remaining modules.

**Steps**
1. 🤖 Separately-consented vault: `su_use_log`, `su_trigger_map`, `su_lapse_review` + a `consents` gate; excluded from general insights.
2. 🤖 Modules: Trigger Map, Mooring Lines, Lapse Review, Time Container, Priority Lens, Energy-Aware Week, Values to Action.
3. 🤖 `local_resources` directory table + the Safety Gateway wired to it.
4. 🙋 **NEEDS YOU:** provide/verify at least one region's real crisis + treatment resources for the directory; test each urgent route.

**✓ Acceptance:** substance-use data is provably isolated; crisis routing tested per supported region.

## Phase 6 — The narrow AI pilot
**Goal:** the three allowlisted AI features, safely.

**Steps**
1. 🤖 Supabase Edge Functions with schema-constrained output for: task rewording, worksheet recap, neutral summary.
2. 🤖 User-approval-before-save UX; a global "turn AI off" switch.
3. 🤖 Reject-list guard (no medical/dosing/diagnosis/risk prompts → deterministic fallback).
4. 🙋 **NEEDS YOU:** add the AI provider key to Supabase/Vercel secrets; review sample outputs for safety.

**✓ Acceptance:** AI can only reword/summarise the user's own text, always shows the result first, and can be fully turned off.

---

## Pre-launch go / no-go
See [docs/09-safety-and-privacy.md](./09-safety-and-privacy.md). No public launch until every box is ticked — including real usability testing with people who have lived experience.
