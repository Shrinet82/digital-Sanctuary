# 4 · Database

The filing cabinet. Each table is a labelled drawer. The golden rule, enforced by **Row-Level Security (RLS)** on every drawer: *you can only ever open your own folders.*

## Tables

| Table | What it stores | Key fields (plain) |
|-------|----------------|--------------------|
| `profiles` | Who you are + settings | display name, language, reduced-motion, module visibility, reminder consent |
| `daily_checkins` | Each 15-second check-in | distress, energy, attention, urge, chosen mode, timestamp |
| `practice_sessions` | Every module you complete | module id, template version, before/after rating, outcome (done/partly/moved/not today) |
| `journal_entries` | Private free-text & worksheet answers | encrypted content, worksheet id, retention setting |
| `worksheet_templates` | Reusable worksheet blueprints | name, version, JSON steps, framework (CBT/DBT), safety gates |
| `tasks` + `task_steps` | ADHD breakdowns & priorities | goal, lens (now/schedule/shrink/letgo), ordered micro-steps, done flags |
| `mood_factors` | Bearable-style trackables | sleep, meds, exercise, custom factors + values per day |
| `mooring_anchors` | Weekly protective behaviours | anchor type, days-present count, week |
| `support_plans` | Chosen safety contacts & routes | contacts, warning signs, preferred services, region |
| `consents` | What you've agreed to, and when | consent type, version, granted/revoked timestamp |
| `local_resources` | Verified crisis/treatment directory | region, service type, hours, languages, is-emergency |

## The substance-use vault 🔒

Substance-use records (trigger maps, use logs, lapse reviews) live in a **separately-consented, extra-restricted domain** — their own tables, their own consent flag, and a rule that they never appear in general cross-module insights unless the user explicitly opts in. This is a promise enforced in the database, not just the UI.

Suggested tables: `su_use_log`, `su_trigger_map`, `su_lapse_review` — all gated behind a `consents` row of type `substance_use_domain`.

## Row-Level Security — what it looks like

One short rule, attached to every table:

```sql
-- "You may only read/write rows that belong to you"
create policy "own_rows_only"
  on practice_sessions
  for all
  using ( auth.uid() = user_id );
```

> **Plain terms:** the database itself checks "is this your data?" on every request. Even if the app code had a bug, the cabinet would still refuse to hand over someone else's folder.

## Conventions

- Every user-owned table has a `user_id uuid references auth.users` column and the `own_rows_only` policy.
- Timestamps: `created_at timestamptz default now()`, plus `updated_at` where edited.
- Sensitive free-text in `journal_entries` is encrypted at rest; retention setting controls auto-purge.
- Guest rows carry a nullable `anon_id` used by the merge Edge Function, cleared on claim.
- Migrations live in `supabase/migrations/` and are the source of truth for the schema.
