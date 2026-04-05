#!/bin/bash
# secret-scout-rotate.sh - Environment swap rotation for SecretScout
# Usage: ./secret-scout-rotate.sh [--dry-run] [--provider <name>]

set -euo pipefail

BACKUP_DIR="$HOME/.openclaw/config-backups"
LOG_FILE="$HOME/.openclaw/logs/secrets-manager.log"
ENV_FILE="$HOME/.openclaw/.env"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DRY_RUN=false
PROVIDER="all"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [ROTATE] $1" | tee -a "$LOG_FILE"
}

# Parse args
while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run) DRY_RUN=true; shift ;;
        --provider) PROVIDER="$2"; shift 2 ;;
        *) shift ;;
    esac
done

echo "========================================="
echo "  SecretScout Auto-Rotation"
echo "========================================="

if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}🔍 DRY RUN MODE${NC}"
fi

log "Starting rotation for: $PROVIDER"

# Check pre-flight first
if [ "$DRY_RUN" = false ]; then
    echo "Running pre-flight check..."
    /home/saint/.openclaw/bin/secrets-preflight --check > /dev/null 2>&1 || {
        log "PRE-FLIGHT FAILED - aborting rotation"
        echo -e "${RED}❌ Pre-flight failed - aborting${NC}"
        exit 1
    }
fi

# Create backup before any changes
if [ "$DRY_RUN" = false ]; then
    cp "$ENV_FILE" "${BACKUP_DIR}/.env.pre_rotation_${TIMESTAMP}"
    log "Backup created: .env.pre_rotation_${TIMESTAMP}"
    echo "✅ Backup created"
fi

# Function to rotate a specific key pair
rotate_keypair() {
    local key_current="$1"
    local key_next="$2"
    
    # Check if both exist
    if ! grep -q "^${key_current}=" "$ENV_FILE"; then
        echo "  ⚠️  $key_current not found - skipping"
        return
    fi
    
    if ! grep -q "^${key_next}=" "$ENV_FILE"; then
        echo "  ⚠️  $key_next not found (need to manually add new key first)"
        log "WARNING: $key_next not found for rotation"
        return
    fi
    
    local current_val=$(grep "^${key_current}=" "$ENV_FILE" | cut -d'=' -f2-)
    local next_val=$(grep "^${key_next}=" "$ENV_FILE" | cut -d'=' -f2-)
    
    if [ "$DRY_RUN" = true ]; then
        echo "  🔍 [DRY RUN] Would swap:"
        echo "      $key_current ← $key_next"
        echo "      $key_next ← $key_current (old)"
        return
    fi
    
    # Perform the swap
    # CURRENT ← NEXT (new key becomes current)
    # NEXT ← CURRENT (old key becomes next/previous)
    sed -i "s|^${key_current}=.*|${key_current}=${next_val}|" "$ENV_FILE"
    sed -i "s|^${key_next}=.*|${key_next}=${current_val}|" "$ENV_FILE"
    
    echo "  ✅ Rotated: $key_current"
    log "Rotated: $key_current ← $key_next"
    
    # Send Telegram notification
    if [ -n "${TELEGRAM_BOT_TOKEN:-}" ]; then
        curl -s -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage" \
            -d "chat_id=1083701579" \
            -d "text=🔄 SecretScout: Rotated $key_current" > /dev/null 2>&1
    fi
}

# Known key pairs that support NEXT pattern
KEY_PAIRS=(
    "RESEND_API_KEY:RESEND_API_KEY_NEXT"
    "OPENROUTER_API_KEY:OPENROUTER_API_KEY_NEXT"
    "OPENAI_API_KEY:OPENAI_API_KEY_NEXT"
    "TELEGRAM_BOT_TOKEN:TELEGRAM_BOT_TOKEN_NEXT"
    "DISCORD_DEFAULT_TOKEN:DISCORD_DEFAULT_TOKEN_NEXT"
)

echo ""
echo "Checking for keys to rotate..."

# Filter by provider if specified
for pair in "${KEY_PAIRS[@]}"; do
    current="${pair%%:*}"
    next="${pair##*:}"
    
    if [ "$PROVIDER" = "all" ] || [ "$current" = "$PROVIDER" ] || [ "$current" = "${PROVIDER^^}_API_KEY" ]; then
        rotate_keypair "$current" "$next"
    fi
done

echo ""
log "Rotation complete"

# Set permissions
if [ "$DRY_RUN" = false ]; then
    chmod 600 "$ENV_FILE"
    echo "✅ .env permissions set to 600"
fi

echo ""
echo "✅ Rotation complete!"
log "Rotation finished successfully"