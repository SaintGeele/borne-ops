# Borne Systems Agents

Agent directory for Borne Systems AI team, managed by BorneAI.

## Directory Structure

```
agents/
  business/lead-gen/          # ICP-targeted prospecting, trigger detection
  security/ghost-protocol/    # Client data separation, access boundaries
  sales/pipeline-analyst/     # Revenue forecasting, deal health scoring
  sales/engineer/              # Pre-sales technical, demo engineering, battlecards
  automation/governance/       # Automation approval framework (n8n governance)
  devops/self-healing-server/ # Auto-remediation, health monitoring
  marketing/ai-aeo-geo-strategist/  # AI citation optimization
  marketing/news-curator/     # Daily competitive intel digest
```

## Agent Pattern

Every agent follows this structure:

```
[agent-name]/
  SOUL.md       # Identity, personality, rules
  AGENTS.md     # Agent config, triggers, output format
  SKILL.md      # Operational details, responsibilities, technical specs
  IDENTITY.md   # Basic identity (name, emoji, color, reports-to)
  scripts/
    *.js        # ESM scripts, dotenv from ~/.openclaw/.env
```

## Shared Dependencies

- **Supabase**: `bnxyaqfulsptequuzlay.supabase.co`
  - Service key from `~/.openclaw/.env` (`SUPABASE_SERVICE_KEY`)
  - Anon key from `~/.openclaw/.env` (`SUPABASE_ANON_KEY`)
- **Telegram**: alerts to configured `TELEGRAM_CHAT_ID`
- **Environment**: all scripts source `~/.openclaw/.env`

## Available Scripts

| Agent | Script | Purpose |
|-------|--------|---------|
| lead-gen | `prospect.js --icp dental --limit 25` | Build ICP-targeted lead lists |
| ghost-protocol | `audit.js` | Data separation boundary audit |
| pipeline-analyst | `report.js` | Weekly pipeline health + forecast |
| automation-governance | `evaluate.js --name "..." --time-savings 5 --data-level high --deps 2 --scale high` | Automation approval scoring |
| sales-engineer | `battlecard.js --competitor RingCentral` | Generate FIA-framework battlecard |
| self-healing-server | `health-check.js [--action check\|cleanup\|report]` | System health monitoring + auto-remediation |
| ai-aeo-geo-strategist | `audit.js --brand "Borne Systems"` | AI citation rate audit across platforms |
| news-curator | `digest.js [--limit 10]` | Daily news digest → content queue |

## Supabase Tables

- `leads`: id, name, email, company, industry, score, status, source, trigger_event, enriched_at
- `activity_log`: agent_id, action_type, title, description, metadata
- `content_queue`: title, source, source_url, summary, relevance_score, status, scheduled_for
- `incidents` (self-healing-server): agent_id, severity, issue_type, service_name, action_taken, before/after_state

## Adding a New Agent

1. Create directory: `agents/[category]/[agent-name]/`
2. Add: SOUL.md, AGENTS.md, SKILL.md, IDENTITY.md
3. Add scripts in `scripts/` subdirectory
4. Commit with descriptive message
