---
name: password-checker
description: Check if emails have been exposed in data breaches using HaveIBeenPwned API. Use to audit client security.
author: Geele
version: 1.0.0
triggers:
  - "password check"
  - "breach check"
  - "haveibeenpwned"
metadata: {"openclaw":{"emoji":"🔐"}}
---

# Password/Breach Checker

Check if emails have been exposed in data breaches using HaveIBeenPwned API.

## Usage

### Check single email
```bash
python3 {baseDir}/scripts/check_breach.py "email@example.com"
```

### Check multiple emails
```bash
python3 {baseDir}/scripts/check_breach.py "email1@example.com,email2@example.com"
```

## Output

```markdown
## Breach Check: email@example.com

### Result: FOUND IN BREACHES
- Adobe (2013)
- LinkedIn (2012)
- Dropbox (2012)

### Recommendations
- Change password immediately
- Enable 2FA
- Use password manager
```

## Use Cases
- Security audits for clients
- Lead generation (offer to help)
- Free value-add service
