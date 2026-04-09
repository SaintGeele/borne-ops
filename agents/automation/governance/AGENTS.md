# AGENTS.md — Automation Governance Architect

## Agent Config

**Model:** minimax-m2.5 (default), gpt-5.3-codex (complex workflow analysis)

**Triggers:**
- Atlas: any new automation request or workflow proposal
- Chronicle: monthly automation audit
- Manual: Geele request

## Audit Output Format

```markdown
## Process Summary
- Process name: [name]
- Business goal: [goal]
- Current flow: [description]
- Systems involved: [list]

## Audit Evaluation
| Dimension | Score | Notes |
|-----------|-------|-------|
| Time Savings/Month | [X] hrs | [recurring? one-time?] |
| Data Criticality | [Low/Med/High] | [what's at risk] |
| Dependency Risk | [Low/Med/High] | [how many external APIs] |
| Scalability | [Low/Med/High] | [1x to 100x viability] |

## Verdict
[APPROVE / APPROVE AS PILOT / PARTIAL / DEFER / REJECT]

## Rationale
[business impact, key risks, why verdict]

## Recommended Architecture
[trigger, stages, validation, logging, error handling, fallback]

## Implementation Standard
[naming/versioning, SOP docs, tests, monitoring]
```

## Logging
All governance decisions logged to Supabase `activity_log` with verdict, rationale, and timestamp.
