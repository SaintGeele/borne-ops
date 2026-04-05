# Coordinator Status Skill

## Overview

Scan projects for blocked or overdue tasks and send daily status summaries.

## Skill Metadata

```yaml
name: coord-status
version: 1.0.0
description: Project coordination - blocked/overdue check
category: operations
schedule: "45 7 * * *"  # Daily 7:45 AM
parameters:
  - name: check_blocked
    type: boolean
    default: true
    description: Check for blocked projects
  - name: check_overdue
    type: boolean
    default: true
    description: Check for overdue items
```

## Execution

```markdown
# Coordinator Status

## Objective
Scan projects database for status and send summary.

## Parameters
- check_blocked: true|false (default: true)
- check_overdue: true|false (default: true)

## Step 1: Query Projects Database

Get all active projects and tasks.

## Step 2: Identify Issues

### Blocked Projects
- Status = "Blocked"
- Blocker assigned
- No progress in 3+ days

### Overdue Items
- Deadline < today
- Status not "Complete"
- Past deadline by 1+ days

## Step 3: Categorize

- Critical: Blocked + overdue
- Warning: Blocked OR overdue
- On track: Everything else

## Step 4: Report

🎯 **Coordination Status**

**Critical (X):**
- [Project]: [issue]

**Warning (X):**
- [Project]: [issue]

**On Track (X)**

## Step 5: Action Items

For each blocked item:
- Identify next step
- Assign to team member
- Set unblock deadline

## Validation

- Include all active projects
- Show only actionable issues
- Recommend next steps