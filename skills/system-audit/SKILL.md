# System Audit Skill

## Purpose
Analyze OpenClaw setup for inefficiencies and optimization opportunities.

## Checks

### Token Usage
- Current session token count vs budget
- Identify unnecessary context accumulation
- Suggest compaction triggers

### Agent Utilization
- Are agents over/under-utilized?
- Kill stale subagents
- Balance workload

### Model Routing
- Are we using the cheapest capable model?
- Route appropriately: flash < mini < sonnet < opus

### Memory Hygiene
- Check memory search results quality
- Identify stale记忆 entries
- Verify important context isn't lost

## Run Command
```
Review the current OpenClaw session for inefficiencies. Check:
1. Token usage vs daily budget ($5)
2. Running subagents - kill any stale ones
3. Model choice for recent tasks
4. Memory recall quality
```

## Output Format
- Issues found
- Recommended fixes
- Estimated savings

