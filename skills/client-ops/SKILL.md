# Client Operations Skill

## Overview

Check projects for deadlines due today, flag overdue items, review onboarding queue.

## Skill Metadata

```yaml
name: client-ops
version: 1.0.0
description: Client operations - deadlines, overdue, onboarding
category: operations
schedule: "0 8 * * *"  # Daily 8 AM
parameters:
  - name: include_onboarding
    type: boolean
    default: true
    description: Include onboarding queue check
  - name: include_deadlines
    type: boolean
    default: true
    description: Include today's deadlines
```

## Execution

```markdown
# Client Operations

## Objective
Check client project deadlines and onboarding queue.

## Parameters
- include_onboarding: true|false (default: true)
- include_deadlines: true|false (default: true)

## Step 1: Check Deadlines

Query projects with:
- Due date = today
- Status != Complete

For each:
- Project name
- Task/deliverable
- Time remaining

## Step 2: Check Overdue

Query projects with:
- Due date < today
- Status != Complete

For each:
- Project name
- Days overdue
- Blocker (if any)

## Step 3: Check Onboarding Queue

If include_onboarding:
- New clients pending setup
- Pending documents
- Pending kickoff call

## Step 4: Report

👥 **Client Ops Report**

**Due Today (X):**
- [Project]: [task]

**Overdue (X):**
- [Project]: [days overdue]

**Onboarding (X):**
- [Client]: [pending item]

## Step 5: Action Items

- Flag urgent deadlines
- Note blockers
- Track onboarding blockers

## Validation

- Include all due today
- Note blockers clearly
- Include onboarding status