/**
 * Discord Reporter — Borne Systems Agent Reporting Layer
 * All agent scripts should call report() after execution.
 * Reports go to the agent's assigned Discord channel.
 * Errors go to errors-and-alerts (1482611166349103166).
 * 
 * NOTE: Some channels are denied to the bot role (see DENIED_CHANNELS below).
 * Reports to denied channels will fall back to errors-and-alerts.
 */

import { config } from "dotenv";
config({ path: "/home/saint/.openclaw/.env" });

// Real Discord channel IDs — ONLY these 5 channels are verified accessible to the BorneAI bot
// All other channels are denied (Missing Permissions error 50013)
// To fix: grant BorneAI bot role access to those channels in Discord server settings
const CHANNELS = {
  // All leadership, sales, outreach, content, security, research agents → research-archive
  "borneai":       "1482611329465454745", // research-archive
  "atlas":         "1482611132077314088", // atlas-coordination ✓
  "relay":         "1482611132077314088", // atlas-coordination ✓
  "nexus":         "1482611329465454745", // research-archive
  "knox":          "1482611132077314088", // atlas-coordination ✓
  "ghost-protocol": "1482611132077314088", // atlas-coordination ✓
  "ivy":           "1482611329465454745", // research-archive
  "insight":       "1482611329465454745", // research-archive
  "news-curator":  "1482611329465454745", // research-archive
  "mrx":           "1482611329465454745", // research-archive
  "chase":         "1482611329465454745", // research-archive
  "closer":        "1482611329465454745", // research-archive
  "leadgen":       "1482611329465454745", // research-archive
  "pipeline":      "1482611329465454745", // research-archive
  "sales-engineer": "1482611329465454745", // research-archive
  "mercury":       "1482611132077314088", // atlas-coordination ✓
  "nova":          "1482611132077314088", // atlas-coordination ✓
  "care":          "1482611329465454745", // research-archive
  "forge":         "1482611329465454745", // research-archive
  "beacon":        "1482611329465454745", // research-archive
  "aeogeo":        "1482611329465454745", // research-archive
  "chronicle":     "1482611329465454745", // research-archive
  "pulse":         "1482611329465454745", // research-archive
  "ledger":        "1482611329465454745", // research-archive
  
  // Ops monitoring → agent-status
  "inspector":     "1482611004507685044", // agent-status ✓
  "governance":     "1482611004507685044", // agent-status ✓
  "self-healing":  "1482611004507685044", // agent-status ✓
  
  // R&D
  "skeptic":       "1486178157290848349", // skeptic ✓
  
  // Errors — always errors-and-alerts
  "errors":        "1482611166349103166", // errors-and-alerts ✓
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
      return { ok: false, status: res.status, body: text };
    }
    return { ok: true };
  } catch (err) {
    console.error(`[Discord Reporter] Fetch failed: ${err.message}`);
    return { ok: false, reason: err.message };
  }
}
