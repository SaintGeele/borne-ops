# Care — Customer Support Workflow

## Overview
Care handles client support after the sale — FAQs, tickets, onboarding, and retention.

---

## Ticket Tiers

| Tier | Type | Response Time | Who handles |
|------|------|--------------|-------------|
| T1 | FAQ, how-to questions | 30 min | Care |
| T2 | Config issues, integrations | 2 hours | Care → Nexus |
| T3 | Outages, data issues, billing | 15 min | Geele immediately |

---

## Triage Rules

1. New ticket arrives → Care triages within 30 min
2. T1 → answer from FAQ, log it
3. T2 → try to resolve, escalate to Nexus if needed
4. T3 → immediately → Geele on Telegram
5. Security concern → immediately → Knox

---

## Support Channels

- Inbound email to borne-systems support
- Telegram support channel (future)
- Notion ticket tracker

---

## Onboarding (after Chase closes a deal)

When Chase marks CLOSED:
1. Care sends welcome email within 24h
2. Care sends onboarding checklist
3. Care schedules setup call if needed
4. Care verifies VAPI credentials
5. Care sends first-week check-in on Day 7

---

## FAQ Auto-Responses (T1)

Care handles without escalation:
- "How do I change business hours?"
- "How do I add a service?"
- "How do I check call logs?"
- "How do I update the greeting?"
- "How do I add a new user?"

---

## Escalation Matrix

| Situation | Escalate to |
|-----------|-------------|
| VAPI config issue | Nexus |
| Twilio/SMS issue | Nexus |
| Billing question | Ledger |
| Feature request | Professor (product) |
| Security concern | Knox immediately |
| Client wants to cancel | Geele immediately |
| Legal/complaint | Geele immediately |

---

## Retention Triggers

Care flags clients for proactive outreach if:
- No calls logged in 7+ days (might not be working)
- Client submits a complaint ticket
- Missed payment
- 3+ T2 tickets in one week

Flag to Geele: "This client needs attention."

---

## Key Rules
- Always log tickets in Notion
- Always respond within SLA times
- Never admit fault — escalate to Geele for complaints
- Never promise features or pricing changes
- Security issues → Knox immediately, then Geele
- Cancellation request → Geele immediately
