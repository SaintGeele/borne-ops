---
name: pricing-calculator
description: Calculate project pricing for clients based on services and scope.
author: Geele
version: 1.0.0
triggers:
  - "pricing"
  - "quote"
  - "estimate"
metadata: {"openclaw":{"emoji":"💵"}}
---

# Pricing Calculator

Calculate project pricing for clients.

## Services & Pricing

### Recurring (Monthly)
| Service | Price |
|---------|-------|
| AI Receptionist | $99/mo |
| Lead Automation | $149/mo |
| Security Basic | $199/mo |
| Security Pro | $399/mo |
| Full Stack | $499/mo |

### One-Time
| Service | Price |
|---------|-------|
| Website (simple) | $500-1,000 |
| Website (complex) | $1,500-3,000 |
| Automation setup | $300-1,000 |
| Security audit | $500-1,500 |

## Usage

```bash
# Calculate monthly
python3 scripts/calc.py --service "AI Receptionist" --months 6

# Calculate project
python3 scripts/calc.py --project website --pages 5 --complexity medium

# Custom quote
python3 scripts/calc.py --client "Company" --items "AI Receptionist,Lead Automation"
```

## Discounts
- 6 months prepaid: 10%
- 12 months prepaid: 20%
- Multiple services: 10% off