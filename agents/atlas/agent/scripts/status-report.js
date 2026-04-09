#!/usr/bin/env node
/**
 * Atlas — End of Day Status Report
 * Runs at 6pm weekdays via cron
 * Summarizes what moved, what's blocked, what's next
 */

import { readFileSync } from 'fs';
import { createClient } from '/home/saint/.openclaw/workspace/node_modules/@supabase/supabase-js/dist/index.mjs';
import { report, reportError } from '../../../ops/discord-reporter.js';

const env = Object.fromEntries(
  readFileSync('/home/saint/.openclaw/.env', 'utf8').split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => { const [k, ...v] = l.split('='); return [k.trim(), v.join('=').trim()]; })
);

const sb = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);
const TELEGRAM_TOKEN = env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = env.TELEGRAM_CHAT_ID;

async function sendTelegram(msg) {
  if (!TELEGRAM_TOKEN || !CHAT_ID) return;
  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: CHAT_ID, text: msg, parse_mode: 'Markdown' })
  });
}

async function run() {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const todayStart = today + 'T00:00:00Z';

  // What moved today — activity log
  const { data: todayActivity } = await sb
    .from('activity_log')
    .select('agent_id, action_type, title, created_at')
    .gte('created_at', todayStart)
    .order('created_at', { ascending: false });

  // Emails sent today
  const { data: emails } = await sb
    .from('email_events')
    .select('event_type')
    .gte('ts', todayStart);

  const sent = (emails || []).filter(e => e.event_type === 'email.sent').length;
  const opened = (emails || []).filter(e => e.event_type === 'email.opened').length;
  const delivered = (emails || []).filter(e => e.event_type === 'email.delivered').length;

  // Content published today
  const { data: published } = await sb
    .from('content_bank')
    .select('title, platform')
    .eq('status', 'published')
    .gte('scheduled_for', todayStart);

  // Open alerts
  const { data: alerts } = await sb
    .from('pulse_alerts')
    .select('event, source')
    .eq('resolved', false);

  // Qualified leads
  const { count: qualifiedLeads } = await sb
    .from('leads')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'qualified');

  // Tomorrow's content queue
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().slice(0, 10);

  const { data: tomorrowContent } = await sb
    .from('content_bank')
    .select('title, platform, scheduled_for')
    .eq('status', 'approved')
    .gte('scheduled_for', tomorrowStr + 'T00:00:00Z')
    .lte('scheduled_for', tomorrowStr + 'T23:59:59Z');

  // Group activity by agent
  const byAgent = {};
  (todayActivity || []).forEach(a => {
    if (!byAgent[a.agent_id]) byAgent[a.agent_id] = [];
    byAgent[a.agent_id].push(a.title || a.action_type);
  });

  const activityLines = Object.entries(byAgent)
    .map(([agent, actions]) => `• *${agent}*: ${actions.slice(0, 2).join(', ')}`)
    .join('\n');

  const lines = [
    `🌆 *Atlas EOD Report — ${today}*`,
    '',
    `*📋 What Moved Today*`,
    activityLines || '• No agent activity logged',
    '',
    `*📧 Chase Pipeline*`,
    `• Emails sent: ${sent} | Delivered: ${delivered} | Opened: ${opened}`,
    `• Open rate: ${delivered > 0 ? Math.round(opened / delivered * 100) : 0}%`,
    `• Qualified leads: ${qualifiedLeads || 0}`,
    '',
    `*📱 Content*`,
    published?.length > 0
      ? published.map(c => `• ✅ Published: ${c.title?.slice(0, 40)}`).join('\n')
      : '• No content published today',
    '',
    `*📅 Tomorrow's Queue*`,
    tomorrowContent?.length > 0
      ? tomorrowContent.map(c => `• ${(c.platform || []).join('/')} @ ${c.scheduled_for?.slice(11, 16)} UTC`).join('\n')
      : '• Nothing scheduled for tomorrow — queue needs content',
    '',
    alerts?.length > 0 ? `*⚠️ Open Alerts: ${alerts.length}*\nCheck Mission Control` : `*✅ No open alerts*`,
  ].filter(Boolean).join('\n');

  await sb.from('activity_log').insert({
    agent_id: 'atlas',
    action_type: 'eod_report',
    title: `EOD status report — ${today}`,
    description: lines,
    metadata: { emails_sent: sent, published: published?.length, qualified_leads: qualifiedLeads }
  });

  await sendTelegram(lines);
  console.log('[Atlas] EOD report sent');
  console.log(lines);

  await report('atlas', {
    title: `EOD Report — ${today}`,
    summary: `Emails: ${sent}, Published: ${published?.length || 0}, Qualified leads: ${qualifiedLeads}`,
    details: lines,
    status: 'info',
    nextAction: 'Review tomorrow morning'
  }).catch(() => {});
}

run().catch(async (e) => {
  console.error('[Atlas] EOD report failed:', e.message);
  await reportError('atlas', e.message, 'status-report.js — Atlas EOD report').catch(() => {});
  process.exit(1);
});
