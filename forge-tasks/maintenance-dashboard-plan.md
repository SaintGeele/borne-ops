# Maintenance Dashboard Plan
**Purpose:** Client-facing dashboard showing AI performance metrics for Borne Systems maintenance clients
**Tech stack:** Supabase (existing) + lightweight frontend (React/Next.js or simple web dashboard)

---

## Overview

The maintenance dashboard is proof of value. It shows clients that their AI is working, that we're monitoring it, and that they have visibility they didn't have before.

**Core function:** Turn "we're watching your AI" from a promise into something they can see.

---

## Dashboard Goals

1. **Build trust** — Clients see that someone is actually monitoring their AI
2. **Prevent churn** — Visible value = recognized value = retained clients
3. **Surface upsell opportunities** — When they see the data, new opportunities become obvious
4. **Reduce support burden** — Clients check the dashboard instead of emailing "is the AI working?"
5. **Make renewal conversations easy** — Monthly report = renewal justification

---

## Metrics to Track

### Call Handling (AI Receptionist)
- Total inbound calls received
- Calls handled by AI (%)
- Calls forwarded to staff (%)
- Missed calls (number and %)
- Average call duration
- Average wait time
- Peak call hours

### Lead Capture (Lead Automation)
- Total leads captured this month
- Leads captured via phone
- Leads captured via web form
- Leads captured via SMS
- Average response time (phone)
- Average response time (text/chat)
- Unresponded leads (leads that fell through)

### Quote / Proposal Flow (QuoteHook)
- Total quote requests received
- Quotes sent automatically
- Quotes followed up on within 5 minutes (%)
- Quotes followed up on within 24 hours (%)
- Estimated pipeline value captured
- Quote close rate (if trackable)

### System Health
- AI uptime (%)
- API response time
- Error rate (failed calls, failed automations)
- Configuration last updated date
- Last optimization review date

### Month-over-Month Comparison
- Calls handled vs. last month
- Lead capture rate vs. last month
- Missed calls trend
- Response time trend

---

## Dashboard Layout (Wireframe)

### Header
- Client name + logo placeholder
- Current date range (default: last 30 days)
- "Last updated: [timestamp]"
- Maintenance tier badge (Bronze / Silver / Gold / Platinum)

### Summary Row (Top)
Four metric cards:
1. **Calls Handled** — [number] | [percentage] of total
2. **Leads Captured** — [number] | up/down vs. last month
3. **Avg Response Time** — [seconds] | up/down vs. last month
4. **AI Uptime** — [percentage] | green/yellow/red indicator

### Section 1: Call Performance
- Line chart: daily call volume over 30 days
- Donut chart: handled vs. missed vs. forwarded
- Table: top 5 call reasons (if recorded)
- Date range selector

### Section 2: Lead Flow
- Bar chart: leads by source (phone / web / SMS)
- Funnel view: inquiries → responded → qualified → converted
- List: recent unresponded leads (flag for follow-up)

### Section 3: AI Health
- Uptime badge (green = >99%, yellow = 95-99%, red = <95%)
- Error log summary (last 7 days)
- Configuration update history (last 3 changes)
- "Next scheduled optimization: [date]"

### Section 4: Month-End Report (PDF Export)
- Auto-generated monthly summary
- Key wins this month
- Areas of concern
- Recommended actions for next month
- Export as PDF button

### Footer
- "Managed by Borne Systems" with logo
- "Questions? Contact your account manager" — email/link
- Maintenance renewal date

---

## Tier-Based Feature Access

| Feature | Bronze | Silver | Gold | Platinum |
|---------|--------|--------|------|----------|
| Call metrics | ✓ | ✓ | ✓ | ✓ |
| Lead capture metrics | ✓ | ✓ | ✓ | ✓ |
| AI health / uptime | ✓ | ✓ | ✓ | ✓ |
| 30-day trend charts | — | ✓ | ✓ | ✓ |
| Week-over-week comparison | — | ✓ | ✓ | ✓ |
| Custom date range | — | — | ✓ | ✓ |
| PDF monthly report | — | — | ✓ | ✓ |
| Export raw data (CSV) | — | — | — | ✓ |
| Real-time alerts | — | — | — | ✓ |

---

## Technical Architecture

### Data Layer (Supabase)
**Existing:** Supabase is already part of Borne Systems infrastructure

**Tables to add:**
- `clients` — client name, tier, renewal date, contact info
- `call_logs` — timestamp, duration, outcome (handled/forwarded/missed), source
- `lead_logs` — timestamp, source, qualified (y/n), converted (y/n)
- `ai_health` — timestamp, uptime %, error_count, avg_response_ms
- `config_changes` — timestamp, what_changed, who_changed

**Cron job:** Aggregate daily stats from raw logs into summary tables (runs daily at midnight)

### Backend
- Supabase Edge Functions for:
  - Aggregating metrics from raw logs
  - Generating monthly PDF reports
  - Sending weekly summary emails
  - Alerting if uptime drops below threshold (for Platinum clients)

### Frontend
- Simple React or Next.js app (or even a Supabase Studio dashboard customized)
- Hosted on AWS Amplify alongside existing Borne website
- Auth: Email/password login per client (simple, no SSO needed)
- URL structure: `clients.bornesystems.com/[client_name]` or subdomain

### Integrations
- Twilio or similar for call log data (if AI Receptionist uses Twilio)
- Zapier or direct API for lead capture data from web forms
- Supabase for all data storage and aggregation

---

## Implementation Phases

### Phase 1: Core Dashboard (MVP)
- Bronze and Silver tier visibility
- Call handling metrics only
- Weekly email summary
- Basic uptime monitoring
- **Timeline:** 3–5 days

### Phase 2: Full Metrics
- Lead capture tracking
- QuoteHook metrics
- Trend charts (30-day)
- **Timeline:** 2–3 days

### Phase 3: Reporting
- Auto-generated PDF monthly report
- Renewal date tracking
- Account manager contact link
- **Timeline:** 2 days

### Phase 4: Tier Upgrades
- Gold tier features
- Platinum tier features
- Real-time alerts
- **Timeline:** 2–3 days

**Total estimated build:** 8–12 days

---

## Monthly Report (PDF) — Template Spec

**Page 1:**
- Header: "Borne Systems Monthly AI Report — [Month Year] — [Client Name]"
- Summary box: "This month, your AI handled [X] calls, captured [Y] leads, and maintained [Z]% uptime."
- Top 3 wins this month
- Top 1 concern (if any)

**Page 2:**
- Key metrics table (calls, leads, response time, uptime — current month vs. last month)
- Mini trend charts
- Configuration changes made this month

**Page 3:**
- Recommended actions for next month
- Maintenance renewal date (prominent)
- "Questions? Contact [account manager]"

---

## Success Metrics for the Dashboard

- Client login rate (target: 60%+ log in at least once per month)
- Support ticket volume reduction (target: 30% reduction)
- Maintenance renewal rate (target: 90%+)
- Upsell rate from Bronze → Silver → Gold (target: 15% annually)
