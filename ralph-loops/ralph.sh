#!/bin/bash

# === RALPH LOOP - Autonomous Task Runner for OpenClaw ===
# Set it up. Check results.
# Perfect for: batch research, content creation, lead enrichment

# === CONFIGURATION ===
MAX_LOOPS=${MAX_LOOPS:-50}
WORKSPACE="${WORKSPACE:-./workspace}"
LOG_FILE="${LOG_FILE:-./output/ralph-log.txt}"

# === COLORS ===
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# === LOGGING ===
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1" | tee -a "$LOG_FILE"
}

# === PRE-CHECK ===
if [ ! -f "tasks.md" ]; then
    error "tasks.md not found! Create your task list first."
    exit 1
fi

if [ ! -d "output" ]; then
    mkdir -p output
    log "Created output/ folder"
fi

# === MAIN LOOP ===
counter=0
failed=0

log "=== Ralph Loop Started ==="
log "Max loops: $MAX_LOOPS"
log "Workspace: $WORKSPACE"

while [ $counter -lt $MAX_LOOPS ]; do
    counter=$((counter + 1))
    log "=== Loop $counter of $MAX_LOOPS ==="
    
    # Run OpenClaw with task prompt
    output=$(openclaw run -w "$WORKSPACE" --prompt "Read tasks.md. Find the first task marked [NOT DONE]. Complete it. Update the task status to [DONE] or [IN PROGRESS]. If all tasks are DONE, say ALL_COMPLETE." 2>&1)
    
    # Log output (truncated)
    echo "$output" | tail -20 >> "$LOG_FILE"
    
    # Check for completion
    if echo "$output" | grep -q "ALL_COMPLETE"; then
        log "🎉 All tasks complete!"
        exit 0
    fi
    
    # Check for errors
    if echo "$output" | grep -qi "error\|failed\|exception"; then
        failed=$((failed + 1))
        warn "Errors detected (total: $failed)"
    fi
    
    # Check if progress was made (output files created/modified)
    task_count=$(grep -c "\[NOT DONE\]" tasks.md 2>/dev/null || echo "0")
    log "Remaining tasks: $task_count"
    
    if [ "$task_count" -eq 0 ]; then
        log "🎉 All tasks marked complete!"
        exit 0
    fi
    
    # Rate limiting - wait between loops
    if [ $counter -lt $MAX_LOOPS ]; then
        sleep 5
    fi
done

# === CLEANUP ===
log "Max loops reached. Check tasks.md and output/ for status."
log "Failed iterations: $failed"

# === SUMMARY ===
remaining=$(grep -c "\[NOT DONE\]" tasks.md 2>/dev/null || echo "0")
in_progress=$(grep -c "\[IN PROGRESS\]" tasks.md 2>/dev/null || echo "0")
done=$(grep -c "\[DONE\]" tasks.md 2>/dev/null || echo "0")

echo ""
echo "=== SUMMARY ==="
echo "Done: $done"
echo "In Progress: $in_progress"
echo "Remaining: $remaining"
echo "Total Loops: $counter"
echo "Failed: $failed"

exit 0