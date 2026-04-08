import { config } from 'dotenv';
config({ path: '/home/saint/.openclaw/.env' });
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_DB_ID = process.env.NOTION_LEADS_DB_ID || '31b26a63-e141-81e9-b4af-cce2e9c60055';
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
      temperature: 0.65
    })
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim();
};

const getUncontactedLeads = async () => {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('status', 'new')
    .order('score', { ascending: false })
    .limit(25);

  if (error) throw error;
  return data || [];
};

const updateLeadStatus = async (id, status, stage) => {
  await supabase.from('leads').update({ status, stage }).eq('id', id);
};

const updateNotionLead = async (pageId, status, stage) => {
  if (!NOTION_TOKEN || !pageId) return;
  try {
    await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${NOTION_TOKEN}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        properties: {
          Status: { select: { name: status } },
          Stage: { select: { name: stage } }
        }
      })
    });
  } catch (e) {
    console.warn('[Chase] Notion update failed:', e.message);
  }
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
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend error: ${err}`);
  }
  return res.json();
};

const generateEmail = async (lead) => {
  const prompt = `You are Chase, the Sales Development Rep for Borne Systems. Write a cold outreach email.

LEAD: ${lead.name || 'there'}${lead.company ? `, ${lead.company}` : ''}${lead.location ? ` (${lead.location})` : ''}
Their interest: ${lead.interest || 'not specified'}
Their message: ${lead.message || 'none'}

RULES:
- Max 100 words
- Subject line first, then body
- Subject: punchy, 6-8 words, curiosity-driven
- Body: 3 short paragraphs max
- Hook: address their pain, not Borne Systems
- CTA: specific next step (reply, book a call link, etc.)
- Never mention pricing, pipeline, or generic "book a demo"
- Warm but direct — not spammy

Return ONLY:
Subject: [subject line]
---
[email body]`;

  return callOpenRouter(prompt);
};

const runOutreach = async () => {
  console.log('[Chase Outreach] Starting cold outreach...');
  const leads = await getUncontactedLeads();
  console.log(`[Chase Outreach] ${leads.length} uncontacted leads`);

  if (leads.length === 0) {
    await sendTelegram('🤖 <b>Chase Outreach</b>\nNo uncontacted leads. Pipeline is clean.');
    return;
  }

  let sent = 0;
  let failed = 0;
  const results = [];

  for (const lead of leads) {
    try {
      const raw = await generateEmail(lead);
      if (!raw) throw new Error('No email generated');

      const [subjectLine, ...bodyParts] = raw.split('---');
      const subject = subjectLine.replace(/^Subject:\s*/i, '').trim();
      const body = bodyParts.join('---').trim();

      if (!subject || !body) throw new Error('Malformed email output');

      await sendEmail(lead.email, subject, `<p>${body.replace(/\n\n/g, '</p><p>')}</p>`);
      await updateLeadStatus(lead.id, 'contacted', 'outreach_sent');
      if (lead.notion_page_id) await updateNotionLead(lead.notion_page_id, 'contacted', 'outreach_sent');

      sent++;
      results.push(`✅ ${lead.name} <${lead.email}>`);
      console.log(`[Chase] Sent to ${lead.name}`);

    } catch (e) {
      failed++;
      results.push(`❌ ${lead.name}: ${e.message}`);
      console.warn(`[Chase] Failed ${lead.name}: ${e.message}`);
    }

    await new Promise(r => setTimeout(r, 1200));
  }

  await supabase.from('activity_log').insert({
    agent_id: 'chase',
    action_type: 'outreach_batch',
    title: `Cold outreach: ${sent} sent, ${failed} failed`,
    description: `${leads.length} leads in batch`,
    metadata: { total: leads.length, sent, failed, results }
  });

  const msg = [
    `📬 <b>Chase Outreach</b>`,
    ``,
    `Batch: ${leads.length} leads`,
    `Sent: ${sent}`,
    `Failed: ${failed}`,
    ``,
    ...results.slice(0, 8),
    results.length > 8 ? `  … and ${results.length - 8} more` : ''
  ].join('\n');

  await sendTelegram(msg);
  console.log(`[Chase Outreach] Complete: ${sent} sent, ${failed} failed.`);
};

runOutreach().catch(e => {
  console.error('[Chase Outreach] Fatal:', e.message);
  process.exit(1);
});
