# Create Discord Bot Applications

Go to: https://discord.com/developers/applications

Create 7 new applications (one per agent). BorneAI already exists.

## Bot Checklist

For **each** bot below:

1. Click **New Application** → name it
2. Go to **Bot** tab → set username
3. Enable under **Privileged Gateway Intents**:
   - ✅ Message Content Intent
   - ✅ Server Members Intent
4. Click **Reset Token** → copy and save the token
5. Go to **OAuth2** → **URL Generator**:
   - Scopes: `bot`, `applications.commands`
   - Bot Permissions: View Channels, Send Messages, Read Message History, Embed Links, Attach Files, Add Reactions
6. Copy the generated URL → open in browser → select **Borne Systems** server → Authorize
7. Go to **General Information** → upload avatar from paths below

## Bot List

| # | App Name | Bot Username | Avatar Path |
|---|----------|-------------|-------------|
| 1 | Atlas | Atlas | `/home/saint/.openclaw/agents/atlas/agent/avatar.png` |
| 2 | Nexus | Nexus | `/home/saint/.openclaw/agents/nexus/agent/avatar.png` |
| 3 | Ivy | Ivy | `/home/saint/.openclaw/agents/ivy/agent/avatar.png` |
| 4 | Knox | Knox | `/home/saint/.openclaw/agents/knox/agent/avatar.png` |
| 5 | Mr. X | Mr. X | `/home/saint/.openclaw/agents/mrx/agent/avatar.png` |
| 6 | Professor | Professor | `/home/saint/.openclaw/agents/professor/agent/avatar.png` |
| 7 | Chronicle | Chronicle | `/home/saint/.openclaw/agents/chronicle/agent/avatar.png` |

## After Creating All 7

Run the setup script:
```bash
cd ~/.openclaw/workspace/projects/discord-multi-agent
bash setup.sh
```

Or set tokens manually:
```bash
openclaw config set channels.discord.accounts.atlas.token '"BOT_TOKEN_HERE"' --json
openclaw config set channels.discord.accounts.nexus.token '"BOT_TOKEN_HERE"' --json
openclaw config set channels.discord.accounts.ivy.token '"BOT_TOKEN_HERE"' --json
openclaw config set channels.discord.accounts.knox.token '"BOT_TOKEN_HERE"' --json
openclaw config set channels.discord.accounts.mrx.token '"BOT_TOKEN_HERE"' --json
openclaw config set channels.discord.accounts.professor.token '"BOT_TOKEN_HERE"' --json
openclaw config set channels.discord.accounts.chronicle.token '"BOT_TOKEN_HERE"' --json
```

## Time Estimate

~15–20 minutes total for all 7 bots.
