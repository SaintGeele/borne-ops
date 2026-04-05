#!/bin/bash
# Usage: ./reply.sh "comment text here"
# Optionally: ./reply.sh "comment" "post text" "url"

COMMENT="$1"
POST="${2:-549 leads in our pipeline. 549 businesses who picked up the phone.}"
URL="${3:-}"
PLATFORM="${4:-linkedin}"

cat > /tmp/reply-input.json << JSONEOF
{
  "platform": "$PLATFORM",
  "post": "$POST",
  "comment": "$COMMENT",
  "url": "$URL"
}
JSONEOF

cd /home/saint/.openclaw/workspace/agents/mrx/scripts
node reply-draft.js
