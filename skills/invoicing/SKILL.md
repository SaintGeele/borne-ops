---
name: invoicing
description: Generate invoices and track payments for clients.
author: Geele
version: 1.0.0
triggers:
  - "invoice"
  - "billing"
metadata: {"openclaw":{"emoji":"📄"}}
---

# Invoicing

Generate invoices and track payments.

## Usage

```bash
# Create invoice
python3 scripts/invoice.py create --client "Client Name" --service "AI Receptionist" --amount 99

# List invoices
python3 scripts/invoice.py list

# Mark as paid
python3 invoice.py paid --id 1
```

## Invoice Fields
- Invoice number
- Client name
- Service description
- Amount
- Date
- Due date
- Status (pending/paid/overdue)

## Output
- Saves toborne-invoices.json
- Can export to PDF (future)