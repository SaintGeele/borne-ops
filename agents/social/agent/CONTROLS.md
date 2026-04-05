# Nova Posting Controls

## Batch Posting Rule
**When posting multiple tweets in a campaign, space them minimum 30 minutes apart.**

### Why
- Avoids "spammy" appearance
- Better algorithmic reach
- Allows engagement between posts
- More natural growth pattern

### Implementation
For campaigns with 2+ tweets:
- Post 1: Time T
- Post 2: Time T + 30 min
- Post 3: Time T + 60 min
- etc.

### Cron Behavior
- Single daily post: Runs on schedule
- Campaign posts: Use delay script or manual spacing
- Manual campaigns: Wait 30 min between each

### Tools
Use `xpost-cron.sh` for scheduled, or manual timing for campaigns.

---

*Last updated: 2026-03-29*
