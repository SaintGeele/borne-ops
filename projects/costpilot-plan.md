# CostPilot - Product Development Plan

## Product Overview
- **Name:** CostPilot
- **Type:** OpenClaw Skill / ClawMart Product
- **Purpose:** Prevent OpenClaw API overspending
- **Target:** Solo founders, SMBs using OpenClaw

---

## Problem Solved
- Users waking up to $300+ bills
- No native spend caps in OpenClaw
- Heartbeats burning $250/week on premium models
- Session context bloat

---

## Features (MVP)

### 1. Cost Monitor
- Track API spend via OpenRouter
- Display daily/weekly/monthly totals
- Session-level cost tracking

### 2. Budget Alerts
- Configurable thresholds (50%, 75%, 90%)
- Telegram/Discord notifications
- Warning before overspend

### 3. Auto-Model Routing
- When budget > 75%: auto-switch to cheaper model
- When budget > 90%: block non-essential calls
- Fallback chain: MiniMax → GPT-nano → Flash

### 4. Heartbeat Optimizer
- Detect if heartbeats use premium models
- Auto-suggest/configure cheapest model
- Reduce heartbeat frequency option

### 5. Config Template
- Optimized model routing (default: MiniMax)
- Session reset reminders
- Budget limits

---

## Development Phases

### Phase 1: Foundation (Today)
- [ ] Create skill structure
- [ ] Build cost monitoring script
- [ ] Create SOUL.md cost rules

### Phase 2: Alerts (Today)
- [ ] Budget threshold logic
- [ ] Notification system
- [ ] Configurable limits

### Phase 3: Automation (Tomorrow)
- [ ] Auto-routing logic
- [ ] Heartbeat optimizer
- [ ] Session cost warnings

### Phase 4: ClawMart Launch
- [ ] SKILL.md documentation
- [ ] Pricing: Free (basic) / $29/mo (pro)
- [ ] Publish to ClawMart

---

## Pricing Strategy

| Tier | Price | Features |
|------|-------|----------|
| **Free** | $0 | Cost tracking, basic alerts, config template |
| **Pro** | $29/mo | Auto-routing, real-time dashboard, priority support |

---

## Success Metrics
- Reduce user API costs by 50-90%
- Easy 5-minute setup
- No config knowledge required

---

## Timeline
- **MVP:** 24 hours
- **ClawMart Publish:** 48 hours
- **Marketing:** Ready for morning brief