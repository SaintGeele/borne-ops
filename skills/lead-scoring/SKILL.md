---
name: lead-scoring
description: Score leads based on fit, budget, seriousness, and company trust. Use to prioritize outreach and qualify leads.
author: Geele
version: 1.0.0
triggers:
  - "score lead"
  - "qualify lead"
  - "lead score"
metadata: {"openclaw":{"emoji":"🎯"}}
---

# Lead Scoring Rubric

Score leads automatically based on fit, budget, seriousness, and trust.

## Scoring Criteria

### 1. Fit (0-30 points)
| Criteria | Points |
|----------|--------|
| Industry matches ICP (real estate, law, finance, med spa, contractors) | 15 |
| Company size 1-50 employees | 10 |
| Location in CT, NY, NJ, MA | 5 |

### 2. Budget (0-25 points)
| Criteria | Points |
|----------|--------|
| Mentioned budget $100+/month | 15 |
| Asked about pricing | 5 |
| Has budget for marketing/tech | 5 |

### 3. Seriousness (0-25 points)
| Criteria | Points |
|----------|--------|
| Specifically asked about services | 10 |
| Provided contact info willingly | 5 |
| Responded to initial outreach | 5 |
| Requested demo/call | 5 |

### 4. Company Trust (0-20 points)
| Criteria | Points |
|----------|--------|
| Established business (2+ years) | 10 |
| Has professional website | 5 |
| Active social media | 5 |

## Score Interpretation

| Score | Grade | Action |
|-------|-------|--------|
| 80-100 | A (Hot) | Priority follow-up within 24h |
| 60-79 | B (Warm) | Qualify, schedule call |
| 40-59 | C (Cool) | Nurture with content |
| 0-39 | D (Cold) | Polite decline or remove |

## Usage

```bash
python3 {baseDir}/scripts/score.py "Company Name" --industry law --size medium --budget high --serious high
```

## Output

```markdown
## Lead Score: 75/100 (B - Warm)

### Breakdown
- Fit: 25/30
- Budget: 20/25
- Seriousness: 20/25
- Trust: 10/20

### Recommendation
Schedule discovery call. They're interested but need qualification.
```

## Integration
- Used by Outreach Agent
- Scores saved to Notion Leads database
- Auto-categorizes: Hot, Warm, Cool, Cold