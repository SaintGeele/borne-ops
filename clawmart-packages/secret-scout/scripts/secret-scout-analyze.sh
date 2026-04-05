#!/bin/bash
# secret-scout-analyze.sh - Entropy scoring, age tracking, duplicate detection
# Usage: ./secret-scout-analyze.sh [--verbose]

ENV_FILE="$HOME/.openclaw/.env"
LOG_FILE="$HOME/.openclaw/logs/secrets-manager.log"
VERBOSE=false

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [ANALYZE] $1" | tee -a "$LOG_FILE"
}

# Parse args
[[ "${1:-}" == "--verbose" ]] && VERBOSE=true

echo "========================================="
echo "  SecretScout Security Analysis"
echo "========================================="

# === ENTROPY SCORING ===
echo ""
echo "1. ENTROPY SCORING"
echo "------------------"

calculate_entropy() {
    local string="$1"
    local len=${#string}
    
    # Check character distribution
    local upper=$(echo "$string" | grep -o '[A-Z]' | wc -l)
    local lower=$(echo "$string" | grep -o '[a-z]' | wc -l)
    local digit=$(echo "$string" | grep -o '[0-9]' | wc -l)
    local special=$(echo "$string" | grep -o '[^A-Za-z0-9]' | wc -l)
    
    # Simple entropy estimate
    local charset_size=$((upper + lower + digit + special))
    local entropy=$(echo "scale=2; l($charset_size) / l(2) * $len" | bc -l 2>/dev/null || echo "0")
    
    echo "$entropy"
}

# Score thresholds (bits)
# Less than 60 bits = weak
# 60-80 bits = moderate  
# 80+ bits = strong

ENTROPY_ISSUES=0
TOTAL_KEYS=0

while IFS='=' read -r key value; do
    # Skip empty lines and comments
    [[ -z "$key" || "$key" =~ ^# ]] && continue
    
    # Skip non-API-key entries
    [[ ! "$key" =~ _API_KEY|_TOKEN|BOT_TOKEN|Secret|Key ]] && continue
    
    TOTAL_KEYS=$((TOTAL_KEYS + 1))
    value=$(echo "$value" | tr -d '"')
    
    # Calculate entropy
    entropy=$(calculate_entropy "$value")
    
    # Determine strength
    if (( $(echo "$entropy < 60" | bc -l 2>/dev/null || echo 0) )); then
        echo -e "  ${RED}⚠️  WEAK${NC}: $key (entropy: $entropy bits)"
        log "WEAK: $key - $entropy bits"
        ENTROPY_ISSUES=$((ENTROPY_ISSUES + 1))
    elif (( $(echo "$entropy < 80" | bc -l 2>/dev/null || echo 0) )); then
        [ "$VERBOSE" = true ] && echo -e "  ${YELLOW}🔶 MEDIUM${NC}: $key (entropy: $entropy bits)"
    else
        [ "$VERBOSE" = true ] && echo -e "  ${GREEN}✅ STRONG${NC}: $key (entropy: $entropy bits)"
    fi
done < <(grep -v "^#" "$ENV_FILE" 2>/dev/null | grep "=")

echo "Entropy analysis: $ENTROPY_ISSUES weak keys found of $TOTAL_KEYS total"


# === SECRET AGE TRACKING ===
echo ""
echo "2. SECRET AGE TRACKING"
echo "---------------------"

# Check .env modification time
if [ -f "$ENV_FILE" ]; then
    ENV_MTIME=$(stat -c %Y "$ENV_FILE" 2>/dev/null)
    NOW=$(date +%s)
    DAYS_OLD=$(( (NOW - ENV_MTIME) / 86400 ))
    
    echo "  .env last modified: $DAYS_OLD days ago"
    
    if [ $DAYS_OLD -gt 30 ]; then
        echo -e "  ${RED}⚠️  STALE${NC}: .env is $DAYS_OLD days old (rotate recommended)"
        log "WARNING: .env is $DAYS_OLD days old"
    elif [ $DAYS_OLD -gt 14 ]; then
        echo -e "  ${YELLOW}🔶 OLD${NC}: .env is $DAYS_OLD days old"
    else
        echo -e "  ${GREEN}✅ FRESH${NC}: .env is $DAYS_OLD days old"
    fi
    
    # Check individual key modification tracking
    # (would need to track in a database for per-key age)
fi


# === DUPLICATE DETECTION ===
echo ""
echo "3. DUPLICATE DETECTION"
echo "--------------------"

declare -A KEY_VALUES
DUPLICATES=0

while IFS='=' read -r key value; do
    # Skip empty lines and comments
    [[ -z "$key" || "$key" =~ ^# ]] && continue
    
    # Skip non-API-key entries
    [[ ! "$key" =~ _API_KEY|_TOKEN|BOT_TOKEN ]] && continue
    
    value=$(echo "$value" | tr -d '"')
    
    if [[ -n "${KEY_VALUES[$value]:-}" ]]; then
        echo -e "  ${RED}⚠️  DUPLICATE${NC}: $key uses same value as ${KEY_VALUES[$value]}"
        log "DUPLICATE: $key matches ${KEY_VALUES[$value]}"
        DUPLICATES=$((DUPLICATES + 1))
    else
        KEY_VALUES[$value]="$key"
    fi
done < <(grep -v "^#" "$ENV_FILE" 2>/dev/null | grep "=")

if [ $DUPLICATES -eq 0 ]; then
    echo -e "  ${GREEN}✅ No duplicate keys detected${NC}"
else
    echo "Duplicates found: $DUPLICATES"
fi


# === SUMMARY ===
echo ""
echo "========================================="
echo "  Analysis Summary"
echo "========================================="
echo ""
echo -e "Weak (entropy <60): ${RED}$ENTROPY_ISSUES${NC}"
echo -e "Stale (>30 days):  $([ $DAYS_OLD -gt 30 ] && echo -e ${RED}$DAYS_OLD || echo '0')${NC}"
echo -e "Duplicates:       ${RED}$DUPLICATES${NC}"
echo ""

TOTAL_ISSUES=$((ENTROPY_ISSUES + DUPLICATES + (DAYS_OLD > 30 ? 1 : 0)))

if [ $TOTAL_ISSUES -eq 0 ]; then
    echo -e "${GREEN}✅ All secrets healthy!${NC}"
else
    echo -e "${YELLOW}⚠️  $TOTAL_ISSUES issues found${NC}"
fi

log "Analysis complete: $TOTAL_ISSUES issues"