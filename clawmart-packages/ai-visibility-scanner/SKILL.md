# SKILL.md - Borne AI Visibility Scanner

## Description
Enhanced AI agent discovery scanner - find out if AI agents can actually discover and recommend your business. Checks for AI search optimization, x402 readiness, and agent marketplace visibility.

## What It Scans

### 1. Basic SEO (8 checks)
- SSL certificate
- robots.txt presence
- Sitemap.xml
- Meta tags
- Open Graph tags

### 2. AI Search Optimization
- JSON-LD structured data
- Schema.org organization markup
- Product/Service schemas
- FAQ schema for voice search
- Location schema for local

### 3. x402 Readiness
- Payment endpoint availability
- API documentation
- USDC acceptance
- Agent-friendly pricing pages

### 4. Agent Marketplace Presence
- ClawMart/ClawHub listing
- x402scan registration
- MCP server availability
- ERC-8004 discovery

### 5. Content Discoverability
- Clear service descriptions
- Pricing transparency (AI-readable)
- Contact method availability
- Feature comparison tables

### 6. Competitor Intelligence
- How competitors appear to AI
- Gap identification
- Opportunity areas

## Commands
- "Scan [domain] for AI visibility"
- "Check x402 readiness"
- "Audit for AI agent discovery"
- "Compare to [competitor]"
- "Generate AI visibility report"

## Output
Plain-English report with:
- Overall AI visibility score (A-F)
- Issue list with severity
- Fix recommendations
- Competitor comparison

## Integration
- Notion logging for tracking over time
- Telegram report delivery
- Historical trend tracking

## Requirements
- Web fetch capability
- Notion API (optional for logging)
- Telegram bot (optional for alerts)