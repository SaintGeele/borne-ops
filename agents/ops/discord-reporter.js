/**
 * Discord Reporter — Borne Systems Agent Reporting Layer
 * All agent scripts should call report() after execution.
 * Reports go to the agent's assigned Discord channel.
 * Errors go to errors-and-alerts (1482611166349103166).
 */

import { config } from "dotenv";
config({ path: "/home/saint/.openclaw/.env" });

// Verified channel IDs — all accessible as of 2026-04-08
const CHANNELS = {
  // Leadership
  "borneai":       "1480000668021428415", // chief-of-staff

  // Engineering
  "nexus":         "1480000719724482744", // development

  // Operations
  "atlas":         "1482611132077314088", // atlas-coordination
  "relay":         "1480000720479715534", // task-orchestration

  // Security
  "knox":          "1480000802302202061", // vulnerability-scanning
  "ghost-protocol": "1480000802302202061", // vulnerability-scanning

  // Research
  "ivy":           "1480000762988728393", // lead-research
  "insight":       "1480000762988728393", // lead-research
  "news-curator":  "1480000762988728393", // lead-research

  // Sales & Outreach
  "mrx":           "1480000844672794876", // cold-outreach
  "chase":         "1480000844672794876", // cold-outreach
  "closer":        "1480000844672794876", // cold-outreach
  "leadgen":       "1480000844672794876", // cold-outreach
  "pipeline":      "1480000667392147568", // ceo-update
  "sales-engineer": "1480000844672794876", // cold-outreach

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

  // Finance
  "ledger":        "1480000667392147568", // ceo-update

  // Pulse & Reports
  "pulse":         "1480000667392147568", // ceo-update

  // R&D
  "skeptic":       "1486178157290848349", // skeptic

  // Errors — always errors-and-alerts
  "errors":        "1482611166349103166", // errors-and-alerts
};

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const GUILD_ID = "1479519793378885894";

const STATUS_COLOR = { success: 0x22C55E, warning: 0xEAB308, error: 0xEF4444, info: 0x3B82F6 };
const STATUS_EMOJI = { success: "✅", warning: "⚠️", error: "🚨", info: "ℹ️" };

/** @param {string} agentName @param {{ title: string, summary: string, details?: string, status?: string, nextAction?: string }} report */
export async function report(agentName, { title, summary, details, status = "info", nextAction }) {
  const channelId = CHANNELS[agentName.toLowerCase()] || CHANNELS["borneai"];
  const color = STATUS_COLOR[status] || 0x3B82F6;
  const emoji = STATUS_EMOJI[status] || "ℹ️";
  const fields = [
    { name: "Summary", value: summary || "—", inline: false },
    ...(details ? [{ name: "Details", value: details, inline: false }] : []),
    ...(nextAction ? [{ name: "Next Action", value: nextAction, inline: false }] : []),
  ];
  const payload = {
    channel_id: channelId,
    guild_id: GUILD_ID,
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
  return sendToDiscord(payload);
}

/** @param {string} agentName @param {string} errorMessage @param {string} [context] */
export async function reportError(agentName, errorMessage, context) {
  const payload = {
    channel_id: CHANNELS["errors"],
    guild_id: GUILD_ID,
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
  return sendToDiscord(payload);
}

/** @param {string} agentName @param {{ tasksRun: number, successes: number, failures: number, highlights?: string, nextUp?: string }} summaryData */
export async function reportDailySummary(agentName, summaryData) {
  const payload = {
    channel_id: CHANNELS["borneai"],
    guild_id: GUILD_ID,
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
  return sendToDiscord(payload);
}

async function sendToDiscord(payload) {
  if (!BOT_TOKEN) {
    console.warn("[Discord Reporter] BOT_TOKEN not set — skipping Discord report");
    return { ok: false, reason: "no token" };
  }
  try {
    const res = await fetch(`https://discord.com/api/v10/channels/${payload.channel_id}/messages`, {
      method: "POST",
      headers: { "Authorization": `Bot ${BOT_TOKEN}`, "Content-Type": "application/json" },
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
