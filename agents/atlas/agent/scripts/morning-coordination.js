#!/usr/bin/env node
/**
 * Atlas — Morning Coordination Script
 * Runs at 8am weekdays via cron
 * Checks agent health, pipeline status, content queue
 * Writes briefing to Supabase activity_log for BorneAI to deliver
 */

import { readFileSync } from 'fs';
import { createClient } from '/home/saint/.openclaw/workspace/node_modules/@supabase/supabase-js/dist/index.mjs';
import { report, reportError } from '../../../ops/discord-reporter.js';

// Load env
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
  const cutoff24h = new Date(now - 24 * 60 * 60 * 1000).toISOString();

  console.log(`[Atlas] Morning coordination — ${today}`);

  // 1. Agent health — who logged activity in last 24h?
  const { data: actLog } = await sb
    .from('activity_log')
    .select('agent_id, created_at')
    .gte('created_at', cutoff24h);

  const activeAgents = [...new Set((actLog || []).map(r => r.agent_id))];
  const allAgents = ['chase', 'mrx', 'mercury', 'knox', 'care', 'pulse', 'ledger', 'inspector', 'beacon', 'chronicle'];
  const staleAgents = allAgents.filter(a => !activeAgents.includes(a));

  // 2. Pipeline — leads
  const { data: hotLeads } = await sb
    .from('leads')
    .select('name, company, status, ts')
    .eq('status', 'qualified')
    .order('ts', { ascending: false })
    .limit(5);

  const { count: newLeads } = await sb
    .from('leads')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'new');

  // 3. Email pipeline — sent today
  const { data: emailsToday } = await sb
    .from('email_events')
    .select('event_type')
    .gte('ts', today + 'T00:00:00Z');

  const sentToday = (emailsToday || []).filter(e => e.event_type === 'email.sent').length;
  const openedToday = (emailsToday || []).filter(e => e.event_type === 'email.opened').length;

  // 4. Content queue — approved posts pending publish
  const { data: pendingContent } = await sb
    .from('content_bank')
    .select('title, platform, scheduled_for')
    .eq('status', 'approved')
    .gte('scheduled_for', now.toISOString())
    .order('scheduled_for', { ascending: true })
    .limit(5);

  // 5. Open alerts
  const { data: alerts } = await sb
    .from('pulse_alerts')
    .select('event, source')
    .eq('resolved', false);

  // 6. Open tickets
  const { count: openTickets } = await sb
    .from('tickets')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'open');

  // Build briefing
  const lines = [
    `🌅 *Atlas Morning Coordination — ${today}*`,
    '',
    `*🤖 Agent Health*`,
    activeAgents.length > 0 ? `✅ Active (24h): ${activeAgents.join(', ')}` : '⚠️ No agent activity in 24h',
    staleAgents.length > 0 ? `🔴 Stale: ${staleAgents.join(', ')}` : '✅ All agents active',
    '',
    `*📊 Pipeline*`,
    `• New leads: ${newLeads || 0}`,
    `• Qualified (warm): ${(hotLeads || []).length}`,
    hotLeads?.length > 0 ? hotLeads.map(l => `  → ${l.name || '?'} · ${l.company || '?'}`).join('\n') : '',
    '',
    `*📧 Email (Today)*`,
    `• Sent: ${sentToday} | Opened: ${openedToday}`,
    `• Open rate: ${sentToday > 0 ? Math.round(openedToday / sentToday * 100) : 0}%`,
    '',
    `*📱 Content Queue*`,
    pendingContent?.length > 0
      ? pendingContent.map(c => `• ${(c.platform || []).join('/')} @ ${c.scheduled_for?.slice(11, 16)} UTC — ${c.title?.slice(0, 40)}`).join('\n')
      : '• No approved content scheduled',
    '',
    `*🎫 Support*`,
    `• Open tickets: ${openTickets || 0}`,
    alerts?.length > 0 ? `• ⚠️ ${alerts.length} unresolved alert(s)` : '• No active alerts',
    '',
    staleAgents.length > 0
      ? `*⚠️ Action Required*\nStale agents need attention: ${staleAgents.join(', ')}`
      : `*✅ All systems nominal*`
  ].filter(l => l !== undefined && l !== '').join('\n');

  // Log to Supabase
  await sb.from('activity_log').insert({
    agent_id: 'atlas',
    action_type: 'morning_coordination',
    title: `Morning coordination — ${today}`,
    description: lines,
    metadata: {
      active_agents: activeAgents,
      stale_agents: staleAgents,
      new_leads: newLeads,
      warm_leads: hotLeads?.length,
      emails_sent_today: sentToday,
      open_tickets: openTickets,
      pending_content: pendingContent?.length
    }
  });

  // Send to Telegram
  await sendTelegram(lines);
  console.log('[Atlas] Morning coordination complete');
  console.log(lines);

  await report('atlas', {
    title: `Morning Coordination — ${today}`,
    summary: `Active agents: ${activeAgents}, New leads: ${newLeads}, Warm leads: ${hotLeads?.length || 0}, Open tickets: ${openTickets}`,
    details: lines,
    status: staleAgents > 0 ? 'warning' : 'success',
    nextAction: staleAgents > 0 ? `Review ${staleAgents} stale agents` : 'Pipeline clear'
  }).catch(() => {});
}

run().catch(async (e) => {
  console.error('[Atlas] Morning coordination failed:', e.message);
  await reportError('atlas', e.message, 'morning-coordination.js — Atlas morning coordination').catch(() => {});
  process.exit(1);
});
