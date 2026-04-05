# Discord Multi-Agent System — Borne Systems

_Created: 2026-03-10_

## Architecture Overview

OpenClaw natively supports multi-agent Discord routing. Each agent gets its own Discord bot account, bound to specific channels via `bindings` in `openclaw.json`. Messages arriving in a channel are routed to the agent whose bot is bound to that channel.

### Why Per-Bot-Per-Agent?

- **Clean separation**: Each agent has its own bot identity, avatar, and personality
- **Channel routing**: Messages in `#development` → Nexus, `#vulnerability-scanning` → Knox, etc.
- **No cross-talk**: Separate sessions, workspaces, and auth per agent
- **Visible collaboration**: Users see which agent is responding by the bot name/avatar

### Known Limitation

OpenClaw issue #11199: In multi-agent setups, bot-to-bot Discord mentions are filtered. Workaround: agents delegate internally via `sessions_send` (invisible delegation, visible output). This is the recommended approach anyway for production — agents collaborate behind the scenes and post results.

---

## Agent → Discord Bot Mapping

| Agent | Discord Bot Name | Role | Primary Channels |
|-------|-----------------|------|-----------------|
| **BorneAI** | BorneAI | Chief of Staff, CEO interface | `#chief-of-staff`, `#ceo-update`, `#general`, `#welcome`, `#announcements` |
| **Atlas** | Atlas | Project Coordinator | `#task-orchestration`, `#mission-control` |
| **Nexus** | Nexus | Engineering Lead | `#development`, `#code-reviews`, `#projects`, `#integrations` |
| **Ivy** | Ivy | Research Lead | `#lead-research`, `#documentation`, `#industry-news`, `#infrastructure-checks` |
| **Knox** | Knox | Security Lead | `#vulnerability-scanning`, `#client-management`, `#vuln-reports`, `#client-updates` |
| **MrX** | Mr. X | Content & Outreach | `#cold-outreach`, `#metrics-reporting`, `#content-automation` |
| **Professor** | Professor | Education Lead | `#academic-training`, `#nyit-courses`, `#red-team-training`, `#red-team-research` |
| **Chronicle** | Chronicle | Documentation Lead | `#documentation` (shared with Ivy) |

---

## Discord Server Channel → Agent Routing Map

### 🏠 General (BorneAI)
| Channel | ID | Agent |
|---------|-----|-------|
| `#welcome` | 1479906695252545596 | BorneAI |
| `#announcements` | 1479906695898730597 | BorneAI |
| `#rules` | 1479906696263368705 | BorneAI |

### 👔 Leadership (BorneAI)
| Channel | ID | Agent |
|---------|-----|-------|
| `#ceo-update` | 1480000667392147568 | BorneAI |
| `#chief-of-staff` | 1480000668021428415 | BorneAI |

### 🏗️ Engineering (Nexus + Atlas)
| Channel | ID | Agent |
|---------|-----|-------|
| `#development` | 1480000719724482744 | Nexus |
| `#task-orchestration` | 1480000720479715534 | Atlas |
| `#mission-control` | 1480000721469444158 | Atlas |
| `#code-reviews` | 1480000722157174835 | Nexus |

### 🔬 Research (Ivy)
| Channel | ID | Agent |
|---------|-----|-------|
| `#lead-research` | 1480000762988728393 | Ivy |
| `#documentation` | 1480000766428188763 | Ivy |
| `#industry-news` | 1480000767476760617 | Ivy |
| `#infrastructure-checks` | 1480000768185733310 | Ivy |

### 🛡️ Security & Ops (Knox)
| Channel | ID | Agent |
|---------|-----|-------|
| `#vulnerability-scanning` | 1480000802302202061 | Knox |
| `#client-management` | 1480000803321155759 | Knox |

### 📢 Content & Social (MrX)
| Channel | ID | Agent |
|---------|-----|-------|
| `#cold-outreach` | 1480000844672794876 | MrX |
| `#metrics-reporting` | 1480000845411254354 | MrX |
| `#content-automation` | 1480000846065307732 | MrX |

### 🎓 Education (Professor)
| Channel | ID | Agent |
|---------|-----|-------|
| `#academic-training` | 1480000913954439228 | Professor |
| `#nyit-courses` | 1480000914596298883 | Professor |
| `#red-team-training` | 1480000915296620675 | Professor |
| `#red-team-research` | 1480000916458438668 | Professor |

### 🛡️ Borne Security (Knox)
| Channel | ID | Agent |
|---------|-----|-------|
| `#general` (security) | 1479906697861664900 | Knox |
| `#vuln-reports` | 1479906698398273588 | Knox |
| `#client-updates` | 1479906699190992999 | Knox |

### 🤖 Borne AI (Nexus)
| Channel | ID | Agent |
|---------|-----|-------|
| `#general` (AI) | 1479906700143362189 | Nexus |
| `#projects` | 1479906700797677648 | Nexus |
| `#integrations` | 1479906701212909581 | Nexus |

### 🧪 Borne Labs (Nexus fallback)
| Channel | ID | Agent |
|---------|-----|-------|
| `#general` (labs) | 1479906752588677324 | Nexus |
| `#beta-tests` | 1479906753490452703 | Nexus |
| `#ideas` | 1479906754522517646 | Ivy |

### 🎫 Client Portal (BorneAI + Knox)
| Channel | ID | Agent |
|---------|-----|-------|
| `#tickets` | 1479906755411578971 | BorneAI |
| `#faq` | 1479906756082667542 | BorneAI |
| `#carson-aesthetics` | 1479943172124839936 | Knox |

### Default channels
| Channel | ID | Agent |
|---------|-----|-------|
| `#general` (root) | 1479519794784108687 | BorneAI |

---

## Setup Requirements

### Step 1: Create 7 Discord Bot Applications
Each agent (except BorneAI, which already has a bot) needs a new bot:

1. Go to https://discord.com/developers/applications
2. Create applications: `Atlas`, `Nexus`, `Ivy`, `Knox`, `Mr. X`, `Professor`, `Chronicle`
3. For each:
   - Enable **Message Content Intent** + **Server Members Intent**
   - Copy the bot token
   - Generate OAuth2 URL with `bot` + `applications.commands` scopes
   - Bot permissions: View Channels, Send Messages, Read Message History, Embed Links, Attach Files, Add Reactions
   - Invite each bot to the Borne Systems server (guild `1479519793378885894`)
4. Set each bot's avatar to match the agent avatar from `/home/saint/.openclaw/agents/<id>/agent/avatar.png`

### Step 2: Store Tokens
Set tokens via CLI (do NOT put in chat):
```bash
openclaw config set channels.discord.accounts.default.token '"BORNEAI_TOKEN"' --json
openclaw config set channels.discord.accounts.atlas.token '"ATLAS_TOKEN"' --json
openclaw config set channels.discord.accounts.nexus.token '"NEXUS_TOKEN"' --json
openclaw config set channels.discord.accounts.ivy.token '"IVY_TOKEN"' --json
openclaw config set channels.discord.accounts.knox.token '"KNOX_TOKEN"' --json
openclaw config set channels.discord.accounts.mrx.token '"MRX_TOKEN"' --json
openclaw config set channels.discord.accounts.professor.token '"PROFESSOR_TOKEN"' --json
openclaw config set channels.discord.accounts.chronicle.token '"CHRONICLE_TOKEN"' --json
```

### Step 3: Apply Config
Use the generated config patch (see `config-patch.json` in this directory).

### Step 4: Restart Gateway
```bash
openclaw gateway restart
openclaw agents list --bindings
openclaw channels status --probe
```

---

## Cost Analysis

- **Discord**: Free (bot accounts are free)
- **API costs**: Each agent uses the same OpenRouter models (already configured)
- **VPS impact**: Minimal — each additional bot connection uses ~5-10MB RAM
- **Estimated total RAM increase**: ~50MB for 7 additional bot connections

---

## Next Steps After Setup

1. **Create bot applications** on Discord Developer Portal (Geele needs to do this)
2. **Set bot avatars** using existing agent avatar images
3. **Store tokens** via CLI
4. **Apply config patch**
5. **Test each channel** with a mention to verify routing
6. **Copy auth-profiles.json** from BorneAI to agents that don't have one yet
7. **Optional**: Set up agent-to-agent workflows (e.g., Knox posts security scan results to `#vulnerability-scanning`, tags Nexus in `#development` for remediation)
