---
name: market-research
description: Crawl competitor websites to gather documentation, pricing, and market intelligence. Use to research competitors, compare offerings, and find market gaps.
author: Geele
version: 1.0.0
triggers:
  - "market research"
  - "competitor analysis"
  - "compare pricing"
  - "crawl competitor"
metadata: {"openclaw":{"emoji":"📈"}}
---

# Market Research Tool

Crawl competitor websites to gather documentation, pricing, and market intelligence.

## Usage

### Research a competitor
```bash
python3 {baseDir}/scripts/research.py "https://competitor.com"
```

### Get pricing info
```bash
python3 {baseDir}/scripts/research.py "https://competitor.com/pricing" --focus pricing
```

### Compare multiple competitors
```bash
python3 {baseDir}/scripts/research.py "competitor1.com,competitor2.com" --compare
```

### Find documentation/features
```bash
python3 {baseDir}/scripts/research.py "https://competitor.com/features" --focus features
```

## Examples

**Basic competitor research:**
```bash
python3 {baseDir}/scripts/research.py "https://www.automation-anywhere.com"
```

**Pricing comparison:**
```bash
python3 {baseDir}/scripts/research.py "https://www.automation-anywhere.com/pricing"
```

**Feature analysis:**
```bash
python3 {baseDir}/scripts/research.py "https://www.automation-anywhere.com/platform" --focus features
```

## Output Format

```markdown
## Market Research: [Competitor Name]

### Company Overview
- Description: [Summary]
- Founded: [Year]
- Size: [Employees]
- Target: [Market segment]

### Pricing
- [Pricing tiers if found]
- [Key pricing signals]

### Features
- [Feature 1]
- [Feature 2]
- [Differentiation]

### Market Position
- [Strengths]
- [Weaknesses]

### Opportunities for Borne
- [Gap to exploit]
```

## Use Cases

1. **Competitor Analysis** - Understand what others offer
2. **Pricing Intelligence** - Benchmark your pricing
3. **Feature Gaps** - Find underserved needs
4. **Market Positioning** - Differentiate your offering

## Integration

Used by:
- **Analytics Agent** - For market intelligence
- **Research Agent** - For competitor research
- **Outreach Agent** - To find positioning angles

## Tools Used

- Web Fetch - For crawling pages
- Tavily - For additional context search
