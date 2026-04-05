import { config } from 'dotenv';
config({ path: '/home/saint/.openclaw/.env' });
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const OFFSET_FILE = path.join(process.env.HOME, '.openclaw/logs/telegram-offset.txt');

const getOffset = () => {
  try { return parseInt(fs.readFileSync(OFFSET_FILE, 'utf8').trim()) || 0; }
  catch { return 0; }
};

const saveOffset = (offset) => {
  fs.writeFileSync(OFFSET_FILE, String(offset));
};

const answerCallback = async (callbackQueryId, text) => {
  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callback_query_id: callbackQueryId, text })
  });
};

const editMessage = async (chatId, messageId, text) => {
  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/editMessageText`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      message_id: messageId,
      text,
      reply_markup: { inline_keyboard: [] }
    })
  });
};

const poll = async () => {
  const offset = getOffset();

  const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/getUpdates?offset=${offset}&timeout=10`);
  const data = await res.json();

  if (!data.ok || !data.result.length) return;

  for (const update of data.result) {
    saveOffset(update.update_id + 1);

    if (!update.callback_query) continue;

    const { id: callbackId, data: callbackData, message } = update.callback_query;
    const [action, postId] = callbackData.split(':');

    if (!action || !postId) continue;

    if (action === 'approve') {
      const { error } = await supabase
        .from('content_bank')
        .update({ status: 'approved', reviewed_by: 'Geele' })
        .eq('id', postId);

      if (!error) {
        await answerCallback(callbackId, '✅ Approved — ready to publish');
        await editMessage(message.chat.id, message.message_id,
          message.text + '\n\n✅ APPROVED');

        await supabase.from('activity_log').insert({
          agent_id: 'inspector',
          action_type: 'content_approved',
          title: `Post approved by Geele`,
          description: `Content bank post ${postId} approved`,
          metadata: { post_id: postId, action: 'approved' }
        });

        console.log(`Approved: ${postId}`);
      }
    }

    if (action === 'reject') {
      const { error } = await supabase
        .from('content_bank')
        .update({ status: 'archived', reviewed_by: 'Geele' })
        .eq('id', postId);

      if (!error) {
        await answerCallback(callbackId, '❌ Rejected — post archived');
        await editMessage(message.chat.id, message.message_id,
          message.text + '\n\n❌ REJECTED');

        await supabase.from('activity_log').insert({
          agent_id: 'inspector',
          action_type: 'content_rejected',
          title: `Post rejected by Geele`,
          description: `Content bank post ${postId} rejected`,
          metadata: { post_id: postId, action: 'rejected' }
        });

        console.log(`Rejected: ${postId}`);
      }
    }
  }
};

poll().then(() => process.exit(0));
