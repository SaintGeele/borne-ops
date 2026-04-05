# Security Audit Skill

## Overview

Run a quick host security audit checking for common vulnerabilities and misconfigurations.

## Skill Metadata

```yaml
name: security-audit
version: 1.0.0
description: Host security auditing - check ports, SSH, firewall, permissions
category: security
schedule: "15 7 * * *"  # Reference cron schedule
parameters:
  - name: severity_threshold
    type: string
    default: high
    description: Minimum severity to report (critical|high|medium)
  - name: auto_fixable_only
    type: boolean
    default: false
    description: Only report auto-fixable issues
```

## Execution

```markdown
# Security Audit

## Objective
Run a quick host security audit and report critical/high findings.

## Parameters
- severity_threshold: critical|high|medium (default: high)
- auto_fixable_only: true|false (default: false)

## Checks

### 1. Public Listeners
Run: `ss -tuln`
Identify services listening on 0.0.0.0 (public)
Flag: Any unexpected open ports

### 2. SSH Configuration
Check:
- PasswordAuthentication enabled?
- Root login enabled?
- Run: `grep -E "^PasswordAuthentication|^PermitRootLogin" /etc/ssh/sshd_config`

### 3. Firewall Status
Check:
- ufw active?
- iptables rules?
- Run: `ufw status` or `iptables -L -n`

### 4. File Permissions
Check:
- ~/.ssh permissions (should be 700)
- ~/.ssh/* permissions (should be 600)
- ~/.openclaw/config permissions

### 5. Recent Security Logs
Check for:
- Failed SSH attempts
- sudo failures
- Unusual login times

## Output

Write JSON to `~/.openclaw/workspace/security-audit-latest.json`:

```json
{
  "timestamp": "ISO8601",
  "findings": [
    {
      "check": "public_listeners",
      "severity": "high|critical",
      "description": "...",
      "auto_fixable": true|false,
      "recommendation": "..."
    }
  ],
  "summary": {
    "critical": 0,
    "high": 0,
    "medium": 0
  }
}
```

## Report Format

Send summary to user:

🔒 **Security Audit**
- ✅ Critical: X
- ⚠️ High: X  
- 📝 Medium: X

[For each critical/high:]
- **[severity]** [check]: [description]

## Validation

- If no findings: "✅ Security audit clean"
- If findings exist: List each with severity
- Always write JSON file for security-fix skill to read