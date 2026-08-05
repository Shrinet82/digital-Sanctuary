# 🙋 Handoffs — things only you (human + IDE agent) can do

This is our shared checklist. The agent commits code and runs Supabase via MCP;
anything needing a browser dashboard, a third-party console, or a real secret
lands here. Check items off as you complete them.

## Legend
- ⏳ waiting on you
- ✅ done
- 🤖 agent will do (listed for visibility)

---

## Phase 0 — Foundations

- [ ] ⏳ **Connect the repo to Vercel.** Import `Shrinet82/digital-Sanctuary`,
      framework preset = Next.js, deploy. This gives us the live auto-deploy URL.
- [ ] ⏳ **Add Vercel env vars** once the Supabase project exists (see below):
      `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
      `SUPABASE_SERVICE_ROLE_KEY`. Values come from Supabase → Settings → API.
- [ ] 🤖 Agent: create the Supabase project in the `Mad82-ops` org (next kickoff step).
- [ ] 🤖 Agent: write SQL migrations under `supabase/migrations/`.

## Phase 1 — Accounts (simple email first)

- [ ] ⏳ In Supabase → Authentication → Providers, confirm **Email** is enabled
      (it is by default). Decide whether to require email confirmation for now.
- [ ] 🔜 (Later) **Google OAuth** — deferred. When we add it: create an OAuth
      client in Google Cloud Console and paste the client id/secret into
      Supabase → Auth → Providers → Google. Not needed yet.

## Local development (for your IDE)

```bash
npm install          # install dependencies
cp .env.example .env.local   # then fill in real Supabase values
npm run dev          # http://localhost:3000
npm run build        # production build check
npm run typecheck    # TypeScript check
```

> Never commit `.env.local` or real keys — `.gitignore` already excludes them.
