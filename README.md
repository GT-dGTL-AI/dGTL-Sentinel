# dGTL Sentinel

**AI-Powered Policyholder Transaction Risk Intelligence Platform**
*"See the signal before it becomes a loss."*

Built by dGTL — Digital & Analytics Practice, Grant Thornton Bharat LLP

---

## What This Is

dGTL Sentinel is a risk intelligence platform for BFSI institutions — particularly **life insurance and pension providers** — that helps risk teams catch suspicious policyholder withdrawal and account-access activity before it turns into a loss.

Today, most insurers and pension providers rely on manual, spreadsheet-driven review to catch this kind of activity: an analyst notices something odd, pulls a few reports, cross-checks a couple of systems, and eventually escalates or clears the transaction. It works, but it's slow, inconsistent between analysts, and easy for weak signals to fall through the cracks — especially when a single case only *looks* suspicious once you connect three or four unrelated data points.

Sentinel replaces that spreadsheet workflow with a single guided system: it watches transactions, scores them against a policyholder's own behavioural history, explains *why* something was flagged in plain language, and gives analysts one place to investigate and close the case.

> **This is a client-facing demo build.** Every screen, workflow, risk score, and AI-generated narrative runs against a realistic seeded dataset, entirely in the browser — there is no backend, no database, and no live LLM API call. See [How the Demo Works](#how-the-demo-works-important) below for exactly what's simulated and why.

---

## The Problem It Solves

Pension and annuity withdrawals are an attractive target for fraud precisely because they're infrequent and high-value — a policyholder might interact with their account only a few times a year, which means there's no "normal daily pattern" to lean on the way a bank might for card transactions. Fraud typically shows up as one (or a combination) of these patterns:

- A withdrawal that's wildly out of line with how this specific policyholder normally behaves
- Account access from a new device, IP, or location on an account that's usually accessed the same way every time
- A withdrawal pushed through a channel, time, or frequency the policyholder has never used before
- A string of smaller withdrawals that, individually, stay under the radar but add up to something large ("structuring")
- A gradual drift in withdrawal size, frequency, or destination account that looks nothing like the policyholder's history

Individually, each of these signals is weak — plenty of legitimate reasons exist for any one of them. The risk (and the fraud) is in the *combination*. Manual review struggles here because spotting a 3-way correlation across systems that don't talk to each other takes time analysts don't have, especially at volume.

## How Sentinel Addresses It

1. **It scores every signal against the policyholder's own history, not a generic rule.** A ₹2 lakh withdrawal might be completely normal for one policyholder and wildly anomalous for another — Sentinel's baseline is per-account, not portfolio-wide.
2. **It correlates signals instead of reviewing them in isolation.** The five detection scenarios below (§ Detection Scenarios) each contribute to one composite score, so a case with an IP change *and* a structuring pattern *and* a behavioural deviation is surfaced very differently from a case with just one weak signal.
3. **It explains its own reasoning.** The AI Insights panel turns the contributing factors into a plain-language narrative an analyst can act on immediately — no digging through raw scores to figure out why a case was flagged.
4. **It gives every case a full audit trail.** Every status change, assignment, note, and disposition is timestamped and logged, which matters as much for internal governance as it does for a regulator asking "how was this decided?"
5. **It routes by severity automatically.** Scores of 4–5 go straight to the priority queue; a 5 auto-flags to a Senior Reviewer. Analysts spend their time where the risk actually is, not working top-to-bottom through an undifferentiated list.

---

## The Five Detection Scenarios

| # | Scenario | What It Catches |
|---|---|---|
| 1 | **Behavioural Pattern Deviation** | Transaction pattern diverges materially from the policyholder's established history |
| 2 | **IP Address / Device Change** | Login or transaction from a new or geographically inconsistent device/IP on a pension account |
| 3 | **Unusual Account Access for Withdrawal** | Withdrawal initiated outside the policyholder's normal channel, time, or frequency |
| 4 | **Structured / Small-Value Withdrawals** | Multiple smaller withdrawals potentially structured to stay under review thresholds |
| 5 | **Withdrawal Pattern Deviation** | Shift in withdrawal frequency, amount trend, or destination account vs. prior history |

Each triggered scenario contributes a weighted percentage to a **composite Risk Score (1–5)**:

| Score | Band | Routing |
|---|---|---|
| 1 | Minimal | Logged only |
| 2 | Low | Logged, visible in queue |
| 3 | Moderate | Standard queue |
| 4 | High | Priority queue |
| 5 | Critical | Priority queue, auto-flagged to Senior Reviewer |

---

## What's in the App

| Screen | Purpose |
|---|---|
| **Command Centre** | Portfolio-level view — open cases, high-risk count, resolution time, alert trend, top 5 riskiest open cases |
| **Case Queue** | The working list — sort, filter (scenario/risk band/status/analyst), search, and bulk-assign cases |
| **Case Detail** | The investigation workspace — policyholder profile, activity timeline, baseline-vs-flagged comparison, device/IP history, risk factor breakdown, and the AI Insights + Analyst Workbench (disposition, notes, reassignment, history log) |
| **Analytics** | Disposition trends, analyst workload and turnaround time, resolution-time distribution, CSV/PDF export |
| **Configuration** | Admin-only — detection rule thresholds, enable/disable individual rules, analyst roster and role management |

## Who It's For

- **Risk Analysts** — a fast, guided triage queue instead of a spreadsheet
- **Senior Reviewers / Team Leads** — escalation visibility and override authority on the highest-severity cases
- **Business Admins** — self-service control over detection thresholds without an engineering ticket
- **Presales / GT Director** — a polished, self-contained artefact for client conversations that doesn't depend on a live backend or network connection

---

## Benefits

**For the business (BFSI client):**
- Consolidates disparate weak signals into one prioritised, explainable queue instead of five disconnected reports
- Cuts investigation time per case — the AI narrative and side-by-side comparison do the first pass of analysis for the analyst
- Reduces both false negatives (correlated fraud that a single-signal rule would miss) and analyst fatigue (weak, isolated signals are auto-logged rather than dumped into the working queue)
- Full timestamped audit trail on every case, supporting internal governance and regulatory conversations
- Configurable thresholds mean the business can tune sensitivity without waiting on an engineering release

**For Grant Thornton (as a presales asset):**
- A concrete, interactive artefact that lets a prospective client *use* the workflow instead of just seeing slides
- Demonstrates the full story end-to-end — detection → prioritisation → AI reasoning → analyst action — in one sitting, in under 10 minutes
- Runs entirely offline from a laptop, so there's zero dependency on client network access, live credentials, or third-party API uptime during a pitch
- Establishes a UI/UX and functional blueprint that carries forward into a scoped production engagement without a redesign

---

## How the Demo Works (Important)

This build is intentionally self-contained so it can be presented anywhere, on or offline, with zero setup risk:

- **No backend, no database.** All data is generated by a seeded random generator (`js/data/seed.js`) the first time a page loads, so the same realistic dataset — 200 policyholders, 1,000 transactions, 300 alerts, 150 cases, 20 analysts — appears every session.
- **"Live" actions persist locally.** Assigning a case, adding a note, changing a disposition, or editing a rule threshold writes to the browser's `localStorage`, so the demo state holds up across page navigation within the same browser, exactly like a real system would — just without a server behind it.
- **The AI Insights panel is not calling an LLM.** It streams a narrative assembled from curated, parameterised templates (`js/services/aiInsightService.js`) that reference the actual case data — different phrasing every time you hit "Regenerate," but never a live model call. This is a deliberate choice for a presentation build: no API keys, no network dependency, no risk of an unpredictable response mid-pitch.
- **CSV export is real**; PDF export uses the browser's native print-to-PDF, both fully offline.

**Path to production:** a follow-on engineering phase would replace the seed generator with live core-system/policy-admin integrations, the templated AI layer with a governed LLM integration, and `localStorage` with a real case-management backend — without requiring a UI redesign, since the interaction model is already fully built out here.

---

## Running It

No build step, no install, no server required.

1. Open `index.html` (or `dashboard.html` directly) in any modern browser.
2. That's it — the dataset seeds itself on first load.

If you'd rather serve it over `http://` (e.g. to test from another device on the same network), any static file server works — for example `npx serve .` or Python's `python -m http.server` from the project root.

## Project Structure

```
dGTL_Sentinel/
├── dashboard.html, case-queue.html, case-detail.html,
│   analytics.html, configuration.html, 404.html, index.html
├── css/
│   ├── tokens.css        — design tokens (colour, type, spacing, shadow, motion)
│   ├── base.css, layout.css, components.css, charts.css, animations.css
│   └── pages/             — per-page styles
├── js/
│   ├── data/               — name pools + seeded dataset generator
│   ├── state/               — localStorage-backed pub/sub store
│   ├── services/          — dataService, aiInsightService, notificationService, exportService
│   ├── components/       — shell (sidebar/topbar), tables, badges, modal, toast, charts, icons
│   ├── utils/                — formatters, risk scoring, DOM helpers
│   └── pages/               — one render module per screen
└── brd.md                    — the source Business Requirements Document
```

Every functional requirement in `brd.md` is implemented — this README explains the *why*; the BRD remains the authoritative *what*.
