# Docker Operations Skill

Docker management subagents for Borne Systems deployments.

## Capabilities
1. **Build** — Build and push Docker images
2. **Deploy** — Run containers and Docker Compose stacks
3. **Monitor** — Health checks, logs, resource usage
4. **Manage** — Start/stop/restart containers, cleanup

## Prerequisites
- Docker Engine installed (`docker --version`)
- Docker Compose v2 plugin (`docker compose version`)
- User in `docker` group (no sudo needed for docker commands)

## Installation
If Docker is not installed, run:
```bash
bash ~/.openclaw/workspace/skills/docker-ops/scripts/install-docker.sh
```
Then log out/in (or `newgrp docker`) to pick up the docker group.

## Usage

### Build an image
```
Build the Docker image for [service] using the Dockerfile at [path]
```

### Deploy a stack
```
Deploy the [service] stack using docker compose at [path]
```

### Check health
```
Check Docker container health / show running containers
```

### View logs
```
Show logs for container [name]
```

## Scripts
| Script | Purpose |
|--------|---------|
| `install-docker.sh` | Install Docker Engine + Compose on Debian |
| `docker-build.sh` | Build and optionally push an image |
| `docker-deploy.sh` | Deploy or update a compose stack |
| `docker-monitor.sh` | Health check all running containers |
| `docker-cleanup.sh` | Prune unused images, volumes, networks |

## Directory Structure
```
skills/docker-ops/
├── SKILL.md
├── templates/
│   ├── Dockerfile.node        # Node.js app template
│   ├── Dockerfile.python      # Python app template
│   ├── docker-compose.base.yml # Base compose template
│   └── nginx-proxy.conf       # Nginx reverse proxy config
└── scripts/
    ├── install-docker.sh
    ├── docker-build.sh
    ├── docker-deploy.sh
    ├── docker-monitor.sh
    └── docker-cleanup.sh
```

## Borne Systems Services
Default services that can be deployed:
- **borne-web** — Main website (Next.js/static)
- **borne-api** — Backend API service
- **borne-db** — PostgreSQL database
- **borne-proxy** — Nginx reverse proxy with SSL
- **borne-monitor** — Uptime/health monitoring
