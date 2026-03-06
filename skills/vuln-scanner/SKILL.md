---
name: vuln-scanner
description: Scan websites for basic security issues. Check SSL, headers, common vulnerabilities.
author: Geele
version: 1.0.0
triggers:
  - "vuln scan"
  - "security scan"
  - "website check"
metadata: {"openclaw":{"emoji":"🔍"}}
---

# Website Vulnerability Scanner

Scan websites for basic security issues.

## Usage

### Scan a website
```bash
python3 {baseDir}/scripts/scan.py "https://example.com"
```

### Quick scan
```bash
python3 {baseDir}/scripts/scan.py "example.com" --quick
```

## Checks Performed

| Check | Description |
|-------|-------------|
| SSL/TLS | Is HTTPS working? |
| Security Headers | HSTS, CSP, X-Frame-Options |
| HTTP Headers | Server info disclosure |
| Mixed Content | HTTP resources on HTTPS page |
| Common Ports | Basic port scan (optional) |

## Output

```markdown
## Security Scan: example.com

### Results
✅ SSL: Certificate valid
✅ HSTS: Enabled
⚠️ X-Frame-Options: Not set
⚠️ Content-Security-Policy: Not set
✅ Server: Generic

### Score: 7/10

### Recommendations
- Add X-Frame-Options header
- Add Content-Security-Policy
- Consider adding security.txt
```

## Use Cases
- Free value-add for prospects
- Security audits
- Quick assessment for clients
