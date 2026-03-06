---
name: port-scanner
description: Simple port scanner for basic network reconnaissance. Check for open ports on client websites.
author: Geele
version: 1.0.0
triggers:
  - "port scan"
  - "network scan"
  - "check ports"
metadata: {"openclaw":{"emoji":"🔌"}}
---

# Port Scanner

Simple port scanner for basic network reconnaissance.

## Usage

### Quick scan (common ports)
```bash
python3 {baseDir}/scripts/portscan.py "example.com"
```

### Full scan
```bash
python3 {baseDir}/scripts/portscan.py "example.com" --full
```

### Specific ports
```bash
python3 {baseDir}/scripts/portscan.py "example.com" --ports "80,443,22,3389"
```

## Checks Common Ports

| Port | Service | Risk |
|------|---------|------|
| 21 | FTP | High (unencrypted) |
| 22 | SSH | Medium |
| 23 | Telnet | Critical |
| 25 | SMTP | Low |
| 80 | HTTP | Medium |
| 443 | HTTPS | Low |
| 3389 | RDP | High |
| 3306 | MySQL | High |
| 5432 | PostgreSQL | High |
| 8080 | HTTP Proxy | Medium |

## Output

```markdown
## Port Scan: example.com

### Open Ports
✅ 80 (HTTP)
✅ 443 (HTTPS)
✅ 22 (SSH)

### Closed/Filtered
❌ 21 (FTP)
❌ 3389 (RDP)

### Recommendations
• Ensure SSH is not exposed to internet
• Consider firewall rules
```

## Use Cases
- Quick security check
- Verify firewall配置
- Find exposed services