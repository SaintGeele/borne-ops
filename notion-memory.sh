#!/bin/bash

# Notion Memory Bridge
# Usage: ./notion-memory.sh add "Memory title" "Context" "Type" "Priority"

API_KEY=${NOTION_API_KEY}
PARENT_PAGE_ID=${NOTION_PARENT_PAGE}

case "$1" in
  "add")
    TITLE="$2"
    CONTEXT="$3"
    TYPE="$4"
    PRIORITY="$5"
    
    if [ -z "$DATABASE_ID" ]; then
      # Create database if not exists
      DB_RESPONSE=$(curl -s -X POST 'https://api.notion.com/v1/databases' \
        -H "Authorization: Bearer $API_KEY" \
        -H 'Content-Type: application/json' \
        -H 'Notion-Version: 2022-06-28' \
        -d @~/.openclaw/workspace/notion-database.json)
      
      DATABASE_ID=$(echo "$DB_RESPONSE" | jq -r '.id')
      echo "$DATABASE_ID" > ~/.openclaw/workspace/notion-db-id.txt
    else
      DATABASE_ID=$(cat ~/.openclaw/workspace/notion-db-id.txt)
    fi
    
    # Add memory entry
    curl -s -X POST 'https://api.notion.com/v1/pages' \
      -H "Authorization: Bearer $API_KEY" \
      -H 'Content-Type: application/json' \
      -H 'Notion-Version: 2022-06-28' \
      -d "{
        \"parent\": {\"database_id\": \"$DATABASE_ID\"},
        \"properties\": {
          \"Memory\": {\"title\": [{\"text\": {\"content\": \"$TITLE\"}}]},
          \"Session\": {\"rich_text\": [{\"text\": {\"content\": \"$SESSION_ID\"}}]},
          \"Context\": {\"select\": {\"name\": \"$CONTEXT\"}},
          \"Type\": {\"select\": {\"name\": \"$TYPE\"}},
          \"Priority\": {\"number\": $PRIORITY},
          \"Timestamp\": {\"date\": {\"start\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}}
        }
      }"
    ;;
  
  "search")
    CONTEXT="$2"
    curl -s -X POST "https://api.notion.com/v1/databases/$(cat ~/.openclaw/workspace/notion-db-id.txt)/query" \
      -H "Authorization: Bearer $API_KEY" \
      -H 'Content-Type: application/json' \
      -H 'Notion-Version: 2022-06-28' \
      -d "{\"filter\": {\"property\": \"Context\", \"select\": {\"equals\": \"$CONTEXT\"}}, \"sorts\": [{\"property\": \"Timestamp\", \"direction\": \"descending\"}], \"page_size\": 10}"
    ;;
esac