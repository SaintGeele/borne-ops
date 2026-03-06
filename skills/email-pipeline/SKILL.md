---
name: email-pipeline
description: Email pipeline for processing leads. Auto-score, respond, and nurture leads via email.
author: Geele
version: 1.0.0
triggers:
  - "email pipeline"
  - "lead email"
  - "send email"
metadata: {"openclaw":{"emoji":"📧"}}
---

# Email Pipeline

Process leads through email - scoring, responses, and nurturing.

## Workflow

### 1. Lead Entry
Lead enters via:
- Website form
- Social media
- Referral
- Cold outreach response

### 2. Auto-Score
Run lead scoring → categorize

### 3. Response
Based on score:
- **Hot (80+)**: Personal call-to-action
- **Warm (60-79)**: Qualification email
- **Cool (40-59)**: Content nurture
- **Cold (0-39)**: Remove or low-touch

### 4. Follow-up Sequence
- Day 0: Initial response
- Day 2: Follow-up #1
- Day 5: Follow-up #2
- Day 14: Final

## Email Templates

### Hot Lead - Initial Response
```
Subject: Quick call to discuss [Company] AI needs

Hi [Name],

Thanks for reaching out! I saw you're looking at [service] for [company].

I'd love to learn more about your specific needs. Are you available for a 15-min call this week?

Best,
[Your Name]
```

### Warm Lead - Qualification
```
Subject: Questions about [Company]'s needs

Hi [Name],

Thanks for your interest! I have a few questions:

1. What's your current challenge with [area]?
2. What's your timeline?
3. Do you have a budget in mind?

Happy to help however I can.

Best,
[Your Name]
```

### Cool Lead - Content Nurture
```
Subject: Resources for [Topic]

Hi [Name],

Thanks for checking us out! Here are some resources that might help:

[Link to blog post]
[Link to case study]

Let me know if you have questions.

Best,
[Your Name]
```

## Integration
- Uses Resend for sending
- Stores in Notion Leads database
- Lead scoring integrated

## Usage

```bash
python3 {baseDir}/scripts/send_response.py --lead "Company Name" --score 85 --template hot
```

## To Do
- [ ] Connect Resend API for sending
- [ ] Set up email sequences
- [ ] Track open/click rates