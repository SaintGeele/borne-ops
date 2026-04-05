# Outreach Batch Skill

## Overview

Review leads database, draft outreach messages, and send follow-ups to warm leads.

## Skill Metadata

```yaml
name: outreach-batch
version: 1.0.0
description: Lead outreach automation - review, draft, follow-up
category: outreach
schedule: "0 9 * * *"  # Daily 9 AM
parameters:
  - name: new_leads
    type: number
    default: 5
    description: Number of new leads to outreach
  - name: warm_followups
    type: number
    default: 3
    description: Number of warm lead follow-ups
  - name: include_linkedin
    type: boolean
    default: true
    description: Include LinkedIn messages
```

## Execution

```markdown
# Outreach Batch

## Objective
Review leads, draft outreach, send follow-ups.

## Parameters
- new_leads: 5 (default)
- warm_followups: 3 (default)
- include_linkedin: true|false (default: true)

## Step 1: Review Leads Database

Query Notion Leads database for:
- NEW leads (never contacted)
- WARM leads (responded, no close)
- HOT leads (close, not converted)

## Step 2: Draft New Outreach

For each new lead:
- Research company/person
- Personalize message
- Match to product fit
- Draft 3-5 sentences

## Step 3: Send Follow-ups

For warm leads:
- Check last contact date
- Send follow-up message
- Update status if needed

## Step 4: Update Notion

Update lead statuses:
- NEW → WARM (if contacted)
- WARM → HOT (if engaged)
- HOT → CLOSED (if converted)

## Step 5: Report

📬 **Outreach Report**

- New leads: X
- Drafts: X
- Follow-ups sent: X
- Status updates: X

[For each outreach:]
- [Lead]: [status] — [one-line summary]

## Validation

- Personalize each message
- Don't mass-template
- Update Notion after outreach
- Track response rate