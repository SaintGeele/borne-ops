#!/bin/bash
# secret-scout-scope.sh - Per-agent secret scoping
# Usage: ./secret-scout-scope.sh [--agent <name>] [--list] [--update]

AGENTS_DIR="$HOME/.openclaw/agents"
ENV_FILE="$HOME/.openclaw/.env"
LOG_FILE="$HOME/.openclaw/logs/secrets-manager.log"

# Agent-to-keys mapping (which keys each agent can access)
declare -A AGENT_KEYS=(
    ["atlas"]="OPENROUTER_API_KEY,TELEGRAM_BOT_TOKEN,DISCORD_ATLAS_TOKEN"
    ["borneai"]="OPENROUTER_API_KEY,TELEGRAM_BOT_TOKEN,DISCORD_BORNEAI_TOKEN,DISCORD_DEFAULT_TOKEN"
    ["nexus"]="OPENROUTER_API_KEY,OPENAI_API_KEY,DISCORD_NEXUS_TOKEN,GITHUB_TOKEN"
    ["knox"]="OPENROUTER_API_KEY,DISCORD_KNOX_TOKEN"
    ["ivy"]="OPENROUTER_API_KEY,DISCORD_IVY_TOKEN,TAVILY_API_KEY,FIRECRAWL_API_KEY"
    ["mercury"]="OPENROUTER_API_KEY,DISCORD_MRX_TOKEN,DISCORD_MISSION_CONTROL_TOKEN"
    ["chase"]="OPENROUTER_API_KEY,DISCORD_GAUGE_TOKEN"
    ["insight"]="OPENROUTER_API_KEY,DISCORD_IVY_TOKEN,TAVILY_API_KEY"
    ["care"]="OPENROUTER_API_KEY,DISCORD_ATLAS_TOKEN"
    ["beacon"]="OPENROUTER_API_KEY,DISCORD_BEACON_TOKEN"
    ["professor"]="OPENROUTER_API_KEY,DISCORD_PROFESSOR_TOKEN"
    ["chronicle"]="OPENROUTER_API_KEY,DISCORD_CHRONICLE_TOKEN"
    ["forge"]="OPENROUTER_API_KEY,DISCORD_FORGE_TOKEN"
)

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [SCOPE] $1" | tee -a "$LOG_FILE"
}

case "${1:-}" in
    --list)
        echo "=== Agent Secret Scopes ==="
        echo ""
        for agent in "${!AGENT_KEYS[@]}"; do
            echo "  $agent:"
            IFS=',' read -ra KEYS <<< "${AGENT_KEYS[$agent]}"
            for key in "${KEYS[@]}"; do
                echo "    - $key"
            done
            echo ""
        done
        ;;
    --agent)
        AGENT="$2"
        if [[ -n "${AGENT_KEYS[$AGENT]:-}" ]]; then
            echo "=== $AGENT can access ==="
            IFS=',' read -ra KEYS <<< "${AGENT_KEYS[$AGENT]}"
            for key in "${KEYS[@]}"; do
                # Check if key exists in .env
                if grep -q "^${key}=" "$ENV_FILE"; then
                    echo "  ✅ $key"
                else
                    echo "  ❌ $key (missing)"
                fi
            done
        else
            echo "Unknown agent: $AGENT"
            echo "Valid agents: ${!AGENT_KEYS[@]}"
        fi
        ;;
    *)
        echo "Usage: $0 [--list|--agent <name>]"
        echo ""
        echo "Options:"
        echo "  --list           List all agent scopes"
        echo "  --agent <name>   Show scope for specific agent"
        ;;
esac