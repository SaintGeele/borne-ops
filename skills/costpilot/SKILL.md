---
name: costpilot
description: Cost monitoring and budget alert skill for OpenClaw. Tracks OpenRouter API spend, enforces budget thresholds, auto-switches to cheaper models when budgets are exceeded, and sends alerts via Telegram. Activate when cost control, budget tracking, or model routing decisions are needed.
---

# CostPilot — OpenClaw Cost Management Skill

## What It Does

CostPilot monitors OpenRouter API spend in real-time, enforces configurable budget thresholds, auto-switches to cheaper models when limits are approached, and alerts via Telegram.

## Core Files

- `SOUL.md` — Cost management principles and threshold defaults
- `scripts/monitor.js` — Daily cost tracking and Supabase logging
- `scripts/alert.js` — Budget threshold checker and Telegram alerts
- `scripts/router.js` — Auto-model routing based on current spend
- `scripts/heartbeat-optimizer.js` — Detects and fixes premium heartbeat models
- `references/openrouter-costs.md` — Current model pricing reference
- `config/.env.costpilot` — Environment variable template

## Usage

### Monitor (daily cron)
```
node skills/costpilot/scripts/monitor.js
```

### Alert check (hourly cron)
```
node skills/costpilot/scripts/alert.js
```

### Model router (before each API call)
```
node skills/costpilot/scripts/router.js --model gpt-4o --prompt "..."
```

### Heartbeat optimizer (one-time)
```
node skills/costpilot/scripts/heartbeat-optimizer.js
```

## Environment Variables

```env
COSTPILOT_DAILY_LIMIT=5.00      # $5/day hard cap
COSTPILOT_WARN_50=2.50          # 50% warning
COSTPILOT_WARN_75=3.75          # 75% warning
COSTPILOT_WARN_90=4.50          # 90% critical
COSTPILOT_AUTO_ROUTE=true       # Auto-switch models at 75%
COSTPILOT_TELEGRAM_ALERT=true   # Send Telegram alerts
```

## Budget Thresholds

| Threshold | Action |
|------------|--------|
| 50% | Warning log, no action |
| 75% | Alert + auto-route to cheaper model |
| 90% | Block non-essential calls |
| 100% | Halt all operations, alert |

## Auto-Route Model Chain

When budget > 75%, route down the chain:
1. `minimax/minimax-m2.7` → default
2. `openai/gpt-5-nano` → fallback at 75%
3. `google/gemini-2.5-flash` → fallback at 90%
4. Block all at 100%

## Supabase Schema

CostPilot logs to `costpilot_daily_spend` table:
```sql
CREATE TABLE costpilot_daily_spend (
  id UUID DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  total_spend DECIMAL(10,4) DEFAULT 0,
  request_count INT DEFAULT 0,
  avg_cost_per_request DECIMAL(10,6),
  top_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (date)
);
```

## Alert Triggers

- 50%: `[COSTPILOT] 50% of daily budget used ($X/$Y)`
- 75%: `[COSTPILOT] 75% budget — switching to cheaper model`
- 90%: `[COSTPILOT] 90% budget — blocking non-essential calls`
- 100%: `[COSTPILOT] DAILY LIMIT REACHED — halting operations`

## Heartbeat Optimization

Heartbeats default to `minimax-minimax-m2.7-highspeed` (free through OpenRouter). The optimizer scans cron configs and flags any heartbeat using Opus, Sonnet, or GPT-4 class models.
