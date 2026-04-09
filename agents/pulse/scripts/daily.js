import { config } from 'dotenv';
config({ path: '/home/saint/.openclaw/.env' });
import { createClient } from '@supabase/supabase-js';
import { report, reportError } from '../../ops/discord-reporter.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

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
    agent_id: 'pulse',
    action_type: 'daily_pulse',
    title,
    description,
    metadata
  });
};

const runDailyPulse = async () => {
  const now = new Date();
  const todayStart = new Date(now); todayStart.setHours(0,0,0,0);
  const todayEnd = new Date(now); todayEnd.setHours(23,59,59,999);
  const yesterday = new Date(now); yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStart = new Date(yesterday); yesterdayStart.setHours(0,0,0,0);
  const yesterdayEnd = new Date(yesterday); yesterdayEnd.setHours(23,59,59,999);

  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  // 1. Agent activity from Chronicle
  const { data: agentLogs } = await supabase
    .from('activity_log')
    .select()
    .gte('created_at', yesterdayStart.toISOString())
    .lte('created_at', yesterdayEnd.toISOString());

  const agentCounts = {};
  (agentLogs || []).forEach(l => {
    agentCounts[l.agent_id] = (agentCounts[l.agent_id] || 0) + 1;
  });

  // 2. Email metrics from yesterday
  const { data: emailEvents } = await supabase
    .from('email_events')
    .select()
    .gte('ts', yesterdayStart.toISOString())
    .lte('ts', yesterdayEnd.toISOString());

  const emailStats = {
    sent: 0, opened: 0, clicked: 0, bounced: 0, unsubscribed: 0
  };
  (emailEvents || []).forEach(e => {
    if (e.event_type === 'email.sent') emailStats.sent++;
    if (e.event_type === 'email.opened') emailStats.opened++;
    if (e.event_type === 'email.clicked') emailStats.clicked++;
    if (e.event_type === 'email.bounced') emailStats.bounced++;
    if (e.event_type === 'email.unsubscribed') emailStats.unsubscribed++;
  });

  // 3. Unresolved pulse alerts
  const { data: alerts } = await supabase
    .from('pulse_alerts')
    .select()
    .eq('resolved', false)
    .eq('action_required', true);

  // 4. Content published yesterday
  const { data: content } = await supabase
    .from('content_bank')
    .select()
    .eq('status', 'published')
    .gte('ts', yesterdayStart.toISOString())
    .lte('ts', yesterdayEnd.toISOString());

  // Build report
  let report = `📊 Pulse Daily Report — ${dateStr}\n\n`;

  // Agent health
  report += `AGENT ACTIVITY (yesterday)\n`;
  const activeAgents = Object.keys(agentCounts);
  if (activeAgents.length > 0) {
    activeAgents.forEach(a => {
      report += `• ${a}: ${agentCounts[a]} action${agentCounts[a] !== 1 ? 's' : ''}\n`;
    });
  } else {
    report += `• No agent activity logged\n`;
  }

  // Email metrics
  report += `\nEMAIL (yesterday)\n`;
  report += `• Sent: ${emailStats.sent}\n`;
  report += `• Opened: ${emailStats.opened}`;
  if (emailStats.sent > 0) report += ` (${Math.round(emailStats.opened/emailStats.sent*100)}%)`;
  report += `\n`;
  report += `• Clicked: ${emailStats.clicked}\n`;
  if (emailStats.bounced > 0) report += `• Bounced: ${emailStats.bounced} ⚠️\n`;
  if (emailStats.unsubscribed > 0) report += `• Unsubscribed: ${emailStats.unsubscribed} ⚠️\n`;

  // Content
  report += `\nCONTENT\n`;
  report += `• Published yesterday: ${(content || []).length}\n`;

  // Alerts
  if ((alerts || []).length > 0) {
    report += `\nOPEN ALERTS (${alerts.length})\n`;
    alerts.slice(0, 5).forEach(a => {
      report += `• ${a.event} — ${a.recipient || a.notes}\n`;
    });
    if (alerts.length > 5) report += `• ...and ${alerts.length - 5} more\n`;
  } else {
    report += `\nNo open alerts\n`;
  }

  report += `\n— Pulse`;

  console.log(report);
  await sendTelegram(report);
  await logToSupabase(`Daily pulse — ${dateStr}`, report, {
    agent_activity: agentCounts,
    email_stats: emailStats,
    open_alerts: (alerts || []).length,
    content_published: (content || []).length
  });

  console.log('Pulse daily report complete.');

  await report('pulse', {
    title: `Daily Pulse — ${dateStr}`,
    summary: `Agents: ${agentCounts.total}, Emails: ${emailStats.sent}, Content: ${content?.length || 0}, Alerts: ${alerts?.length || 0}`,
    details: report,
    status: (alerts || []).length > 0 ? 'warning' : 'success',
    nextAction: (alerts || []).length > 0 ? `Review ${(alerts || []).length} open alerts` : 'All clear'
  }).catch(() => {});
};

runDailyPulse().catch(async (e) => {
  console.error('[Pulse] Daily pulse failed:', e.message);
  await reportError('pulse', e.message, 'daily.js — Pulse daily pulse').catch(() => {});
  process.exit(1);
});
