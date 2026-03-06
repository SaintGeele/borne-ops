#!/usr/bin/env bash
# Install Docker Engine + Compose on Debian (requires sudo)
set -euo pipefail

echo "=== Installing Docker Engine ==="

# Check if already installed
if command -v docker &>/dev/null; then
    echo "Docker already installed: $(docker --version)"
    echo "Docker Compose: $(docker compose version 2>/dev/null || echo 'not found')"
    exit 0
fi

# Detect Debian version
. /etc/os-release
DISTRO_CODENAME="${VERSION_CODENAME}"

# For trixie (Debian 13), Docker may not have official repos yet — fall back to bookworm
if [ "$DISTRO_CODENAME" = "trixie" ]; then
    echo "NOTE: Debian 13 (trixie) detected — using bookworm repos as fallback"
    DOCKER_CODENAME="bookworm"
else
    DOCKER_CODENAME="$DISTRO_CODENAME"
fi

# Install prerequisites
sudo apt-get update -qq
sudo apt-get install -y -qq ca-certificates curl gnupg lsb-release

# Add Docker's official GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Add the repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
  ${DOCKER_CODENAME} stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt-get update -qq
sudo apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add current user to docker group
sudo usermod -aG docker "$USER"

echo ""
echo "=== Docker installed successfully ==="
docker --version
docker compose version
echo ""
echo "IMPORTANT: Log out and back in (or run 'newgrp docker') to use Docker without sudo."
