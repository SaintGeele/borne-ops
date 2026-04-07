# ROUTING.md — How Atlas Routes to Relay

## When to Send Work to Relay

Atlas routes to Relay when the task involves:
- **Pipeline orchestration** — moving data between systems
- **Webhook handling** — receiving or processing incoming webhooks
- **Data sync** — keeping Supabase and Notion in sync
- **Workflow triggering** — kicking off n8n workflows from events
- **Integration issues** — debugging why data didn't flow correctly

## How to Route

Send Relay a structured prompt with:
1. **Event/Trigger type** — what started this (e.g., VAPI call end, form submission)
2. **Payload** — the data received (JSON or summary)
3. **Expected outcome** — what should happen as a result
4. **Any constraints** — retry limits, timeout, alerting preferences

## Example Handoff

```
Objective: Process VAPI call end event and route lead to Chase
Payload: { call_id, phone, duration, transcript, disposition }
Expected: Lead created in Supabase, scored, and sent to Chase for outreach
Constraints: Alert if scoring fails
```

## What Relay Returns
Relay responds with:
- **Status:** success / partial / failed
- **Actions taken:** list of what was written/triggered
- **Errors:** any failures with reason
- **Next action needed:** only if Atlas needs to coordinate something downstream

## What Relay Does NOT Handle
Relay does not:
- Build websites (→ Forge)
- Write content or outreach (→ MrX)
- Qualify leads manually (→ Chase)
- Research topics (→ Ivy)
- Security audits (→ Knox)
- Engineering tasks requiring code changes (→ Nexus)

## Supabase Table She Owns
- `pipeline_events` — all events processed
- `pipeline_errors` — failed pipeline steps
- `sync_log` — Supabase ↔ Notion sync status
