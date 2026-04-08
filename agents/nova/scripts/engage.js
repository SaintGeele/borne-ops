import { config } from 'dotenv';
config({ path: '/home/saint/.openclaw/.env' });
import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const REPLIES_FILE = join(process.cwd(), 'nova', 'nova-replies.json');

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
      'X-Title': 'Borne Systems Nova'
    },
    body: JSON.stringify({
      model: 'anthropic/claude-sonnet-4-6',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300,
      temperature: 0.65
    })
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim();
};

const readReplies = () => {
  try {
    if (!existsSync(REPLIES_FILE)) return [];
    return JSON.parse(readFileSync(REPLIES_FILE, 'utf8'));
  } catch { return []; }
};

const writeReplies = (replies) => {
  writeFileSync(REPLIES_FILE, JSON.stringify(replies, null, 2));
};

const postReply = async (platform, replyToId, text) => {
  console.log(`[Nova Engage] Posting ${platform} reply to ${replyToId}: "${text.substring(0, 50)}…"`);
  // Platform-specific posting would go here
  // X: use status ID as in_reply_to
  // LinkedIn: use comment URN
  return { success: true, platform, replyToId, text };
};

const generateReply = async (original, platform, context) => {
  const prompt = `You are Nova, the social engagement agent for Borne Systems. Write a reply to this ${platform} post.\n\nORIGINAL POST:\n"${original}"\n\nCONTEXT:\n- Our brand: Borne Systems — AI automation and cybersecurity for small businesses\n- Founded by Geele Evans\n- Tone: direct, helpful, not corporate, not spammy\n- Goal: engage authentically, offer value, don't hard sell\n\nRULES:\n- Max 280 chars for X, 200 words for LinkedIn\n- Reply TO the post, don't redirect\n- Be specific — reference what they actually said\n- Ask a question to keep conversation going\n- Never start with "Great post!" or generic praise\n\nPlatform: ${platform}\nReturn ONLY the reply text.`;

  return callOpenRouter(prompt);
};

const runEngage = async () => {
  console.log('[Nova Engage] Checking reply queue...');
  const replies = readReplies();
  const pending = replies.filter(r => r.status === 'pending');

  if (pending.length === 0) {
    console.log('[Nova Engage] No pending replies.');
    return;
  }

  console.log(`[Nova Engage] Processing ${pending.length} replies...`);
  let processed = 0;
  let failed = 0;

  for (const item of pending) {
    const reply = await generateReply(item.original_text || item.text, item.platform, item.context);
    if (!reply) {
      item.status = 'failed';
      item.error = 'No reply generated';
      failed++;
      continue;
    }

    try {
      await postReply(item.platform, item.reply_to_id, reply);
      item.status = 'replied';
      item.reply_text = reply;
      item.replied_at = new Date().toISOString();
      processed++;
    } catch (e) {
      item.status = 'failed';
      item.error = e.message;
      failed++;
    }

    await new Promise(r => setTimeout(r, 2000));
  }

  writeReplies(replies);

  await supabase.from('activity_log').insert({
    agent_id: 'nova',
    action_type: 'engagement_replies',
    title: `Engagement: ${processed} replied, ${failed} failed`,
    description: `${pending.length} replies processed`,
    metadata: { processed, failed, total: pending.length }
  });

  const msg = [
    `💬 <b>Nova Engage</b>`,
    ``,
    `Processed: ${pending.length}`,
    `Replied: ${processed}`,
    `Failed: ${failed}`
  ].join('\n');

  console.log(msg);
  await sendTelegram(msg);
};

runEngage().catch(e => {
  console.error('[Nova Engage] Fatal:', e.message);
  process.exit(1);
});
