# 8 · Tracking & Insights

The Bearable/Moodfit half — quietly logging what you do and how you feel, then reflecting it back as **gentle patterns**, never streaks or scores. Motivation through insight, not guilt.

## What we record

- **Before/after ratings** on practices (did the breathing actually help *you*?)
- **Completion states** — done, partly, moved, not today (never "failed")
- **Mood factors** — sleep, meds, movement, custom trackables (Bearable-style)
- **Check-in history** — the 15-second daily snapshot

## What we show back

- **Rolling weekly trends** — soft bar charts, no daily pass/fail
- **"What helps me most"** — your top-rated modules across all conditions
- **Gentle observations** — e.g. "weeks you slept more, mornings felt easier" (shown as observations, never medical claims)
- **Export anytime** — your data is yours to download or delete

## Deliberately absent (these omissions are features)

- ❌ No streaks / "you broke your 12-day chain"
- ❌ No productivity scores
- ❌ No push notifications that could expose you in public
- ❌ No comparison to other users

The research is clear that shame mechanics backfire for exactly our audience.

## Insights are rules, not AI guesses

Every pattern shown is computed by **transparent rules on your own numbers** — the same "deterministic by default" principle as everywhere else. We never let an AI invent a correlation or imply a diagnosis. If a trend is shown, the user can see exactly why.

## Data model touchpoints

Trends read from `practice_sessions`, `daily_checkins`, and `mood_factors`. The "what helps me most" view ranks modules by user-marked helpfulness across tables — **excluding** the substance-use vault unless the user has opted that data in.
