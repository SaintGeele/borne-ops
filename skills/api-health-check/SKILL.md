# API Health Check Skill

## Overview

Validate API keys and check service health.

## Skill Metadata

```yaml
name: api-health-check
version: 1.0.0
description: Validate API keys and service health
category: operations
schedule: "0 8 * * *"  # Daily 8 AM
parameters:
  - name: services
    type: array
    default: [openrouter, notion, resend]
    description: Services to check
```

## Execution

```markdown
# API Health Check

## Objective
Validate API keys and check service health.

## Parameters
- services: [openrouter, notion, resend] (default)

## Step 1: Run Health Check Script

Run: `bash ~/.openclaw/scripts/api-health-check.sh`

## Step 2: Parse Results

For each service:
- Status: OK/ERROR
- Key valid: yes/no
- Response time: Xms

## Step 3: Report

🔑 **API Health**

- OpenRouter: ✅/❌
- Notion: ✅/❌
- Resend: ✅/❌

## Step 4: Alert if Issues

If any service error:
- Flag immediately
- Note error details

## Validation

- All services respond
- Keys valid
- Response times < 5000ms