# SKILL.md - Notion Sync

## Description
Bi-directional sync between Notion and Telegram/webhooks.

## Commands
- "Sync telegram to Notion"
- "Sync webhook to Notion"
- "Check sync status"

## Execution
1. Telegram: Listen for messages, extract text/media
2. Webhook: Receive JSON, map fields to Notion DB
3. Notion: Create/update pages in target database
4. Conflict resolution: last-write-wins with timestamp