#!/bin/bash
# Daily CEO Briefing Execution Script
# Runs daily at 2 AM ET via cron (6 AM UTC)
# Requires OpenClaw to be running

set -e

DATE=$(date +%Y-%m-%d)
SCRIPT_DIR="/home/saint/.openclaw/workspace/briefing"
OUTPUT_DIR="/home/saint/.openclaw/workspace/memory/briefings"
mkdir -p "$OUTPUT_DIR"

# File to collect agent responses
BRIEFING_FILE="$OUTPUT_DIR/$DATE.md"

log() {
    echo "[$(date)] $1"
}

log "Starting CEO Briefing for $DATE"

# Initialize briefing file
cat > "$BRIEFING_FILE" << EOF
# Daily CEO Briefing - $DATE

---

## 🔧 RUNTIME HEALTH
EOF

# Step 1: Get runtime health from Mission Control
log "Querying Mission Control..."
MC_RESPONSE=$(/home/saint/.npm-global/bin/openclaw run "Provide a 2-3 sentence runtime health summary for Borne Systems. Check gateway status, agent services, and uptime. Keep it brief for a CEO briefing." --model kimi-k2 2>/dev/null | head -100)
echo "$MC_RESPONSE" >> "$BRIEFING_FILE"
echo "" >> "$BRIEFING_FILE"

# Step 2: Get security concerns from Knox
cat >> "$BRIEFING_FILE" << EOF
## 🛡️ SECURITY
EOF

log "Querying Knox..."
KNOX_RESPONSE=$(/home/saint/.npm-global/bin/openclaw run "Provide a 2-3 sentence security summary for Borne Systems. Check for vulnerabilities, failed auth attempts, hardening status, or alerts. Keep it brief for a CEO briefing." --model kimi-k2 2>/dev/null | head -100)
echo "$KNOX_RESPONSE" >> "$BRIEFING_FILE"
echo "" >> "$BRIEFING_FILE"

# Step 3: Get research opportunities from Ivy
cat >> "$BRIEFING_FILE" << EOF
## 📈 RESEARCH
EOF

log "Querying Ivy..."
IVY_RESPONSE=$(/home/saint/.npm-global/bin/openclaw run "Provide a 2-3 sentence research/opportunities summary. Note any new leads, market opportunities, or research in progress. Keep it brief for a CEO briefing." --model kimi-k2 2>/dev/null | head -100)
echo "$IVY_RESPONSE" >> "$BRIEFING_FILE"
echo "" >> "$BRIEFING_FILE"

# Step 4: Get engineering priorities from Nexus
cat >> "$BRIEFING_FILE" << EOF
## ⚙️ ENGINEERING
EOF

log "Querying Nexus..."
NEXUS_RESPONSE=$(/home/saint/.npm-global/bin/openclaw run "Provide a 2-3 sentence engineering status summary. Note active projects, completed work, blockers, or next priorities. Keep it brief for a CEO briefing." --model kimi-k2 2>/dev/null | head -100)
echo "$NEXUS_RESPONSE" >> "$BRIEFING_FILE"
echo "" >> "$BRIEFING_FILE"

# Finalize
cat >> "$BRIEFING_FILE" << EOF
---
*Recorded by Chronicle | $(date)*
EOF

log "Briefing complete: $BRIEFING_FILE"

# Display summary
echo ""
echo "=== BRIEFING SUMMARY ==="
cat "$BRIEFING_FILE"

# TODO: Send to Geele via BorneAI/Telegram
log "Done."