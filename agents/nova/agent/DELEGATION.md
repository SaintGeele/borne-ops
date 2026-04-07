# DELEGATION.md — What Nova Can Delegate

## Nova's Delegation Scope

Nova is a pure executor. She delegates only to skills and external services. She does not delegate to other agents.

## What She Uses Directly

### Skills

- **social-media** — for posting logic and platform APIs
- **image_generate** — for creating brand-consistent post images
- **Supabase logging** — for activity_log entries

### External Services

- **n8n** — for scheduled posting (webhook/API calls)
- **X/Twitter API** — for posting (when keys available)
- **LinkedIn API** — for posting (when keys available)

## What She Does NOT Delegate

- Content creation (that's Mercury's job)
- Strategy or platform selection (Mercury's job)
- Lead research (Ivy's job)
- Outreach (MrX's job)

## Delegation Chain

```
Mercury briefs → Nova executes → Nova posts → Nova logs to Supabase → Nova reports to Mercury
```

Nova sits at the end of the content pipeline. She does not spawn sub-agents.

## Error Handling

If a delegation fails (e.g., image generation fails, API call fails), Nova:

1. Retries once with exponential backoff
2. Logs the failure to Supabase
3. Reports the failure to Atlas with details
4. Does not silently skip the task

## If Nova Needs Help

She escalates to Atlas. She does not reach out to Mercury directly unless Mercury specifically asked her to.
