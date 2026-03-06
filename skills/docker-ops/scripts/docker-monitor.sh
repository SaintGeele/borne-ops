#!/usr/bin/env bash
# Monitor Docker containers — health, resources, status
# Usage: docker-monitor.sh [--compose <file>] [--project <name>] [--json] [--alert]
set -euo pipefail

COMPOSE_FILE=""
PROJECT=""
JSON=false
ALERT=false

while [[ $# -gt 0 ]]; do
    case "$1" in
        --compose|-f) COMPOSE_FILE="$2"; shift 2 ;;
        --project|-p) PROJECT="$2"; shift 2 ;;
        --json) JSON=true; shift ;;
        --alert) ALERT=true; shift ;;
        *) echo "Unknown option: $1"; exit 1 ;;
    esac
done

echo "=== Docker Container Health Report ==="
echo "Timestamp: $(date -Iseconds)"
echo ""

# System-wide Docker info
echo "--- Docker System ---"
docker system df --format "table {{.Type}}\t{{.TotalCount}}\t{{.Size}}\t{{.Reclaimable}}"
echo ""

# Running containers
echo "--- Running Containers ---"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}\t{{.Image}}"
echo ""

# Container resource usage
echo "--- Resource Usage ---"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
echo ""

# Check for unhealthy containers
UNHEALTHY=$(docker ps --filter "health=unhealthy" --format "{{.Names}}" 2>/dev/null)
EXITED=$(docker ps -a --filter "status=exited" --format "{{.Names}}\t{{.Status}}" 2>/dev/null | head -10)

if [ -n "$UNHEALTHY" ]; then
    echo "⚠️  UNHEALTHY CONTAINERS:"
    echo "$UNHEALTHY" | while read -r name; do
        echo "  - $name"
        docker inspect "$name" --format '    Health: {{.State.Health.Status}} | Last check: {{with index .State.Health.Log 0}}{{.Output}}{{end}}' 2>/dev/null || true
    done
    echo ""
fi

if [ -n "$EXITED" ]; then
    echo "🛑 Recently Exited Containers:"
    echo "$EXITED" | while IFS=$'\t' read -r name status; do
        echo "  - $name ($status)"
    done
    echo ""
fi

# Compose-specific status
if [ -n "$COMPOSE_FILE" ] && [ -f "$COMPOSE_FILE" ]; then
    PROJECT_ARG=""
    if [ -n "$PROJECT" ]; then
        PROJECT_ARG="-p ${PROJECT}"
    fi
    echo "--- Compose Stack: ${COMPOSE_FILE} ---"
    docker compose -f "${COMPOSE_FILE}" ${PROJECT_ARG} ps
    echo ""
fi

# Disk space warning
DOCKER_ROOT=$(docker info --format '{{.DockerRootDir}}' 2>/dev/null || echo "/var/lib/docker")
if [ -d "$DOCKER_ROOT" ]; then
    USAGE=$(df "$DOCKER_ROOT" --output=pcent 2>/dev/null | tail -1 | tr -d ' %')
    if [ -n "$USAGE" ] && [ "$USAGE" -gt 80 ]; then
        echo "⚠️  DISK WARNING: Docker root ($DOCKER_ROOT) is at ${USAGE}% capacity"
        echo "   Run: docker system prune -f"
        echo ""
    fi
fi

echo "=== End Health Report ==="
