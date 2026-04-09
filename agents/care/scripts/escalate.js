import { config } from 'dotenv';
config({ path: '/home/saint/.openclaw/.env' });
import { createClient } from '@supabase/supabase-js';
import { report, reportError } from '../../ops/discord-reporter.js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const ESCALATION_KEYWORDS = ['cancel', 'refund', 'legal', 'angry', 'lawsuit', 'complaint', 'manager', 'supervisor', 'urgent', 'asap'];
const ESCALATION_HOURS = 48;

const sendTelegram = async (message) => {
  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message, parse_mode: 'HTML' })
  });
};

const checkEscalationCriteria = (ticket) => {
  const reasons = [];

  if (ticket.created_at) {
    const ageHours = (Date.now() - new Date(ticket.created_at).getTime()) / (1000 * 60 * 60);
    if (ageHours > ESCALATION_HOURS) reasons.push(`open ${Math.floor(ageHours)}h`);
  }

  if (ticket.priority === 'high' || ticket.priority === 'urgent') {
    reasons.push(`priority: ${ticket.priority}`);
  }

  const text = `${ticket.subject || ''} ${ticket.message || ''} ${ticket.description || ''}`.toLowerCase();
  const matched = ESCALATION_KEYWORDS.filter(kw => text.includes(kw));
  if (matched.length > 0) reasons.push(`keyword(s): ${matched.join(', ')}`);

  return reasons;
};

const updateTicketEscalated = async (ticketId, reason) => {
  await supabase.from('tickets').update({
    status: 'escalated',
    escalated_reason: reason,
    escalated_at: new Date().toISOString()
  }).eq('id', ticketId);
};

const logEscalation = async (ticket, reason) => {
  await supabase.from('activity_log').insert({
    agent_id: 'care',
    action_type: 'ticket_escalated',
    title: `ESCALATED: ${ticket.requester || ticket.name || 'Unknown'} — ${ticket.subject || 'No subject'}`,
    description: `Reason: ${reason}`,
    metadata: { ticket_id: ticket.id, requester: ticket.requester || ticket.name, subject: ticket.subject, priority: ticket.priority, created_at: ticket.created_at, reason }
  });
};

const sendEscalationAlert = async (ticket, reason) => {
  await sendTelegram(
    `🚨 <b>CARE ESCALATION</b>\n\n` +
    `<b>Ticket ID:</b> ${ticket.id}\n` +
    `<b>Requester:</b> ${ticket.requester || ticket.name || 'Unknown'}\n` +
    `<b>Subject:</b> ${ticket.subject || 'No subject'}\n` +
    `<b>Reason:</b> ${reason}\n` +
    `<b>Priority:</b> ${ticket.priority || 'medium'}\n` +
    `<b>Created:</b> ${ticket.created_at ? new Date(ticket.created_at).toLocaleString() : 'unknown'}`
  );
};

const runEscalationTrigger = async () => {
  console.log('[Care Escalate] Scanning for tickets needing escalation...');

  const { data: tickets, error } = await supabase
    .from('tickets')
    .select('*')
    .in('status', ['open', 'in_progress'])
    .order('created_at', { ascending: true });

  if (error) { console.error('[Care Escalate] Fetch error:', error.message); return; }
  if (!tickets || tickets.length === 0) { console.log('[Care Escalate] No open tickets.'); return; }

  console.log(`[Care Escalate] Checking ${tickets.length} tickets...`);
  const escalated = [];

  for (const ticket of tickets) {
    const reasons = checkEscalationCriteria(ticket);
    if (reasons.length === 0) continue;

    const reason = reasons.join(' | ');
    await updateTicketEscalated(ticket.id, reason);
    await logEscalation(ticket, reason);
    await sendEscalationAlert(ticket, reason);

    escalated.push({ id: ticket.id, requester: ticket.requester || ticket.name, subject: ticket.subject, reason });
    console.log(`[Care Escalate] Escalated: ${ticket.id} — ${reason}`);

    await new Promise(r => setTimeout(r, 1000));
  }

  console.log(`[Care Escalate] Done. Escalated ${escalated.length} tickets.`);

  await report('care', {
    title: `Escalation Scan — ${escalated.length} escalated`,
    summary: `Scanned ${tickets.length} open tickets. ${escalated.length} escalated.`,
    details: escalated.slice(0, 8).map(e => `• ${e.requester}: ${e.reason}`).join('\n'),
    status: escalated.length > 0 ? 'warning' : 'success',
    nextAction: escalated.length > 0 ? `Review ${escalated.length} escalated tickets` : 'No escalations needed'
  }).catch(() => {});
};

runEscalationTrigger().catch(async (e) => {
  console.error('[Care Escalate] Fatal:', e.message);
  await reportError('care', e.message, 'escalate.js — Care escalation trigger').catch(() => {});
  process.exit(1);
});
