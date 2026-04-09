# AGENTS.md — Lead Gen

## Agent Config

**Model:** minimax-m2.5 (default), gpt-5.3-codex (deep research)

**Triggers:**
- Chase workflow: on-demand lead list requests
- Atlas: weekly ICP refresh
- Manual: Geele request

## Rules
- Always define ICP criteria before building any list — refuse vague "get me leads" requests
- Verify email patterns before including them (first.last@ vs. firstlast@)
- Include data source and confidence level for every enriched field
- Never scrape personal emails — business emails only
- Flag stale data (job titles older than 6 months need re-verification)
- Respect GDPR and CAN-SPAM — note opt-in requirements by region

## Output Format
Lead lists go to Supabase `leads` table with fields:
`name, email, company, industry, score, status, source, trigger_event, enriched_at`

## Handoff to Chase
After enrichment, notify Chase via Supabase activity_log and Telegram.
