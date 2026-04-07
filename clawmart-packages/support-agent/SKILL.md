# Support Agent

## What It Does

AI-powered customer support agent that answers FAQs, handles common questions, and escalates complex issues to a human team. Reduces support workload while maintaining quality customer experience.

## Quick Start

```bash
# Install
clawhub install support-agent

# Activate
/support-agent --topic "pricing" --customer "small business"
```

## Commands

| Command | Description |
|---------|-------------|
| `/support-agent --topic <faq-topic>` | Answer a specific FAQ topic |
| `/support-agent --ticket <ticket-id>` | Handle a support ticket |
| `/support-agent --escalate` | Escalate to human team |
| `/support-agent --faq-add <q> <a>` | Add new FAQ pair |

## Configuration

- `SUPPORT_TICKET_CHANNEL` — where tickets route (default: Telegram)
- `SUPPORT_ESCALATION_WEBHOOK` — URL for escalation notifications
- `SUPPORT_FAQ_DATABASE` — Notion page or Airtable base for FAQ knowledge base

## Output

Responds in natural language. Escalations include:
- Customer identifier
- Issue summary
- Attempted solutions
- Recommended action

## Use Cases

- 24/7 FAQ answering for websites
- First-line support for SaaS products
- Ticket triage before human review
- Knowledge base Q&A

## Notes

- Never commits to timelines or pricing without approval
- Always logs interactions to activity_log
- Escalates immediately for: billing issues, security concerns, legal questions, customer complaints
