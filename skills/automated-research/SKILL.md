---
name: automated-research
description: Automatically find local businesses without websites using web research. Build lead lists for outreach.
author: Geele
version: 1.0.0
triggers:
  - "research businesses"
  - "find leads"
  - "automated research"
metadata: {"openclaw":{"emoji":"🔬"}}
---

# Automated Business Research

Automatically find local businesses without websites using Tavily search.

## Usage

### Research a specific area and industry
```bash
python3 {baseDir}/scripts/research_leads.py --area "Milford, CT" --industry "restaurant"
```

### Research multiple areas
```bash
python3 {baseDir}/scripts/research_leads.py --area "Connecticut" --industry "auto repair,hvac,plumber"
```

### Full research run
```bash
python3 {baseDir}/scripts/research_leads.py --full
```

## Process

1. Search for businesses in area + industry
2. Check each business for website
3. Flag businesses WITHOUT websites
4. Save to leads database
5. Generate outreach list

## Output

CSV with:
- Business Name
- Address
- Phone
- Has Website (Yes/No)
- Website URL (if found)
- Research Date

## Integration
- Results save to Notion Leads database
- Ready for VAPI cold call outreach
- Mock websites can be generated

## Automation
Set up cron job to run daily:
```bash
0 9 * * * python3 /path/to/research_leads.py --full
```

## Target Areas
- Connecticut (CT)
- New York (NY)
- New Jersey (NJ)
- Massachusetts (MA)

## Target Industries
- Restaurant
- Auto Repair
- HVAC
- Plumber
- Salon
- Barber
- Pet Grooming
- Home Cleaning
- Landscaping
- Medical Practice
- Law Firm
- Accountant
