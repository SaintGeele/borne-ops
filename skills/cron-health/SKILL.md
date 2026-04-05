# Cron Health Monitor Skill

## Overview

Monitor cron job health, classify status, and alert on failures.

## Skill Metadata

```yaml
name: cron-health
version: 1.0.0
description: Monitor cron job health and alert on failures
category: operations
schedule: "0 9 * * *"  # Daily 9 AM
parameters:
  - name: alert_threshold
    type: number
    default: 3
    description: consecutiveErrors threshold for alert
  - name: critical_jobs
    type: array
    default: ["Morning Brief", "Security Audit", "Security Fix", "API Health Check", "Cron Health Monitor"]
    description: Jobs that must be healthy
```

## Execution

```markdown
# Cron Health Monitor

## Objective
Check cron job health, classify status, alert on critical failures.

## Parameters
- alert_threshold: 3 (default)
- critical_jobs: [list of job names that must be healthy]

## Step 1: List All Cron Jobs

Run: `openclaw cron list --json`

## Step 2: Classify Each Job

For each cron job, classify status:

| Status | Criteria |
|--------|----------|
| HEALTHY | consecutiveErrors = 0 AND lastRunStatus = ok |
| WARNING | consecutiveErrors 1-2 |
| DEAD | consecutiveErrors >= 3 OR disabled |

## Step 3: Check Critical Jobs

For each job in critical_jobs list:
- If DEAD: 🚨 Alert immediately
- If WARNING: ⚠️ Note for summary

## Step 4: Count Totals

```
HEALTHY: X jobs
WARNING: X jobs  
DEAD: X jobs
DISABLED: X jobs
```

## Step 5: Report

If all healthy:
```
✅ All X crons healthy
```

If issues exist:
```
⚠️ Cron Health Report
- ✅ Healthy: X
- ⚠️ Warning: X
- 🚨 Dead: X

🚨 Critical Jobs Dead:
- [job name]: [error details]

⚠️ Jobs Needing Attention:
- [job name]: [status]
```

## Step 6: Auto-fix (optional)

For simple issues, auto-fix:
- Re-enable accidentally disabled jobs
- Fix delivery channel if misconfigured
- Reset consecutiveErrors for transient failures

## Output

Write JSON summary to ~/.openclaw/workspace/cron-health-latest.json:

```json
{
  "timestamp": "ISO8601",
  "totals": {
    "healthy": X,
    "warning": X,
    "dead": X,
    "disabled": X
  },
  "critical_dead": [],
  "jobs": [...]
}
```

## Critical Jobs to Monitor

- Morning Brief
- Security Audit
- Security Fix
- API Health Check
- Cron Health Monitor

## Validation

- Should report all cron jobs
- Should identify dead jobs by consecutiveErrors >= 3
- Should alert immediately if critical job is dead