import { config } from 'dotenv';
config({ path: '/home/saint/.openclaw/.env' });
import { createClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';
import fs from 'fs';
import { report, reportError } from '../../ops/discord-reporter.js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const callOpenRouter = async (prompt) => {
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://bornesystems.com',
          'X-Title': 'Borne Systems MrX'
        },
        body: JSON.stringify({
          model: 'minimax/minimax-m2.5',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 500,
          temperature: 0.85
        })
      });
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (content) return content.trim();
      await new Promise(r => setTimeout(r, 2000));
    } catch(e) {
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  return null;
};

const humanize = async (text) => {
  try {
    const tmpIn = `/tmp/reply_in_${Date.now()}.txt`;
    const tmpOut = `/tmp/reply_out_${Date.now()}.txt`;
    fs.writeFileSync(tmpIn, text);
    execSync(`python3 /home/saint/.openclaw/workspace/skills/humanize-ai-text/scripts/transform.py ${tmpIn} -o ${tmpOut}`, { timeout: 10000 });
    const cleaned = fs.readFileSync(tmpOut, 'utf8').trim();
    fs.unlinkSync(tmpIn);
    fs.unlinkSync(tmpOut);
    return cleaned || text;
  } catch(e) {
    return text;
  }
};

const sendTelegram = async (message) => {
  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: message
    })
  });
};

const run = async () => {
  // Read from input file: reply-input.json
  const inputFile = '/tmp/reply-input.json';
  
  if (!fs.existsSync(inputFile)) {
    console.log('Create /tmp/reply-input.json with: {"platform":"linkedin","post":"...","comment":"...","url":"..."}');
    process.exit(1);
  }

  const input = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
  const { platform, post, comment, url } = input;

  console.log('Generating reply for:', comment.slice(0, 60));

  const prompt = `You are writing a reply to a comment on behalf of Geele Evans, founder of Borne Systems.

GEELE'S VOICE:
- Veteran. Direct. No BS.
- Conversational, like texting a smart friend
- Specific and real, no corporate speak
- No hyphens as dashes
- No AI slop: no "game-changing", "revolutionary", "seamlessly", "leverage", "innovative"
- Short paragraphs
- Acknowledge their point genuinely first
- Add real insight or value
- End with a question or strong statement

PLATFORM: ${platform}
ORIGINAL POST: ${post}
COMMENT: ${comment}

Write a reply. Return ONLY the reply text.`;

  const raw = await callOpenRouter(prompt);
  if (!raw) {
    console.log('Failed to generate reply');
    process.exit(1);
  }

  const reply = await humanize(raw);

  // Save to content_bank
  const { data } = await supabase.from('content_bank').insert({
    title: `Reply — ${platform} — ${comment.slice(0, 50)}`,
    copy: reply,
    platform: [platform],
    type: 'tweet',
    status: 'draft',
    campaign: 'REPLIES',
    product: 'AI Receptionist',
    confidence: 0.85,
    author: 'mrx',
    ts: new Date().toISOString(),
    notes: `Comment: ${comment} | URL: ${url || ''}`
  }).select().single();

  const msg = `💬 Reply Draft — ${platform.toUpperCase()}

COMMENT:
${comment}

SUGGESTED REPLY:
${reply}

Draft ID: ${data?.id}

Copy and paste this reply. Reply APPROVE or REJECT to this message.`;

  await sendTelegram(msg);
  console.log('\nREPLY GENERATED:\n');
  console.log(reply);
  console.log('\nSent to Telegram for approval.');

  await report('mrx', {
    title: `Reply Draft — ${platform.toUpperCase()}`,
    summary: `Reply draft generated for ${platform}: "${comment.slice(0, 60)}..."`,
    details: `Reply: ${reply.slice(0, 200)}…`,
    status: 'success',
    nextAction: 'Approve or reject reply draft via Telegram'
  }).catch(() => {});
};

run().catch(async (e) => {
  console.error('[MrX] Reply draft failed:', e.message);
  await reportError('mrx', e.message, 'reply-draft.js — MrX reply draft').catch(() => {});
  process.exit(1);
});
