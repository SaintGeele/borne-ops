# SKILL.md - Server Health Dashboard

## Description
Real-time server monitoring with web UI and Telegram bot.

## Commands
- "Show server status"
- "Get system metrics"
- "List failed services"

## Execution
1. Collect: CPU (top), Memory (free -m), Disk (df -h), Containers (docker ps -a)
2. Check failed systemd services (systemctl --failed)
3. Serve dashboard via Express on port 3001
4. Telegram bot polling for on-demand reports

## Endpoints
- GET / - Dashboard HTML
- GET /api/status - JSON metrics