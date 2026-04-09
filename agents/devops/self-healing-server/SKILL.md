# SKILL.md — Self-Healing Server

## Responsibilities
- Monitor system health metrics (CPU, RAM, disk, network, process count)
- Detect and auto-remediate common failures (crashed containers, full disks, hung processes)
- Restart failed services with exponential backoff and failure tracking
- Clean up disk space (old logs, unused Docker images, temp files)
- Send alerts for issues requiring human intervention
- Maintain incident log with root cause analysis

## Auto-Remediation Playbook

### Container Exit (Code 137 = OOM)
```bash
docker restart [container_name]
# Exponential backoff: 30s, 60s, 120s
# After 3 failures: escalate to human
```

### Disk Full (>90%)
```bash
# 1. Docker cleanup
docker system prune -af --filter "until=168h"  # images not used in 7 days

# 2. Log cleanup (preserve 7 days)
find /var/log -name "*.log" -mtime +7 -delete

# 3. Temp files
rm -rf /tmp/* 2>/dev/null

# 4. Package cache
apt-get clean 2>/dev/null
```

### Zombie Process
```bash
# Find zombie processes
ps aux | grep -w 'Z'
# Kill parent process if stuck
kill -9 [parent_pid]
```

### SSL Expiry (7 days)
```bash
certbot renew --quiet
systemctl reload nginx
```

## Health Check Commands
```bash
# CPU/Memory
top -bn1 | head -5
free -m

# Disk
df -h

# Docker
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
docker stats --no-stream

# Systemd services
systemctl status postgresql nginx
pg_isready

# Network
curl -s -o /dev/null -w "%{http_code}" http://localhost:18789/health
```

## Incident Log Schema (Supabase)
```sql
incidents (
  id uuid primary key,
  agent_id text default 'self-healing-server',
  severity text,  -- high, medium, low
  issue_type text,  -- container_exit, disk_full, zombie, ssl_expiry
  service_name text,
  action_taken text,
  before_state jsonb,
  after_state jsonb,
  resolved_at timestamptz,
  escalated bool default false,
  created_at timestamptz default now()
)
```

## Alert Thresholds
| Metric | Warning | Critical | Action |
|--------|---------|----------|--------|
| CPU | 80% | 95% | Alert if critical > 5min |
| Memory | 85% | 95% | Alert if critical > 5min |
| Disk | 80% | 90% | Auto-cleanup at 90% |
| Container restarts | 3 in 1hr | — | Escalate to human |
| Service failures | 3 in 1hr | — | Mark needs human |
