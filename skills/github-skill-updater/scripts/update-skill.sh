#!/bin/bash
#
# Update a specific skill by name
# Usage: ./update-skill.sh <skill-name>
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILLS_DIR="$HOME/.openclaw/workspace/skills"

if [[ -z "$1" ]]; then
    echo "Usage: $0 <skill-name>"
    exit 1
fi

SKILL_NAME="$1"
SKILL_PATH="$SKILLS_DIR/$SKILL_NAME"

if [[ ! -d "$SKILL_PATH" ]]; then
    echo "Error: Skill '$SKILL_NAME' not found in $SKILLS_DIR"
    exit 1
fi

# Check if it's a Git repo
if [[ ! -d "$SKILL_PATH/.git" ]]; then
    echo "Error: $SKILL_NAME is not a Git repository"
    exit 1
fi

echo "Updating skill: $SKILL_NAME"
echo "Path: $SKILL_PATH"

cd "$SKILL_PATH"

# Show current state
echo "Current commit: $(git rev-parse HEAD)"
echo "Current branch: $(git branch --show-current)"

# Fetch and show what's available
echo ""
echo "Fetching updates..."
git fetch --all --tags 2>/dev/null || true

# Get remote branch
remote_branch=$(git rev-parse --abbrev-ref origin/HEAD 2>/dev/null | sed 's|origin/||' || echo "main")
remote_commit=$(git rev-parse "$remote_branch" 2>/dev/null || echo "")

if [[ -z "$remote_commit" ]]; then
    remote_branch="master"
    remote_commit=$(git rev-parse "$remote_branch" 2>/dev/null || echo "")
fi

echo "Remote commit ($remote_branch): $remote_commit"

if [[ "$(git rev-parse HEAD)" == "$remote_commit" ]]; then
    echo ""
    echo "✅ Already up to date!"
    exit 0
fi

echo ""
echo "Update available. Applying..."
git reset --hard "$remote_commit" 2>/dev/null || git pull --ff-only 2>/dev/null || true

echo ""
echo "✅ Updated!"
echo "New commit: $(git rev-parse HEAD)"