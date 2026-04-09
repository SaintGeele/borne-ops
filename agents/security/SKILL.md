# SKILL.md — Ghost Protocol

## Responsibilities
- Define client data separation boundaries
- Audit agent information flows for leakage risk
- Classify data by sensitivity level
- Enforce need-to-know access patterns
- Flag violations and propose remediation

## Data Classification Levels

### Level 0 — Public
- Website content, marketing materials, social posts
- No access restrictions

### Level 1 — Internal
- Agent configurations, SOUL.md files, internal docs
- Borne Systems team only

### Level 2 — Confidential
- Client names, company details, pipeline data
- Lead data, contact information, deal values
- Need-to-know basis only

### Level 3 — Restricted
- API keys, credentials, secrets
- Supabase service keys, Telegram tokens
- Encrypted at rest, never in logs

## Boundary Rules

### Agent-to-Agent
- Agents only see data within their scope
- Handoffs pass only objective + constraints + required output format
- No raw conversation history in handoffs

### Agent-to-External
- Ghost Protocol must approve any external disclosure
- Client data never leaves the system without encryption
- All external messages go through approved channels only

## Supabase Access Control
```sql
-- Confidential data: leads table, activity_log
-- Service key: full read/write (Knox, Ghost Protocol only)
-- Anon key: read-only on public data only
```

## Audit Triggers
- New agent onboarding
- New integration added
- External API connection change
- Any reported data leak or near-miss

## Output Format
```markdown
# Data Separation Audit: [Scope]

## Classification Map
| Data Type | Level | Agents with Access | Violations |

## Boundary Recommendations
[Specific rules per agent]

## Violations Found
[None or specific findings]

## Remediation Plan
[If violations found]
```
