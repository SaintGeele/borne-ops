# SKILL.md - Knox Security Hardening

## Description
Automated host security auditing skill that checks SSH hardening, firewall rules, failed login attempts, and identifies vulnerabilities with remediation recommendations.

## Commands
- "Run security audit on [host]"
- "Check SSH hardening"
- "Scan for failed logins"
- "List open ports"
- "Check firewall rules"

## Execution
1. SSH into target host (requires credentials in environment)
2. Run audit scripts:
   - SSH config check (PasswordAuthentication, PermitRootLogin, PubkeyAuthentication)
   - UFW/iptables rule review
   - Auth log analysis for failed attempts
   - Open port enumeration
3. Parse results and format as markdown report
4. Return findings with severity levels and fixes

## Security Notes
- Read-only audit (no changes made)
- Requires sudo/root for full firewall inspection
- Stores nothing - stateless execution