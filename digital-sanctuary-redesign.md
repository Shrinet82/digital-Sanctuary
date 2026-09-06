# Digital Sanctuary — Product Redesign v2

**A complete overhaul spec.** Everything below replaces the current product plan. Where something already exists in the codebase it's marked `[built]`, `[rebuild]`, or `[new]`.

Status: proposal · Owner: Shashwat Pratap Singh · Region: India-first

---

## 0 · The short version

Digital Sanctuary is a private, deterministic, no-AI web app for people living with anxiety, low mood, ADHD, or substance use — usually more than one at once.

It does three things:

1. **Holds you through a bad moment** — you open it in distress and are doing something useful within fifteen seconds.
2. **Remembers your days without asking much of you** — a tap-first log that becomes a picture of your year.
3. **Shows you your own patterns** — what actually helps *you*, learned from what you did, not guessed at.

Nothing in it grades you. Nothing resets. Nothing guesses.

### What changes from v1

| v1 | v2 |
|---|---|
| Check-in feeds the recommender, then vanishes | Check-in **is** the daily log entry |
| A library of 11 modules, no starting point | A fixed 14-day Path, then the library opens |
| Narrow AI for rewording and recaps | **Zero AI.** Everything authored or rule-based |
| Regex crisis guard on free text | Guard deleted; free text minimised by design |
| Generic crisis directory | Personal **Safety Net** the user writes in advance |
| Planning tools for urges | **Ride the Wave** — a timed container for the urge itself |
| Modules grouped by diagnosis | Grouped by **state**: "I can't calm down / can't start / feel nothing / want to use" |
| Insights need weeks of data | First reflection lands on day 3 |
| No retention mechanic | The **Year Grid** — accumulating, never breaking |

---

## 1 · Positioning

**The one-line pitch:** A quiet place that asks how you are, gives you one thing to do, and remembers — so you can see what actually helps you.

**Not the pitch:** "Replaces four apps." That's an investor slide. It invites a comparison we can't win (our breathing exercise will never beat Calm's) and nobody wakes up wanting to consolidate their app stack.

**What we're actually the only one doing:**

- The four conditions travel together in real people and are separated by every app on the market. One check-in feeds all of them.
- Nothing here guesses about you. Every suggestion comes from a rule you can read on screen.
- A lapse costs you nothing. No streak, no reset, no score.
- Your data leaves in one tap and dies in one tap.

**Who it's for.** Adults in India who are managing themselves — between therapists, waiting for one, priced out of one, or supplementing one. English-only, permanently: the people we're building for function in English on their phones, and this isn't a phase-1 gap awaiting a later pass. Decided by the founder in consultation with the consulting psychiatrist. See §18.

**Who it's not for.** People in acute crisis needing a human. We route those out fast and honestly, and never pretend to be treatment.

---

## 2 · Design principles

These are veto rules. If a feature breaks one, the feature loses.

1. **Deterministic or it doesn't ship.** Every output traces to a rule or an authored string. If a user asks "why did it say that?", we can show them the exact reason.
2. **Tap before type.** Every entry point has a version that requires no writing. Typing is always the top rung of a ladder, never the first step.
3. **Never grade a person.** No streaks, scores, percentages, pass/fail, or "you missed 3 days."
4. **Nothing resets.** History accumulates. A gap is a gap, not a failure.
5. **Fifteen seconds to useful.** From cold open to doing something helpful.
6. **The exit is always visible.** Every screen has a way out that doesn't lose your work.
7. **Say what you don't know.** No fake precision, no invented crisis numbers, no "we noticed you're feeling…" from three data points.
8. **The user owns everything.** Export and delete are one tap, never buried, never behind a paywall.
9. **We invent no methods.** Every module implements a named, published, trialled protocol. If we can't cite who developed it and what the evidence says, it doesn't ship. See §17.

---

## 3 · The core loop

```
        OPEN
          │
    ┌─────┴─────┐
    │  URGENT?  │──── yes ──▶  Safety Net → Safety Gateway
    └─────┬─────┘
          │ no
          ▼
    ┌───────────────┐
    │  THE CHECK-IN │   4 taps · ~15 seconds
    │  How are you? │   ── writes the day's log entry ──▶ YEAR GRID
    └───────┬───────┘
            │
            ▼
    ┌───────────────┐
    │ ONE NEXT STEP │   deterministic rule + visible reason
    │  + 2 others   │   + "just pick for me"
    └───────┬───────┘
            │
            ▼
    ┌───────────────┐
    │   DO THE THING│
    └───────┬───────┘
            │
            ▼
    ┌───────────────┐
    │  HOW WAS THAT?│   1 tap: helped / a bit / not really
    │  + Journal?   │   ── optional, gradual ──▶ THE LEDGER
    └───────┬───────┘
            │
            ▼
        PATTERNS      (unlocks day 3, deepens over weeks)
```

**The single most important structural change:** the check-in and the mood log are one action. In v1 they were separate ideas; the check-in served the recommender and was thrown away. Now one interaction does both jobs, which means the tracker costs the user nothing extra and the recommender gets richer data.

---

## 4 · Information architecture

Five destinations. Not more.

```
┌──────────────────────────────────────────────┐
│  ⚡ URGENT              (persistent, always)  │
├──────────────────────────────────────────────┤
│  🏠 Today      — check-in, next step, path   │
│  📔 Ledger     — year grid, journal, days    │
│  🧰 Toolkit    — all modules, by state       │
│  📈 Patterns   — what helps you              │
│  ⚙️ You        — safety net, vault, data     │
└──────────────────────────────────────────────┘
```

**Today** is the default and 80% of sessions end there.
**Toolkit** is browsable but never the entry point — the check-in is.
**Urgent** is a persistent element on every screen, not a tab. One tap, no confirmation, no chatbot in the way.

---

## 5 · The Check-In `[rebuild]`

Four taps, one optional. Designed so a person in a bad state can complete it without reading carefully.

**Screen 1 — the bean.** Five states as illustrated characters, not numbers. Tap one.
`Rough · Low · Flat · Okay · Good`

**Screen 2 — what's loudest right now?** Multi-select, max three, big targets:
`Anxious · Can't start · Empty · Craving · Restless · Angry · Numb · Overwhelmed · Can't sleep · Fine`

**Screen 3 — context chips.** Optional, tap what applies. User-customisable set.
`Slept badly · Ate · Moved · Saw someone · Alone all day · Work · Family · Money · Health · Screen all day`

**Screen 4 — what would help?**
`Calm me down · Help me start · Lift me a bit · Get through this urge · Just log it · Surprise me`

That's it. "Just log it" ends the flow immediately — the log is valid on its own and the app never nags someone into an exercise.

**Design notes**
- Sliders are gone. Tapping a face is faster and less cognitively expensive than positioning a slider, and it maps better to how people actually assess themselves.
- Everything is optional except screen 1.
- Multiple check-ins per day are allowed and encouraged. The Year Grid shows the day's dominant state; the Ledger shows all of them.

---

## 6 · The Ledger `[new]` — mood tracker + gradual journal

The Ledger is the memory of the product. Two views over the same data.

### 6.1 The Year Grid

365 small squares, coloured by that day's state. Empty days are pale, not red. Tap any square to open that day.

This replaces streaks entirely. It is an artifact that accumulates and becomes more meaningful the longer you use it. A gap in it reads as a gap — not a broken chain. There is no counter anywhere, no "longest run," no notification about a missed day.

Also available as a month view (larger squares, activity icons visible) and a week strip on the Today screen.

### 6.2 The Gradual Journal — the ladder of disclosure

The core idea: **every rung is a complete, valid entry.** Nobody ever faces a blank page.

```
Rung 0   Tap a face                    → entry exists
Rung 1   Tap context chips             → entry has texture
Rung 2   One word                      → "tired"
Rung 3   One sentence                  → prompted, single line
Rung 4   Guided fields                 → 3 short authored prompts
Rung 5   Free page                     → blank, if you want it
```

The app offers rung *n+1* only after you complete rung *n*, and never scolds you for stopping. On a rough day, rung 0 is the whole entry and that's fine.

**Rung 3 prompts** rotate deterministically — seeded by the date, drawn from an authored bank of ~200. Day *N* always shows the same prompt, so it's reproducible and testable. Examples of the register we want: *"What took the most out of you today?" · "Anything go slightly better than expected?" · "Who did you speak to?" · "What did today ask of you?"*

**Rung 4** is three fixed short fields: *what happened · what it felt like in your body · one thing you'd tell a friend in the same spot.*

**Attachments:** one photo, optional. Voice note in a later phase (stored, never transcribed — we have no AI and won't pretend to).

### 6.3 Day view

Opening a square shows: the state, the chips, any journal rungs completed, any modules done that day and how they went. Editable. Deletable, per-entry, without a confirmation lecture.

---

## 7 · Ride the Wave `[new]` — the missing module

The single biggest gap in v1. There were tools to *plan* for an urge and tools to *review* one afterwards, and nothing to hold someone *during* it.

**Protocol:** urge surfing (Marlatt & Gordon, *Relapse Prevention*, 1985).

**The premise, stated to the user in one line:** an urge is a wave — strongest right when it starts, and it passes whether or not you act on it. You don't have to fight it. You have to outlast it.

**The flow**

1. **What are you riding?** `Craving · Panic · The urge to lash out · The urge to disappear · Something else`
2. **How long have you got?** `2 minutes · 5 minutes · 15 minutes`
3. **What kind of thing?** `Comfort · Distract · Move · Express · Just pick for me`
4. A single authored activity appears with a **visible countdown**. Big timer. One activity, no menu.
5. At the end: **"You rode it out."** Then one tap — `gone · quieter · still here`.
6. If *still here*: offer one more round, or the Safety Net. Never a dead end.

**Rules for the activity bank**
- Every activity is authored by us, reviewed, and sits in a versioned content file.
- **Nothing involving pain, cold shock, physical discomfort, or sensory punishment.** Those circulate widely in this genre and they are substitution, not regulation. They don't go in our bank.
- Every activity is doable in a small room, alone, on a phone, without equipment or money.
- "Just pick for me" is prominent — decision load is the symptom.

**No streaks here.** Some apps in this space count consecutive resisted urges and hand out awards. That converts a hard night into a scoreboard you can lose. We don't.

**Scope note (open decision):** this pattern is borrowed from tools built for self-harm urges. We're building it for craving, panic, and overwhelm. Whether Digital Sanctuary names self-harm as a supported lane is a separate decision requiring clinical review and a different duty of care — see §17.

---

## 8 · The Safety Net `[new]`

The calm version of you writes instructions for the version of you in trouble. Built once, edited anytime, shown at every crisis exit.

Four sections, all in the user's own words:

| Section | Prompt | Example content |
|---|---|---|
| **Signs** | What does it look like when I'm heading downhill? | *Stop replying to messages. Sleep goes. Skip meals.* |
| **Things that have worked** | Not what should work — what has | *Walk to the shop. Cold shower. Call Ankit.* |
| **People** | Name + number. One tap to call | *Ankit · Mum · Dr. Rao* |
| **Lines** | Verified services for my region | Auto-filled, editable |

**Why this matters more than a generic directory:** a national helpline number is correct and impersonal. A screen that says *"Last time this happened, walking to the shop helped. Ankit's number is here."* — in the user's own handwriting — is the difference between a resource and a rescue.

Prompted during onboarding (skippable), and again the first time someone completes a Ride the Wave or a Lapse Review.

---

## 9 · The Path `[new]` — first 14 days

Solves the cold-start problem: eleven modules in a library is paralysing on day one, which is unfortunate for a product built to fight paralysis.

A **fixed, authored, identical-for-everyone** sequence. Not adaptive, not personalised — that would be guessing.

| Day | What arrives | Why it's there |
|---|---|---|
| 1 | Check-in + Ground & Settle | Prove the loop works |
| 2 | Check-in + Year Grid explained | Show the artifact forming |
| 3 | Check-in + **first reflection** | Value before week two |
| 4 | One Small Action | First win |
| 5 | The Safety Net | Build it while calm |
| 6 | Ride the Wave (practice run) | Learn it before needing it |
| 7 | **Week one, looked back at** | The first real payoff |
| 8 | Card Deck intro | Self-affirmation, framed honestly (see §11) |
| 9 | Task Decomposer | The ADHD lane |
| 10 | Journal rung 3 | Nudge up the ladder |
| 11 | Values to Action | Meaning, not motivation |
| 12 | Time Container | Structure |
| 13 | Full Toolkit unlocks | Now you know what's in it |
| 14 | **Your first fortnight** | Close the loop, hand over the keys |

Fourteen days is a *finite* commitment — a defined thing you can finish, not "use this forever." Skippable at any point ("show me everything now"). Nothing is locked; the Path only controls what's *offered*, never what's *reachable*.

---

## 10 · The Toolkit — full module catalog

Reorganised by **state**, not diagnosis. Nobody opens an app thinking "I'd like an ADHD intervention." They think "I can't start."

Build status: `[built]` exists · `[rebuild]` exists, needs rework · `[new]` doesn't exist

### 🌊 "I can't calm down"

| Module | What it does | Status |
|---|---|---|
| **Ground & Settle** | 60–180s paced breathing, longer exhale, before/after tap | `[built]` |
| **Ride the Wave** | Timed container for an urge or spike | `[new]` |
| **5-4-3-2-1** | Guided sensory countdown | `[new]` |
| **Body Settle** | Progressive muscle release, audio-optional | `[new]` |
| **Cool the Storm** | Paced breathing + slow movement + release (DBT-derived, no physical shock) | `[new]` |

### ⚡ "I can't start"

| Module | What it does | Status |
|---|---|---|
| **What's Blocking Me?** | Name the friction → routed to the right tool | `[new]` ← *entry point for this whole lane* |
| **Task Decomposer** | One goal → micro-steps, first step under 2 minutes | `[rebuild]` (AI removed) |
| **Priority Lens** | Sort Now / Schedule / Shrink / Let go → capped at 3 | `[built]` |
| **Time Container** | Visible timer, start ritual, finish note, free restarts | `[built]` |
| **Energy-Aware Week** | Capacity-first planner, drop anything without penalty | `[built]` |
| **Focus Setup** | Environment checklist before you start | `[new]` |

### 🌻 "I feel nothing / everything's heavy"

| Module | What it does | Status |
|---|---|---|
| **One Small Action** | One achievable, pleasant, or connecting thing | `[rebuild]` (AI removed) |
| **Values to Action** | A value → one 2-minute voluntary step | `[built]` |
| **Before / After** | Rate mood around an action; watch doing lift you | `[new]` |
| **Opposite Action** | Small move against the pull to withdraw | `[built]` |
| **Gentle Rhythm** | Rebuild routine without a rigid schedule | `[new]` |

### 🌀 "My head won't stop"

| Module | What it does | Status |
|---|---|---|
| **Card Deck** | Swipe away unhelpful self-talk, keep the supportive — self-affirmation, not a claimed treatment (see §11) | `[new]` |
| **Worry Sorter** | Actionable / uncertain / needs real help → routed | `[new]` |
| **Thought Record** | 5-step CBT diary, full version | `[rebuild]` (AI removed) |
| **Worry Window** | Park a worry to a set time, refocus card meanwhile | `[new]` |
| **Problem Ladder** | Vague dread → one doable move | `[new]` |
| **Behavioural Experiment** | Test a feared prediction, with a safety gate | `[built]` |

### 🧭 "I want to use" — the Vault

Non-stigmatising. Reduction, safer use, abstinence, and just-learning are equally valid goals with no ranking. Lives behind its own consent gate (§14).

| Module | What it does | Status |
|---|---|---|
| **Safety Gateway** | Verified emergency + overdose routes, no barrier | `[built]` |
| **My Goal, My Direction** | You set the goal. No moral hierarchy | `[built]` |
| **Trigger & Alternative Map** | Map triggers, pre-choose an alternative | `[built]` |
| **Mooring Lines** | Weekly protective anchors. Counts, never scores | `[built]` |
| **Lapse Learning Review** | Non-punitive: what happened, what helped, one adjustment | `[built]` |
| **Context Log** | Optional private logging. Never procurement details | `[new]` |

**Totals:** 15 built or near-built · 18 new · **33 modules at full scope.** The v1 docs claimed "30+" against 11 real — this catalog is now honest about which is which, and the README must match it.

---

## 11 · The Card Deck `[new]`

CBT delivered as a swipe, not a form. Sixty seconds, no typing, fully authored.

You're shown a short statement. Swipe **left** to discard it, **right** to keep it.

- *"If I can't do it perfectly there's no point."* → discard
- *"I've done hard things before."* → keep
- *"Everyone can tell I'm struggling."* → discard
- *"Feeling this doesn't mean it's true."* → keep

Fifteen cards per session. The bank is authored per theme (perfectionism, catastrophising, self-blame, mind-reading, all-or-nothing), rotated by date seed. Cards are never generated.

**Decision (owner + consulting psychiatrist, logged here):** this maps to Cognitive Bias Modification, a mechanism whose formal trial evidence is weak — see §17. It ships anyway, on a different footing than the rest of the catalog: **framed to the user as self-affirmation, not as treatment.** Nobody is told this changes their thinking. It's positioned as what it plainly is — a moment of reaffirming things you already know about yourself, in a format that's quick and doesn't ask you to write anything. Copy must never claim it as clinically effective; it's a pseudo-therapeutic ritual, not a mechanism of change, and the in-app framing has to say so plainly.

**Why this earns its place:** the Thought Record is a five-field form, and a five-field form is the wrong ask for someone at their least capable. The deck is a tenth of the effort with the same mechanism, and it's the on-ramp to the full worksheet for people who'd otherwise bounce off it.

---

## 12 · Patterns `[rebuild]`

Reflection, not prediction. It describes; it never diagnoses, forecasts, or advises.

**Day 3 — first reflection.** Deliberately modest, deliberately early: *"Three days logged. Two were flat, one was okay. The okay one, you'd slept."* That's it. Getting *something* back on day 3 is what stops the app dying in week one.

**Day 7 — the week.** The grid strip, states counted, modules done and how they went.

**Day 14 onward — What Helps You.** Ranked by the user's own after-ratings. *"Ground & Settle: helped 7 of 9 times."* Requires at least 4 data points before a tool appears — below that we show nothing rather than pretend.

**Things You Might Notice.** Co-occurrence only, stated as co-occurrence: *"Six of your seven roughest days had 'slept badly' on them."* Never *"poor sleep is causing your low mood."* We are not making a claim about cause and the copy must never imply one.

**What is never on this page:** streaks, scores, percentages, a "wellness index," comparisons to other users, or any sentence beginning "you should."

---

## 13 · Determinism — how everything decides

The whole engine, written out. This section is the product's differentiator, so it's specified rather than implied.

### The recommender

A single ordered rule chain, evaluated top to bottom, first match wins:

```
1. urgent flag              → Safety Net
2. state = Rough + Craving  → Ride the Wave
3. state = Rough            → Ground & Settle
4. want = Get through urge  → Ride the Wave
5. want = Calm me down      → Ground & Settle
6. want = Help me start     → What's Blocking Me?
7. want = Lift me a bit     → One Small Action
8. loudest = Can't start    → Task Decomposer
9. loudest = Anxious        → Card Deck
10. want = Surprise me      → date-seeded pick from eligible set
11. fallback                → One Small Action
```

Every result renders with its reason in plain words: *"You said you're craving and it's rough right now — this is the one for holding on."* Plus two alternatives and a "something else" escape.

### Daily rotation

Anything that varies day to day — journal prompts, deck cards, Path content, activity picks — is selected by `hash(date + userId) % bankSize`. Reproducible, testable, no randomness anyone has to trust, and identical on every device.

### What we deleted

| Was | Now |
|---|---|
| AI task rewording | Authored verb-template bank + splitting rules |
| AI worksheet recap | Show the user their own sentences back, verbatim |
| AI note summarising | Removed. The note is the note |
| Regex crisis guard | **Deleted with the AI it protected** |

**The safety argument for removing AI is stronger than the cost argument.** That guard existed only to stop a model from encountering risk content — and it was the highest-stakes, most fragile code in the repo. Remove the model and the entire failure mode disappears. The tap-first redesign shrinks the free-text surface further, which shrinks the risk surface again.

**The pitch line:** *Nothing here guesses about you. Every suggestion comes from a rule you can read.* No competitor in this category can say that.

---

## 14 · Privacy, data, ownership

**Default posture.** Account optional. No local-only or offline mode: this is a website, not a native app, and a browser can't promise reliable on-device-only storage the way a native app could. Decided by the founder in consultation with the consulting psychiatrist — not being revisited unless the product becomes a native app. See §18.

**The Vault.** Substance-use data sits behind an explicit consent gate enforced at the database policy level, not in the UI. Without an active consent record the rows are unreadable *even to their owner*. Revoke freezes; delete is a separate, deliberate act. This already works and must survive the overhaul untouched.

**Passcode lock** on the Ledger and the Vault, independent of login.

**Export** — one tap, everything, readable JSON plus a printable PDF.
**Delete** — one tap, irreversible, no retention period, no "are you sure you want to lose your progress?" dark pattern.

**Never collected:** contacts, location, ad identifiers, third-party analytics on any screen containing personal content.

Sanvello is the cautionary tale here: it became AbleTo SelfCare+ and users reported a confusing redesign, missing features, and lost data. Data ownership isn't a compliance checkbox for this audience — it's a marketing position.

**Regulatory:** India's DPDP Act 2023 applies, and substance-use records are about as sensitive as personal data gets. The education-not-treatment boundary needs a written, reviewed position — not a bullet in a README.

---

## 15 · Tone and copy rules

The copy *is* the product. Rules, not vibes:

- **Second person, present tense, short sentences.** "You said it's rough right now."
- **Never congratulate for compliance.** Not "great job logging 5 days in a row!"
- **Never imply failure.** No "you missed," "you broke," "get back on track."
- **Name the hard thing plainly.** After a lapse review: *"Nothing was reset and nothing counts against you. You looked at it honestly, which is the hard part."* That line already exists in the codebase and it's the register for everything.
- **No therapy-speak, no wellness-speak.** No "journey," "warrior," "self-care ritual," "hold space."
- **No exclamation marks** outside genuine celebration, which is rare.
- **Uncertainty stated, not hidden.** "We don't have a verified line for your region yet" beats a plausible wrong number.

---

## 16 · Visual direction — candy neo-brutalism

The existing theme stays. It is not a placeholder to be softened later; it's a deliberate rejection of the muted-pastel wellness aesthetic and it is correct for this product.

**Why chunky beats calm here.** High contrast and heavy outlines *reduce* cognitive load — a person at their least capable shouldn't have to work out what's tappable. The border-and-shadow vocabulary makes every interactive element unmistakably a thing you press. The style pulls the user toward doing and touching rather than reading and deciding, which is exactly the behaviour the product needs.

### The tokens (already built)

| | |
|---|---|
| **Ground** | `#FBF2E4` warm cream + dotted radial texture, 26px grid |
| **Surface** | `#FFFDF8` card · `#F5EBDD` recessed |
| **Ink** | `#191323` · soft `#4A4159` · faint `#7E7490` |
| **Primary** | violet `#8B5CF6` · soft `#E9DFFD` · deep `#6D3FE0` |
| **Accents** | teal `#2FC6B0` · coral `#FF6B5E` · yellow `#FFD84D` · sand `#FFEBAE` · mint `#CDF3EA` |
| **Borders** | 2.5px ink, everywhere |
| **Shadows** | `5px 5px 0` ink, zero blur · sm `3px` · lg `8px` |
| **Radius** | 22px cards · 14px buttons |
| **Display** | Bricolage Grotesque 800, `-0.02em`, line-height 1.1 |
| **Body** | Space Grotesk |
| **Marker** | yellow highlight sweep on `.ds-hl`, and as `::selection` |

### Motion

**Average, not slow.** Snappy and physical — the press translate on `.ds-btn` is the signature and it stays. Screen transitions get a little more weight than the buttons do, but nothing should feel sluggish. Reduced-motion is already respected globally.

### No dark mode

Deliberate, and worth stating in the README so nobody files it as a bug.

The reasoning: someone opens this at 3am because the room and the night and their head are all already dark. Handing them a dark grey interface matches the mood instead of interrupting it. A warm, bright, colourful screen is a small light in the room — something to look into and briefly lose the surroundings in. The one place the industry defaults to dark is the one place it's wrong.

### The rest

- **Illustrated mood characters, not emoji.** Thick outlines, flat fills, hard shadows — native to this style. The Rough state must look genuinely rough, not a frowny face. This is the app's identity and the one place to spend design money.
- **The Year Grid is the hero image.** 365 chunky bordered squares. It's what a user screenshots and shows a friend.
- **Large tap targets everywhere.** Assume shaking hands, tears, 3am, one thumb. The border-and-shadow language already forces this.
- WCAG AA minimum — which the ink-on-cream palette clears comfortably.

### The quiet variant `[new tokens]`

Crisis surfaces — Safety Net, Safety Gateway, and the Ride the Wave countdown — need a calmer register of the *same* system, not a different one. Same cream, same borders, same fonts:

- shadow drops to `pop-sm`, no hover translate
- accents pull back to `violet-soft` / `mint`
- **new token needed:** the Ride the Wave timer must not read as alarm. Coral is wrong — it says emergency, and this screen's whole message is "this passes." Propose a `wave` token in the teal→violet range, plus `wave-soft` for the track behind the countdown.

---

## 17 · Evidence policy — we invent nothing

**The rule:** every module implements a protocol that already exists, was developed by named clinicians or researchers, and has been trialled on people. We adapt the delivery; we do not author the method. If we can't point to who made it and what the trials found, it doesn't ship.

This is not caution for its own sake. An untested method delivered confidently to someone at 3am is the single worst thing this product could do.

### The evidence register

Every module gets a row before it gets a ticket. No row, no build.

| Field | Example |
|---|---|
| Protocol | Urge surfing |
| Origin | Marlatt & Gordon, Relapse Prevention (1985) |
| Evidence | Established within relapse-prevention packages; weaker as a standalone component |
| Source | Published manual + subsequent RCTs of RP |
| Our adaptation | Timed container, self-rated after |
| Grade | **B** |

**Grades:** **A** — multiple RCTs / guideline-recommended (NICE, WHO, APA). **B** — trialled, used clinically, evidence real but thinner or component-level. **C** — widely practised, weak formal evidence. **D** — no evidence base. *Nothing graded D ships. Anything graded C ships only with a clinician's sign-off and honest in-app framing.*

### First pass at the catalog

Rough grades, to be confirmed by a qualified reviewer:

| Lane | Protocol behind it | Grade |
|---|---|---|
| Ground & Settle | Paced breathing, extended exhale | B |
| Ride the Wave | Urge surfing (Marlatt) | B |
| 5-4-3-2-1 | Sensory grounding | **C** — ubiquitous, thin formal evidence |
| One Small Action, Before/After, Gentle Rhythm | Behavioural Activation | **A** |
| Values to Action | ACT values work | A |
| Opposite Action | DBT emotion regulation | A |
| Thought Record | Beckian cognitive therapy | **A** |
| Behavioural Experiment | CBT behavioural experiments | A |
| Worry Window | Stimulus-control worry postponement (Borkovec) | B |
| Worry Sorter | Worry classification, GAD protocols | B |
| Task Decomposer, Priority Lens, Time Container, Focus Setup | CBT for adult ADHD (Safren) | **A** |
| Energy-Aware Week | Activity scheduling / pacing | B |
| Trigger & Alternative Map | Implementation intentions (Gollwitzer) | **A** |
| My Goal, My Direction | Motivational Interviewing + harm reduction | A |
| Lapse Learning Review | Relapse prevention, lapse-vs-relapse framing | A |
| Mooring Lines | Protective-factor monitoring | B |
| **Card Deck** | Cognitive Bias Modification | **C — shipped as self-affirmation, not treatment; see below** |

### Two calls made on grade-C items — decided, not defaulted

Both of these came back grade C: real evidence gap, no proper trials, wide informal use. The policy's own rule is that grade C ships only with a clinician's sign-off and honest framing — it doesn't say "cut it." Both were reviewed against that bar and kept.

**Card Deck.** Swipe-to-reject-a-thought is Cognitive Bias Modification, and the formal evidence for it as a treatment mechanism didn't hold up under later, better trials. Decision: **ship it, but never call it treatment.** It's framed to the user as self-affirmation — a quick, honest ritual of reminding yourself what you already know, not a claim that swiping rewires anything. That framing is what makes it compatible with the evidence policy: we're not asserting a therapeutic effect we can't back up, we're offering a feel-good, low-effort moment and saying exactly that.

**5-4-3-2-1.** Ubiquitous, genuinely under-studied, no red flags. Decision: **ship it as a normal toolkit item**, same footing as anything else grade B or above. It doesn't need a lane built around it, but it also doesn't need to be hedged or downplayed in the app — it's standard practice, not a risk.

### Where to source

The good news is that the underlying protocols are mostly free and public: NICE guidelines, WHO mhGAP and *Doing What Matters in Times of Stress*, NHS and Australian government self-help materials, university psychology-tools libraries, published treatment manuals, and open-access trial literature.

Three cautions:

1. **Free ≠ unlicensed.** Many *instruments* are copyrighted. PHQ-9 and GAD-7 are free to use; several well-known inventories are not, and require paid licences. Check each one before it goes near the codebase.
2. **A validated protocol delivered digitally is not itself validated.** We can honestly say "this is based on X, which has been trialled." We cannot say "this app is proven to work." Copy must hold that line exactly.
3. **Adaptation drift.** Every simplification we make for a phone screen moves us away from the trialled version. The register's "our adaptation" field exists to make that drift visible and reviewable.

### Clinical review is now a dependency, not a nice-to-have

Under this policy, launch requires a qualified reviewer to sign off the register and every authored bank — cards, activities, prompts, the Path. Find the reviewer early; it shapes what gets built, not just what gets approved.

**Status: signed off.** The founder has personally reviewed and signed off on the therapy content and the evidence register above, in consultation with the consulting psychiatrist. Recorded internally in `docs/HANDOFFS.md` — this is not published on the site, and it isn't a substitute for the fuller external clinical review process should one happen later. Any new module or authored bank added after this sign-off still needs to go through this same register-and-signoff step before it ships; the sign-off covers what exists today, not what gets added next.

---

## 18 · Open decisions

**Settled:**

- ~~Money~~ — self-funded. No ads, no subscription, no paywall. Free because the point is helping people.
- ~~Dark mode~~ — not building it. See §16.
- ~~Motion~~ — average and physical, not slow.
- ~~Visual direction~~ — candy neo-brutalism stays.
- ~~Card Deck~~ — ships, framed as self-affirmation, not treatment. Decided with the consulting psychiatrist. See §17.
- ~~5-4-3-2-1~~ — ships as a standard toolkit item, no special hedging needed.
- ~~Finding the clinical reviewer~~ — done. A consulting psychiatrist is engaged, and the founder has reviewed and signed off on the therapy content and evidence register. See §17.
- ~~Hindi~~ — not building it. English-only is a permanent decision, not a phase-1 gap: the people we're building for function in English on their phones. Decided by the founder in consultation with the consulting psychiatrist.
- ~~Local-only / offline mode~~ — not building it. This is a website, not a native app, so reliable on-device-only storage isn't available the way it would be in a native app. Not being revisited unless that changes. Decided by the founder in consultation with the consulting psychiatrist.

**Still open:**

1. **Self-harm scope.** Ride the Wave borrows its structure from tools built for self-harm urges. Do we name that lane? Materially different duty of care. Default for v2: **no** — build for craving, panic and overwhelm, revisit with the clinical reviewer. Note that under §17 this decision is now easier: the protocols for it exist and are trialled, so the question is purely about duty of care, not about whether we'd be inventing anything.
2. **Distribution.** Still nobody has written a line about how a user hears this exists. Sharper now that it's free — no acquisition cost pressure, but no growth engine either.

---

## 19 · Roadmap

**Phase A — The Spine (4–6 weeks)**
Strip AI and the guard entirely · rebuild the check-in as tap-first · the Ledger, Year Grid, journal rungs 0–3 · rewire the recommender · Safety Net · rewrite README to match reality · tests in the repo and in CI.

**Phase B — The Hold (3–4 weeks)**
Ride the Wave + activity bank · Card Deck + card banks · What's Blocking Me? · 5-4-3-2-1 · Patterns rebuild with the day-3 reflection.

**Phase C — The Path (3 weeks)**
14-day sequence · onboarding · journal rungs 4–5 · Worry Sorter, Worry Window, Before/After.

**Phase D — Depth (4+ weeks)**
Remaining modules · Vault Context Log · passcode lock · export/delete polish · clinical review pass.

**Phase E — Reach**
Regional crisis directory expansion — more verified state and city helplines added to the existing directory over time. (Hindi and local-only/offline mode were considered and are permanently out of scope — see §18.)

---

## 20 · How we'll know it's working

Deliberately *not* DAU, session length, or retention curves — optimising those in this category means optimising for people staying unwell.

| Signal | Why |
|---|---|
| Time from open to first useful action | The core promise. Target: under 15s |
| % of check-ins that lead to a completed module | Is the recommendation any good? |
| % of Ride the Wave sessions ending "gone" or "quieter" | Does the hardest module work? |
| Return rate after a **gap** of 4+ days | The real test of a shame-free product |
| Safety Nets completed | Preparedness, the thing that matters in a crisis |
| Journal ladder progression | Are people climbing rungs over time? |
| **Graceful exits** | People leaving because they're better, and taking their data with them |

That last one is the honest north star. A product like this succeeding sometimes looks like someone not needing it any more.

---

*Digital Sanctuary is not treatment and does not diagnose. It routes to human help, quickly and without obstruction, whenever that's what's needed.*
