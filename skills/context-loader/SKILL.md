# Context Loader Skill

## Purpose
Load relevant context at session start to avoid repetitive back-and-forth.

## How It Works

### On Session Start
1. Check date/time (America/New_York timezone)
2. Read today's memory file if exists
3. Check for pending tasks from MEMORY.md queue
4. Load active project context
5. Check cron jobs status

### Files to Check
- `memory/YYYY-MM-DD.md` — today's notes
- `MEMORY.md` — master index with queue
- Agent workspaces for active tasks

## Run
Load context for today's work. What's pending? What's the focus?

