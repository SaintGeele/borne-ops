#!/usr/bin/env bash
# Build a Docker image, optionally push to registry
# Usage: docker-build.sh <image-name> <context-path> [--push] [--tag <tag>] [--registry <registry>]
set -euo pipefail

IMAGE_NAME="${1:?Usage: docker-build.sh <image-name> <context-path> [--push] [--tag tag] [--registry registry]}"
CONTEXT_PATH="${2:?Usage: docker-build.sh <image-name> <context-path> [--push] [--tag tag] [--registry registry]}"
shift 2

PUSH=false
TAG="latest"
REGISTRY=""
DOCKERFILE=""

while [[ $# -gt 0 ]]; do
    case "$1" in
        --push) PUSH=true; shift ;;
        --tag) TAG="$2"; shift 2 ;;
        --registry) REGISTRY="$2"; shift 2 ;;
        --dockerfile|-f) DOCKERFILE="$2"; shift 2 ;;
        *) echo "Unknown option: $1"; exit 1 ;;
    esac
done

# Construct full image reference
if [ -n "$REGISTRY" ]; then
    FULL_IMAGE="${REGISTRY}/${IMAGE_NAME}:${TAG}"
else
    FULL_IMAGE="${IMAGE_NAME}:${TAG}"
fi

DOCKERFILE_ARG=""
if [ -n "$DOCKERFILE" ]; then
    DOCKERFILE_ARG="-f ${DOCKERFILE}"
fi

echo "=== Building Docker Image ==="
echo "Image: ${FULL_IMAGE}"
echo "Context: ${CONTEXT_PATH}"
echo "Dockerfile: ${DOCKERFILE:-Dockerfile}"
echo ""

# Build with timestamps
BUILD_START=$(date +%s)
docker build ${DOCKERFILE_ARG} -t "${FULL_IMAGE}" "${CONTEXT_PATH}"
BUILD_END=$(date +%s)
BUILD_DURATION=$((BUILD_END - BUILD_START))

echo ""
echo "✅ Build complete in ${BUILD_DURATION}s"
echo "Image: ${FULL_IMAGE}"
docker images "${IMAGE_NAME}" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}"

# Also tag as latest if tag isn't already latest
if [ "$TAG" != "latest" ] && [ -z "$REGISTRY" ]; then
    docker tag "${FULL_IMAGE}" "${IMAGE_NAME}:latest"
    echo "Also tagged as ${IMAGE_NAME}:latest"
fi

# Push if requested
if [ "$PUSH" = true ]; then
    echo ""
    echo "=== Pushing to Registry ==="
    docker push "${FULL_IMAGE}"
    if [ "$TAG" != "latest" ]; then
        docker push "${IMAGE_NAME}:latest" 2>/dev/null || true
    fi
    echo "✅ Push complete"
fi
