# github-skill-updater

Update skills installed from GitHub repositories.

## When to use

- Run manually when you want to check for updates to GitHub-installed skills
- Schedule via cron for periodic updates (weekly recommended)
- After ClawHub installs a new skill from a GitHub repo

## What it does

1. Scans `~/.openclaw/workspace/skills/` for skills with GitHub origins
2. For each skill, fetches latest commits/tags from remote
3. Compares local HEAD with remote
4. If updates available, runs `skill-guard` pre-flight scan
5. If safe, pulls the update
6. Logs results to `memory/github-skill-updates.md`

## Usage

```bash
# Update all GitHub skills
~/.openclaw/workspace/skills/github-skill-updater/scripts/update-all.sh

# Dry run (check only, no updates)
~/.openclaw/workspace/skills/github-skill-updater/scripts/update-all.sh --dry-run

# Update specific skill
~/.openclaw/workspace/skills/github-skill-updater/scripts/update-skill.sh <skill-name>
```

## Output

Returns a JSON summary:
```json
{
  "updated": ["skill-guard", "scrapling-mcp"],
  "skipped": ["last30days"],
  "failed": [],
  "timestamp": "2026-03-26T00:37:00Z"
}
```

## Requirements

- Git installed
- skill-guard for pre-flight security scans
- Read access to skill directories

## Safety

- Always runs `skill-guard` before applying updates
- Records all changes to memory for audit
- Dry-run mode available for testing