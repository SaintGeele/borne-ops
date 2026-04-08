import { config } from 'dotenv';
config({ path: '/home/saint/.openclaw/.env' });
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Platform API keys
const X_API_KEY = process.env.X_API_KEY;
const X_API_SECRET = process.env.X_API_SECRET;
const X_ACCESS_TOKEN = process.env.X_ACCESS_TOKEN;
const X_ACCESS_SECRET = process.env.X_ACCESS_SECRET;
const LINKEDIN_TOKEN = process.env.LINKEDIN_ACCESS_TOKEN;

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
      model: 'minimax/minimax-m2.7',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 400,
      temperature: 0.7
    })
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim();
};

const postToX = async (content) => {
  if (!X_ACCESS_TOKEN || !X_ACCESS_SECRET) {
    console.warn('[Nova Router] X credentials not configured');
    return null;
  }

  try {
    // Use OpenClaw's opencli-rs or direct X v2 API
    const res = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${X_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text: content })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(data));
    return data;
  } catch (e) {
    console.warn('[Nova Router] X post failed:', e.message);
    return null;
  }
};

const postToLinkedIn = async (content) => {
  if (!LINKEDIN_TOKEN) {
    console.warn('[Nova Router] LinkedIn token not configured');
    return null;
  }

  try {
    const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LINKEDIN_TOKEN}`,
        'X-Restli-Protocol-Version': '2.0.0',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        author: `urn:li:person:${process.env.LINKEDIN_PERSON_ID || ''}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: { text: content },
            shareMediaCategory: 'NONE'
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(data));
    return data;
  } catch (e) {
    console.warn('[Nova Router] LinkedIn post failed:', e.message);
    return null;
  }
};

const postToInstagram = async (content, imageUrl) => {
  // Instagram via Graph API — requires Facebook API setup
  console.warn('[Nova Router] Instagram posting requires Facebook Graph API setup');
  return null;
};

const generateVariant = async (brief, platform) => {
  const platformPrompts = {
    x: `Adapt this content for X (Twitter). Max 280 chars. Punchy, direct. Hashtags at end. Return ONLY the post text:\n\n"${brief}"`,
    linkedin: `Adapt this content for LinkedIn. 150-300 words. Professional founder voice, Geele building in public. Soft CTA at end. Return ONLY the post text:\n\n"${brief}"`,
    instagram: `Adapt this content for Instagram. Hook-first, story-style. Line breaks for readability. 100-200 words. Return ONLY the post text:\n\n"${brief}"`
  };

  return callOpenRouter(platformPrompts[platform]);
};

const routePost = async (item) => {
  const { brief, platforms = ['x', 'linkedin', 'instagram'], image_url } = item;
  const results = [];

  for (const platform of platforms) {
    const variant = await generateVariant(brief, platform);
    if (!variant) continue;

    let result;
    switch (platform) {
      case 'x':
        result = await postToX(variant);
        break;
      case 'linkedin':
        result = await postToLinkedIn(variant);
        break;
      case 'instagram':
        result = await postToInstagram(variant, image_url);
        break;
    }

    results.push({ platform, variant, result, posted: !!result });
    await new Promise(r => setTimeout(r, 2000));
  }

  return results;
};

const runRouter = async (item) => {
  if (!item) {
    console.error('[Nova Router] Usage: node router.js --brief "content" [--platform x,linkedin,instagram]');
    process.exit(1);
  }

  const platforms = item.platforms || ['x', 'linkedin', 'instagram'];
  const brief = item.brief || item.content || item.text;

  console.log(`[Nova Router] Posting to: ${platforms.join(', ')}`);
  const results = await routePost({ ...item, platforms, brief });

  await supabase.from('activity_log').insert({
    agent_id: 'nova',
    action_type: 'router_post',
    title: `Router: ${results.filter(r => r.posted).length}/${results.length} platforms posted`,
    description: `Brief: ${brief?.substring(0, 60)}…`,
    metadata: { item, results }
  });

  const posted = results.filter(r => r.posted);
  const msg = [
    `📡 <b>Nova Router</b>`,
    ``,
    `Posted: ${posted.length}/${results.length}`,
    ...results.map(r => `${r.posted ? '✅' : '⚠️'} ${r.platform}: ${r.variant?.substring(0, 50)}…`)
  ].join('\n');

  console.log(msg);
  await sendTelegram(msg);
  return results;
};

// CLI entry
const args = process.argv.slice(2);
const item = { platforms: ['x', 'linkedin', 'instagram'] };

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--brief' && args[i + 1]) item.brief = args[++i];
  if (args[i] === '--platforms' && args[i + 1]) item.platforms = args[++i].split(',');
}

runRouter(item).catch(e => {
  console.error('[Nova Router] Fatal:', e.message);
  process.exit(1);
});
