# Config Backup Skill

## Overview

Backup OpenClaw configuration files.

## Skill Metadata

```yaml
name: config-backup
version: 1.0.0
description: Backup OpenClaw config files
category: operations
schedule: "0 3 * * *"  # Daily 3 AM
parameters:
  - name: include_secrets
    type: boolean
    default: false
    description: Include secrets (default: false)
```

## Execution

```markdown
# Config Backup

## Objective
Backup OpenClaw configuration.

## Parameters
- include_secrets: false (default)

## Step 1: Run Backup Script

Run: `bash ~/.openclaw/workspace/scripts/backup-openclaw.sh`

## Step 2: Verify

Check:
- Backup file created
- Size > 0
- Timestamp current

## Step 3: Log

Log to ~/.openclaw/workspace/logs/backup.log:

```
[YYYY-MM-DD HH:MM] Backup: SUCCESS/FAILURE
```

## Validation

- Script runs successfully
- Backup file exists
- Size > 0