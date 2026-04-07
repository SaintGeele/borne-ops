# HEARTBEAT.md — Care, Daily Operations

## Schedule

Run this heartbeat **every 30 minutes** during business hours (9am–8pm ET).

---

## 1. Ticket Queue Check

Query open tickets from Supabase:

```sql
SELECT id, name, email, issue_type, subject, description, priority, status, ts
FROM tickets
WHERE status IN ('open', 'in_progress')
ORDER BY 
  CASE priority
    WHEN 'urgent' THEN 1
    WHEN 'high'   THEN 2
    WHEN 'normal' THEN 3
    WHEN 'low'    THEN 4
  END ASC,
  ts ASC
LIMIT 20;
```

### Per Ticket Action

- **T1 (FAQ/low):** Answer directly from FAQ bank. Send resolution. Mark `resolved`.
- **T2 (complex):** Acknowledge, investigate, coordinate with Nexus if needed. Set `in_progress`. Reply within 4 hours.
- **T3 (critical):** Alert Geele immediately via Telegram. Do not wait to investigate first.

---

## 2. FAQ Auto-Responses

Check if ticket matches a known FAQ pattern:

| Issue Type | Response Route |
|---|---|
| Billing / pricing | Route to Ledger |
| Technical setup | Check setup guide, respond with steps |
| VAPI configuration | Check VAPI config doc, respond with steps |
| Onboarding status | Send current onboarding step + next action |
| Feature request | Log as `low` priority, acknowledge receipt |
| Security concern | Route to Knox immediately, alert BorneAI |

---

## 3. Stale Ticket Follow-Up

Check tickets with no update in 24 hours:

```sql
SELECT id, name, subject, ts
FROM tickets
WHERE status = 'in_progress'
  AND ts < now() - interval '24 hours';
```

Action: Send a follow-up message to the client, update notes in Supabase.

---

## 4. Onboarding Progress Check

Check active onboardings:

```sql
SELECT client_id, client_name, email, onboarding_step, scheduled_date, status
FROM onboarding_tracker
WHERE status IN ('active', 'pending_followup');
```

### Daily Follow-Up Triggers

- **Day 3 no-response:** Send Day 3 check-in email via Resend
- **Day 7 no-response:** Send Day 7 nudge + alternative scheduling options
- **Setup call completed:** Mark step done, advance to next phase
- **Go-live confirmed:** Mark onboarding complete, trigger 7-day check-in

---

## 5. Daily Summary to Chronicle

After each heartbeat run, log to Supabase `ticket_log`:

```sql
INSERT INTO ticket_log (agent, action, notes, ts)
VALUES ('Care', 'heartbeat_run', '<count> tickets processed, <n> resolved, <n> escalated', now());
```

---

## Onboarding SOP — AI Receptionist Clients

### Day 1
- [ ] Send welcome email (Resend, template: `welcome-ai-receptionist`)
- [ ] Create Notion client page (client profile, VAPI config, Square setup)
- [ ] Schedule Square API setup call
- [ ] Schedule voice recording session
- [ ] Log to `onboarding_tracker`

### Day 2–3
- [ ] Configure VAPI assistant (name, greeting, transfer numbers, business hours)
- [ ] Set business hours in VAPI dashboard
- [ ] Record and upload greeting audio
- [ ] Configure escalation route (Geele or designated backup)
- [ ] Send test greeting link to client for approval

### Day 4–5
- [ ] Conduct live test call with client
- [ ] Walk client through client portal
- [ ] Collect feedback, note any adjustments
- [ ] Update Notion page with feedback

### Day 6–7
- [ ] Go live — confirm phone number routing is active
- [ ] Send go-live confirmation to client
- [ ] Schedule first-week report (Day 7)
- [ ] Schedule 30-day check-in

### Day 7 (First-Week Report)
- [ ] Pull VAPI call metrics
- [ ] Send summary to client (calls handled, transfer rate, any issues)
- [ ] Note any client concerns for follow-up

### Day 30 (Check-In)
- [ ] Send 30-day check-in message
- [ ] Review client satisfaction
- [ ] Note any upsell or renewal signals for Chase

---

## Escalation Fast Path

```
T3 / Security  →  Knox + BorneAI + Geele (Telegram simultaneously)
Billing dispute →  Geele immediately
Complaint       →  Geele immediately
Legal / Press   →  Geele immediately
Ticket > 48hrs  →  Geele + note in Supabase
```
