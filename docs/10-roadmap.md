# 10 · Roadmap

Each phase ends with something real you can test. We don't move on until the acceptance test passes. Estimates are rough solo-dev; adjust to pace.

## Phase 0 — Foundations · ~1 week
Scaffold Next.js + TypeScript + Tailwind in the repo, port the prototype's candy neo-brutalist design system, connect Supabase (**create the project inside the `Mad82-ops` org via the `Supabase 2` account**), deploy the empty shell to Vercel.
> ✓ **Done when:** the live URL shows a styled "hello" page that auto-deploys on every push to `main`.

## Phase 1 — Accounts & the shell · ~1–2 weeks
Supabase Auth (email + Google), guest mode, guest→account merge Edge Function, the `profiles` table, and the app nav shell with the always-on urgent-help button.
> ✓ **Done when:** you can sign up, log out, log back in, and land on your dashboard.

## Phase 2 — Check-in + 3 core modules · ~2–3 weeks
The 15-second check-in saving to the database, the rules-based recommendation engine, and three modules wired to real storage: **Ground & Settle, Task Decomposer, One Small Action**.
> ✓ **Done when:** you do a breathing session today and it's still in your history tomorrow.

## Phase 3 — The Worksheet Engine · ~2–3 weeks
Build `<WorksheetPlayer>`, the `worksheet_templates` table, and ship **ABC Model + Behavioural Experiment + Thought Record** as templates. Unlocks fast content growth.
> ✓ **Done when:** a new worksheet can be added by writing a JSON file — zero new app code.

## Phase 4 — Tracking & insights · ~2 weeks
Mood-factor logging, streak-free trend views, and the "what helps me most" cross-module insight — all computed by transparent rules.
> ✓ **Done when:** a week of use produces an honest, gentle trend view you'd actually want to look at.

## Phase 5 — Substance-use domain + full module set · ~2 weeks
The separately-consented substance-use vault (**Trigger Map, Mooring Lines, Lapse Review**), the verified local-resource directory, plus remaining modules (**Time Container, Priority Lens, Energy-Aware Week, Values to Action**).
> ✓ **Done when:** substance-use data is provably isolated and crisis routing is tested in each supported region.

## Phase 6 — The narrow AI pilot · ~1–2 weeks
Wire the three allowlisted AI features via Supabase Edge Functions with schema-constrained output and user approval before anything saves. Evaluate for safety/usefulness before expanding.
> ✓ **Done when:** AI can only reword/summarise your own text, always shows the result first, and can be turned off entirely.

---

## Module → phase index

| Module | Phase |
|--------|-------|
| Ground & Settle, Task Decomposer, One Small Action | 2 |
| ABC Model, Behavioural Experiment, Thought Record (via engine) | 3 |
| Mood & factor tracking, trends, "what helps me most" | 4 |
| Trigger Map, Mooring Lines, Lapse Review, Time Container, Priority Lens, Energy-Aware Week, Values to Action | 5 |
| Worry Sorter, Worry Window, Problem-Solving Ladder, Maintenance Map, DBT skills, Focus Plan, Weekly Reset | 3–5 (as templates/modules) |
| Body-Doubling Room | post-MVP |

See [docs/06-modules-catalog.md](./06-modules-catalog.md) for what each module does.
