# 3 · Login & Accounts

Mental-health apps live or die on the first 30 seconds. Ours lets you start **without an account at all**, then gently offers to save your progress. Nobody hands over an email before they've felt any benefit.

## Three ways in

| Mode | What happens |
|------|--------------|
| **👤 Guest** | Open the app and use it with zero signup. Data lives temporarily in the browser only. |
| **✉️ Email & Google** | Ready to keep your history? Sign up with email + password or one-tap Google. Handled by Supabase Auth. |
| **🔀 The merge** | When a guest signs up, everything they did as a guest moves into their new account automatically. No lost progress. |

## How the guest → account merge works

1. Guest actions are tagged with a temporary `anon_id` stored in the browser.
2. On signup, one Supabase **Edge Function** runs: "re-assign every row with this `anon_id` to my new `user_id`."
3. The browser clears the temp id. The thought record from five minutes ago is now permanently theirs.

> **Plain terms:** try before you commit, and nothing you did gets thrown away when you decide to stay.

## Auth details

- **Provider:** Supabase Auth (email/password + Google OAuth).
- **Sessions:** JWT access token in an httpOnly cookie; refresh handled by the Supabase client.
- **Profile row:** on first sign-in we create a `profiles` row (see [docs/04-database.md](./04-database.md)) holding language, accessibility, and module-visibility preferences.
- **Deletion:** account deletion cascades to every user-owned row and clears storage (see [docs/09-safety-and-privacy.md](./09-safety-and-privacy.md)).

## Accessibility from day one

Sign-in and onboarding respect: reduced-motion, keyboard-first navigation, dyslexia-friendly type option, and an anonymity/private-practice mode that saves nothing.
