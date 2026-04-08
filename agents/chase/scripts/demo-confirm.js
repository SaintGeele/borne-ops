import { config } from 'dotenv';
config({ path: '/home/saint/.openclaw/.env' });
import { createClient } from '@supabase/supabase-js';

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
      max_tokens: 600,
      temperature: 0.55
    })
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim();
};

const getDemoBookedLeads = async () => {
  const { data } = await supabase
    .from('leads')
    .select('*')
    .eq('stage', 'demo_booked')
    .eq('status', 'contacted')
    .order('updated_at', { ascending: true })
    .limit(15);

  return data || [];
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

const generateConfirmation = async (lead) => {
  const prompt = `You are Chase, the SDR for Borne Systems. Write a demo confirmation email.

CONTACT: ${lead.name}${lead.company ? `, ${lead.company}` : ''}
Phone: ${lead.phone || 'not provided'}
Interest: ${lead.interest || 'general'}

RULES:
- Max 120 words
- Confirm the demo has been booked
- Include a clear agenda (3 bullets: who we are, what we cover, Q&A)
- Mention they can reply with any questions before the call
- CTA: add to calendar (provide a placeholder Calendly link or generic "book your time")
- Tone: warm, organized, confident — not pushy

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

const runDemoConfirm = async () => {
  console.log('[Chase Demo Confirm] Checking demo bookings...');
  const leads = await getDemoBookedLeads();
  console.log(`[Chase Demo Confirm] ${leads.length} demos to confirm`);

  if (leads.length === 0) {
    await sendTelegram('🤖 <b>Chase Demo Confirm</b>\nNo demos booked to confirm.');
    return;
  }

  let sent = 0;
  let skipped = 0;
  const results = [];

  for (const lead of leads) {
    const email = await generateConfirmation(lead);
    if (!email) { skipped++; continue; }

    try {
      await sendEmail(
        lead.email,
        email.subject,
        `<p>${email.body.replace(/\n\n/g, '</p><p>')}</p>`
      );
      await updateLeadStage(lead.id, 'demo_confirmed');
      sent++;
      results.push(`✅ ${lead.name} <${lead.email}>`);
      console.log(`[Chase] Demo confirmed: ${lead.name}`);
    } catch (e) {
      skipped++;
      results.push(`❌ ${lead.name}: ${e.message}`);
    }

    await new Promise(r => setTimeout(r, 1200));
  }

  await supabase.from('activity_log').insert({
    agent_id: 'chase',
    action_type: 'demo_confirm_batch',
    title: `Demo confirm: ${sent} sent, ${skipped} skipped`,
    description: `${leads.length} demos checked`,
    metadata: { total: leads.length, sent, skipped }
  });

  const msg = [
    `📅 <b>Chase Demo Confirm</b>`,
    ``,
    `Confirmed: ${sent}`,
    `Skipped: ${skipped}`,
    ``,
    ...results.slice(0, 10)
  ].join('\n');

  await sendTelegram(msg);
  console.log(`[Chase Demo Confirm] Complete: ${sent} confirmed.`);
};

runDemoConfirm().catch(e => {
  console.error('[Chase Demo Confirm] Fatal:', e.message);
  process.exit(1);
});
