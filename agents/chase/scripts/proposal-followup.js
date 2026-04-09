import { config } from 'dotenv';
config({ path: '/home/saint/.openclaw/.env' });
import { createClient } from '@supabase/supabase-js';
import { report, reportError } from '../../ops/discord-reporter.js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const sendTelegram = async (message) => {
  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message, parse_mode: 'HTML' })
  });
};

const callOpenRouter = async (prompt) => {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://bornesystems.com',
      'X-Title': 'Borne Systems Chase'
    },
    body: JSON.stringify({
      model: 'minimax/minimax-m2.7',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
      temperature: 0.6
    })
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim();
};

const CADENCE = [2, 5, 10]; // days after proposal_sent

const getProposalLeads = async () => {
  const cutoff = new Date();
  const results = [];

  for (const days of CADENCE) {
    const target = new Date(cutoff);
    target.setDate(target.getDate() - days);
    const start = new Date(target); start.setHours(0, 0, 0, 0);
    const end = new Date(target); end.setHours(23, 59, 59, 999);

    const { data } = await supabase
      .from('leads')
      .select('*')
      .eq('stage', 'proposal_sent')
      .eq('status', 'contacted')
      .gte('updated_at', start.toISOString())
      .lte('updated_at', end.toISOString());

    if (data) {
      for (const lead of data) {
        results.push({ ...lead, followup_day: days });
      }
    }
  }
  return results;
};

const updateLeadStage = async (id, stage) => {
  await supabase.from('leads').update({ stage }).eq('id', id);
};

const sendEmail = async (to, subject, html) => {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ from: 'Borne Systems <noreply@bornesystems.com>', to, subject, html })
  });
  if (!res.ok) throw new Error(await res.text());
};

const generateProposalFollowup = async (lead, day) => {
  const prompt = `You are Chase, the SDR for Borne Systems. Write a proposal follow-up email.

CONTACT: ${lead.name}${lead.company ? `, ${lead.company}` : ''}
Days since proposal: ${day}

RULES:
- Max 90 words
- Day 2: check if they received it, ask if they have questions
- Day 5: highlight one key benefit from the proposal, offer a call
- Day 10: be direct — ask if they're ready to move forward or if something stopped them
- Subject: short, day-specific
- Never beg or sound desperate
- CTA: specific next step

Return ONLY:
Subject: [subject]
---
[body]`;

  const raw = await callOpenRouter(prompt);
  if (!raw) return null;

  const [subjectLine, ...bodyParts] = raw.split('---');
  const subject = subjectLine.replace(/^Subject:\s*/i, '').trim();
  const body = bodyParts.join('---').trim();

  if (!subject || !body) return null;
  return { subject, body };
};

const runProposalFollowup = async () => {
  console.log('[Chase Proposal Followup] Checking proposal follow-ups...');
  const leads = await getProposalLeads();
  console.log(`[Chase Proposal Followup] ${leads.length} proposals need follow-up`);

  if (leads.length === 0) {
    await sendTelegram('🤖 <b>Chase Proposal Followup</b>\nNo proposals due for follow-up.');
    return;
  }

  let sent = 0;
  let skipped = 0;
  const results = [];

  for (const lead of leads) {
    const email = await generateProposalFollowup(lead, lead.followup_day);
    if (!email) { skipped++; continue; }

    try {
      await sendEmail(
        lead.email,
        email.subject,
        `<p>${email.body.replace(/\n\n/g, '</p><p>')}</p>`
      );
      const newStage = `proposal_followup_day${lead.followup_day}`;
      await updateLeadStage(lead.id, newStage);
      sent++;
      results.push(`✅ ${lead.name} [day ${lead.followup_day}]`);
      console.log(`[Chase] Proposal follow-up sent: ${lead.name}`);
    } catch (e) {
      skipped++;
      results.push(`❌ ${lead.name}: ${e.message}`);
    }

    await new Promise(r => setTimeout(r, 1200));
  }

  await supabase.from('activity_log').insert({
    agent_id: 'chase',
    action_type: 'proposal_followup_batch',
    title: `Proposal follow-up: ${sent} sent, ${skipped} skipped`,
    description: `${leads.length} proposals checked`,
    metadata: { total: leads.length, sent, skipped }
  });

  const msg = [
    `📋 <b>Chase Proposal Followup</b>`,
    ``,
    `Sent: ${sent}`,
    `Skipped: ${skipped}`,
    ``,
    ...results.slice(0, 10)
  ].join('\n');

  await sendTelegram(msg);
  console.log(`[Chase Proposal Followup] Complete: ${sent} sent.`);

  await report('chase', {
    title: `Proposal Followup — ${sent} sent, ${skipped} skipped`,
    summary: `${sent} proposal follow-ups sent.`,
    details: results.slice(0, 8).join('\n'),
    status: sent > 0 ? 'success' : skipped > 0 ? 'warning' : 'info',
    nextAction: 'Await proposal decisions from leads'
  }).catch(() => {});
};

runProposalFollowup().catch(async (e) => {
  console.error('[Chase Proposal Followup] Fatal:', e.message);
  await reportError('chase', e.message, 'proposal-followup.js — Chase proposal follow-up').catch(() => {});
  process.exit(1);
});
