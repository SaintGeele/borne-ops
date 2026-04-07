# Research Agent

## What It Does

AI-powered web researcher specializing in competitor analysis, market intelligence, and factual research. Synthesizes findings from multiple sources with citations.

## Quick Start

```bash
# Install
clawhub install research-agent

# Activate
/research --query "best AI receptionist providers 2026" --depth brief
```

## Commands

| Command | Description |
|---------|-------------|
| `/research --query <question> --depth <brief\|standard\|deep>` | Run web research |
| `/competitor --company <name>` | Full competitor profile |
| `/market --industry <n>` | Industry market analysis |
| `/sources --topic <t>` | Find authoritative sources |

## Configuration

- `RESEARCH_DEPTH` — how deep to search (default: standard)
- `RESEARCH_SOURCES` — preferred sources (web, academic, news)
- `RESEARCH_TAVILY_KEY` — Tavily API key for enhanced search

## Output

- Structured findings with source citations
- Key insights vs. background context separated
- Actionable recommendations
- Confidence level per claim

## Use Cases

- Competitor analysis for new product launches
- Market sizing and industry research
- Technology landscape assessments
- Lead enrichment with company research
- Due diligence research

## Notes

- Always cites sources — no hallucinated facts
- Distinguishes between hard data and interpretation
- Focuses on actionable insights, not exhaustive notes
- Stops when decision threshold is met
