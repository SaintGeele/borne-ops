# OpenRouter Model Costs

Updated: April 2026. Verify current pricing at https://openrouter.ai/models

## Free / Very Cheap

| Model | Input ($/1M) | Output ($/1M) | Notes |
|-------|-------------|--------------|-------|
| minimax/minimax-m2.7 | $0 | $0 | Default — use for most work |
| minimax/minimax-m2.7-highspeed | $0 | $0 | Fast variant |
| google/gemini-2.5-flash | $0.075 | $0.30 | Good for summaries, formatting |
| openai/gpt-5-nano | $0.10 | $0.40 | Fallback at 75% budget |

## Mid-Tier

| Model | Input ($/1M) | Output ($/1M) | Notes |
|-------|-------------|--------------|-------|
| openai/gpt-4o-mini | $0.15 | $0.60 | Occasional use |
| deepseek/deepseek-v3.2 | $0.14 | $0.28 | Good value |
| google/gemini-2.0-flash | $0.10 | $0.40 | Stable |

## Premium (Avoid for Heartbeats)

| Model | Input ($/1M) | Output ($/1M) | Notes |
|-------|-------------|--------------|-------|
| openai/gpt-4o | $2.50 | $10.00 | Only for complex reasoning |
| anthropic/claude-sonnet-4-6 | $3.00 | $15.00 | Only when MiniMax fails |
| anthropic/claude-opus-4-7 | $15.00 | $75.00 | Never for heartbeats |

## CostPilot Default Chain

```
Under 75% daily budget → minimax/minimax-m2.7 (free)
75%+ daily budget → openai/gpt-5-nano ($0.10/$0.40)
90%+ daily budget → google/gemini-2.5-flash ($0.075/$0.30)
100%+ daily budget → BLOCK non-essential
```
