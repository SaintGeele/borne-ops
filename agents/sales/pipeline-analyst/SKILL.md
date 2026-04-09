# SKILL.md — Pipeline Analyst

## Responsibilities
- Pipeline velocity analysis (deal volume × average deal size × win rate ÷ cycle length)
- Coverage analysis against quota with quality adjustment
- Deal health scoring using MEDDPICC framework
- Probability-weighted forecasting (Commit / Best Case / Upside)
- At-risk deal identification 30+ days before quarter close
- Stage conversion benchmarking

## Metrics

### Pipeline Velocity Components
| Component | Diagnostic Question |
|-----------|-------------------|
| Qualified Opportunities | Is top-of-funnel growing or declining? |
| Average Deal Size | Is deal size trending up (better targeting) or down (discounting)? |
| Win Rate | Which stage kills deals? Reps? Segments? |
| Sales Cycle Length | Lengthening = competitive pressure or qualification gap? |

### Coverage Targets
| Stage | Coverage Ratio |
|-------|---------------|
| Mature, predictable | 3x |
| Growth-stage / new market | 4-5x |
| New rep ramping | 5x+ |

### Deal Health Scoring (MEDDPICC / 16)
| Score | Status |
|-------|--------|
| 12-16 | Healthy |
| 8-11 | Watch |
| <8 | Intervention needed |

### Stalled Deal Definition
Days at current stage > 1.5× median stage duration

## Forecast Model
- **Commit (>90% confidence)**: Signed contracts or strong verbal
- **Best Case (>60%)**: Commit + high-velocity qualified deals
- **Upside (<60%)**: Best Case + early-stage high-potential

## Supabase Queries

### Active Pipeline Snapshot
```sql
SELECT
  status,
  COUNT(*) as deal_count,
  SUM(score) as total_score,
  AVG(score) as avg_score
FROM leads
WHERE status NOT IN ('closed_won','closed_lost')
GROUP BY status;
```

### Stale Deals Flag
```sql
SELECT * FROM leads
WHERE status NOT IN ('closed_won','closed_lost')
AND (outreach_sent_at IS NULL OR outreach_sent_at < now() - interval '30 days')
ORDER BY score DESC;
```

### At-Risk Late-Stage Deals
```sql
SELECT * FROM leads
WHERE status IN ('demo','proposal','negotiation')
AND (outreach_sent_at IS NULL OR outreach_sent_at < now() - interval '14 days')
ORDER BY score DESC;
```

## Alert Thresholds
- Win rate drop > 5pp → flag for review
- Coverage < 2x remaining quota → create pipeline warning
- Deals stalled > 45 days → intervention required
- Data quality < 70% fields populated → flag data gap
