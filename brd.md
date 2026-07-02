# Business Requirements Document

# dGTL Sentinel
### AI-Powered Policyholder Transaction Risk Intelligence Platform

| | |
|---|---|
| **Document Type** | Business Requirements Document (BRD) |
| **Prepared For** | Client Demonstration – GT Director Presentation |
| **Prepared By** | dGTL – Digital & Analytics Practice, Grant Thornton Bharat LLP |
| **Version** | 1.0 |
| **Status** | Draft – Demo Build |
| **Classification** | Internal / Client Confidential |

---

## 1. Executive Summary

**dGTL Sentinel** is an AI-powered risk intelligence platform designed to help BFSI institutions — particularly life insurance and pension providers — identify, prioritise, and resolve suspicious policyholder withdrawal and account-access behaviour in near real time.

The platform combines rule-based pattern detection, behavioural deviation scoring, and a generative AI reasoning layer to surface high-risk transactions to a dedicated analyst team, replacing manual, spreadsheet-driven review with a single, guided workbench.

This document defines the business requirements for a **client-facing demonstration build** of dGTL Sentinel, styled on the dGTL Pulse design language, intended to showcase the platform's end-to-end workflow — from anomaly detection through analyst disposition — to prospective BFSI clients.

> **Demo Build Note:** This version is built for presentation purposes. All screens, workflows, risk scores, and AI-generated narratives are fully functional against a simulated, seeded dataset. No live core-banking, policy administration, or third-party LLM APIs are called in this build — see Section 11 for the demo architecture approach. The experience is designed to look and feel identical to a production, API-integrated system.

---

## 2. Business Objectives

1. Demonstrate a credible, end-to-end AI risk-monitoring workflow that a BFSI client can visualise adopting for pension and policy withdrawal oversight.
2. Show how disparate risk signals (behavioural pattern deviation, device/IP change, withdrawal structuring) can be consolidated into a single prioritised queue.
3. Showcase AI-generated, analyst-ready case narratives that reduce manual investigation time.
4. Provide GT Director / presales team with a polished, interactive artefact that supports the sales narrative without requiring live backend integration.
5. Establish a reusable UI/UX and functional blueprint that can later be engineered into a production-grade solution.

---

## 3. Scope

### 3.1 In Scope (Demo Build)
- Interactive web application, dGTL Pulse-themed UI
- Simulated policyholder, account, and transaction dataset (seeded, realistic BFSI data)
- Risk detection engine covering the five core scenario types (Section 7)
- Risk scoring model (1–5 scale) with visual indicators
- Case queue, case detail view, and analyst workbench with disposition actions
- AI Insights panel showing LLM-style narrative reasoning per case
- Basic analytics/summary dashboard
- Role-based views: Analyst, Reviewer, Admin (UI-level only)
- Notification indicators (in-app only)

### 3.2 Out of Scope (Demo Build)
- Live integration with core banking / policy administration systems
- Live integration with any third-party LLM or AI provider
- Real-time IP/device intelligence feeds
- Actual case-management persistence beyond the session/demo dataset
- User authentication against enterprise identity providers
- Regulatory reporting/filing workflows
- Mobile application

---

## 4. Stakeholders & User Personas

| Persona | Description | Primary Needs |
|---|---|---|
| **Risk Analyst** | Front-line reviewer working the case queue | Fast triage, clear reasoning, quick disposition actions |
| **Senior Reviewer / Team Lead** | Reviews escalated or high-severity cases | Case history, override/escalate controls, team workload view |
| **Business Admin** | Configures detection rules and thresholds | Simple rule configuration, threshold tuning |
| **GT Director / Presenter** | Presents platform to client stakeholders | Reliable, polished, self-explanatory demo flow |
| **Client Stakeholder (Audience)** | CXO / Risk Head evaluating the platform | Confidence in detection logic, ROI, ease of adoption |

---

## 5. Product Naming & Positioning

| Element | Detail |
|---|---|
| **Application Name** | dGTL Sentinel |
| **Tagline** | "See the signal before it becomes a loss." |
| **Positioning** | Part of the dGTL product family (alongside dGTL Pulse, dGTL Retain) — extends dGTL's presence into policyholder risk intelligence for BFSI clients |
| **Primary Sector Focus** | Life Insurance, Pension & Annuity Providers, Retail Banking |

---

## 6. Design & UX Guidelines (dGTL Pulse Theme)

- **Visual language:** Consistent with dGTL Pulse — clean card-based layout, generous white space, rounded corners, soft elevation/shadows
- **Colour palette:** GT purple as primary brand colour, with a supporting neutral (charcoal/slate) palette; severity communicated through a calibrated red–amber–green scale reserved strictly for risk indicators
- **Typography:** Modern sans-serif, clear hierarchy — bold headline weights for KPIs, regular weight for supporting text
- **Navigation:** Persistent left-hand sidebar (Command Centre, Case Queue, Analytics, Configuration); top bar with search, notifications, and user profile
- **Data density:** Dashboard-first, card and table hybrid — summary cards up top, detailed sortable/filterable tables below
- **Interaction cues:** Skeleton loaders and subtle "Analysing…" states on case load to visually reinforce that detection and AI reasoning are being computed live
- **Accessibility:** WCAG AA-compliant contrast ratios, keyboard navigable tables

---

## 7. Core Detection Scenarios (Functional Basis)

The demo dataset and detection engine are built around five representative risk scenarios, each mapped to a distinct alert type:

| # | Scenario | Trigger Logic | Alert Category |
|---|---|---|---|
| 1 | **Behavioural Pattern Deviation** | Transaction pattern diverges materially from the policyholder's established historical behaviour | Behavioural Anomaly |
| 2 | **IP Address / Device Change on Pension Account** | Login or transaction request originates from a new or geographically inconsistent IP address on a pension/annuity account | Access Anomaly |
| 3 | **Unusual Account Access for Withdrawal** | Account is accessed and a withdrawal is initiated outside the policyholder's normal access channel, time, or frequency | Access Anomaly |
| 4 | **Structured / Small-Value Withdrawals** | Multiple withdrawals in smaller amounts, potentially structured to stay below standard review thresholds | Structuring Pattern |
| 5 | **Withdrawal Pattern Deviation** | Change in withdrawal frequency, amount trend, or destination account inconsistent with prior history | Behavioural Anomaly |

Each triggered scenario contributes to a composite **Risk Score (1–5)**; cases scoring 4–5 are auto-routed to the priority queue for analyst disposition.

---

## 8. Functional Requirements

### 8.1 Command Centre (Landing Dashboard)
- FR-1.1: Display total open cases, high-risk case count, average resolution time, and cases resolved today
- FR-1.2: Visual breakdown of alerts by category (Behavioural Anomaly, Access Anomaly, Structuring Pattern)
- FR-1.3: Trend chart of alert volume over a rolling 30-day period
- FR-1.4: Quick-access list of top 5 highest-risk open cases

### 8.2 Case Queue
- FR-2.1: Sortable, filterable table of all active cases (Risk Score, Category, Policyholder, Date Flagged, Status, Assigned Analyst)
- FR-2.2: Visual risk badge (colour-coded 1–5 scale) per case row
- FR-2.3: Filter by scenario type, risk band, status (New / In Review / Escalated / Closed), and assigned analyst
- FR-2.4: Bulk assignment of cases to analysts

### 8.3 Case Detail View
- FR-3.1: Policyholder summary panel (masked PII, tenure, product type, historical transaction summary)
- FR-3.2: Timeline view of the triggering transaction(s) and related account activity
- FR-3.3: Side-by-side comparison of the flagged transaction against the policyholder's historical baseline pattern
- FR-3.4: Device/IP history panel showing prior known access points vs. the flagged access event
- FR-3.5: Composite risk score with contributing factor breakdown (e.g., "40% Pattern Deviation, 35% IP Change, 25% Withdrawal Structuring")

### 8.4 AI Insights Panel
- FR-4.1: Auto-generated narrative summary explaining, in plain language, why the case was flagged
- FR-4.2: Suggested next-best-action recommendation (e.g., "Recommend contacting policyholder to verify identity before disbursal")
- FR-4.3: Confidence indicator alongside the AI-generated narrative
- FR-4.4: "Regenerate insight" action to visually simulate a fresh AI reasoning pass

### 8.5 Analyst Workbench
- FR-5.1: Disposition actions — Accommodate (Clear/Approve), Escalate, Hold for Additional Information, Decline/Block
- FR-5.2: Free-text notes field for analyst commentary
- FR-5.3: Case history log capturing all status changes and analyst actions with timestamps
- FR-5.4: Reassignment control to route case to a senior reviewer

### 8.6 Analytics & Reporting
- FR-6.1: Summary view of case disposition outcomes over time
- FR-6.2: Analyst-level workload and turnaround-time view
- FR-6.3: Exportable summary report (PDF/CSV) of case activity for a selected period

### 8.7 Configuration (Admin)
- FR-7.1: Threshold configuration for each detection scenario (e.g., structuring amount ceiling, IP-change sensitivity)
- FR-7.2: Enable/disable individual detection rules
- FR-7.3: Manage analyst roster and role assignments

---

## 9. Risk Scoring Model

| Score | Band | Description | Routing |
|---|---|---|---|
| 1 | Minimal | Isolated minor deviation, low confidence | Logged only |
| 2 | Low | Single weak signal | Logged, visible in queue |
| 3 | Moderate | One strong signal or multiple weak signals | Standard queue |
| 4 | High | Multiple correlated signals (e.g., IP change + withdrawal structuring) | Priority queue |
| 5 | Critical | Strong multi-signal correlation with pattern deviation | Priority queue, auto-flag to Senior Reviewer |

---

## 10. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Performance | All screens load within 2 seconds against the seeded demo dataset |
| Usability | Presenter can complete the full demo flow (dashboard → case → AI insight → disposition) without technical assistance |
| Reliability | No dependency on live internet connectivity or external services during presentation |
| Portability | Runs in any modern browser; no installation required |
| Data Realism | Seeded dataset reflects realistic BFSI policyholder, transaction, and access patterns |
| Branding | Fully aligned to dGTL Pulse visual identity and GT brand guidelines |

---

## 11. Demo Architecture Approach (Internal Note — Not for Client Slide)

To ensure a reliable, self-contained presentation:

- **No live API calls.** All "API-driven" experiences — risk scoring, IP/device intelligence, and AI-generated case narratives — are powered by a pre-built simulation layer using seeded data and pre-written/parameterised narrative templates.
- **AI Insights panel** is built to visually replicate an LLM response (typing/streaming effect, confidence score, regenerate action) but draws from a curated set of scenario-matched narrative templates rather than a live model call.
- **State management** is session-based; no persistent backend or database is required for the demo.
- **Rationale:** This approach removes dependency on live credentials, network conditions, or third-party service availability during a client-facing presentation, while preserving full visual and interactive fidelity to a production system.
- **Path to production:** A follow-on engineering phase would replace the simulation layer with live core-system integrations, a real detection/scoring engine, and a governed LLM integration — without requiring UI redesign.

---

## 12. Simplified Data Model (Demo Dataset)

- **Policyholder** — ID, name (masked), product type, tenure, risk profile
- **Account** — Account ID, policyholder link, product details, historical baseline pattern
- **Transaction** — Transaction ID, account link, amount, channel, timestamp, device/IP metadata
- **Alert** — Alert ID, transaction link, scenario type(s), risk score, contributing factors
- **Case** — Case ID, alert link, status, assigned analyst, notes, disposition, history log
- **Analyst** — Analyst ID, name, role, workload

---

## 13. Assumptions & Dependencies

- The seeded demo dataset will be reviewed and approved before the client presentation to ensure scenario realism.
- The GT Director presenting the demo will be briefed on the simulated-backend nature of the build (Section 11) to accurately represent capability during Q&A.
- No client data will be used in the demo build; all data is synthetic.
- Final scenario wording and terminology will be validated against the target client's internal risk/BFSI vocabulary prior to presentation.

---

## 14. Success Criteria (Demo)

- Presenter can walk a client audience through the full journey — dashboard, flagged case, AI-generated reasoning, and analyst disposition — in under 10 minutes.
- Client stakeholders can articulate, post-demo, how the five core scenarios map to their own risk exposure.
- No visible errors, broken states, or loading failures during a live run-through.
- Positive client feedback captured to inform scoping of a production build.

---

## 15. Out of Scope for This Phase

- Production-grade security, encryption, and access control implementation
- Integration with client's actual core banking/policy admin systems
- Regulatory and compliance sign-off processes
- Multi-tenant / multi-client configuration
- Live model governance and explainability tooling for a production LLM integration

---

## 16. Glossary

| Term | Definition |
|---|---|
| **Structuring** | Splitting withdrawals into smaller amounts, potentially to avoid triggering standard review thresholds |
| **Behavioural Baseline** | A policyholder's historically established pattern of transaction amount, frequency, and channel use |
| **Composite Risk Score** | A weighted score (1–5) combining all triggered detection signals for a given case |
| **Disposition** | The final analyst decision on a case (Accommodate, Escalate, Hold, Decline) |
| **Accommodate** | Analyst action to clear/approve a flagged case after review |

---

*Prepared by dGTL – Digital & Analytics Practice, Grant Thornton Bharat LLP. This document is intended solely to support internal build and client demonstration purposes.*