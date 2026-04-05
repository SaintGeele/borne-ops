# SecretScout Product Specification

## Core Differentiator
**Agent-aware secrets management** - understands OpenClaw agent graph, respects per-agent scopes, treats each agent as distinct identity. No existing secrets manager does this.

---

## Phase 1: Foundation (Now)

### Secrets Health
- [x] Pre-flight check script ✅
- [x] Backup system ✅
- [ ] Daily scan of all config files for hardcoded patterns
- [ ] Entropy scoring (flag weak/short tokens)
- [ ] Secret age tracking (flag >30 days as stale)
- [ ] Duplicate detection (same secret across agents)
- [ ] Alert when .env untouched in X days

### Backup & Recovery
- [x] Timestamped backups ✅
- [ ] Encrypted vault backup to S3 with versioning
- [ ] One-command full restore
- [ ] Disaster recovery mode (auto-restore from backup on boot)

---

## Phase 2: Core Product (Week 1-2)

### Rotation Engine
- [ ] Per-provider rotation scripts (Resend, Twilio, Telegram)
- [ ] Graceful rotation (24h overlap)
- [ ] Weekly rotation scheduler with cron
- [ ] Post-rotation smoke test
- [ ] Rollback on failed rotation

### Blast Radius Limiting
- [ ] Per-agent secret scoping (agent X only sees keys for agent X)
- [ ] Gateway token splitting (separate tokens per service)
- [ ] Read-only vs read-write token tiers
- [ ] Time-bound tokens (auto-expire)

### Developer Experience
- [ ] CLI: `openclaw secrets audit` - full scan and report
- [ ] CLI: `openclaw secrets rotate <key>` - rotate specific key
- [ ] CLI: `openclaw secrets status` - show health of all secrets
- [ ] Git pre-commit hook (block commits with secrets)
- [ ] Dry-run mode for all operations

---

## Phase 3: Advanced (Week 3-4)

### Audit & Visibility
- [ ] Every secret access logged with timestamp + agent
- [ ] Weekly digest to Telegram
- [ ] Anomaly detection (10x usage spike alert)
- [ ] Compliance report (90+ days without rotation)

### OpenClaw-Native
- [ ] MCP-compatible secret broker
- [ ] Agent identity tokens (unique per agent)
- [ ] Session-scoped secrets (expire with session)
- [ ] Runtime secret injection (never stored in agent workspace)

### Circuit Breaker
- [ ] IP/context binding
- [ ] Auto-revoke on unexpected source
- [ ] Alert on revocation

---

## Phase 4: Enterprise (Week 5+)

### Dashboard
- [ ] UI showing secret health across all agents
- [ ] Visual rotation schedule
- [ ] Audit log viewer

### HIPAA Angle
- [ ] HIPAA-aware secret handling
- [ ] Audit logs formatted for compliance review
- [ ] Dental-niche marketing

---

## Product Positioning

| Feature | Competitors | SecretScout |
|---------|-------------|-------------|
| Agent-aware | ❌ | ✅ |
| Local-first (no external deps) | ❌ | ✅ |
| MCP-compatible | ❌ | ✅ |
| Session-scoped tokens | ❌ | ✅ |
| HIPAA compliance | ❌ | ✅ |

---

## Pricing Tiers

| Tier | Price | Features |
|------|-------|----------|
| **Free** | $0 | Basic scan, manual backup, CLI tools |
| **Pro** | $19/mo | Auto-rotation, alerts, S3 backup |
| **Enterprise** | $99/mo | Full audit, HIPAA reports, MCP broker |

---

## Ready to Build First

Priority order:
1. Daily secret scanner (find hardcoded keys)
2. CLI commands (audit, rotate, status)
3. Rotation engine
4. Per-agent scoping

What should we tackle first?