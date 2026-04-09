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

const CADENCE = [1, 3, 7, 14]; // days after outreach_sent

const getLeadsForFollowup = async () => {
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
      .eq('status', 'contacted')
      .eq('stage', 'outreach_sent')
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
  if (!res.ok) throw new Error(`Resend: ${await res.text()}`);
};

const generateFollowup = async (lead, day) => {
  const cadenceLabel = { 1: 'first', 3: 'second', 7: 'third', 14: 'final' }[day] || 'follow-up';
  const prompt = `You are Chase, the Sales Development Rep for Borne Systems. Write a ${cadenceLabel} follow-up email.

CONTACT: ${lead.name}${lead.company ? `, ${lead.company}` : ''}
Day: ${day} days after initial outreach

RULES:
- Max 80 words
- Subject: same as initial or a variant (keep it short)
- Body: 2-3 short paragraphs
- Don't repeat the first email — offer new value or a different angle
- Soft close — ask a question, don't demand a reply
- If day 14: be direct about closing the loop, offer to reconnect later
- CTA: reply, book a call, or just "does this make sense?"

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

const runFollowup = async () => {
  console.log('[Chase Followup] Checking follow-up cadence...');
  const leads = await getLeadsForFollowup();
  console.log(`[Chase Followup] ${leads.length} leads need follow-up`);

  if (leads.length === 0) {
    await sendTelegram('🤖 <b>Chase Followup</b>\nNo leads due for follow-up today.');
    return;
  }

  let sent = 0;
  let skipped = 0;
  const results = [];

  for (const lead of leads) {
    if (lead.score && lead.score < 30) {
      skipped++;
      continue;
    }

    const email = await generateFollowup(lead, lead.followup_day);
    if (!email) {
      skipped++;
      continue;
    }

    try {
      await sendEmail(
        lead.email,
        email.subject,
        `<p>${email.body.replace(/\n\n/g, '</p><p>')}</p>`
      );

      const newStage = `followup_day${lead.followup_day}`;
      await updateLeadStage(lead.id, newStage);

      sent++;
      results.push(`✅ ${lead.name} [day ${lead.followup_day}]`);
      console.log(`[Chase] Follow-up sent to ${lead.name} (day ${lead.followup_day})`);
    } catch (e) {
      skipped++;
      results.push(`❌ ${lead.name}: ${e.message}`);
    }

    await new Promise(r => setTimeout(r, 1200));
  }

  await supabase.from('activity_log').insert({
    agent_id: 'chase',
    action_type: 'followup_batch',
    title: `Follow-up: ${sent} sent, ${skipped} skipped`,
    description: `${leads.length} leads checked`,
    metadata: { total: leads.length, sent, skipped }
  });

  const msg = [
    `🔄 <b>Chase Follow-up</b>`,
    ``,
    `Checked: ${leads.length}`,
    `Sent: ${sent}`,
    `Skipped: ${skipped}`,
    ``,
    ...results.slice(0, 10)
  ].join('\n');

  await sendTelegram(msg);
  console.log(`[Chase Followup] Complete: ${sent} sent.`);

  await report('chase', {
    title: `Follow-up — ${sent} sent, ${skipped} skipped`,
    summary: `${sent} follow-up emails sent to ${leads.length} leads.`,
    details: results.slice(0, 8).join('\n'),
    status: sent > 0 ? 'success' : skipped > 0 ? 'warning' : 'info',
    nextAction: 'Track replies over next 2-3 days'
  }).catch(() => {});
};

runFollowup().catch(async (e) => {
  console.error('[Chase Followup] Fatal:', e.message);
  await reportError('chase', e.message, 'followup.js — Chase follow-up emails').catch(() => {});
  process.exit(1);
});
