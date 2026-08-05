# 9 · Safety & Privacy

This is a mental-health product. The safety and privacy layer isn't a feature we might add — it's the foundation everything else sits on.

## 🛟 Crisis & safety

- **Always-on urgent help** button on every screen.
- **Deterministic routing** — fixed rules (not AI) decide when to surface emergency options. A strong urge, a danger flag, or a red-flag worksheet answer routes straight to real help.
- **Education, not treatment** — clearly stated; we never claim to diagnose or cure.
- **Verified local directory** (`local_resources`) — crisis lines and services are region-specific and human-checked.
- **Substance-use specifics:** overdose concern → emergency services + local naloxone/OORM info; risky withdrawal (alcohol/benzodiazepines) → urgent clinical route. Never give instructions for use, dosing, mixing, withdrawal, or concealment.

## 🔐 Privacy & data

- **Row-Level Security** on every table — you only ever see your own data.
- **Private by default** — journals and worksheets aren't shared with anyone.
- **Export & delete** — one tap to download everything or erase your account (cascades to all user rows + storage).
- **Minimal data** — store the least we can; encrypt sensitive free-text at rest.
- **Substance-use vault** — separate consent, extra restrictions, excluded from general insights unless opted in.
- **Consent ledger** — `consents` records what was agreed and when, with versioned consent text.

## 🤖 The narrow AI allowlist

AI is used in only three tightly-scoped, user-approved ways — never for anything clinical:

1. ✍️ **Rewording your task** into a smaller first step (Task Decomposer)
2. 📝 **Recapping your own worksheet answers** in plain language — you approve before it saves
3. 🗂️ **Neutral summaries** of entries you wrote

**Never:** diagnosing, deciding risk, giving medical/dosing advice, or acting as a therapist. Those always fall back to deterministic rules and human routes.

### AI service boundary (implementation rules)

- Pass only the minimum user-approved fields to the model.
- Use schema-constrained output; never write directly to the plan/database without user confirmation.
- Maintain an allowlist of tasks (reformatting, microstep wording, neutral summaries) and reject anything outside it.
- Reject medication, emergency, dosing, diagnosis, therapy, and risk-disposition prompts → show deterministic escalation instead.
- Log model/version, prompt class, and user acceptance; retain no unnecessary raw text.

## Go / no-go before any public launch

- [ ] Every worksheet has a clinical rationale + reading level + review date.
- [ ] Urgent-support routes tested in each supported region.
- [ ] No critical action depends on an AI response.
- [ ] Data export & delete verified end-to-end.
- [ ] Real usability testing with people who have lived experience (compensated, trauma-informed).
