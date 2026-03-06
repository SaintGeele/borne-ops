---
name: onboarding
description: Automated client onboarding workflow. New clients get welcome email, setup tasks, and onboarding checklist.
author: Geele
version: 1.0.0
triggers:
  - "onboard"
  - "new client"
metadata: {"openclaw":{"emoji":"🚀"}}
---

# Client Onboarding

Automated workflow for new clients.

## Workflow

### 1. Welcome Email
- Thank them
- What to expect
- Next steps

### 2. Welcome Packet
- Service agreement
- Pricing summary
- Contact info

### 3. Setup Tasks
- [ ] Collect access credentials
- [ ] Set up accounts
- [ ] Configure services
- [ ] Schedule kickoff call

### 4. Kickoff Meeting
- Review goals
- Timeline
- Expectations

## Usage

```bash
python3 scripts/onboard.py "Client Name" --email "client@email.com" --service "AI Receptionist"
```

## Integration
- Uses Resend for emails
- Tracks in Notion Projects database
- Creates client folder in Google Drive (future)

## Checklist
See onboard.py for full workflow