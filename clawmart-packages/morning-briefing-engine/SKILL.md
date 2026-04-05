# SKILL.md - Morning Briefing Engine

## Description
Automated daily briefing system that aggregates weather, calendar, todos, deadlines, and news into a concise morning report. Runs on OpenClaw cron.

## Features

### Weather
- Fetch current weather and forecast
- Configurable location (default: New York)
- Supports wttr.in, Open-Meteo APIs

### Calendar Integration
- Check upcoming events for the day
- Meeting reminders
- Deadlines approaching

### Task Review
- Read from Notion or local todos
- Identify due today
- Flag overdue items

### News Brief
- Tech news summary
- Custom topics (configure in MEMORY.md)
- Web search integration

### Memory Check
- Scan memory for upcoming deadlines
- Flag unaddressed items from yesterday
- Recurring task reminders

## Output Format
```
╔══════════════════════════════════════╗
║     MORNING BRIEFING - [Date]        ║
╚══════════════════════════════════════╝

WEATHER
☀️ 72°F Partly Cloudy - New York

CALENDAR
📅 2 meetings today
   • 10:00 AM - Team Standup
   • 3:00 PM - Project Review

TASKS
✓ 3 tasks due today
⚠️ 1 overdue: [Task Name]

DEADLINES
📌 SAP Appeal - Due in 5 days
📌 Job Application - Due in 7 days

NEWS
• [Tech headline 1]
• [Tech headline 2]

Next action: [Priority task for today]
```

## Commands
- "Run morning briefing"
- "Generate daily brief"
- "What's on my calendar today"

## Cron Setup
```cron
0 7 * * * [briefing command]
```

## Requirements
- Web search capability
- Notion API (optional, for tasks)
- Telegram bot (optional, for delivery)

## Customization
Edit MEMORY.md to:
- Change location
- Add custom news topics
- Set priority keywords
- Configure delivery channel