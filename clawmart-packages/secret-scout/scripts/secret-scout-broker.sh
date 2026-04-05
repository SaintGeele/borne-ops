#!/bin/bash
# secret-scout-broker.sh - MCP-compatible secret broker
# Usage: 
#   ./secret-scout-broker.sh get <key>           # Get a specific key
#   ./secret-scout-broker.sh list <agent>        # List keys for agent
#   ./secret-scout-broker.sh check <key>         # Check if key exists

ENV_FILE="$HOME/.openclaw/.env"
LOG_FILE="$HOME/.openclaw/logs/secrets-manager.log"

# Agent-to-keys mapping (same as scope.sh)
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
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [BROKER] $1" | tee -a "$LOG_FILE"
}

ACTION="${1:-}"
shift || true

case "$ACTION" in
    get)
        KEY="$1"
        AGENT="${2:-borneai}"  # Default to borneai if not specified
        
        # Check if agent has access to this key
        ALLOWED="${AGENT_KEYS[$AGENT]:-}"
        if [[ "$ALLOWED" == *"$KEY"* ]]; then
            VALUE=$(grep "^${KEY}=" "$ENV_FILE" 2>/dev/null | cut -d'=' -f2- | tr -d '"')
            if [ -n "$VALUE" ]; then
                echo "$VALUE"
                log "ACCESS: $AGENT requested $KEY - granted"
            else
                echo "ERROR: Key exists but value is empty"
                log "ERROR: $KEY value empty"
                exit 1
            fi
        else
            echo "ERROR: $AGENT not authorized for $KEY"
            log "DENIED: $AGENT requested $KEY - not in scope"
            exit 1
        fi
        ;;
    list)
        AGENT="$1"
        ALLOWED="${AGENT_KEYS[$AGENT]:-}"
        if [ -z "$ALLOWED" ]; then
            echo "Unknown agent: $AGENT"
            exit 1
        fi
        echo "Keys available to $AGENT:"
        IFS=',' read -ra KEYS <<< "$ALLOWED"
        for key in "${KEYS[@]}"; do
            if grep -q "^${key}=" "$ENV_FILE"; then
                echo "  ✅ $key"
            else
                echo "  ❌ $key (missing)"
            fi
        done
        ;;
    check)
        KEY="$1"
        if grep -q "^${KEY}=" "$ENV_FILE"; then
            VALUE=$(grep "^${KEY}=" "$ENV_FILE" | cut -d'=' -f2-)
            if [ -n "$VALUE" ]; then
                echo "OK: $KEY exists and is populated"
                exit 0
            else
                echo "WARN: $KEY exists but is empty"
                exit 1
            fi
        else
            echo "MISSING: $KEY not found"
            exit 1
        fi
        ;;
    mcp-json)
        # MCP-compatible JSON output for tool integration
        echo "{"
        echo "  \"version\": \"1.0\","
        echo "  \"tools\": ["
        echo "    {"
        echo "      \"name\": \"secret_get\","
        echo "      \"description\": \"Get a secret for a specific agent\","
        echo "      \"input\": {"
        echo "        \"key\": \"OPENROUTER_API_KEY\","
        echo "        \"agent\": \"borneai\""
        echo "      }"
        echo "    },"
        echo "    {"
        echo "      \"name\": \"secret_list\","
        echo "      \"description\": \"List available secrets for an agent\","
        echo "      \"input\": {"
        echo "        \"agent\": \"borneai\""
        echo "      }"
        echo "    },"
        echo "    {"
        echo "      \"name\": \"secret_check\","
        echo "      \"description\": \"Check if a secret exists\","
        echo "      \"input\": {"
        echo "        \"key\": \"OPENROUTER_API_KEY\""
        echo "      }"
        echo "    }"
        echo "  ]"
        echo "}"
        ;;
    *)
        echo "SecretScout Broker - MCP-compatible secret access"
        echo ""
        echo "Usage:"
        echo "  $0 get <key> [agent]    # Get secret for agent"
        echo "  $0 list <agent>         # List secrets for agent"
        echo "  $0 check <key>          # Check if secret exists"
        echo "  $0 mcp-json             # Show MCP tool definitions"
        echo ""
        echo "Examples:"
        echo "  $0 get OPENROUTER_API_KEY nexus"
        echo "  $0 list ivy"
        echo "  $0 check TELEGRAM_BOT_TOKEN"
        ;;
esac