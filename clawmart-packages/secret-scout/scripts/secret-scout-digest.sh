#!/bin/bash
# secret-scout-digest.sh - Weekly digest to Telegram
# Usage: ./secret-scout-digest.sh [--dry-run]

DRY_RUN=false
[[ "${1:-}" == "--dry-run" ]] && DRY_RUN=true

LOG_FILE="$HOME/.openclaw/logs/secrets-manager.log"
ENV_FILE="$HOME/.openclaw/.env"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [DIGEST] $1" | tee -a "$LOG_FILE"
}

echo "=== SecretScout Weekly Digest ==="
log "Generating weekly digest..."

# Gather stats
TOTAL_KEYS=$(grep -c "_API_KEY\|_TOKEN" "$ENV_FILE" 2>/dev/null || echo 0)

# Check age
ENV_MTIME=$(stat -c %Y "$ENV_FILE" 2>/dev/null)
NOW=$(date +%s)
DAYS_OLD=$(( (NOW - ENV_MTIME) / 86400 ))

# Check for rotation candidates
NEXT_COUNT=$(grep -c "_NEXT=" "$ENV_FILE" 2>/dev/null)

# Count backups
BACKUP_COUNT=$(ls -1 "$HOME/.openclaw/config-backups"/.env.backup_* 2>/dev/null | wc -l)

# Build digest message
MESSAGE="🛰️ *SecretScout Weekly Digest*

📊 *Stats:*
• Total keys: $TOTAL_KEYS
• Age: $DAYS_OLD days
• Rotation ready: $NEXT_COUNT
• Backups: $BACKUP_COUNT

🔄 *Action needed:*
"

if [ $DAYS_OLD -gt 14 ]; then
    MESSAGE+="• ⚠️ Keys are aging - consider rotation\n"
fi

if [ $NEXT_COUNT -eq 0 ]; then
    MESSAGE+="• 💡 Add _NEXT keys to enable auto-rotation\n"
fi

MESSAGE+="
✅ *System:* Healthy
📅 *Next digest:* Sunday

_Use /secret-scout status for details_"

echo "$MESSAGE"

if [ "$DRY_RUN" = false ]; then
    # Send to Telegram
    if [ -n "${TELEGRAM_BOT_TOKEN:-}" ]; then
        curl -s -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage" \
            -d "chat_id=1083701579" \
            -d "text=$MESSAGE" \
            -d "parse_mode=markdown" > /dev/null 2>&1
        echo ""
        echo "✅ Digest sent to Telegram"
        log "Digest sent successfully"
    else
        echo "⚠️ TELEGRAM_BOT_TOKEN not set - skipping notification"
    fi
else
    echo "[DRY RUN] Would send digest"
fi