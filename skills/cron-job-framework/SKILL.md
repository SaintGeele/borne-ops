# Cron Job Framework Skill

## Purpose

Create reusable, maintainable cron job tasks as skills instead of pasting raw prompts into cron config.

## Why Skills Over Raw Prompts?

| Raw Prompt in Cron | Skill-based Cron |
|---|---|
| Hard to test manually | Run skill directly to test |
| No versioning | Version controlled |
| Single purpose | Reusable anywhere |
| No parameters | Accepts dynamic parameters |
| Hard to debug | Built-in error handling |
| One-off logic | Modular, maintainable |

## Skill Structure

```
cron-job-skill/
├── SKILL.md           # This file
├── skill.yaml         # Skill metadata
├── prompts/
│   ├── run.md         # Main execution prompt
│   └── test.md        # Test/validation prompt
├── scripts/
│   └── validate.sh    # Optional validation script
└── config/
    └── defaults.yaml # Default parameters
```

## YAML Schema

```yaml
name: "cron-job-name"
version: "1.0.0"
description: "What this cron job does"
schedule: "0 9 * * *"  # Cron expression (for reference)
category: "security|operations|analytics|outreach"

# Parameters this skill accepts
parameters:
  - name: "target"
    type: "string"
    required: true
    description: "Target system or database"
  - name: "threshold"
    type: "number"
    default: 5
    description: "Alert threshold"

# Execution settings
execution:
  timeout_seconds: 120
  retry_attempts: 3
  retry_delay_seconds: 10
  
# Output settings
output:
  format: "json|markdown|text"
  destination: "telegram|notion|file"
```

## Execution Prompt Template

```markdown
# {{skill_name}}

## Objective
{{one-line objective}}

## Parameters
- {{param1}}: {{description}}
- {{param2}}: {{description}}

## Steps

### Step 1: {{action}}
{{specific instruction}}

### Step 2: {{action}}
{{specific instruction}}

## Error Handling
- If {{error condition}}: {{action}}
- If {{error condition}}: {{action}}

## Output Format
{{expected output format}}

## Validation
- {{validation check}}
- {{validation check}}
```

## Cron Configuration

For cron jobs using skills, configure like:

```json
{
  "name": "My Cron Job",
  "schedule": "0 9 * * *",
  "payload": {
    "kind": "agentTurn",
    "message": "Run skill: my-cron-job-skill with parameters: {target: 'production', threshold: 10}"
  }
}
```

Or via CLI:
```
openclaw cron add --skill my-cron-job-skill --params '{"target":"production"}' --schedule "0 9 * * *"
```

## Best Practices

1. **Test manually first** — Run the skill manually before automating
2. **Add timeout** — Prevent runaway jobs
3. **Add retry logic** — Handle transient failures
4. **Log output** — Write results to file for debugging
5. **Validate before output** — Check data quality before alerting
6. **Use parameters** — Make it dynamic, not hardcoded
7. **Version your skill** — Track changes

## Categories

### Security Skills
- CVE monitoring
- Host auditing
- Auto-remediation
- API health checks

### Operations Skills
- Morning/evening briefings
- Project status checks
- Client ops reviews

### Analytics Skills
- Metrics calculation
- Lead generation reports
- Content pipeline status

### Outreach Skills
- Lead review and outreach
- Follow-up sequencing
- Status updates