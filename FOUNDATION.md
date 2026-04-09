# Borne Systems — Foundation

## Core Agents (Revenue)

| Agent | Role | Channel | Status |
|-------|------|---------|--------|
| Chase | Outbound sales, LinkedIn, demo booking | #cold-outreach | Token ✅ |
| Lead Gen | Prospecting, ICP targeting | #cold-outreach | Token ✅ |
| Closer | Proposal, negotiation, closing | #cold-outreach | Token ✅ |
| Sales Engineer | Demos, battlecards, technical | #cold-outreach | Token ✅ |
| Pipeline Analyst | Forecast, velocity, at-risk deals | #ceo-update | Token ✅ |

## Client Delivery

| Agent | Role | Channel | Status |
|-------|------|---------|--------|
| Care | Tickets, FAQ, onboarding | #client-management | Token ✅ |
| Forge | Client delivery, implementation | #client-management | Token ✅ |

## Visibility

| Agent | Role | Channel | Status |
|-------|------|---------|--------|
| Pulse | Daily briefing, schedule guardian | #ceo-update | Token ✅ |
| Ledger | Spend tracking, burn rate, cost per lead | #ceo-update | Token ✅ |
| Inspector | QA, pre-launch checks | #agent-status | Token ✅ |

## Coordination

| Agent | Role | Channel | Status |
|-------|------|---------|--------|
| Atlas | Task orchestration, execution flow | #atlas-coordination | Token ✅ |
| Relay | Event system, workflow triggers | #atlas-coordination | Token ✅ |

## Security

| Agent | Role | Channel | Status |
|-------|------|---------|--------|
| Knox | CVE monitoring, hardening | #vulnerability-scanning | Token ✅ |
| Ghost Protocol | Data boundary enforcement | #vulnerability-scanning | Token ✅ |
| Self-Healing | Auto-remediation | #agent-status | Token ✅ |

---

## What's Working

- Supabase events table ✅
- Relay event poller (every 5 min) ✅
- Discord multi-bot identity ✅
- borne-ops repo ✅

## What's Broken

- borneai auth profile (minimax model) — blocks agent-Turn crons
- borne@ email — manual read, Resend for outbound
- Many crons failing due to auth issue

## What's Not Wired

- Lead Gen → Chase handoff (events table, needs Relay running)
- Chase → Closer handoff
- Pipeline Analyst → report to Telegram

## Next Actions

1. Fix borneai auth profile for minimax
2. Test Lead Gen → events → Chase chain
3. Set up Pipeline Analyst cron
4. Test end-to-end: Lead Gen runs → event fires → Chase picks up
