# Analytics Report Skill

## Overview

Query Notion databases for metrics and generate daily business insights reports.

## Skill Metadata

```yaml
name: analytics-report
version: 1.0.0
description: Query Notion for business metrics and generate reports
category: analytics
schedule: "0 18 * * *"  # Daily 6 PM
parameters:
  - name: databases
    type: array
    default: ["Leads", "Projects", "Content"]
    description: Which databases to query
  - name: period
    type: string
    default: daily
    description: Report period (daily|weekly|monthly)
```

## Execution

```markdown
# Analytics Report

## Objective
Query Notion databases for business metrics and generate insights.

## Parameters
- databases: [Leads, Projects, Content] (default)
- period: daily|weekly|monthly (default: daily)

## Step 1: Query Notion

For each database:

### Leads Database
- Total leads
- New leads (today/this week)
- Converted leads
- Lead sources breakdown
- Status distribution (HOT/WARM/NEW/COLD)

### Projects Database
- Active projects
- Completed projects
- Blocked/overdue projects
- Revenue generated

### Content Database
- Posts published
- Engagement metrics
- Pipeline status

## Step 2: Calculate Metrics

Calculate:
- Lead conversion rate
- Project completion rate
- Content output count
- Period-over-period changes

## Step 3: Generate Insights

Identify:
- Wins (improvements)
- Alerts (declines)
- Trends

## Step 4: Report

📊 **Daily Analytics**

**Leads:**
- Total: X (+X new)
- Converted: X

**Projects:**
- Active: X
- Completed: X

**Content:**
- Published: X

[Insights...]

## Output

Write JSON to ~/.openclaw/workspace/analytics-latest.json:

```json
{
  "timestamp": "ISO8601",
  "period": "daily",
  "leads": {...},
  "projects": {...},
  "content": {...},
  "insights": [...]
}
```

## Validation

- Query all specified databases
- Include period-over-period changes
- Highlight alerts/wins