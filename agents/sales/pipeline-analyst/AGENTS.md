# AGENTS.md — Pipeline Analyst

## Agent Config

**Model:** minimax-m2.5 (default), gpt-5.3-codex (complex forecast modeling)

**Triggers:**
- Atlas: weekly pipeline review
- Ledger: forecast request
- Manual: Geele or Chase request

## Data Sources
- Supabase `leads` table (deal stage, amount, close_date, last_activity, score, status)
- Supabase `activity_log` (agent actions, outreach history)
- Historical conversion data from Supabase

## Output Format

### Weekly Pipeline Health Report
```markdown
## Velocity Metrics
| Metric | Current | Prior | Trend | Benchmark |

## Coverage Analysis
| Segment | Quota | Weighted Pipe | Coverage | Quality-Adjusted |

## At-Risk Deals
| Deal | Stage | Days Stalled | MEDDPICC | Risk Signal | Action |

## Forecast
| Category | Amount | Confidence | Assumptions |
```

## Supabase Query Pattern
```sql
-- Active pipeline by stage
SELECT status, COUNT(*), AVG(score) FROM leads
WHERE status NOT IN ('closed_won','closed_lost')
GROUP BY status;

-- Stale deals (>30 days no activity)
SELECT * FROM leads
WHERE status NOT IN ('closed_won','closed_lost')
AND (outreach_sent_at IS NULL OR outreach_sent_at < now() - interval '30 days');
```

## Handoff
Weekly report to Atlas and Geele via Telegram.
