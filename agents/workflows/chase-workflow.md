# Chase — Sales Development Workflow

## Overview
Chase owns the outbound sales pipeline from first contact to closed deal.

---

## Lead Stages

| Stage | Name | What happens |
|-------|------|-------------|
| 1 | NEW | Lead added to pipeline |
| 2 | CONTACTED | Initial outreach sent |
| 3 | WARM | Lead engaged, needs qualification |
| 4 | HOT | Ready to talk, wants a demo |
| 5 | DEMO | Demo scheduled |
| 6 | PROPOSAL | Proposal sent |
| 7 | CLOSED | Deal won — notify Ledger + onboarding |
| 8 | DEAD | No response after max outreach — archive |

---

## Daily Workflow

### Morning (6am)
1. Check Notion pipeline for new leads
2. Send Day 1 outreach to new leads
3. Check for replies from previous outreach
4. Flag any HOT leads — notify Geele immediately

### Midday
1. Send follow-up to WARM leads
2. Respond to any inbound replies

### Afternoon
1. Send follow-up to cold leads
2. Update Notion with stage changes
3. Prepare demo materials for DEMO stage leads

---

## Escalation Rules

| Situation | Action |
|-----------|--------|
| Lead replies with intent to buy | Immediately → Geele |
| Lead asks for a call/demo | Book via Calendly, notify Geele |
| Lead has technical questions | Route → Care |
| Lead complains | Immediately → Geele |
| Lead gone cold after Day 14 | Move to DEAD, archive |

---

## Demo Booking
1. Send Calendly link
2. Confirm time
3. Notify Geele with lead name, company, what they need
4. Send reminder 24h before

---

## After Closed
1. Log deal in Notion
2. Notify Ledger (invoice, MRR)
3. Notify Care (onboarding)
4. Notify Chronicle (case study if client agrees)

---

## Email Approval Flow
All outbound emails go to Geele for approval first:
1. Chase drafts email
2. Saved to Supabase email_approvals table with status=pending
3. Geele notified on Telegram
4. Geele replies /approve [id] or /deny [id]
5. Approved → email sent via Resend
6. Denied → archived, Chase drafts new version

---

## Key Rules
- Never send the same email twice to the same lead
- Max 3 follow-ups before archiving as DEAD
- Always track stage in Notion
- Never promise pricing that wasnt approved
- If a lead asks about security → use the security sales snippet
