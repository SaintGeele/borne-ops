import { config } from 'dotenv';
config({ path: '/home/saint/.openclaw/.env' });
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const ALL_AGENTS = [
  'chase', 'care', 'mercury', 'mrx', 'forge',
  'beacon', 'insight', 'pulse', 'inspector', 'ledger', 'borneai'
];

const sendTelegram = async (message) => {
  const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'HTML'
    })
  });
  const data = await res.json();
  if (!data.ok) console.error('Telegram error:', data);
};

const logToSupabase = async (title, description, metadata = {}) => {
  await supabase.from('activity_log').insert({
    agent_id: 'chronicle',
    action_type: 'daily_digest',
    title,
    description,
    metadata
  });
};

const runDigest = async () => {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  const { data: logs, error } = await supabase
    .from('activity_log')
    .select()
    .gte('created_at', start.toISOString())
    .lte('created_at', end.toISOString())
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Chronicle digest failed:', error.message);
    return;
  }

  const byAgent = {};
  for (const log of logs) {
    if (!byAgent[log.agent_id]) byAgent[log.agent_id] = [];
    byAgent[log.agent_id].push(log);
  }

  const activeAgents = Object.keys(byAgent).filter(a => a !== 'chronicle');
  const silentAgents = ALL_AGENTS.filter(a => !byAgent[a]);
  const anomalies = logs.filter(l => l.metadata?.flagged);

  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  let digest = `📓 <b>Chronicle Daily Digest — ${dateStr}</b>\n\n`;
  digest += `<b>ACTIVE TODAY:</b> ${activeAgents.length > 0 ? activeAgents.join(', ') : 'None'}\n`;
  digest += `<b>SILENT TODAY:</b> ${silentAgents.length > 0 ? silentAgents.join(', ') : 'None ✅'}\n\n`;

  digest += `<b>BY AGENT:</b>\n`;
  if (activeAgents.length > 0) {
    for (const agent of activeAgents) {
      const agentLogs = byAgent[agent];
      digest += `• <b>${agent}</b> — ${agentLogs.length} action${agentLogs.length !== 1 ? 's' : ''}\n`;
      agentLogs.slice(-2).forEach(l => {
        digest += `  ↳ ${l.title}\n`;
      });
    }
  } else {
    digest += `None\n`;
  }

  if (anomalies.length > 0) {
    digest += `\n⚠️ <b>ANOMALIES:</b>\n`;
    anomalies.forEach(a => {
      digest += `• ${a.title}\n`;
    });
  } else {
    digest += `\n✅ <b>No anomalies detected</b>\n`;
  }

  if (silentAgents.includes('chase')) {
    digest += `\n🚨 <b>Chase was silent today — expected outreach emails</b>`;
  }

  digest += `\n\n<i>Total actions logged: ${logs.length}</i>`;

  console.log(digest);
  await sendTelegram(digest);
  await logToSupabase(
    `Daily digest — ${dateStr}`,
    digest,
    { active_agents: activeAgents, silent_agents: silentAgents, total_actions: logs.length, anomalies: anomalies.length }
  );

  console.log('Chronicle digest complete.');
};

runDigest();
