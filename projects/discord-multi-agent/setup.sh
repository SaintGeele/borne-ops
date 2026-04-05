#!/bin/bash
# Discord Multi-Agent Setup Script for Borne Systems
# Run after creating Discord bot applications and collecting tokens.
#
# Usage: bash setup.sh
# Prerequisites: openclaw CLI available, bot tokens ready

set -euo pipefail

GUILD_ID="1479519793378885894"
USER_ID="345963930864058368"

echo "=== Borne Systems Discord Multi-Agent Setup ==="
echo ""
echo "This script configures OpenClaw to route 8 agents to Discord."
echo "You need bot tokens for: Atlas, Nexus, Ivy, Knox, MrX, Professor, Chronicle"
echo "(BorneAI already has a token configured)"
echo ""

# Agent list (excluding borneai which already has a token)
AGENTS=("atlas" "nexus" "ivy" "knox" "mrx" "professor" "chronicle")
NAMES=("Atlas" "Nexus" "Ivy" "Knox" "Mr. X" "Professor" "Chronicle")

# Collect tokens
declare -A TOKENS
for i in "${!AGENTS[@]}"; do
  agent="${AGENTS[$i]}"
  name="${NAMES[$i]}"
  echo -n "Enter Discord bot token for ${name} (${agent}): "
  read -rs token
  echo ""
  if [ -z "$token" ]; then
    echo "  ⚠️  Skipping ${name} (no token provided)"
  else
    TOKENS[$agent]="$token"
    echo "  ✅ ${name} token saved"
  fi
done

echo ""
echo "Setting tokens in OpenClaw config..."

for agent in "${!TOKENS[@]}"; do
  token="${TOKENS[$agent]}"
  openclaw config set "channels.discord.accounts.${agent}.token" "\"${token}\"" --json 2>/dev/null
  echo "  ✅ ${agent} token configured"
done

echo ""
echo "Setting up bindings..."

# The bindings and channel configs are in config-patch.json
# We need to merge them manually since openclaw config merge may not exist
CONFIG_DIR="$(dirname "$0")"

echo "  → Bindings need to be added to openclaw.json manually or via:"
echo "    openclaw config set bindings '[...]' --json"
echo ""
echo "  See: ${CONFIG_DIR}/config-patch.json for the full config"
echo ""

echo "Copying auth profiles to agents that need them..."
SRC="/home/saint/.openclaw/agents/borneai/agent/auth-profiles.json"
if [ -f "$SRC" ]; then
  for agent in "${AGENTS[@]}"; do
    DEST="/home/saint/.openclaw/agents/${agent}/agent/auth-profiles.json"
    if [ ! -f "$DEST" ]; then
      cp "$SRC" "$DEST"
      echo "  ✅ Copied auth-profiles.json to ${agent}"
    else
      echo "  ⏭️  ${agent} already has auth-profiles.json"
    fi
  done
else
  echo "  ⚠️  BorneAI auth-profiles.json not found, skipping copies"
fi

echo ""
echo "=== Setup Complete ==="
echo ""
echo "Next steps:"
echo "  1. Review/merge config-patch.json into ~/.openclaw/openclaw.json"
echo "  2. Run: openclaw gateway restart"
echo "  3. Run: openclaw agents list --bindings"
echo "  4. Run: openclaw channels status --probe"
echo "  5. Test by @mentioning each bot in its assigned channel"
