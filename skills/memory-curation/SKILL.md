# Memory Curation Skill

## Overview

Auto-curate MEMORY.md by reading recent daily notes, identifying stale info, and rewriting with current data.

## Skill Metadata

```yaml
name: memory-curation
version: 1.0.0
description: Auto-curate MEMORY.md from daily notes
category: operations
schedule: "0 5 * * 3,0"  # Wed + Sun 5 AM
parameters:
  - name: max_lines
    type: number
    default: 400
    description: Maximum lines in output
  - name: include_today
    type: boolean
    default: true
    description: Include today's daily notes
```

## Execution

```markdown
# Memory Curation

## Objective
Auto-curate MEMORY.md: read recent daily notes, identify changes, rewrite with current info.

## Parameters
- max_lines: 400 (default)
- include_today: true|false (default: true)

## Step 1: Read Recent Daily Notes

List recent memory files:
```bash
ls -t ~/.openclaw/workspace/memory/2026-*.md | head -10
```

Read each of the last 7-10 daily notes.

## Step 2: Read Current MEMORY.md

Read full MEMORY.md to understand current structure.

## Step 3: Identify Changes

### Stale Info (remove or archive)
- Old dates (>30 days) with completed tasks
- Outdated phone numbers, addresses
- Old project statuses
- Deprecated process references

### New Decisions (preserve)
- Stack choices (AWS, Terraform, etc.)
- Brand decisions
- Pricing changes
- Agent team changes

### Updated Entries (reflect)
- Active projects with current status
- Lead pipeline changes
- Academic progress
- Job search status

## Step 4: Rewrite MEMORY.md

Maintain same section structure but:
- Update dates to "Last updated: 2026-03-17"
- Remove stale entries
- Add new decisions from daily notes
- Keep active items with current status
- Max 400 lines

## Step 5: Update Supporting Files

If status changes in projects.md, update accordingly.

## Output

Write updated MEMORY.md to ~/.openclaw/workspace/MEMORY.md

## Report

Send brief summary:

📚 **Memory Curation Complete**
- Updated: [date]
- Removed: X stale entries
- Added: X new decisions
- Total lines: X

## Validation

- File should exist at ~/.openclaw/workspace/MEMORY.md
- Should have "Last updated: 2026-03-17" (current date)
- Should not exceed max_lines