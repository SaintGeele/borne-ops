# HEARTBEAT.md

# Heartbeat Configuration

## Reminders for Geele (America/New_York)

## Heartbeat Interval: Every 15 Minutes

### On Every Heartbeat (15 min), Check:
1. Calendar (if connected) -- events in the next 2 hours. If found, prepare a briefing.
2. Memory -- approaching deadlines this week. Flag if unmentioned.
3. Any files in `/home/saint/.openclaw/workspace/projects/` folder -- surface if action is needed.
4. Current time -- if 30 minutes before a meeting, send prep reminder.

### Only Notify If:
- There's an event in the next 2 hours that's unprepared for
- A deadline is in the next 48 hours and unaddressed
- Something in priority tasks is overdue
- It's 30 min before a meeting with no prep done

If everything is fine, don't message. Just log `Heartbeat: OK` in `heartbeat-log.md`.

**Use Gemini Flash Lite for all heartbeat checks - it's FREE through OpenRouter.**

---

## Cron Jobs

**Pro tip: Use Flash or MiniMax for cron jobs instead of Opus. Much cheaper, still effective for these tasks.**

### CRON JOB #1: Morning Briefing -- Every Day at 7:00 AM
- Check calendar for today's events (if calendar connected)
- Review any emails from the last 18 hours (if email connected)
- Pull top 3 priorities from memory
- Check for any deadlines this week
- Format as a clean, scannable briefing under 150 words
- Send on [Telegram -- user's preferred messaging platform]

### CRON JOB #2: Evening Reflection -- Every Day at 9:00 PM
- Review what was worked on today
- Note any decisions made or tasks completed
- Flag anything that should be saved to memory
- Ask one reflection question about the day

### CRON JOB #3: Weekly Review -- Every Monday at 8:00 AM
- Analyze what was accomplished last week
- Compare against stated goals
- Identify patterns (what worked, what didn't)
- Suggest 3 priorities for this week
- Save analysis to `/home/saint/.openclaw/workspace/reviews/weekly-[date].md`

### CRON JOB #4: Content Research -- Every Day at 2:00 AM
- Scan Reddit, LinkedIn, X for trending topics in [AI, Tech, Sports, and Small Business -- use last30days-skill]
- Draft 3 post ideas based on trends
- Save to `/home/saint/.openclaw/workspace/projects/` folder
- Use silent mode (don't notify -- user checks in the morning)

### Evening reflection (~9:30 PM ET / 02:30+1 UTC)
- Send: "Winding down, Geele. What did you accomplish today? Anything to carry into tomorrow? Try to get to bed by 11."

### Sleep guard (after 11 PM ET / 04:00 UTC)
- If Geele is still chatting: "Hey — it's past 11 PM. You need rest. Get some sleep, I'll be here tomorrow."
