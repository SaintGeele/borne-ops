---
name: tavily
description: Search the web using Tavily API - optimized for AI agents. Use for research, finding current information, and answering questions.
author: Geele
version: 1.0.0
triggers:
  - "search"
  - "look up"
  - "find information"
  - "research"
metadata: {"openclaw":{"emoji":"🔍"}}
---

# Tavily - Web Search

Search the web using Tavily's AI-optimized search API.

## Usage

### Basic Search

```bash
python3 {baseDir}/scripts/tavily_search.py "your search query"
```

### Search with Answer

```bash
python3 {baseDir}/scripts/tavily_search.py "your query" --answer
```

### Search with Sources

```bash
python3 {baseDir}/scripts/tavily_search.py "your query" --sources 5
```

## Examples

**Research a topic:**
```bash
python3 {baseDir}/scripts/tavily_search.py "NTLM relay attack mitigation 2024"
```

**Find current news:**
```bash
python3 {baseDir}/scripts/tavily_search.py "latest CVE vulnerabilities"
```

**Get AI-generated answer:**
```bash
python3 {baseDir}/scripts/tavily_search.py "how to secure Active Directory" --answer
```

## API Key

- Stored in: `~/.openclaw/credentials/tavily.json`
- Format: `{"tavily": "tvly-..."}`

## Notes

- Tavily is optimized for AI agents (factual, efficient)
- Returns sources + optional AI-generated answer
- Lower cost than traditional search APIs
- Great for research tasks
