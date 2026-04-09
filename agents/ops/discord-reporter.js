/**
 * Discord Reporter — Borne Systems Agent Reporting Layer
 * All agent scripts should call report() after execution.
 * Each agent uses its own Discord bot for visual identity.
 */

// Verified channel IDs — only channels with active agents
const CHANNELS = {
  // Leadership
  "borneai":       "1480000668021428415", // chief-of-staff

  // Engineering
  "nexus":         "1480000719724482744", // development

  // Operations
  "atlas":         "1482611132077314088", // atlas-coordination

  // Security
  "knox":          "1480000802302202061", // vulnerability-scanning
  "ghost-protocol": "1480000802302202061", // vulnerability-scanning

  // Research
  "ivy":           "1480000762988728393", // lead-research
  "news-curator":  "1480000762988728393", // lead-research

  // Sales & Outreach
  "chase":         "1480000844672794876", // cold-outreach
  "mrx":           "1480000844672794876", // cold-outreach
  "closer":        "1480000844672794876", // cold-outreach
  "leadgen":       "1480000844672794876", // cold-outreach
  "sales-engineer": "1480000844672794876", // cold-outreach
  "pipeline":      "1480000667392147568", // ceo-update

  // Content
  "mercury":       "1480000846065307732", // content-automation
  "nova":          "1480000846065307732", // content-automation

  // Client Management
  "care":          "1480000803321155759", // client-management
  "forge":         "1480000803321155759", // client-management

  // SEO & Documentation
  "beacon":        "1480000766428188763", // documentation
  "aeogeo":        "1480000766428188763", // documentation
  "chronicle":     "1480000766428188763", // documentation

  // Ops & Monitoring
  "inspector":     "1482611004507685044", // agent-status
  "governance":    "1482611004507685044", // agent-status
  "self-healing":  "1482611004507685044", // agent-status

  // Finance & Reports
  "ledger":        "1480000667392147568", // ceo-update
  "pulse":         "1480000667392147568", // ceo-update

  // Errors — always errors-and-alerts
  "errors":        "1482611166349103166", // errors-and-alerts
};

const GUILD_ID = "1479519793378885894";

// Per-agent Discord bot tokens — each agent uses its own bot for identity
// Falls back to DISCORD_BOT_TOKEN if agent-specific token not set
const AGENT_TOKENS = {
  boreanaai:   process.env.DISCORD_BORNEAI_TOKEN,
  nexus:       process.env.DISCORD_NEXUS_TOKEN,
  ivy:         process.env.DISCORD_IVY_TOKEN,
  knox:        process.env.DISCORD_KNOX_TOKEN,
  mrx:         process.env.DISCORD_MRX_TOKEN,
  professor:   process.env.DISCORD_PROFESSOR_TOKEN,
  chronicle:   process.env.DISCORD_CHRONICLE_TOKEN,
  atlas:       process.env.DISCORD_ATLAS_TOKEN,
  gauge:       process.env.DISCORD_GAUGE_TOKEN,
  forge:       process.env.DISCORD_FORGE_TOKEN,
  tutor:       process.env.DISCORD_TUTOR_TOKEN,
  mrrobot:     process.env.DISCORD_MRROBOT_TOKEN,
  elliot:      process.env.DISCORD_ELLIOT_TOKEN,
  missioncontrol: process.env.DISCORD_MISSION_CONTROL_TOKEN,
  beacon:      process.env.DISCORD_BEACON_TOKEN,
  leadgen:     process.env.DISCORD_LEAD_GEN_TOKEN,
  chase:       process.env.DISCORD_CHASE_TOKEN,
  nova:        process.env.DISCORD_NOVA_TOKEN,
  care:        process.env.DISCORD_CARE_TOKEN,
  ghostprotocol: process.env.DISCORD_GHOST_PROTOCOL_TOKEN,
  selfhealing: process.env.DISCORD_SELF_HEALING_TOKEN,
  salesengineer: process.env.DISCORD_SALES_ENGINEER_TOKEN,
  pipeline: process.env.DISCORD_PIPELINE_TOKEN,
  governance: process.env.DISCORD_GOVERNANCE_TOKEN,
  aiageogeo: process.env.DISCORD_AI_AEO_GEO_TOKEN,
  newscurator: process.env.DISCORD_NEWS_CURATOR_TOKEN,
  inspector: process.env.DISCORD_INSPECTOR_TOKEN,
  mercury: process.env.DISCORD_MERCURY_TOKEN,
  closer: process.env.DISCORD_CLOSER_TOKEN,
  // add new agents here as DISCORD_[NAME]_TOKEN is added to .env
};

const getBotToken = (agentName) => {
  return AGENT_TOKENS[agentName?.toLowerCase()] || process.env.DISCORD_BOT_TOKEN;
};

const STATUS_COLOR = { success: 0x22C55E, warning: 0xEAB308, error: 0xEF4444, info: 0x3B82F6 };
const STATUS_EMOJI = { success: "✅", warning: "⚠️", error: "🚨", info: "ℹ️" };

/** @param {string} agentName @param {{ title: string, summary: string, details?: string, status?: string, nextAction?: string }} report */
export async function report(agentName, { title, summary, details, status = "info", nextAction }) {
  const channelId = CHANNELS[agentName?.toLowerCase()] || CHANNELS["borneai"];
  const color = STATUS_COLOR[status] || 0x3B82F6;
  const emoji = STATUS_EMOJI[status] || "ℹ️";
  const fields = [
    { name: "Summary", value: summary || "—", inline: false },
    ...(details ? [{ name: "Details", value: details, inline: false }] : []),
    ...(nextAction ? [{ name: "Next Action", value: nextAction, inline: false }] : []),
  ];
  const payload = {
    channel_id: channelId,
    content: `${emoji} **[${agentName}]** ${title}`,
    embeds: [{
      color,
      title,
      description: summary,
      fields,
      footer: { text: `${agentName} • ${new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}` },
      timestamp: new Date().toISOString(),
    }],
  };
  return sendToDiscord(agentName, payload);
}

/** @param {string} agentName @param {string} errorMessage @param {string} [context] */
export async function reportError(agentName, errorMessage, context) {
  const payload = {
    channel_id: CHANNELS["errors"],
    content: `🚨 **[${agentName}] Error** — \`${errorMessage.substring(0, 120)}\``,
    embeds: [{
      color: 0xEF4444,
      title: `${agentName} — Script Error`,
      fields: [
        { name: "Error", value: errorMessage, inline: false },
        ...(context ? [{ name: "Context", value: context, inline: false }] : []),
        { name: "Time", value: new Date().toISOString(), inline: false },
      ],
    }],
  };
  return sendToDiscord(agentName, payload);
}

/** @param {string} agentName @param {{ tasksRun: number, successes: number, failures: number, highlights?: string, nextUp?: string }} summaryData */
export async function reportDailySummary(agentName, summaryData) {
  const payload = {
    channel_id: CHANNELS["borneai"],
    content: `📊 **${agentName} Daily Summary — ${new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}**`,
    embeds: [{
      color: 0x3B82F6,
      fields: [
        { name: "Tasks Run", value: String(summaryData.tasksRun || 0), inline: true },
        { name: "✅ Successes", value: String(summaryData.successes || 0), inline: true },
        { name: "❌ Failures", value: String(summaryData.failures || 0), inline: true },
        ...(summaryData.highlights ? [{ name: "📌 Highlights", value: summaryData.highlights }] : []),
        ...(summaryData.nextUp ? [{ name: "➡️ Next Up", value: summaryData.nextUp }] : []),
      ],
      timestamp: new Date().toISOString(),
    }],
  };
  return sendToDiscord(agentName, payload);
}

/**
 * Send a payload to Discord using the agent's own bot token.
 * @param {string} agentName
 * @param {object} payload
 */
async function sendToDiscord(agentName, payload) {
  const token = getBotToken(agentName);
  if (!token) {
    console.warn(`[Discord Reporter] No bot token for ${agentName} — skipping Discord report`);
    return { ok: false, reason: "no token" };
  }
  try {
    const res = await fetch(`https://discord.com/api/v10/channels/${payload.channel_id}/messages`, {
      method: "POST",
      headers: { "Authorization": `Bot ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error(`[Discord Reporter] ${res.status}: ${text}`);
      return { ok: false, status: res.status };
    }
    return { ok: true };
  } catch (err) {
    console.error(`[Discord Reporter] Fetch failed: ${err.message}`);
    return { ok: false, reason: err.message };
  }
}
