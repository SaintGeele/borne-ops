# SKILL.md - DeployOps

## Description
One-command deployments with rollback and health checks.

## Commands
- "Deploy [service] to [environment]"
- "Rollback [service]"
- "Check deployment status"

## Execution
1. Receive service name and git commit/tag
2. Run docker-compose up -d or terraform apply
3. Health check: curl http://localhost:{port}/health
4. On failure: docker-compose rollback or terraform rollback
5. Notify via Telegram/Discord webhook