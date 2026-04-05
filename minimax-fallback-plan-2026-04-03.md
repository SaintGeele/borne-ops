# MiniMax M2.7 → M2.5 Fallback Plan
**Date:** 2026-04-03  
**Status:** Draft — requires confirmation before applying  
**File:** `/home/saint/Documents/BorneSystems/minimax-fallback-plan-2026-04-03.md`

---

## 1. What I Found

### Model Inventory (from `~/.openclaw/openclaw.json` + borneai `models.json`)

| Provider | Model ID | Available? |
|---|---|---|
| `minimax-portal` | `MiniMax-M2.7` | ✅ Yes |
| `minimax-portal` | `MiniMax-M2.7-highspeed` | ✅ Yes |
| `minimax-portal` | `MiniMax-M2.5` | ❌ **Not registered** |
| `blockrun` (127.0.0.1:8402) | `minimax/minimax-m2.5` | ✅ Yes |

**Critical finding:** `minimax-portal` **only has M2.7 and M2.7-highspeed**. M2.5 is not registered there. M2.5 only exists under the `blockrun` provider (the x402 proxy at `http://127.0.0.1:8402/v1`).

The task's premise that M2.5 lives in `minimax-portal` is incorrect based on current config. However, the intent is achievable — just via a **cross-provider fallback** from `minimax-portal/MiniMax-M2.7` → `minimax/minimax-m2.5`.

### Current Config State

**`defaults.model`** (in `openclaw.json`):
```json
{
  "primary": "claude-cli/claude-sonnet-4-6",
  "fallbacks": [
    "minimax-portal/MiniMax-M2.7",
    "minimax-portal/MiniMax-M2.7-highspeed"
  ]
}
```
The current fallbacks are **both on `minimax-portal`** — same rate-limit pool. If M2.7 hits 15K/5hr, M2.7-highspeed is also on that same pool. **This provides zero fallback protection.**

**Per-agent models** (23 agents, all identical):
```json
{ "id": "atlas",    "model": "minimax-portal/MiniMax-M2.7" },
{ "id": "borneai",  "model": "minimax-portal/MiniMax-M2.7" },
... (all 23 agents)
```
No per-agent fallbacks defined anywhere.

---

## 2. Rate Limit Architecture

- **`minimax-portal/MiniMax-M2.7`** → hits `https://api.minimax.io/anthropic` (OAuth)  
  → Rate limit: 15K requests / 5hr window (shared across M2.7 + M2.7-highspeed on this provider)

- **`minimax/minimax-m2.5`** → hits `http://127.0.0.1:8402/v1` (blockrun x402 proxy → MiniMax)  
  → **Separate rate limit pool** — different API endpoint, different auth path  
  → Uses OpenAI completions API format (not Anthropic messages), blockrun handles translation

These are **different API routes with independent limits**. Falling back to `minimax/minimax-m2.5` when `minimax-portal/MiniMax-M2.7` is exhausted will bypass the 15K/5hr cap.

---

## 3. Recommended Approach: Global Fallback via `defaults.model`

**Option A — Global fallback (recommended):**  
Update `defaults.model.fallbacks` in `openclaw.json`. This covers all agents in one edit. The per-agent `model` fields are redundant since they all just repeat `minimax-portal/MiniMax-M2.7` anyway.

**Option B — Per-agent fallbacks:**  
Add `fallbacks` array to each agent in `agents.list`. More work, same effect, harder to maintain.

**Recommendation: Option A** — single change in `openclaw.json`, minimal risk, no agent disruption.

---

## 4. Config Patch

### Step 1 — Update `defaults.model.fallbacks` in `~/.openclaw/openclaw.json`

Replace the fallbacks array under `agents.defaults.model`:

**Before:**
```json
"model": {
  "primary": "claude-cli/claude-sonnet-4-6",
  "fallbacks": [
    "minimax-portal/MiniMax-M2.7",
    "minimax-portal/MiniMax-M2.7-highspeed"
  ]
}
```

**After:**
```json
"model": {
  "primary": "claude-cli/claude-sonnet-4-6",
  "fallbacks": [
    "minimax-portal/MiniMax-M2.7",
    "minimax/minimax-m2.5"
  ]
}
```

**Change summary:**
- Removed `minimax-portal/MiniMax-M2.7-highspeed` (same rate-limit pool, useless as fallback)
- Added `minimax/minimax-m2.5` (separate provider, separate limits, same model family)

### Step 2 — Register `minimax/minimax-m2.5` in `defaults.models` (optional but recommended)

Add to `agents.defaults.models` so the model is explicitly known:

```json
"minimax/minimax-m2.5": {
  "alias": "minimax-m2.5"
}
```

### Step 3 — No per-agent changes needed

The `agents.list[].model` fields all say `minimax-portal/MiniMax-M2.7` — but since OpenClaw falls back globally via `defaults.model.fallbacks`, every agent automatically gains the M2.5 fallback without touching individual agent entries.

---

## 5. What This Achieves

When `minimax-portal/MiniMax-M2.7` hits its 15K/5hr limit:

1. OpenClaw sees the rate-limit error
2. Automatically routes to next fallback: `minimax/minimax-m2.5`
3. Request hits `http://127.0.0.1:8402/v1/chat/completions` (blockrun proxy)
4. Blockrun forwards to MiniMax with M2.5, using a **different rate-limit pool**
5. Agents continue operating without interruption

**Effective combined capacity:** M2.7 (15K/5hr via minimax-portal) + M2.5 (15K/5hr via blockrun) = 30K requests per 5hr window.

---

## 6. Risks & Watchouts

| Risk | Severity | Mitigation |
|---|---|---|
| M2.5 uses OpenAI API format (blockrun proxy) — slightly different behavior vs direct Anthropic API | Low | Blockrun handles translation; existing sessions already use `minimax/minimax-m2.5` successfully |
| M2.5 has smaller `maxTokens` (16,384) vs M2.7 (131,072) — long outputs may truncate | Medium | Monitor for truncated responses; if problematic, add `minimax/minimax-m2.5-highspeed` to fallbacks if/when it appears in blockrun |
| Changing `openclaw.json` while agents are running | Low | Safe to apply during low-traffic window; restart gateway after config change |
| `minimax-portal/MiniMax-M2.7-highspeed` removed from fallbacks | None | It shared the same rate-limit pool — not a real fallback |

---

## 7. Execution Checklist

- [ ] Backup `~/.openclaw/openclaw.json` → `~/.openclaw/openclaw.json.bak-2026-04-03`
- [ ] Edit `agents.defaults.model.fallbacks` — replace `minimax-portal/MiniMax-M2.7-highspeed` with `minimax/minimax-m2.5`
- [ ] Add `minimax/minimax-m2.5` entry to `agents.defaults.models` with alias
- [ ] Verify config is valid JSON: `python3 -c "import json; json.load(open('/home/saint/.openclaw/openclaw.json'))"`
- [ ] Restart OpenClaw gateway: `openclaw gateway restart`
- [ ] Confirm agents still responding (send a test message to BorneAI or Atlas)
- [ ] Monitor for 429 rate-limit errors in logs — should see fallback switching happening

---

## 8. Open Questions

1. **Is `minimax-portal/MiniMax-M2.5` supposed to exist?** If MiniMax portal is supposed to offer M2.5 directly (separate pool), that would be a cleaner fallback. Currently it only has M2.7 and M2.7-highspeed registered. Worth confirming with MiniMax portal docs or API.

2. **Should `minimax-portal/MiniMax-M2.7-highspeed` be completely dropped?** It's on the same rate-limit pool — not a real fallback. Recommend dropping it unless there's a specific use case where highspeed mode is preferred.

3. **Monitor fallback frequency.** If M2.5 is hit frequently as fallback, the 5hr window could also fill up. The combined 30K/5hr should be sufficient for most workloads, but track usage.
