# Outreach Report Skill

## Overview

Generate lead outreach reports from Notion.

## Skill Metadata

```yaml
name: outreach-report
version: 1.0.0
description: Generate lead outreach reports
category: outreach
schedule: "0 9 * * *"  # Daily 9 AM
parameters:
  - name: period
    type: string
    default: daily
    description: Report period (daily|weekly)
```

## Execution

```markdown
# Outreach Report

## Objective
Generate lead outreach report.

## Parameters
- period: daily|weekly (default: daily)

## Step 1: Run Report Script

Run: `python3 ~/.openclaw/workspace/scripts/outreach_report.py`

## Step 2: Parse Output

Extract:
- New leads contacted
- Responses received
- Conversions
- Pipeline changes

## Step 3: Format Report

📬 **Outreach Report** ([period])

- New: X
- Responded: X
- Converted: X

## Validation

- Script runs successfully
- Output parsed
- Stats accurate