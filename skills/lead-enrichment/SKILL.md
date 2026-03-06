---
name: lead-enrichment
description: Enrich leads with company information using Tavily search. Use to research prospects before outreach - find company details, size, industry, news, and decision makers.
author: Geele
version: 1.0.0
triggers:
  - "enrich lead"
  - "research company"
  - "company info"
  - "lead lookup"
metadata: {"openclaw":{"emoji":"🔎"}}
---

# Lead Enrichment

Enrich leads with company information using Tavily search API.

## Usage

### Enrich a company from website URL
```bash
python3 {baseDir}/scripts/enrich.py "https://company.com"
```

### Enrich from company name
```bash
python3 {baseDir}/scripts/enrich.py "Company Name"
```

### Get specific info (decision makers, news, etc.)
```bash
python3 {baseDir}/scripts/enrich.py "company.com" --focus "decision makers"
python3 {baseDir}/scripts/enrich.py "company.com" --focus "news"
python3 {baseDir}/scripts/enrich.py "company.com" --focus "technology stack"
```

## Examples

**Basic enrichment:**
```bash
python3 {baseDir}/scripts/enrich.py "https://acme.com"
```

**Research for cold outreach:**
```bash
python3 {baseDir}/scripts/enrich.py "acme.com" --focus "about company size industry"
```

**Find decision makers:**
```bash
python3 {baseDir}/scripts/enrich.py "acme.com" --focus "CEO CTO leadership team"
```

## Output Format

```markdown
## Company Enrichment: [Company Name]

### Basic Info
- Industry: [Industry]
- Company Size: [Size/Employees]
- Location: [Location]
- Description: [Summary]

### Recent News
- [News item 1]
- [News item 2]

### Technology
- [Tech stack if available]

### Key People
- [Decision makers if found]

### Outreach Notes
- [Suggestions for outreach based on findings]
```

## Integration

This skill is used by **Outreach Agent** to:
1. Research prospects before cold outreach
2. Find relevant talking points
3. Identify decision makers
4. Personalize cold emails

## API Key

- Uses Tavily API (already configured)
- Stored in: `~/.openclaw/credentials/tavily.json`
