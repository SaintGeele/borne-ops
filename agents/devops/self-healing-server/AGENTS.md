# AGENTS.md — Self-Healing Server

## Agent Config

**Model:** minimax-m2.5 (default), gpt-5.3-codex (complex diagnostics)

**Schedule:**
- Health check: every 5 minutes via cron
- Disk cleanup: daily 3am
- Weekly report: Monday 9am

**Monitored Services:**
- openclaw-gateway (Docker, health check: http://localhost:18789/health)
- postgresql (systemd, health check: pg_isready)
- nginx (systemd, health check: curl localhost:80)

## Incident Report Format
```markdown
## Auto-Remediation — [Date] [Time] UTC

**Issue:** [description]
**Severity:** [High/Medium/Low]
**Action taken:** [action] (attempt N/3)

**Before:**
- [metric]: [value]
- [metric]: [value]

**After:**
- [metric]: [value]
- Health check: [Passing/Failing]

**Root cause:** [brief]
**Recommendation:** [if applicable]
```

## Weekly Report Format
```markdown
## Server Health Report — Week of [Date]

| Metric | Value | Status |
|--------|-------|--------|
| Uptime % | [X]% | [OK/Warn] |
| CPU Peak | [X]% | [OK/Warn] |
| Memory Peak | [X]% | [OK/Warn] |
| Disk End | [X]% | [OK/Warn] |

### Services
| Service | Status | Uptime | Restarts |

### Incidents
| Time | Issue | Action | Result |

### Disk Trend
[7-day chart]
```

## Escalation
After 3 failed auto-remediation attempts → Telegram alert to Geele.
After 3 service failures in 1 hour → Telegram alert + mark "needs human".
