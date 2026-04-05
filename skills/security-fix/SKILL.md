# Security Fix Skill

## Overview

Auto-remediate critical and high security issues found by security-audit.

## Skill Metadata

```yaml
name: security-fix
version: 1.0.0
description: Auto-remediate security issues found by security-audit
category: security
schedule: "30 7 * *"  # Reference cron schedule
parameters:
  - name: dry_run
    type: boolean
    default: false
    description: Show fixes without applying
  - name: auto_fixable_only
    type: boolean
    default: true
    description: Only fix auto-fixable issues
```

## Execution

```markdown
# Security Fix - Auto Remediation

## Objective
Read security-audit results and auto-remediate critical/high issues.

## Parameters
- dry_run: true|false (default: false)
- auto_fixable_only: true|false (default: true)

## Step 1: Read Audit Results

Read: `~/.openclaw/workspace/security-audit-latest.json`

If file doesn't exist or is older than 24 hours:
- Skip auto-fixes
- Note: "No recent audit results found"

## Step 2: Auto-Fix Critical/High Issues

### Open Ports on 0.0.0.0
- If service should only bind locally:
  - Update config to bind to 127.0.0.1
  - Restart affected service
- Examples: Redis, MongoDB, custom apps

### Firewall Rules
- If no firewall active:
  - Enable ufw with defaults: `ufw --force enable`
  - Allow SSH: `ufw allow 22/tcp`
  - Allow known IPs
  - Deny incoming by default: `ufw default deny incoming`
- If missing rules:
  - Add missing deny rules for exposed ports

### SSH Hardening
- Set PasswordAuthentication no:
  - Edit /etc/ssh/sshd_config
  - Run: `systemctl reload sshd`
- Set PermitRootLogin no:
  - Edit /etc/ssh/sshd_config
  - Run: `systemctl reload sshd`
- Fix permissions:
  - `chmod 700 ~/.ssh`
  - `chmod 600 ~/.ssh/*`

### File Permissions
- Fix overly permissive files:
  - Config files should be 600/640
  - Private keys should be 600
- Fix directory permissions:
  - Home directories should be 700

## Step 3: Verify Fixes

After applying fixes, re-run relevant checks to confirm remediation worked.

## Step 4: Report

Send message to user:

🔒 **Security Remediation Report**
- ✅ Fixed: X critical/high issues
- ⚠️ Manual review needed: X medium/low items
- ❌ Failed fixes: X (with details)

For each action:
- **[severity]** [check]: [action taken]

## Safety Rules

⚠️ **NEVER:**
- Disable SSH entirely (lock yourself out)
- Change firewall without preserving SSH
- Modify OpenClaw gateway config
- Break existing service configurations

**ALWAYS:**
- Verify fixes after applying
- If unsure, skip and flag for manual review
- Test SSH access after changes