# 🙋 Handoffs — things only you (human + IDE agent) can do

This is our shared checklist. The agent commits code and runs Supabase via MCP;
anything needing a browser dashboard, a third-party console, or a real secret
lands here. Check items off as you complete them.

## Legend
- ⏳ waiting on you
- ✅ done
- 🤖 agent will do (listed for visibility)

---

## Environment reference

| Thing | Value |
|-------|-------|
| Live app | https://digital-sanctuary-black.vercel.app |
| GitHub | `Shrinet82/digital-Sanctuary` (`main`) |
| Supabase account | `Supabase 2` |
| Supabase org | `Mad82-ops's Org` (`askjtjjacprsiylfzwwf`) |
| Supabase project | `digital-sanctuary` — ref `lpsyncvegwcycgmgxiui`, region `ap-south-1` (Mumbai) |
| Project API URL | `https://lpsyncvegwcycgmgxiui.supabase.co` |

---

## Phase 0 — Foundations ✅

- [x] ✅ **Connect the repo to Vercel.** Done — live at
      https://digital-sanctuary-black.vercel.app (auto-deploys on push to `main`).

## Phase 1 — Database + Email Auth

- [x] 🤖 SQL migrations written &amp; applied (`0001_core_schema`, `0002_harden_functions`).
- [x] 🤖 Supabase project created in `Mad82-ops's Org`.
- [x] 🤖 Verified: 4 tables, RLS on all, profile auto-created on signup,
      cross-user writes rejected (`42501`), security advisor clean.
- [x] 🤖 Auth pages + middleware + dashboard shell built.

### ⏳ 1. Add the Vercel environment variables — **required for auth to work live**

Vercel → your project → **Settings → Environment Variables**. Add both, for all
environments (Production, Preview, Development), then **redeploy**:

```
NEXT_PUBLIC_SUPABASE_URL = https://lpsyncvegwcycgmgxiui.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxwc3luY3ZlZ3djeWNnbWd4aXVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5MTYyMTksImV4cCI6MjEwMTQ5MjIxOX0.LURO9LbLJFe1LHasvBZEVs0F0O-nwTOIM1QI9eOEzWQ
```

> The anon key is designed to be public — it's safe in the browser because
> Row-Level Security is what actually protects the data. The **service role
> key** is the secret one; we don't need it yet.

### ⏳ 2. Decide: email confirmation on or off?

Right now Supabase requires users to confirm their email before they can sign in,
and the built-in email sender is rate-limited (a few per hour) — which makes
testing slow.

**Recommended for now:** Supabase → **Authentication → Sign In / Providers →
Email** → turn **"Confirm email" OFF**. Signup then logs you straight in.
Turn it back on before any real launch (or wire a proper email provider).

### ⏳ 3. Set the Site URL for auth redirects

Supabase → **Authentication → URL Configuration** → set
**Site URL** to `https://digital-sanctuary-black.vercel.app`
(add `http://localhost:3000` under Redirect URLs for local dev).

## Phase 3 — Worksheet Engine ✅

- [x] 🤖 `worksheet_templates` registry table + RLS (read-only to users).
- [x] 🤖 `WorksheetPlayer` renders any template; 4 worksheets shipped as JSON.
- [x] 🤖 Verified: adding a JSON file creates a new worksheet with zero code changes.

### 🚫 Leaked-password protection — not available on Free

Supabase's advisor suggests it, but the HaveIBeenPwned check is a **Pro-plan
feature**. Deliberately parked: sign-up hardening is not the priority while the
product itself is being built. Revisit if/when the project moves to Pro, or
before any real public launch.

### 🔜 Later — Google OAuth (deferred)

When we add it: create an OAuth client in Google Cloud Console, paste the client
id/secret into Supabase → Auth → Providers → Google. Not needed yet.

---

## Local development (for your IDE)

```bash
npm install
cp .env.example .env.local     # then paste the two values above
npm run dev                    # http://localhost:3000
npm run build                  # production build check
npm run typecheck              # TypeScript check
```

> Never commit `.env.local` or real keys — `.gitignore` already excludes them.

## What to QA once env vars are set

1. Visit `/signup`, create an account → you should land on `/dashboard`.
2. Sign out, sign back in at `/login`.
3. Visit `/dashboard` while signed out → should redirect to `/login`.
4. Check Supabase → Table Editor → `profiles` — your row should be there.
