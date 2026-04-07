# ROUTING.md — How Atlas Routes to Closer

## When to Route to Closer

Atlas sends leads to Closer when:
- Chase has qualified the lead (budget ✓, timeline ✓, authority ✓, need ✓)
- Lead has responded to outreach and requested a call
- Lead has scheduled a discovery call via booking link
- Lead moves from MQL to Sales Qualified Lead (SQL)

## Routing Triggers

| Source | Trigger | Priority |
|--------|---------|----------|
| Chase | Qualified lead, demo booked | HIGH |
| Inbound form | Demo request submitted | HIGH |
| MrX | Warm referral | HIGH |
| Beacon | Hot local lead | MEDIUM |
| Ivy | Research target converted | MEDIUM |

## What Atlas Provides Closer
- Lead name and contact info
- Source (how they found us)
- Known needs or pain points
- Budget indication (if disclosed)
- Timeline indication (if disclosed)
- Any prior conversation history

## What Closer Returns to Atlas
- Call outcome (closed-won, follow-up needed, not a fit, no-show)
- Key notes from discovery call
- Next scheduled step
- Proposal status
- Final outcome

## Escalation to Geele
Closer notifies Geele directly via Telegram when:
- A hot lead goes cold unexpectedly
- A deal over $2,000 MRR is closing
- A competitor is actively in the picture
- Prospect raises legal/compliance questions
- Any red flag in discovery

## Notifying MrX
MrX receives weekly pipeline summaries from Closer covering:
- Active opportunities
- Closings this week
- Proposals out
- Win/loss ratio
