# SKILL.md - Lead Pipeline Manager

## Description
Notion-based CRM for tracking leads through your pipeline. Scoring, follow-up reminders, and automated status updates.

## Features

### Lead Capture
- Add leads from any source (form, social, manual)
- Store: name, company, contact, source, notes
- Auto-timestamp creation

### Pipeline Stages
- **New** - Just captured
- **Contacted** - Initial outreach done
- **Qualified** - Confirmed interest
- **Proposal** - Sent quote/proposal
- **Won** - Closed deal
- **Lost** - No go

### Lead Scoring
Auto-score based on:
- Source quality (Web > Referral > Cold)
- Company size
- Response speed
- Engagement level

| Score | Rating |
|-------|--------|
| 80-100 | 🔥 Hot |
| 50-79 | 🌡️ Warm |
| 0-49 | ❄️ Cold |

### Follow-up Reminders
- Auto-remind after no contact (configurable days)
- Escalate stale leads
- Never lose a lead

### Pipeline Views
- Kanban board
- Leaderboard (by score)
- Overdue list

## Notion Database Schema
Create a database with:
- Name (title)
- Company (text)
- Email (email)
- Phone (phone)
- Source (select: Web, Referral, Cold, LinkedIn)
- Stage (select: New, Contacted, Qualified, Proposal, Won, Lost)
- Score (number: 0-100)
- Last Contact (date)
- Next Follow-up (date)
- Notes (text)

## Commands
- "Add lead [name] from [company]"
- "Update [company] to [stage]"
- "Show hot leads"
- "List overdue follow-ups"
- "Score [company]"
- "Pipeline summary"

## Integration
- Notion API required
- Telegram bot (optional, for alerts)

## Automation Ideas
- Auto-follow-up via cron
- Stage change notifications
- Weekly pipeline report

## Requirements
- Notion integration token
- Notion database created

## Pricing Tiers Compatible
Free: Up to 50 leads
Pro: Unlimited leads + automation