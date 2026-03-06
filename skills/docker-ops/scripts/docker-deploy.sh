#!/usr/bin/env bash
# Deploy or update a Docker Compose stack
# Usage: docker-deploy.sh <compose-file> [--project <name>] [--pull] [--build] [--force-recreate]
set -euo pipefail

COMPOSE_FILE="${1:?Usage: docker-deploy.sh <compose-file> [--project name] [--pull] [--build] [--force-recreate]}"
shift

PROJECT=""
PULL=false
BUILD=false
FORCE=false
DETACH=true

while [[ $# -gt 0 ]]; do
    case "$1" in
        --project|-p) PROJECT="$2"; shift 2 ;;
        --pull) PULL=true; shift ;;
        --build) BUILD=true; shift ;;
        --force-recreate) FORCE=true; shift ;;
        --no-detach) DETACH=false; shift ;;
        *) echo "Unknown option: $1"; exit 1 ;;
    esac
done

if [ ! -f "$COMPOSE_FILE" ]; then
    echo "❌ Compose file not found: $COMPOSE_FILE"
    exit 1
fi

PROJECT_ARG=""
if [ -n "$PROJECT" ]; then
    PROJECT_ARG="-p ${PROJECT}"
fi

echo "=== Deploying Docker Compose Stack ==="
echo "Compose file: ${COMPOSE_FILE}"
echo "Project: ${PROJECT:-<default>}"
echo ""

# Pull latest images if requested
if [ "$PULL" = true ]; then
    echo "--- Pulling images ---"
    docker compose -f "${COMPOSE_FILE}" ${PROJECT_ARG} pull
    echo ""
fi

# Build options
BUILD_ARG=""
if [ "$BUILD" = true ]; then
    BUILD_ARG="--build"
fi

FORCE_ARG=""
if [ "$FORCE" = true ]; then
    FORCE_ARG="--force-recreate"
fi

DETACH_ARG=""
if [ "$DETACH" = true ]; then
    DETACH_ARG="-d"
fi

# Deploy
echo "--- Starting services ---"
docker compose -f "${COMPOSE_FILE}" ${PROJECT_ARG} up ${DETACH_ARG} ${BUILD_ARG} ${FORCE_ARG}

echo ""
echo "=== Stack Status ==="
docker compose -f "${COMPOSE_FILE}" ${PROJECT_ARG} ps

echo ""
echo "✅ Deployment complete"
