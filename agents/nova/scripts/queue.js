import { config } from 'dotenv';
config({ path: '/home/saint/.openclaw/.env' });
import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { spawn } from 'child_process';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const QUEUE_FILE = join(process.cwd(), 'nova', 'nova-queue.json');
const SCRIPT_DIR = join(process.cwd(), 'nova', 'scripts');

const sendTelegram = async (message) => {
  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message, parse_mode: 'HTML' })
  });
};

const readQueue = () => {
  try {
    if (!existsSync(QUEUE_FILE)) return [];
    return JSON.parse(readFileSync(QUEUE_FILE, 'utf8'));
  } catch { return []; }
};

const writeQueue = (queue) => {
  writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2));
};

const isDue = (item) => {
  if (!item.scheduled_at || item.status !== 'pending') return false;
  return new Date(item.scheduled_at) <= new Date();
};

const spawnRouter = (item) => {
  return new Promise((resolve, reject) => {
    const child = spawn('node', [
      join(SCRIPT_DIR, 'router.js'),
      '--brief', item.brief || item.content || item.text,
      '--platforms', (item.platforms || [item.platform || 'x']).join(',')
    ], { stdio: ['pipe', 'pipe', 'pipe'] });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', d => stdout += d.toString());
    child.stderr.on('data', d => stderr += d.toString());

    child.on('close', code => {
      if (code === 0) resolve(stdout);
      else reject(new Error(`Router exited ${code}: ${stderr}`));
    });

    child.on('error', err => reject(err));
    setTimeout(() => { child.kill(); reject(new Error('Router timeout')); }, 120000);
  });
};

const processQueue = async () => {
  console.log('[Nova Queue] Checking queue...');
  const queue = readQueue();
  const now = new Date();
  const due = queue.filter(isDue);

  console.log(`[Nova Queue] ${due.length} posts due now`);

  if (due.length === 0) {
    const upcoming = queue
      .filter(q => q.status === 'pending' && q.scheduled_at)
      .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))
      .slice(0, 3);

    if (upcoming.length > 0) {
      const previews = upcoming.map(p =>
        `${new Date(p.scheduled_at).toLocaleString()}: ${(p.brief || '').substring(0, 50)}…`
      );
      await sendTelegram(`📡 <b>Nova Queue</b>\nNo posts due. Upcoming:\n${previews.join('\n')}`);
    }
    return;
  }

  let processed = 0;
  let failed = 0;

  for (const item of due) {
    const idx = queue.findIndex(q => q.id === item.id);
    if (idx === -1) continue;

    try {
      await spawnRouter(item);
      queue[idx].status = 'posted';
      queue[idx].posted_at = new Date().toISOString();
      processed++;
      console.log(`[Nova Queue] Posted: ${item.id}`);
    } catch (e) {
      queue[idx].status = 'failed';
      queue[idx].error = e.message;
      failed++;
      console.warn(`[Nova Queue] Failed: ${item.id} — ${e.message}`);
    }

    await new Promise(r => setTimeout(r, 3000));
  }

  writeQueue(queue);

  await supabase.from('activity_log').insert({
    agent_id: 'nova',
    action_type: 'queue_processed',
    title: `Queue processed: ${processed} posted, ${failed} failed`,
    description: `${due.length} posts checked`,
    metadata: { processed, failed, total: due.length }
  });

  const msg = [
    `📡 <b>Nova Queue</b>`,
    ``,
    `Due: ${due.length}`,
    `Posted: ${processed}`,
    `Failed: ${failed}`
  ].join('\n');

  console.log(msg);
  await sendTelegram(msg);
};

processQueue().catch(e => {
  console.error('[Nova Queue] Fatal:', e.message);
  process.exit(1);
});
