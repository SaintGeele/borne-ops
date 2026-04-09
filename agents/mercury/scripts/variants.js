import { config } from 'dotenv';
config({ path: '/home/saint/.openclaw/.env' });
import { createClient } from '@supabase/supabase-js';
import { report, reportError } from '../../ops/discord-reporter.js';
import { writeFileSync } from 'fs';
import { join } from 'path';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const OUTPUT_FILE = join(process.cwd(), 'mercury', 'variants-output.json');

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
      'X-Title': 'Borne Systems Mercury'
    },
    body: JSON.stringify({
      model: 'minimax/minimax-m2.7',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 3000,
      temperature: 0.7
    })
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim();
};

const parseArgs = () => {
  const args = process.argv.slice(2);
  let brief = '';
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--brief' && args[i + 1]) brief = args[++i];
  }
  return { brief };
};

const generateVariants = async (brief) => {
  if (!brief) {
    console.error('[Mercury Variants] Error: --brief is required');
    process.exit(1);
  }

  console.log('[Mercury Variants] Generating platform variants...');

  const prompt = `You are Mercury for Borne Systems. Generate three platform-optimized variants.

CONTENT BRIEF: "${brief}"

Return ONLY valid JSON:
{
  "source_brief": "the original brief",
  "x": {
    "content": "280 chars max. Punchy, direct. Hook first. 1-2 hashtags at end.",
    "character_count": number,
    "hashtags": ["#hashtag1", "#hashtag2"]
  },
  "linkedin": {
    "content": "150-300 words. Professional founder voice. Soft CTA.",
    "word_count": number,
    "cta": "bornesystems.com | geele@bornesystems.com | (203) 439-4897"
  },
  "instagram": {
    "content": "Hook-first, story-style. Line breaks. Emoji-friendly. 100-200 words. Story arc: hook → struggle → insight → CTA.",
    "hook_line": "First line as scroll-stopper",
    "cta": "bornesystems.com | DM for details"
  }
}

Rules:
- NO pricing, costs, pipeline numbers, tech stack, personal info, client names
- X: contrarian, punchy, veteran systems voice
- LinkedIn: thoughtful, building in public
- Instagram: story-driven, honest, behind-the-scenes`;

  const raw = await callOpenRouter(prompt);
  const cleaned = raw.replace(/```json|```/g, '').trim();
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON found');

  let variants;
  try {
    const sanitized = jsonMatch[0].replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, ' ').replace(/\n/g, '\\n').replace(/\r/g, '');
    variants = JSON.parse(sanitized);
  } catch {
    const ultraClean = jsonMatch[0].replace(/[^\x20-\x7E\n\r\t]/g, '').replace(/\n\s*/g, ' ');
    variants = JSON.parse(ultraClean);
  }

  writeFileSync(OUTPUT_FILE, JSON.stringify(variants, null, 2));

  await supabase.from('activity_log').insert({
    agent_id: 'mercury',
    action_type: 'variants_generated',
    title: variants.x?.content?.substring(0, 60) || 'platform variants',
    description: `X: ${variants.x?.character_count} chars | LI: ${variants.linkedin?.word_count} words | IG: story format`,
    metadata: { source: brief, variants }
  });

  const xPreview = (variants.x?.content || '').substring(0, 80);
  const liPreview = (variants.linkedin?.content || '').substring(0, 80);
  const igHook = variants.instagram?.hook_line || '';

  const msg = [
    `✍️ <b>Mercury Variants Generated</b>`,
    ``,
    `<b>X</b> (${variants.x?.character_count} chars):`,
    `${xPreview}…`,
    ``,
    `<b>LinkedIn</b> (${variants.linkedin?.word_count} words):`,
    `${liPreview}…`,
    ``,
    `<b>Instagram</b> — Hook: ${igHook}`,
    ``,
    `Full output: ${OUTPUT_FILE}`
  ].join('\n');

  console.log(msg);
  await sendTelegram(msg);
  console.log('\n=== VARIANTS OUTPUT ===\n' + JSON.stringify(variants, null, 2));

  await report('mercury', {
    title: `Content Variants — ${brief.substring(0, 50)}…`,
    summary: `Generated variants for X, LinkedIn, Instagram.`,
    details: `X: ${variants.x?.character_count} chars | LinkedIn: ${variants.linkedin?.word_count} words`,
    status: 'success',
    nextAction: 'Review variants and publish via Nova'
  }).catch(() => {});

  return variants;
};

const { brief } = parseArgs();
generateVariants(brief).catch(async (e) => {
  console.error('[Mercury Variants] Fatal:', e.message);
  await reportError('mercury', e.message, 'variants.js — Mercury content variants').catch(() => {});
  process.exit(1);
});
