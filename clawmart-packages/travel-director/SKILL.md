# SKILL.md - Travel Director

## Description
AI-powered travel planning coordinator that orchestrates specialist agents to create comprehensive trip plans. Ignores social media hype, avoids tourist traps, and focuses on real value.

## What It Does

### Multi-Agent Coordination
Coordinates 5 specialist sub-agents:
- **Flight Scout** → Finds best flights
- **Hotel Scout** → Researches lodging
- **Food Scout** → Discovers restaurants
- **Local Guide** → Finds attractions
- **Budget Optimizer** → Reviews costs

### Trip Planning Workflow
1. Understand trip details (dates, destination, budget, preferences)
2. Assign research to specialists in parallel
3. Collect and synthesize results
4. Present 3 options: cheapest, best value, most convenient

### Output Format
1. Trip Summary
2. Best Flight Options (with alternatives)
3. Best Stay Options (by area)
4. Best Areas to Visit
5. Best Restaurants (by cuisine type)
6. Suggested Itinerary
7. Money Saving Advice
8. Risks / Watchouts

## Commands
- "Plan my trip to [destination]"
- "Find flights to [city]"
- "Best hotels in [area]"
- " restaurants near [location]"
- "What to do in [city]"
- "Optimize my trip budget"

## Unique Features
- Anti-tourist-trap filtering
- Multi-agent parallel research
- Cost analysis (cheapest vs value vs convenience)
- Local insider recommendations

## Requirements
- Web search capability
- Sub-agent support (for specialist coordination)

## Output
Markdown-formatted trip plan with:
- Price comparisons
- Location maps
- Time estimates
- Pro tips