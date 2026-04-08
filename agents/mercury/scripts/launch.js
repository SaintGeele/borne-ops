import { config } from 'dotenv';
config({ path: '/home/saint/.openclaw/.env' });
import { createClient } from '@supabase/supabase-js';
import { spawn } from 'child_process';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const SCRIPT_DIR = join(process.cwd(), 'mercury', 'scripts');
const CAMPAIGNS_DIR = join(process.cwd(), 'mercury', 'campaigns');

const sendTelegram = async (message) => {
  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message, parse_mode: 'HTML' })
  });
};

const runScript = (scriptName, args = []) => {
  return new Promise((resolve, reject) => {
    const child = spawn('node', [join(SCRIPT_DIR, scriptName), ...args], { stdio: ['pipe', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';

    child.stdout.on('data', d => stdout += d.toString());
    child.stderr.on('data', d => stderr += d.toString());

    child.on('close', code => {
      if (code === 0) resolve({ code, stdout, stderr });
      else reject(new Error(`Script ${scriptName} exited ${code}: ${stderr}`));
    });
    child.on('error', err => reject(new Error(`Spawn failed: ${err.message}`)));

    setTimeout(() => { child.kill(); reject(new Error(`${scriptName} timeout`)); }, 300000);
  });
};

const parseArgs = () => {
  const args = process.argv.slice(2);
  let campaign = '';
  let brief = '';
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--campaign' && args[i + 1]) campaign = args[++i];
    if (args[i] === '--brief' && args[i + 1]) brief = args[++i];
  }
  return { campaign, brief };
};

const writeManifest = (campaign, data) => {
  if (!existsSync(CAMPAIGNS_DIR)) mkdirSync(CAMPAIGNS_DIR, { recursive: true });
  const path = join(CAMPAIGNS_DIR, `${campaign.toLowerCase().replace(/\s+/g, '-')}.json`);
  writeFileSync(path, JSON.stringify(data, null, 2));
  return path;
};

const launchCampaign = async ({ campaign, brief }) => {
  if (!campaign || !brief) {
    console.error('[Mercury Launch] Usage: node launch.js --campaign "Name" --brief "Core message"');
    process.exit(1);
  }

  const startTime = Date.now();
  console.log(`[Mercury Launch] Campaign: "${campaign}"`);

  let calendarOk = false;
  let variantsOk = false;
  const errors = [];

  console.log('[Mercury Launch] Step 1: Calendar...');
  try {
    await runScript('calendar.js');
    calendarOk = true;
  } catch (e) {
    errors.push({ step: 'calendar', error: e.message });
  }

  console.log('[Mercury Launch] Step 2: Variants...');
  let variantsData = null;
  try {
    const result = await runScript('variants.js', ['--brief', brief]);
    const match = result.stdout.match(/=== VARIANTS OUTPUT ===\n([\s\S]+)$/);
    if (match) variantsData = JSON.parse(match[1]);
    variantsOk = true;
  } catch (e) {
    errors.push({ step: 'variants', error: e.message });
  }

  let postCount = 0;
  try {
    const queueFile = join(process.cwd(), 'nova', 'nova-queue.json');
    if (existsSync(queueFile)) {
      postCount = JSON.parse(require('fs').readFileSync(queueFile, 'utf8')).length;
    }
  } catch {}

  const manifest = {
    campaign,
    brief,
    status: errors.length === 0 ? 'launched' : 'partial',
    launched_at: new Date().toISOString(),
    duration_ms: Date.now() - startTime,
    steps: { calendar: { success: calendarOk }, variants: { success: variantsOk } },
    summary: {
      posts_generated: postCount,
      variants_created: variantsData ? 3 : 0,
      platforms: ['x', 'linkedin', 'instagram']
    },
    variants_preview: variantsData ? {
      x_chars: variantsData.x?.character_count,
      linkedin_words: variantsData.linkedin?.word_count,
      instagram_hook: variantsData.instagram?.hook_line
    } : null,
    errors
  };

  const manifestPath = writeManifest(campaign, manifest);

  await supabase.from('activity_log').insert({
    agent_id: 'mercury',
    action_type: 'campaign_launch',
    title: `Campaign: ${campaign}`,
    description: `${postCount} posts, ${variantsData ? 3 : 0} variants`,
    metadata: manifest
  });

  const status = errors.length === 0 ? '✅ Complete' : '⚠️ Partial';
  const msg = [
    `🚀 <b>Mercury Campaign Launch</b>`,
    ``,
    `Campaign: ${campaign}`,
    `Status: ${status}`,
    ``,
    `Posts: ${postCount}`,
    `Variants: ${variantsData ? 'X, LinkedIn, Instagram' : 'failed'}`,
    ``,
    `Manifest: ${manifestPath}`,
    ...errors.map(e => `❌ ${e.step}: ${e.error}`)
  ].filter(Boolean).join('\n');

  console.log(msg);
  await sendTelegram(msg);
  return manifest;
};

const { campaign, brief } = parseArgs();
launchCampaign({ campaign, brief }).catch(e => {
  console.error('[Mercury Launch] Fatal:', e.message);
  process.exit(1);
});
