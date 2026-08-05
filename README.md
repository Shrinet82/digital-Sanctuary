# ✦ Digital Sanctuary

> A single, low-friction web app that helps people navigating **anxiety, low mood, ADHD, and substance use** — one calm home that does the job of Headspace, Goblin Tools, Tiimo *and* Bearable, and remembers what actually helps *you*.

**Status:** Pre-build. Design prototype + full plan complete. Repo currently holds the planning documents; code scaffolding (Phase 0) is next.

---

## What this is

Most people juggling overlapping mental-health needs have to app-hop: one app to calm down, another to break down a task, a third to log mood. Digital Sanctuary is **one place** that:

1. **Meets you where you are today** — a 15-second check-in surfaces the *one smallest helpful next step* (panic, paralysis, flat mood, or a craving).
2. **Remembers and reflects** — saved history and gentle, streak-free tracking so you can see yourself getting steadier over time.
3. **Stays safe** — always-on crisis routing, education-not-treatment framing, and privacy by default.

**Core principle:** *Deterministic by default.* Fixed rules, transparent calculations, and traceable content power the experience. Generative AI is optional and narrow (reword a task, recap your own words) — it never diagnoses, decides risk, or acts as a therapist.

---

## 📚 Documentation map — read in this order

| # | Doc | What it covers |
|---|-----|----------------|
| 🧭 | [AGENTS.md](./AGENTS.md) | **Start here.** Context sweep for any human or AI contributor — the whole project in one file. |
| 1 | [docs/01-product-blueprint.md](./docs/01-product-blueprint.md) | Vision, audience, and the feature map vs. competitors |
| 2 | [docs/02-architecture.md](./docs/02-architecture.md) | Next.js + Supabase + Vercel stack and data flow |
| 3 | [docs/03-accounts.md](./docs/03-accounts.md) | Login, guest mode, and guest→account merge |
| 4 | [docs/04-database.md](./docs/04-database.md) | Every table + Row-Level Security |
| 5 | [docs/05-worksheet-engine.md](./docs/05-worksheet-engine.md) | Turning CBT/DBT sheets into interactive forms (the core bet) |
| 6 | [docs/06-modules-catalog.md](./docs/06-modules-catalog.md) | All 30+ therapeutic modules and how each helps |
| 7 | [docs/07-competitor-comparison.md](./docs/07-competitor-comparison.md) | Head-to-head vs. Headspace, Calm, Goblin Tools, Tiimo, Moodfit, Bearable |
| 8 | [docs/08-tracking-and-insights.md](./docs/08-tracking-and-insights.md) | What's logged and the streak-free insight layer |
| 9 | [docs/09-safety-and-privacy.md](./docs/09-safety-and-privacy.md) | Crisis routing, consent, the AI allowlist |
| 10 | [docs/10-roadmap.md](./docs/10-roadmap.md) | Phased build plan with acceptance criteria |

---

## 🧱 Tech stack

| Layer | Choice |
|-------|--------|
| Frontend | **Next.js 14** (App Router) + **TypeScript** + **Tailwind CSS** |
| Backend | **Supabase** — Auth, Postgres, Row-Level Security, Storage, Edge Functions |
| Hosting | **Vercel** (auto-deploy on push to `main`) |
| Source | **GitHub** — this repo (`Shrinet82/digital-Sanctuary`) |

### Supabase target
- **Account:** `Supabase 2`  ·  **Organization:** `Mad82-ops`
- **Project:** *none yet* — Phase 0 creates the project inside the `Mad82-ops` org.

---

## ⚠️ Important boundaries (read before contributing)

- This is **education and skills-practice, not diagnosis or treatment.**
- **No AI risk decisions.** Crisis routing is always deterministic.
- **No streaks, scores, or shame mechanics** — by design.
- **Substance-use data** lives in a separately-consented, extra-restricted domain.
- **Worksheet content** is originally authored (mechanism preserved, wording ours) unless a source licence explicitly allows adaptation. We do not scrape/rehost clinical PDFs.

---

## 🚀 Next step

**Phase 0 — Foundations:** scaffold the Next.js app, port the prototype's "candy neo-brutalist" design system, connect Supabase (create the project in `Mad82-ops`), deploy the shell to Vercel. See [docs/10-roadmap.md](./docs/10-roadmap.md).
