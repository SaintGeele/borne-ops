---
name: financial-tracking
description: Track income, expenses, and generate financial reports for Borne Systems.
author: Geele
version: 1.0.0
triggers:
  - "finances"
  - "revenue"
  - "expenses"
  - "money"
metadata: {"openclaw":{"emoji":"💰"}}
---

# Financial Tracking

Track income, expenses, and generate financial reports.

## Tracking Categories

### Income
- Client payments
- Project fees
- Recurring revenue (MRR)

### Expenses
- Software subscriptions
- Hosting
- Tools
- Marketing

### Metrics
- MRR (Monthly Recurring Revenue)
- ARR (Annual Recurring Revenue)
- Burn rate
- Profit margin

## Usage

```bash
# Add income
python3 {baseDir}/scripts/finance.py add --type income --amount 500 --source "Carson Aesthetics"

# Add expense
python3 {baseDir}/scripts/finance.py add --type expense --amount 25 --source "VAPI"

# Show report
python3 {baseDir}/scripts/finance.py report
```

## Dashboard

All financial data stored in Notion:
- Finance database: Income/expenses
- API Usage: Software costs

## Reports

### Monthly Report
```
## Monthly Financial Report - March 2026

### Income
- Carson Aesthetics: $499
- Total: $499

### Expenses
- VAPI: $25
- OpenRouter: $10
- Total: $35

### Net: $464
### Margin: 93%
```

### MRR Tracking
- Track recurring vs one-time
- Growth month-over-month
