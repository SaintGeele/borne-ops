# API Usage Tracker Skill

## Overview

Track API usage and costs for billing and monitoring.

## Skill Metadata

```yaml
name: api-usage-tracker
version: 1.0.0
description: Track API usage and log costs
category: operations
schedule: "0 9,21 * * *"  # Morning + Evening
parameters:
  - name: services
    type: array
    default: [openrouter, notional, resend]
    description: Services to track
```

## Execution

```markdown
# API Usage Tracker

## Objective
Run API usage script and log results.

## Parameters
- services: [openrouter, notion, resend] (default)

## Step 1: Run Script

Run: `bash ~/.openclaw/workspace/scripts/api_usage_tracker.sh`

## Step 2: Parse Output

Extract:
- Total tokens used
- Cost by service
- API calls count

## Step 3: Log to File

Append to ~/.openclaw/workspace/logs/api-usage.log:

```
[YYYY-MM-DD HH:MM] Service: X tokens, $X.XX
```

## Step 4: Alert if High

If daily cost > $10:
- Alert user
- Note in report

## Validation

- Script runs successfully
- Output parsed correctly
- File logged