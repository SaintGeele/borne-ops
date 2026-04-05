---
name: config-safety-first
description: Always backup critical files before making configuration changes. Prevents data loss from failed migrations or corrupted configs.
version: 1.0.0
author: Borne Systems
triggers:
  - "backup before"
  - "make config change"
  - "update secrets"
  - "migrate keys"
---

# Config Safety First

## Rule: ALWAYS backup before config changes

Before modifying any of these files, you MUST run the backup script:

- `~/.openclaw/openclaw.json` - Main config
- `~/.openclaw/.env` - Environment variables / secrets
- `~/.bashrc` - Shell config
- `~/.openclaw/agents/*/agent/auth-profiles.json` - API keys

## How to Use

```bash
# Run backup before any change
bash ~/.openclaw/workspace/scripts/config-backup-before-change.sh
```

## What Gets Backed Up

| File | Prevents |
|------|----------|
| openclaw.json | Lost config, broken gateway |
| .env | Lost all API keys, lockout |
| auth-profiles.json | Hardcoded secrets lost |
| bashrc | Shell config corruption |

## Restoration

If something breaks:
```bash
# Find latest backup
ls -la ~/.openclaw/backups/auto/

# Restore specific file
cp ~/.openclaw/backups/auto/openclaw.json.pre_change_20260328_XXXXXX ~/.openclaw/openclaw.json
```

## Integration

This should be called as the FIRST step in any task that modifies:
- openclaw.json
- .env file
- Agent configurations
- API keys or secrets
- Gateway configuration
- Cron jobs

**Never modify configs without running backup first.**