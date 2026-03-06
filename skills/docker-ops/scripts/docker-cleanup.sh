#!/usr/bin/env bash
# Clean up unused Docker resources
# Usage: docker-cleanup.sh [--all] [--volumes] [--dry-run]
set -euo pipefail

ALL=false
VOLUMES=false
DRY_RUN=false

while [[ $# -gt 0 ]]; do
    case "$1" in
        --all|-a) ALL=true; shift ;;
        --volumes) VOLUMES=true; shift ;;
        --dry-run) DRY_RUN=true; shift ;;
        *) echo "Unknown option: $1"; exit 1 ;;
    esac
done

echo "=== Docker Cleanup ==="
echo "Timestamp: $(date -Iseconds)"
echo ""

# Show current usage
echo "--- Before Cleanup ---"
docker system df
echo ""

if [ "$DRY_RUN" = true ]; then
    echo "[DRY RUN] Would clean:"
    
    echo "  Stopped containers:"
    docker ps -a --filter "status=exited" --format "    - {{.Names}} ({{.Image}}, exited {{.Status}})"
    
    echo "  Dangling images:"
    docker images -f "dangling=true" --format "    - {{.Repository}}:{{.Tag}} ({{.Size}})"
    
    if [ "$ALL" = true ]; then
        echo "  Unused images (not referenced by any container):"
        docker images --format "    - {{.Repository}}:{{.Tag}} ({{.Size}})"
    fi
    
    echo "  Unused networks:"
    docker network ls --filter "type=custom" --format "    - {{.Name}}"
    
    if [ "$VOLUMES" = true ]; then
        echo "  ⚠️  Unused volumes (DATA LOSS RISK):"
        docker volume ls -f "dangling=true" --format "    - {{.Name}}"
    fi
    
    echo ""
    echo "Run without --dry-run to execute."
    exit 0
fi

# Remove stopped containers
echo "--- Removing stopped containers ---"
docker container prune -f

# Remove dangling images
echo ""
echo "--- Removing dangling images ---"
docker image prune -f

# Remove all unused images (not just dangling)
if [ "$ALL" = true ]; then
    echo ""
    echo "--- Removing all unused images ---"
    docker image prune -a -f
fi

# Remove unused networks
echo ""
echo "--- Removing unused networks ---"
docker network prune -f

# Remove unused volumes (dangerous!)
if [ "$VOLUMES" = true ]; then
    echo ""
    echo "--- Removing unused volumes ---"
    docker volume prune -f
fi

echo ""
echo "--- After Cleanup ---"
docker system df

echo ""
echo "✅ Cleanup complete"
