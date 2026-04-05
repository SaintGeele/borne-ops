---
name: secret-scout
description: OpenClaw security tool that scans for hardcoded secrets, manages API keys via environment variables, and provides automated backup/restore with Telegram alerts.
version: 1.0.0
author: Borne Systems
category: security
triggers:
  - "scan for secrets"
  - "check hardcoded keys"
  - "backup secrets"
  - "verify env vars"
  - "secrets manager"
  - "secret scout"
  - "rotate secrets"
  - "secret audit"
  - "secret status"
---

# SecretScout 🛰️

Find the secrets you've already leaked before hackers do.

## Features

### ✅ Implemented (Ready to Use)

| Feature | Command | Status |
|---------|---------|--------|
| **Pre-flight check** | `secret-scout status` | ✅ Ready |
| **Secret scanner** | `secret-scout scan` | ✅ Ready |
| **Full audit** | `secret-scout audit` | ✅ Ready |
| **Backup** | `secret-scout backup` | ✅ Ready |
| **Reference verify** | `secret-scout verify` | ✅ Ready |
| **Auto-rotation** | `secret-scout rotate` | ✅ Ready |
| **Weekly cron** | Sunday midnight | ✅ Scheduled |

## Usage

```bash
# Quick status check
secret-scout status

# Scan for hardcoded secrets
secret-scout scan --verbose

# Full security audit
secret-scout audit

# Rotate secrets
secret-scout rotate --dry-run
secret-scout rotate

# Verify all ${VAR} references
secret-scout verify

# Create backup
secret-scout backup
```

## Files

```
secret-scout/
├── scripts/
│   ├── secret-scout          # CLI (main)
│   ├── secret-scout-scan   # Scanner
│   ├── secret-scout-rotate # Rotation
│   └── secrets-preflight  # Pre-flight checks
└── SKILL.md
```

## Requirements

- OpenClaw installation
- Write access to ~/.openclaw/
- Telegram bot token (optional, for alerts)

## Pricing

| Tier | Price | Features |
|------|-------|----------|
| **Free** | $0 | Scan, backup, CLI tools |
| **Pro** | $19/mo | Auto-rotation, Telegram alerts |
| **Enterprise** | $99/mo | Full audit, HIPAA reports |

---

*Part of the Borne Systems security stack.*
*Use with Borne Security.*