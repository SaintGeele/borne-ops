import { config } from 'dotenv';
config({ path: '/home/saint/.openclaw/.env' });
import { createClient } from '@supabase/supabase-js';

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const sendWithButtons = async (text, postId) => {
  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text,
      reply_markup: {
        inline_keyboard: [[
          { text: '✅ Approve', callback_data: `approve:${postId}` },
          { text: '❌ Reject', callback_data: `reject:${postId}` }
        ]]
      }
    })
  });
};

// Get all drafts not yet notified
const { data: drafts } = await sb
  .from('content_bank')
  .select('id, title, copy, platform, campaign, scheduled_for, notes')
  .eq('status', 'draft')
  .eq('author', 'mrx')
  .is('reviewed_by', null)
  .order('ts', { ascending: true })
  .limit(10);

for (const post of drafts || []) {
  const isManual = (post.platform || []).includes('linkedin_company');
  const platformLabel = (post.platform || []).join(', ');
  const scheduledLabel = post.scheduled_for
    ? new Date(post.scheduled_for).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York' })
    : 'No schedule';

  const msg = `📝 ${isManual ? '⚠️ MANUAL POST (copy-paste to LinkedIn company page)' : 'Auto-publish post'}

📌 ${post.title}
📱 ${platformLabel}
🕐 ${scheduledLabel}
📋 ${post.campaign}

${post.copy}

${isManual ? '👆 Copy and paste to: linkedin.com/company/112594293' : ''}`;

  await sendWithButtons(msg.slice(0, 4000), post.id);
  await new Promise(r => setTimeout(r, 500));
}

console.log(`Notified ${(drafts || []).length} pending drafts`);
