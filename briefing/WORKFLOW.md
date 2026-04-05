# Daily CEO Briefing Workflow

## Overview
Daily automated briefing for Geele (CEO) aggregating runtime health, security, research, and engineering status.

## Schedule
- **Time:** Daily 2:00 AM ET
- **Execution:** Cron-triggered shell script

## Agent Assignments

| Agent | Role | Output |
|-------|------|--------|
| Mission Control | Runtime Health | System status, service health, uptime |
| Knox | Security Concerns | Vulnerabilities, alerts, hardening status |
| Ivy | Research Opportunities | Market gaps, competitor intel, leads |
| Nexus | Engineering Priorities | In-progress work, blockers, next tasks |
| Chronicle | Final Recording | Consolidate & store briefing |

## Execution Flow

```
┌─────────────────┐
│  Cron (2 AM ET) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Execute Script │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌───────┐ ┌───────┐
│Mission│ │ Knox  │
│Control│ │       │
└───┬───┘ └───┬───┘
    │         │
    ▼         ▼
┌───────┐ ┌───────┐
│ Ivy   │ │ Nexus │
│       │ │       │
└───┬───┘ └───┬───┘
    │         │
    └────┬────┘
         │
         ▼
┌─────────────────┐
│   Chronicle     │
│  (Aggregate)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   BorneAI       │
│  (Deliver to    │
│   Geele)        │
└─────────────────┘
```

## Output Format

Briefing message structure:
```
📊 DAILY BRIEFING - [DATE]

🔧 RUNTIME HEALTH
[Summary from Mission Control]

🛡️ SECURITY
[Summary from Knox]

📈 RESEARCH
[Summary from Ivy]

⚙️ ENGINEERING
[Summary from Nexus]

---
Recorded by Chronicle
```

## Files

- `scripts/run-briefing.sh` - Main execution script
- `prompts/mission-control.md` - Runtime health prompt
- `prompts/knox.md` - Security concerns prompt
- `prompts/ivy.md` - Research opportunities prompt
- `prompts/nexus.md` - Engineering priorities prompt
- `prompts/chronicle.md` - Aggregation prompt