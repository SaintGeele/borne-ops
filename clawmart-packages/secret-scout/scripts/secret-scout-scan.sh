#!/bin/bash
# secret-scout-scan.sh - Scan for hardcoded secrets in OpenClaw config
# Usage: ./secret-scout-scan.sh [--verbose] [--output <file>]

set -uo pipefail

WORKSPACE="$HOME/.openclaw"
SCAN_DIRS=(
    "$WORKSPACE/agents"
    "$WORKSPACE/workspace"
    "$WORKSPACE/skills"
    "$WORKSPACE/.openclaw"
)
LOG_FILE="$HOME/.openclaw/logs/secrets-manager.log"
OUTPUT_FILE=""
VERBOSE=false

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Patterns to scan for
SECRET_PATTERNS=(
    "sk-[a-zA-Z0-9]{20,}"                 # OpenAI
    "sk-or-v1-[a-zA-Z0-9]{20,}"           # OpenRouter
    "re_[a-zA-Z0-9]{20,}"                 # Resend
    "xai-[a-zA-Z0-9]{20,}"                # xAI
    "tvly-[a-zA-Z0-9]{20,}"               # Tavily
    "fc-[a-zA-Z0-9]{20,}"                 # Firecrawl
    "ECA[a-zA-Z0-9]{1,}"                  # OpenClaw
    "ghp_[a-zA-Z0-9]{36}"                 # GitHub PAT
    "gho_[a-zA-Z0-9]{36}"                 # GitHub OAuth
    "AKIA[0-9A-Z]{16}"                    # AWS Access Key
    "whsec_[a-zA-Z0-9]{32}"               # Resend Webhook
    "am_us_[a-zA-Z0-9]{32,}"              # AgentMail
    "MTQ[0-9A-Za-z_-]{20,}"               # Discord Bot Token
    "[0-9]{8,10}:[a-zA-Z0-9_-]{30,}"      # Telegram Bot Token
)

# Known safe patterns (whitelist)
SAFE_PATTERNS=(
    "\.env"
    "auth-profiles\.json"
    "secrets-preflight"
    "secret-scout"
    "BACKUP"
    "backup"
    "timestamp"
)

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [SCAN] $1" | tee -a "$LOG_FILE"
}

# Parse args
while [[ $# -gt 0 ]]; do
    case $1 in
        --verbose) VERBOSE=true; shift ;;
        --output) OUTPUT_FILE="$2"; shift 2 ;;
        *) shift ;;
    esac
done

echo "========================================="
echo "  SecretScout Scanner 🛰️"
echo "========================================="
log "Starting secret scan..."

TOTAL_FINDINGS=0
declare -A FINDINGS

# Scan each directory
for SCAN_DIR in "${SCAN_DIRS[@]}"; do
    if [ ! -d "$SCAN_DIR" ]; then
        [ "$VERBOSE" = true ] && echo "  ⚠️  Skipping: $SCAN_DIR (not found)"
        continue
    fi
    
    echo ""
    echo "Scanning: $SCAN_DIR"
    
    # Skip .git, node_modules, etc
    while IFS= read -r -d '' file; do
        # Skip certain file types
        if [[ "$file" =~ (node_modules|\.git|dist|build|cache) ]]; then
            continue
        fi
        
        # Skip binary files
        if file "$file" 2>/dev/null | grep -q "binary"; then
            continue
        fi
        
        # Check each pattern
        for pattern in "${SECRET_PATTERNS[@]}"; do
            if grep -EHno "$pattern" "$file" 2>/dev/null | head -1 | grep -v "Binary" > /dev/null; then
                # Check if it's in a safe location
                IS_SAFE=false
                for safe in "${SAFE_PATTERNS[@]}"; do
                    if [[ "$file" =~ $safe ]]; then
                        IS_SAFE=true
                        break
                    fi
                done
                
                if [ "$IS_SAFE" = false ]; then
                    RESULT=$(grep -EHno "$pattern" "$file" 2>/dev/null | head -1)
                    FINDINGS["$file"]="$RESULT"
                    ((TOTAL_FINDINGS++))
                    echo -e "  ${RED}⚠️  FOUND${NC}: $(basename "$file") - $RESULT"
                    log "FOUND: $file - $RESULT"
                fi
            fi
        done
    done < <(find "$SCAN_DIR" -type f -name "*.json" -o -name "*.md" -o -name "*.sh" -o -name "*.js" -o -name "*.ts" -print0 2>/dev/null)
done

# Summary
echo ""
echo "========================================="
echo "  Scan Complete"
echo "========================================="
echo ""
echo "Total findings: $TOTAL_FINDINGS"

if [ $TOTAL_FINDINGS -eq 0 ]; then
    echo -e "${GREEN}✅ No hardcoded secrets found!${NC}"
    log "Scan complete - no findings"
else
    echo -e "${RED}⚠️  $TOTAL_FINDINGS potential secrets found${NC}"
    log "Scan complete - $TOTAL_FINDINGS findings"
    
    echo ""
    echo "Files requiring attention:"
    for file in "${!FINDINGS[@]}"; do
        echo "  - $file"
    done
    
    # Save to output file if specified
    if [ -n "$OUTPUT_FILE" ]; then
        {
            echo "SecretScout Scan Results"
            echo "Date: $(date)"
            echo "Findings: $TOTAL_FINDINGS"
            echo ""
            for file in "${!FINDINGS[@]}"; do
                echo "$file: ${FINDINGS[$file]}"
            done
        } > "$OUTPUT_FILE"
        echo ""
        echo "Report saved to: $OUTPUT_FILE"
    fi
fi

log "Scan finished"
exit 0