import { config } from 'dotenv';
config({ path: '/home/saint/.openclaw/.env' });
import { createClient } from '@supabase/supabase-js';
import { report, reportError } from '../../ops/discord-reporter.js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const sendTelegram = async (message) => {
  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message })
  });
};

const runDailyCare = async () => {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const yesterday = new Date(now); yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStart = new Date(yesterday); yesterdayStart.setHours(0,0,0,0);
  const yesterdayEnd = new Date(yesterday); yesterdayEnd.setHours(23,59,59,999);

  const { data: tickets } = await supabase
    .from('tickets')
    .select()
    .gte('created_at', yesterdayStart.toISOString())
    .lte('created_at', yesterdayEnd.toISOString());

  const { data: openTickets } = await supabase
    .from('tickets')
    .select()
    .in('status', ['open', 'in_progress']);

  const responded = (tickets || []).filter(t => t.status === 'in_progress' || t.status === 'resolved');
  const escalated = (tickets || []).filter(t => t.assigned_to === 'Geele');

  let report = `🎧 Care Daily — ${dateStr}\n\n`;
  report += `YESTERDAY\n`;
  report += `• New tickets: ${(tickets || []).length}\n`;
  report += `• Responded: ${responded.length}\n`;
  report += `• Escalated to Geele: ${escalated.length}\n`;
  report += `\nOPEN NOW: ${(openTickets || []).length} tickets\n`;

  if (escalated.length > 0) {
    report += `\nESCALATIONS NEED YOUR ATTENTION\n`;
    escalated.slice(0, 3).forEach(t => {
      report += `• ${t.name || 'Unknown'} — ${t.subject || '—'}\n`;
    });
  }

  if ((openTickets || []).length === 0) {
    report += `\nNo open tickets ✅\n`;
  }

  report += `\n— Care`;

  console.log(report);
  await sendTelegram(report);

  await supabase.from('activity_log').insert({
    agent_id: 'care',
    action_type: 'daily_report',
    title: `Care daily — ${(tickets||[]).length} new, ${(openTickets||[]).length} open`,
    description: report,
    metadata: { new_tickets: (tickets||[]).length, open_tickets: (openTickets||[]).length, escalated: escalated.length }
  });

  console.log('Care daily report complete.');

  await report('care', {
    title: `Daily Report — ${dateStr}`,
    summary: `New: ${(tickets||[]).length}, Open: ${(openTickets||[]).length}, Responded: ${responded.length}, Escalated: ${escalated.length}`,
    details: report,
    status: escalated.length > 0 ? 'warning' : 'success',
    nextAction: escalated.length > 0 ? `Review ${escalated.length} escalations` : 'Support queue is clear'
  }).catch(() => {});
};

runDailyCare().catch(async (e) => {
  console.error('[Care] Daily report failed:', e.message);
  await reportError('care', e.message, 'daily.js — Care daily report').catch(() => {});
  process.exit(1);
});
