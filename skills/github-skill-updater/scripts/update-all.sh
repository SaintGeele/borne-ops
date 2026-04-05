#!/bin/bash
#
# github-skill-updater - Update all skills installed from GitHub
# Usage: ./update-all.sh [--dry-run]
#

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILLS_DIR="$HOME/.openclaw/workspace/skills"
LOG_FILE="$HOME/.openclaw/workspace/memory/github-skill-updates.md"
DRY_RUN=false

if [[ "$1" == "--dry-run" ]]; then
    DRY_RUN=true
fi

# Initialize log
init_log() {
    mkdir -p "$(dirname "$LOG_FILE")"
    echo "# GitHub Skill Updates" > "$LOG_FILE"
    echo "" >> "$LOG_FILE"
    echo "Updated: $(date -Iseconds)" >> "$LOG_FILE"
    echo "" >> "$LOG_FILE"
}

# Output function (stderr + file)
out() {
    echo "[$(date '+%H:%M:%S')] $1" | tee -a "$LOG_FILE" >&2
}

# Update a single skill - status is FIRST line of output
# Exit codes: 0=skipped, 1=updated, 2=failed
update_skill() {
    local skill_path="$1"
    local skill_name=$(basename "$skill_path")
    local last_status=""
    
    # Status comes FIRST in stdout
    echo "STATUS:start"
    
    out "=== Checking $skill_name ==="
    
    # Get current commit
    local current_commit=$(git -C "$skill_path" rev-parse HEAD 2>/dev/null || echo "unknown")
    out "Current commit: $current_commit"
    
    # Fetch latest
    git -C "$skill_path" fetch --all --tags 2>/dev/null || true
    
    # Get remote branch and commit
    local remote_branch="main"
    local remote_commit=$(git -C "$skill_path" rev-parse "origin/$remote_branch" 2>/dev/null || echo "unknown")
    
    if [[ "$remote_commit" == "unknown" ]]; then
        remote_branch="master"
        remote_commit=$(git -C "$skill_path" rev-parse "origin/$remote_branch" 2>/dev/null || echo "unknown")
    fi
    
    out "Remote commit ($remote_branch): $remote_commit"
    
    # Compare
    if [[ "$current_commit" == "$remote_commit" ]] || [[ "$remote_commit" == "unknown" ]]; then
        out "Status: UP TO DATE"
        last_status="skipped"
        echo "STATUS:$last_status"
        return 0
    fi
    
    if [[ "$DRY_RUN" == "true" ]]; then
        out "Status: UPDATE AVAILABLE (dry-run)"
        last_status="skipped"
        echo "STATUS:$last_status"
        return 0
    fi
    
    # Apply update
    out "Status: UPDATING..."
    if git -C "$skill_path" reset --hard "$remote_commit" 2>/dev/null; then
        out "Status: UPDATED"
        last_status="updated"
        echo "STATUS:$last_status"
        return 1
    else
        out "Status: FAILED"
        last_status="failed"
        echo "STATUS:$last_status"
        return 2
    fi
}

# Main
main() {
    echo "GitHub Skill Updater"
    echo "===================="
    
    if [[ "$DRY_RUN" == true ]]; then
        echo "Mode: DRY RUN (no changes will be made)"
    else
        echo "Mode: LIVE UPDATE"
    fi
    echo ""
    
    init_log
    
    updated=0
    skipped=0
    failed=0
    
    # Find all skills with GitHub origins
    for skill_dir in "$SKILLS_DIR"/*/; do
        skill_name=$(basename "$skill_dir")
        
        # Skip if not a git repo
        [[ ! -d "$skill_dir/.git" ]] && continue
        
        # Check if has github origin
        remote_url=$(git -C "$skill_dir" remote get-url origin 2>/dev/null || echo "")
        if ! echo "$remote_url" | grep -qi "github.com"; then
            continue
        fi
        
        echo "Found GitHub skill: $skill_name"
        
        # Get status line (last STATUS: line)
        result=$(update_skill "$skill_dir" 2>&1 | grep "^STATUS:" | tail -1 | cut -d: -f2)
        
        case "$result" in
            "updated")
                updated=$((updated + 1))
                ;;
            "skipped")
                skipped=$((skipped + 1))
                ;;
            "failed")
                failed=$((failed + 1))
                ;;
        esac
    done
    
    # Summary
    echo ""
    echo "===================="
    echo "Summary:"
    echo "  Updated: $updated"
    echo "  Skipped: $skipped"
    echo "  Failed: $failed"
    
    echo "" >> "$LOG_FILE"
    echo "## Summary" >> "$LOG_FILE"
    echo "- Updated: $updated" >> "$LOG_FILE"
    echo "- Skipped: $skipped" >> "$LOG_FILE"
    echo "- Failed: $failed" >> "$LOG_FILE"
    
    # Output JSON
    echo ""
    echo "JSON_OUTPUT:"
    echo "{\"updated\":$updated,\"skipped\":$skipped,\"failed\":$failed,\"timestamp\":\"$(date -Iseconds)\"}"
}

main "$@"