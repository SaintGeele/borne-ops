#!/bin/bash
# Run Ralph Loop overnight - for cron scheduling
# Usage: 0 21 * * * /path/to/run-overnight.sh

WORKSPACE="/home/saint/.openclaw/workspace/ralph-loops"
LOG_DIR="$WORKSPACE/output"

mkdir -p "$LOG_DIR"

cd "$WORKSPACE"

# Set conservative limits for overnight
export MAX_LOOPS=30
export LOG_FILE="$LOG_DIR/ralph-$(date +%Y%m%d).txt"

echo "=== Overnight Ralph Run ===" | tee -a "$LOG_FILE"
./ralph.sh 2>&1 | tee -a "$LOG_FILE"

exit 0
