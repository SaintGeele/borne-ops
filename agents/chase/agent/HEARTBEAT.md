# HEARTBEAT.md — Chase

## Schedule
**Runs daily at 9:00 AM ET** via OpenClaw cron

---

## Daily Pipeline Check — 9 AM

### Step 1: Fetch Notion Leads
- Connect to Notion leads DB (`31b26a63-e141-81e9-b4af-cce2e9c60055`)
- Pull all leads with status != CLOSED and != LOST
- Score any uncontacted leads (Score field = 0 or null)

### Step 2: Score New Leads
For leads with Score = 0 or uncontacted:
- Apply scoring rubric (Fit 1-3, Budget 1-3, Timeline 1-3, Engagement 1-3)
- Update Score in Notion
- Assign tier: HOT (10-12), WARM (6-9), COOL (<6)

### Step 3: Execute Follow-Up Sequences
For each open lead, check last activity date:

| Days since last contact | Action |
|------------------------|--------|
| 0 | New lead — send Day 0 outreach |
| 3 | Send nurture-touch-2.md |
| 7 | Send nurture-touch-3.md |
| 14 | Send nurture-touch-4.md |
| 21 | Send final close-out email |
| 21+ no reply | Mark LOST in Notion, stop sequence |

### Step 4: Flag HOT Leads
Immediately notify BorneAI on Telegram:
```
🚨 HOT LEAD ALERT
Name: [Name]
Company: [Company]
Score: [X]/12
Pain: [One line]
Last Contact: [Date]
Status: [Current Notion status]
```

### Step 5: Update Notion
- Update status after every action (NEW → WARM → HOT → DEMO → PROPOSAL → CLOSED)
- Add activity note for every status change

### Step 6: Log to Supabase
Write to `activity_log`:
```json
{
  "ts": "[ISO timestamp]",
  "agent": "chase",
  "action": "[action_type]",
  "lead_id": "[notion_page_id or email]",
  "lead_name": "[name]",
  "stage_from": "[previous]",
  "stage_to": "[new]",
  "notes": "[brief notes]"
}
```

### Step 7: Report to Geele (Telegram)
End of heartbeat summary:
```
CHASE PIPELINE REPORT — [DATE]
━━━━━━━━━━━━━━━━━━━━
HOT: [N] — [names]
WARM: [N] — [names]
NEW today: [N]
Demo scheduled: [N]
Awaiting proposal: [N]
Closed this week: [N]
━━━━━━━━━━━━━━━━━━━━
```

---

## Weekly Report (Friday 4 PM)
Full pipeline review sent to Geele on Telegram:
- All HOT leads with current status
- WARM leads approaching HOT
- Deals in DEMO/PROPOSAL stages
- Win/loss summary
- Pipeline value estimate

---

## Alert Flags (Immediate Telegram Message)
Send to Geele immediately if:
- HOT lead books a demo
- Lead says "no" to everything and goes LOST
- Bounce or unsubscribe detected
- Any lead asks to speak with Geele directly
