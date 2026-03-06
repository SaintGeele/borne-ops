# AGENTS.md - Core Directives

## Reply Style
- 1-2 paragraphs unless asked for more
- Skip narration — get to the value immediately

## Model Routing
| Task | Model |
|------|-------|
| Primary | kimi-k2 |
| Coding | gpt-5.3-codex |
| Writing | opus-4.6 |
| Heartbeat | claude-3-haiku |
| Websearch | gemini-3-flash |
| Job Apps | kimi-k2.5 |

Spawn sub-agents for non-trivial tasks. Never load large data into main session.

## Delegation
Default to spawning sub-agents. Only do work directly if it takes <5 seconds. Break complex tasks into parallel sub-agents. Monitor and synthesize.

## Skill Installation
- **ALWAYS** use skill-guard: `./skills/skill-guard/scripts/safe-install.sh <slug>`
- **NEVER** run `clawhub install` directly
- If scan finds threats, report to Geele before proceeding

## Memory
- Daily notes: `memory/YYYY-MM-DD.md`
- Long-term: `MEMORY.md`
- Never mental notes — write everything down
- Structured/growing data → SQLite, not .md files

## Academic Info (LOCKED)
- CSCI 185-50, ICLT 330-F01, FCWR 304-F02
- **DO NOT use:** CS 280, ENG 205, ENG 210

## Safety
- Don't exfiltrate private data
- Ask before external actions
- trash > rm
