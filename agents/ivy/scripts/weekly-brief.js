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

const callOpenRouter = async (prompt) => {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://bornesystems.com',
      'X-Title': 'Borne Systems Ivy'
    },
    body: JSON.stringify({
      model: 'minimax/minimax-m2.5',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1500,
      temperature: 0.5
    })
  });
  const data = await res.json();
  return data.choices[0].message.content.trim();
};

const runWeeklyBrief = async () => {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  // Pull pipeline data to inform research
  const { data: leads } = await supabase.from('leads').select('status, industry');
  const industries = {};
  (leads || []).forEach(l => {
    if (l.industry) industries[l.industry] = (industries[l.industry] || 0) + 1;
  });
  const topIndustries = Object.entries(industries).sort((a,b) => b[1]-a[1]).slice(0,5).map(([k,v]) => `${k} (${v})`).join(', ');

  const prompt = `You are Ivy, the research agent for Borne Systems.

Borne Systems sells AI automation to small businesses — primarily AI Receptionist ($99/month) and SecretScout (security tool).
Current pipeline: ${(leads||[]).length} leads. Top industries: ${topIndustries}.

Generate a concise weekly industry intelligence brief for Mercury (our marketing strategist).

Cover:
1. ONE key trend in AI adoption for small businesses this week
2. ONE pain point small businesses are commonly expressing right now
3. ONE competitive insight (what are other AI tools for SMBs doing)
4. ONE content opportunity MrX should explore this week
5. ONE new vertical Borne Systems should consider targeting

Keep each point to 2-3 sentences max. Be specific and actionable.
Format as a numbered list. No fluff.`;

  const brief = await callOpenRouter(prompt);

  const msg = `🌿 Ivy Weekly Brief — ${dateStr}\n\nIntelligence for Mercury:\n\n${brief}\n\n— Ivy`;

  console.log(msg);
  await sendTelegram(msg);

  await supabase.from('activity_log').insert({
    agent_id: 'ivy',
    action_type: 'weekly_brief',
    title: `Weekly intelligence brief — ${dateStr}`,
    description: brief,
    metadata: { leads_count: (leads||[]).length, top_industries: topIndustries }
  });

  console.log('Ivy weekly brief complete.');

  await report('ivy', {
    title: `Weekly Brief — ${dateStr}`,
    summary: `Brief generated for Mercury. Pipeline: ${(leads||[]).length} leads. Top: ${topIndustries}`,
    details: brief,
    status: 'success',
    nextAction: 'Mercury to review and act on content opportunities'
  }).catch(() => {});
};

runWeeklyBrief().catch(async (e) => {
  console.error('[Ivy] Weekly brief failed:', e.message);
  await reportError('ivy', e.message, 'weekly-brief.js — Ivy weekly intelligence brief').catch(() => {});
  process.exit(1);
});
