# SKILL.md - Borne X/Twitter Agent (Lite)

## Description
Free version of our X/Twitter automation. Your AI can post to Twitter using xpost CLI - no browser automation, no account flagging.

## What's Included
- xpost CLI setup guide
- API keys configuration
- Basic post command
- 1 tweet/day scheduling

## What's NOT Included (upgrade to full)
- Multiple tweets/day
- Engagement/reply automation
- Blocklist management
- Approval routing
- Content scheduling
- Prompt injection defense

## Setup
```bash
# 1. Get X API keys at developer.x.com
# 2. Create config
mkdir -p ~/.config/x-api
# Add your keys to keys.env

# 3. Test
xpost post "Hello from [Your Name]!"
```

## Commands (Lite)
- "Post a tweet"
- "Check API status"

## Upgrade to Full ($9)
Get: 3-6 tweets/day, auto-reply, blocklists, scheduling, engagement, safety rails