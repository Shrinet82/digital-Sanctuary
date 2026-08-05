# 🧭 AGENTS.md — Context Sweep

**Purpose:** everything a new contributor (human or AI agent) needs to understand this project in one read, before touching anything. If you read only one file, read this one.

---

## 1. What we're building (one paragraph)

Digital Sanctuary is a web app for people living with **overlapping** mental-health conditions — anxiety, depression/low mood, ADHD (executive dysfunction), and substance use. Instead of app-hopping, users get a single dashboard that (a) gives **immediate relief** (grounding, breathing, task breakdown) and (b) supports **long-term self-tracking** (mood, energy, habits) without cognitive overload. It aggregates evidence-based methods (CBT, DBT, behavioural activation, harm reduction, executive-function support) and turns static worksheets into friendly interactive modules.

## 2. The prime directives (do not violate)

1. **Deterministic by default.** Rules, decision trees, and transparent math drive the app. Generative AI is optional and narrow.
2. **AI allowlist — only these three:** (a) reword a user's task into a smaller step, (b) recap the user's *own* worksheet answers (user approves before save), (c) neutral summaries of the user's own entries. **Never** diagnose, decide risk, give medical/dosing advice, or act as a therapist.
3. **Safety is deterministic.** Crisis/urgent routing is decided by fixed rules + a clinician-approved local directory, never by an AI classifier. An always-on "Need urgent help?" control is on every screen.
4. **Education, not treatment.** Never claim to diagnose or cure. Show this clearly.
5. **Streak-free, shame-free.** No streaks, scores, pass/fail days, or guilt notifications. Completion states are done / partly / moved / not today — never "failed".
6. **Privacy by default.** Journals and worksheets are private. Users can export or delete everything. Store the minimum; encrypt sensitive free-text.
7. **Substance-use vault.** Substance-use data lives in a separately-consented, extra-restricted domain and never appears in general cross-module insights unless the user opts in.
8. **Content licensing.** Preserve the *mechanism* of clinical worksheets but author our *own* wording, unless a source licence explicitly permits adaptation. Never scrape/rehost copyrighted PDFs.

## 3. The architecture in 5 lines

- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind, hosted on Vercel.
- **Backend:** Supabase — Auth (email + Google), Postgres database, Row-Level Security (RLS), Storage, Edge Functions.
- **Security model:** every table has an RLS policy `auth.uid() = user_id` so a user can only ever touch their own rows.
- **Deploy:** push to `main` on GitHub → Vercel auto-deploys.
- **Design system:** "candy neo-brutalist" — cream dot-grid canvas, bold ink borders, hard offset shadows, candy palette (violet/coral/teal/yellow), Bricolage Grotesque + Space Grotesk. See prototype.

## 4. The Worksheet Engine (the core technical bet)

Instead of hand-coding each worksheet, we build **one player** (`<WorksheetPlayer>`) that renders a worksheet described as a **versioned JSON template** (a list of typed steps: `text`, `longtext`, `scale`, `single_choice`, `multi_choice`, `info`, `safety_gate`, `summary`). Adding a new CBT/DBT worksheet = writing a JSON file, **not** writing code. Answers save to `journal_entries` (private words) + `practice_sessions` (before/after numbers), tagged with the template `version`. Full spec + two worked examples in [docs/05-worksheet-engine.md](./docs/05-worksheet-engine.md).

## 5. Environments & accounts

| Thing | Value |
|-------|-------|
| GitHub repo | `Shrinet82/digital-Sanctuary` (default branch `main`) |
| Supabase account | `Supabase 2` |
| Supabase org | `Mad82-ops` |
| Supabase project | **none yet** — create in Phase 0 inside `Mad82-ops` |
| Hosting | Vercel (to be connected in Phase 0) |

## 6. Where things live in this repo

- `README.md` — overview + doc map.
- `AGENTS.md` — this file.
- `docs/01…10` — the full plan, one topic per file.
- (coming in Phase 0) `app/`, `components/`, `lib/`, `supabase/migrations/`, `content/worksheets/`.

## 7. Current status & next action

- ✅ Interactive prototype built (all 4 conditions, 12+ modules, working check-in + rule engine).
- ✅ Full plan + module catalog + competitor comparison written (these docs).
- ⏭️ **Next:** Phase 0 — scaffold Next.js, port design system, create Supabase project in `Mad82-ops`, deploy shell to Vercel. See [docs/10-roadmap.md](./docs/10-roadmap.md).

## 8. Glossary (plain terms)

- **RLS (Row-Level Security):** database rule that makes it impossible to read another user's data.
- **Behavioural activation:** doing one small valued/pleasant action to lift low mood — action before motivation.
- **CBT:** cognitive behavioural therapy — working with thoughts and behaviours (e.g. the ABC model).
- **DBT:** dialectical behaviour therapy — emotion-regulation & distress-tolerance skills (e.g. TIPP, DEAR MAN).
- **Harm reduction:** meeting someone at their own goal (reduce / safer use / abstain / learn) without forcing abstinence.
- **Body-doubling:** working alongside someone (even virtually) to make starting easier — common ADHD support.
- **Deterministic:** decided by fixed, inspectable rules (not by an AI guessing).
