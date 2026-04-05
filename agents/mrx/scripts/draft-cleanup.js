import { config } from 'dotenv';
config({ path: '/home/saint/.openclaw/.env' });
import { createClient } from '@supabase/supabase-js';

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

const sendPostForApproval = async (post) => {
  const platform = post.platform[0].toUpperCase();
  const preview = post.copy.slice(0, 200) + (post.copy.length > 200 ? '...' : '');
  const ageHours = Math.round((Date.now() - new Date(post.ts).getTime()) / 3600000);

  const message = `✍️ MrX Draft — ${platform} (${ageHours}h old)\n\n${preview}\n\nCampaign: ${post.campaign}`;

  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      reply_markup: {
        inline_keyboard: [[
          { text: '✅ Approve', callback_data: `approve:${post.id}` },
          { text: '❌ Reject', callback_data: `reject:${post.id}` }
        ]]
      }
    })
  });
};

const runCleanup = async () => {
  const now = new Date();
  const cutoff24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // 1. Auto-archive drafts older than 24 hours
  const { data: expired } = await supabase
    .from('content_bank')
    .select()
    .eq('status', 'draft')
    .lt('ts', cutoff24h.toISOString());

  if (expired && expired.length > 0) {
    const ids = expired.map(p => p.id);
    await supabase
      .from('content_bank')
      .update({ status: 'archived', notes: 'Auto-archived — no approval within 24h' })
      .in('id', ids);

    await supabase.from('activity_log').insert({
      agent_id: 'mrx',
      action_type: 'drafts_expired',
      title: `${expired.length} draft(s) auto-archived`,
      description: `Posts expired without approval after 24 hours`,
      metadata: { count: expired.length, ids }
    });

    await sendTelegram(`🗄️ MrX — ${expired.length} draft(s) auto-archived (no approval within 24h)`);
    console.log(`Auto-archived ${expired.length} expired drafts.`);
  }

  // 2. Resend drafts under 24 hours that still need approval
  const { data: pending } = await supabase
    .from('content_bank')
    .select()
    .eq('status', 'draft')
    .gte('ts', cutoff24h.toISOString())
    .order('ts', { ascending: true });

  if (pending && pending.length > 0) {
    await sendTelegram(`📋 ${pending.length} post(s) still waiting for your approval:`);
    for (const post of pending) {
      await sendPostForApproval(post);
      await new Promise(r => setTimeout(r, 500));
    }
    console.log(`Resent ${pending.length} pending drafts for approval.`);
  } else {
    console.log('No pending drafts.');
  }
};

runCleanup();
