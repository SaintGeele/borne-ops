# Incident Analysis — OOM Crash, April 3, 2026

**Prepared by:** Knox (Security & Infrastructure)  
**Date:** 2026-04-03  
**Classification:** Infrastructure / Resource Exhaustion  
**Status:** Resolved — fixes already applied

---

## Timeline

| Time (EDT) | Event |
|---|---|
| ~05:38 | Gateway starts initializing 20+ agents via `qmd memory startup initialization` |
| 05:39:46 | `qmd binary unavailable` — falls back to builtin, ENOENT error |
| 05:39:46 | Agent initialization continues with errors |
| 05:41:30 | OOM Killer sends SIGKILL to openclaw-gateway (1.1GB peak) |
| 05:41:30 | `systemd: openclaw-gateway.service: Failed with result 'signal'` |
| 05:41:50 | Gateway restarts, re-initializes all agents again |
| 05:42:56 | Second `qmd binary unavailable` error on heartbeat agent |

---

## Root Cause

**Primary:** Version mismatch between the installed OpenClaw gateway and the expected module files caused the gateway to consume ~1.4GB (vs normal ~650MB) during agent initialization. At 05:38, the gateway's `qmd memory startup initialization` began loading 20+ agents simultaneously — this triggered the OOM threshold, and the Linux OOM Killer sent SIGKILL (status=9) to the gateway process at 05:41:30.

**Contributing factors:**

1. **Version mismatch / broken qmd binary.** The gateway repeatedly fails to find the `qmd` binary (`/home/saint/.bun/bin/qmd`) and falls back to a builtin spawn path that also errors (`Cannot find module openclaw/dist/manager-runtime-CxBipzwq.js`). This indicates a partial upgrade or broken installation that left the gateway in a bloated, error-prone state.

2. **30 cron jobs with scheduling conflicts.** Multiple Node.js scripts fire at overlapping times:
   - `care-respond.js` at minutes 2 and 32
   - `check-replies.js` at minutes 7 and 37
   - `sync-content-notion.js` at minutes 12 and 42
   - `watchdog.sh` every 3 minutes (3, 18, 33, 48)
   - `approval-poll.js` every 20 minutes
   - All daily agent scripts clustered at 6:00–9:00 AM
   - These cause concurrent Node.js process spawns creating memory spikes

3. **Sunday 4am forced kill in watchdog.sh.** The line `0 4 * * 0 kill -9 $(pgrep -f openclaw-gateway)` uses SIGKILL, which does not allow graceful shutdown. This is dangerous — if it fires during high memory load it can corrupt in-flight agent sessions and leave connections dangling.

4. **Docker.** Confirmed: no Docker containers are running. Not a factor this incident.

---

## Security Assessment

**Classification: NOT a security incident.**

This was pure resource exhaustion, not an attack:
- No unauthorized access attempts
- All cron jobs are legitimate Borne Systems scripts
- OOM triggered by the gateway's own broken version during agent initialization
- No data exfiltration, no anomalous connections

**One security-adjacent concern:**
The `kill -9` bypasses graceful shutdown hooks. A forced kill during an active session could interrupt Supabase writes, lead capture processing, or credential handling mid-flight. Operational risk, not external threat.

---

## Fixes Already Applied

- ✅ OpenClaw updated — gateway at 647MB (down from 1.4GB)
- ✅ Cron jobs staggered
- ✅ Weekly gateway restart added (Sunday 4am — see concern below)
- ✅ `mc-watchdog` cron removed
- ✅ `approval-poll` reduced from every 5 min to every 20 min

---

## Hardening Recommendations

### Priority 1 — Fix the forced kill in watchdog.sh (CRITICAL)

**Current (dangerous):**
```bash
0 4 * * 0 kill -9 $(pgrep -f openclaw-gateway)
```

**Replace with:**
```bash
0 4 * * 0 sudo systemctl restart openclaw-gateway
```

Or graceful shutdown then start:
```bash
0 4 * * 0 sudo systemctl stop openclaw-gateway && sleep 5 && sudo systemctl start openclaw-gateway
```

**Why:** `kill -9` (SIGKILL) cannot be caught, blocked, or gracefully handled. It leaves no chance to flush buffers, close DB connections, or finish in-flight API calls. `systemctl restart` sends SIGTERM first.

---

### Priority 2 — Fix or reinstall qmd binary

The repeated `qmd binary unavailable` and `Cannot find module openclaw/dist/manager-runtime-CxBipzwq.js` errors indicate a broken qmd installation. Either:
1. Reinstall: `bun install -g qmd` (or the appropriate install command for your setup)
2. Investigate why the gateway looks for a hashed module file that doesn't exist — a partial/ corrupted upgrade

Run to diagnose:
```bash
ls -la /home/saint/.bun/bin/qmd
openclaw --version
```

---

### Priority 3 — Add memory-based auto-restart to watchdog.sh

Replace the `kill -9` line with a memory-aware restart:
```bash
AVAILABLE=$(free -m | awk 'NR==2{print $7}')
if [ "$AVAILABLE" -lt 300 ]; then
    send_alert "🚨 Critical memory: ${AVAILABLE}MB — restarting gateway"
    sudo systemctl restart openclaw-gateway
fi
```

---

### Priority 4 — Cap gateway memory via systemd

Add a memory ceiling to the OpenClaw service so systemd handles the kill (controlled) rather than the kernel OOM killer (disruptive):

```bash
sudo systemctl edit openclaw-gateway
```

Add:
```ini
[Service]
MemoryMax=1.5G
MemoryHigh=1.2G
```

---

### Priority 5 — Swap pressure monitoring

2GB swap is active with 1.3GB used. Add cron alert for swap thrashing:
```bash
# Alert if swap > 80% used
*/5 * * * * free -m | awk 'NR==3{if($3>1600) system("curl -s -X POST https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage -d '\"'\"'{\"chat_id\":\"'\"'\"'$TELEGRAM_CHAT_ID'\"'\"',\"text\":\"🚨 Swap critical\"}'\"'\"'") }'
```

---

### Priority 6 — Clean up Docker if not needed

No Docker containers are running. If Docker is not actively used:
```bash
sudo systemctl stop docker
sudo systemctl disable docker
# or: sudo apt remove docker.io docker-ce
```

---

## Summary

| | |
|---|---|
| **Root cause** | Broken OpenClaw version + qmd errors → gateway memory bloat (1.1GB peak) → OOM Killer at 05:41:30 |
| **Trigger** | `qmd memory startup initialization` loading 20+ agents simultaneously |
| **Was it an attack?** | No — resource exhaustion from broken gateway + concurrent cron jobs |
| **Staggering sufficient?** | Yes — applied stagger fixes are correct |
| **Most dangerous item** | `0 4 * * 0 kill -9 $(pgrep -f openclaw-gateway)` — replace immediately |
| **VPS RAM** | 7.8GB total, 3.2GB used / 4.6GB available — not undersized |

---

## Action Items

| Priority | Owner | Action |
|---|---|---|
| P1 | Geele | Replace `kill -9` with `systemctl restart` in watchdog.sh |
| P1 | Geele | Fix or reinstall qmd binary (resolve ENOENT errors) |
| P2 | Knox | Monitor gateway memory over next 24h — flag if >1GB |
| P2 | Geele | Consider VPS RAM upgrade if memory creep resumes |
| P3 | Geele/Nexus | Add MemoryMax to openclaw-gateway systemd unit |
| P3 | Geele | Disable Docker if no containers needed |
