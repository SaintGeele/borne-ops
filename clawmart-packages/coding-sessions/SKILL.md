# SKILL.md - Borne Coding Sessions

## Description
Run persistent, self-healing AI coding sessions with tmux, automatic retry loops, and completion notifications. Built for OpenClaw with Nexus integration.

## Commands
- "Start coding session [task description]"
- "Run coding agent [filename or task]"
- "Check session status"
- "Get session output"
- "Restart failed session"
- "Kill session [name]"

## Features

### Persistent Sessions
- tmux sessions that survive gateway restarts
- Stable socket path: `~/.tmp/openclaw-sessions/`
- Auto-reconnect on reconnection
- Session naming: `coder-{timestamp}-{task-slug}`

### Ralph Retry Loops
- Automatic restart on agent failure
- Configurable max retries (default: 3)
- Exponential backoff between retries
- Failure log for debugging

### PRD-Based Workflows
- Requirement checklist validation
- Phase gates: Plan → Implement → Test → Deploy
- Approval checkpoints before proceeding

### Parallel Execution
- Run multiple coding agents simultaneously
- Aggregate results from all sessions
- Resource management limits

### Completion Hooks
- Telegram notification on completion
- Desktop notification support
- Output saved to `~/coding-sessions/logs/`

## Integration
- Works with: Codex, Claude Code, any CLI AI
- Nexus integration for engineering tasks
- Chronicle integration for documentation

## Requirements
- tmux installed
- Node.js 18+
- Optional: Telegram bot for notifications

## Troubleshooting
- Session won't start: Check tmux is installed
- Agent hangs: Use "restart failed session"
- No output: Check logs in `~/coding-sessions/logs/`