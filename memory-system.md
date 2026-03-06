# Notion Memory System

## Overview
Using Notion as a persistent memory backend for OpenClaw agent interactions.

## Setup
- Integration: OpenClaw Memory
- Database: OpenClaw Memories (ID from setup)
- API Key: NOTION_API_KEY

## Memory Structure
Each memory entry contains:
- Session ID
- Timestamp
- Context tags (academic, professional, personal, technical)
- Memory type (conversation, task, decision, insight)
- Content (markdown format)
- Priority (1-5 scale)

## Usage
```bash
# Add new memory
notion-cli page create --parent <memories_db> --props '{"Memory": {"title": [["SAP appeal context 2026-03-02"]]}, "Session": {"rich_text": [["agent:main:telegram:direct:1083701579"]]}, "Type": {"select": {"name": "conversation"}}, "Priority": {"number": 3}, "Timestamp": {"date": {"start": "2026-03-02T05:55:00Z"}}}'

# Query recent memories
notion-cli db query <memories_db> --sort '{"Property": "Timestamp", "Direction": "descending"}' --limit 10

# Search contextual memories
notion-cli db query <memories_db> --filter '{"and": [{"property": "Context", "select": {"equals": "academic"}}, {"property": "Priority", "number": {"greater_than": 2}}]}'
```