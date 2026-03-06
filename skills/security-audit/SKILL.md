---
name: security-audit
description: Conduct security audits for clients. Questionnaire-based assessment that scores security posture.
author: Geele
version: 1.0.0
triggers:
  - "security audit"
  - "audit questionnaire"
  - "security assessment"
metadata: {"openclaw":{"emoji":"📋"}}
---

# Security Audit Tool

Conduct security audits via questionnaire. Generate score and recommendations.

## Usage

### Run audit
```bash
python3 {baseDir}/scripts/audit.py
```

### Quick audit
```bash
python3 {baseDir}/scripts/audit.py --quick
```

## Questionnaire Categories

| Category | Questions |
|----------|-----------|
| Passwords | 2FA, password manager, policies |
| Network | Firewall, VPN, WiFi security |
| Data | Backup, encryption, access control |
| Email | Spam filter, DMARC, SPF |
| Training | Phishing awareness, policies |
| Compliance | GDPR, HIPAA, PCI |

## Output

```markdown
## Security Audit Results

### Score: 65/100 (C)

### Breakdown
| Category | Score |
|----------|-------|
| Passwords | 80% |
| Network | 50% |
| Data | 70% |
| Email | 60% |
| Training | 40% |

### Critical Issues
- No 2FA enabled
- No regular backups
- No employee training

### Recommendations
1. Enable 2FA everywhere
2. Set up automated backups
3. Implement phishing training
```

## Use Cases
- Free lead magnet
- Initial client assessment
- Annual security review