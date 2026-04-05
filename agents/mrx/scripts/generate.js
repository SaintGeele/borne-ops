import { config } from 'dotenv';
config({ path: '/home/saint/.openclaw/.env' });
import { createClient } from '@supabase/supabase-js';
import { getNextScheduledDate } from './schedule-helper.js';

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

const callOpenRouter = async (prompt, retries = 3) => {
  for (let i = 0; i < retries; i++) {
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
          max_tokens: 3000,
          temperature: 0.85
        })
      });
      const data = await res.json();
      if (data.choices?.[0]?.message?.content) {
        return data.choices[0].message.content.trim();
      }
      console.log(`OpenRouter attempt ${i+1} returned no content, retrying...`);
      await new Promise(r => setTimeout(r, 2000));
    } catch (e) {
      console.log(`OpenRouter attempt ${i+1} failed: ${e.message}`);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  throw new Error('OpenRouter failed after 3 attempts');
};

const GEELE_VOICE = `
You are writing as GEELE EVANS — founder of Borne Systems. Veteran. Systems engineer. Builder.

GEELE'S RAW VOICE (never deviate from this):
"Borne Systems takes the annoying, repetitive work off a business's plate and handles it with AI, but in a way that actually makes sense for how they operate. I focus on things like answering calls, capturing leads, and routing work so nothing slips through the cracks. At the same time, I'm big on security, so everything is built with that in mind from the start. It's not some bloated system or generic setup, it's something practical that just works and helps them make more money. Honestly, it's about making businesses run smoother without adding more chaos."

HORMOZI TECHNIQUES — use at least one per post:
1. HOOK WITH NUMBERS: Start with a specific stat, dollar amount, or painful situation
   GOOD: "549 leads. 0 clients. Here's what I'm doing about it."
   BAD: "Building a business is hard."

2. CONTRAST/BEFORE-AFTER: Show transformation with real numbers
   GOOD: "Before: 8 missed calls/day. After: 0. Cost: $99/month."
   BAD: "Our AI receptionist helps businesses."

3. CALLOUT: Call out the exact person you're writing for
   GOOD: "If you own a small business and you're still answering your own phones at 9pm..."
   BAD: "Business owners should consider AI."

4. VALUE STACK: Make the price feel insane
   GOOD: "24/7 call answering. Lead capture. SMS follow-up. Telegram alerts. Monthly report. $99/month."
   BAD: "Great value for your money."

5. THE ADMISSION: Vulnerability builds trust
   GOOD: "I have 549 leads and 0 clients. I'm posting this anyway."
   BAD: "We're making great progress on our journey."

6. TEACH SOMETHING REAL: Share actual systems and frameworks
   GOOD: "Here's exactly how I built an AI that answers calls at 2am for $99/month:"
   BAD: "AI can help your business in many ways."

7. SOFT CTA: Don't pitch. Leave a door open.
   GOOD: "If this resonates — bornesystems.com"
   BAD: "Click here to buy now! Limited time offer!"

VOICE RULES (non-negotiable):
- Short sentences. 1-3 lines max per paragraph.
- Always say 'Borne Systems' — never 'Borne'
- No buzzwords: "AI-powered", "revolutionary", "game-changer", "cutting-edge", "seamless", "leverage"
- Real numbers only. Never vague.
- Would a tired small business owner at 11pm stop scrolling for this? If not, rewrite.
- Sounds like Geele at a bar explaining what he built. Not a press release.
- Use emojis sparingly — only when they add emphasis, not decoration
- Occasional imperfection is fine — real people don't write perfectly

WHAT YOU CAN REFERENCE:
- Building Borne Systems from scratch as a veteran and systems engineer
- 14 AI agents running autonomously in the background
- (203) 439-4897 — AI answers every call 24/7
- Knox security agent scored 100/100 on hardening — security first mindset
- Content, outreach, and follow-up all automated
- Built by a veteran with 8+ years military systems admin background
- The struggle of building something real with no outside funding
- The mission: help small businesses stop losing money to stuff that should be fixed

WHAT YOU MUST NEVER MENTION:
- Pricing or costs of any service
- Number of leads in pipeline
- Number of clients
- Tech stack details (Node.js, Supabase, OpenClaw, etc.)
- Personal information about Geele
- Specific client names or results

CTA OPTIONS (rotate these):
- bornesystems.com
- geele@bornesystems.com
- (203) 439-4897
`;

const humanize = async (text) => {
  try {
    const fs = await import('fs');
    const { execSync } = await import('child_process');
    const tmpIn = `/tmp/mrx_in_${Date.now()}.txt`;
    const tmpOut = `/tmp/mrx_out_${Date.now()}.txt`;
    fs.writeFileSync(tmpIn, text);
    execSync(`python3 /home/saint/.openclaw/workspace/skills/humanize-ai-text/scripts/transform.py ${tmpIn} -o ${tmpOut}`, { timeout: 15000 });
    const patternCleaned = fs.readFileSync(tmpOut, 'utf8').trim();
    fs.unlinkSync(tmpIn);
    fs.unlinkSync(tmpOut);

    const voicePrompt = `You are editing a social media post written by Geele Evans, founder of Borne Systems.

Make it sound like a real human wrote this. Rules:
- No hyphens used as dashes
- No AI slop: "game-changing", "revolutionary", "seamlessly", "leverage", "innovative", "cutting-edge", "delve", "furthermore", "moreover"
- Short punchy sentences mixed with longer ones
- Sounds like a founder typing at 11pm, not a marketing team
- Keep all numbers and specific facts exactly as they are
- Keep the Hormozi energy — hooks, contrast, specific numbers
- No bullet points unless the original had them

Return ONLY the rewritten post. Nothing else.

POST TO EDIT:
${patternCleaned}`;

    const result = await callOpenRouter(voicePrompt);
    return result || patternCleaned;
  } catch(e) {
    console.log('Humanizer failed, using original:', e.message);
    return text;
  }
};

const generateContent = async () => {
  // Get latest Mercury brief
  const { data: briefs } = await supabase
    .from('activity_log')
    .select()
    .eq('agent_id', 'mercury')
    .eq('action_type', 'weekly_brief')
    .order('created_at', { ascending: false })
    .limit(1);

  if (!briefs || briefs.length === 0) {
    console.log('No Mercury brief found. Run mercury/scripts/brief.js first.');
    return;
  }

  const brief = briefs[0].metadata;
  console.log(`Using brief: ${brief.theme} — ${brief.angle}`);

  const posts = [];

  // Generate LinkedIn posts
  const linkedinTopics = brief.platforms?.linkedin?.topics || [];
  const linkedinSchedule = brief.platforms?.linkedin?.schedule || [];

  for (let i = 0; i < linkedinTopics.length; i++) {
    const topicObj = linkedinTopics[i];
    const topic = typeof topicObj === 'object' ? topicObj.topic : topicObj;
    const technique = typeof topicObj === 'object' ? topicObj.hormozi_technique : 'hook';
    const type = typeof topicObj === 'object' ? topicObj.type : 'founder';
    const scheduledFor = linkedinSchedule[i] || `Tuesday 9am EST`;

    const prompt = `${GEELE_VOICE}

Write a LinkedIn post for Geele Evans (personal account).

TOPIC: ${topic}
CONTENT TYPE: ${type}
HORMOZI TECHNIQUE: ${technique}
CAMPAIGN THEME: ${brief.theme} — ${brief.angle}
TRENDING HOOKS AVAILABLE: ${(brief.trending_hooks || []).join(' | ')}
MILESTONES AVAILABLE: ${(brief.real_milestones || []).join(' | ')}

LINKEDIN SPECIFIC:
- Professional but human. Not corporate.
- 150-300 words optimal
- Line breaks between every 1-2 sentences for mobile readability
- End with a question OR a soft CTA — not both
- First line is the HOOK — make it impossible to scroll past
- DO NOT use hashtags more than 3, only if highly relevant

Return ONLY the post text. No labels, no quotes, no markdown.`;

    const copy = await callOpenRouter(prompt);
    const title = `LinkedIn — ${topic.slice(0, 55)}`;
    console.log(`LinkedIn post ${i + 1} written: ${topic.slice(0, 40)}...`);

    const { data, error: insertError } = await supabase.from('content_bank').insert({
      title,
      copy,
      platform: ['linkedin'],
      type: 'tweet',
      status: 'draft',
      campaign: brief.theme,
      product: brief.product_focus || 'AI Receptionist',
      confidence: 0.85,
      author: 'mrx',
      ts: new Date().toISOString(),
      scheduled_for: getNextScheduledDate(scheduledFor),
      notes: `Schedule: ${scheduledFor} | Technique: ${technique} | Type: ${type}`
    }).select().single();
    if (insertError) console.error('LinkedIn insert error:', insertError.message);

    posts.push({ platform: 'linkedin', topic, id: data?.id, scheduledFor });
    await new Promise(r => setTimeout(r, 1000));
  }

  // Generate Twitter posts
  const twitterTopics = brief.platforms?.twitter?.topics || [];
  const twitterSchedule = brief.platforms?.twitter?.schedule || [];

  for (let i = 0; i < twitterTopics.length; i++) {
    const topicObj = twitterTopics[i];
    const topic = typeof topicObj === 'object' ? topicObj.topic : topicObj;
    const technique = typeof topicObj === 'object' ? topicObj.hormozi_technique : 'hook';
    const type = typeof topicObj === 'object' ? topicObj.type : 'founder';
    const scheduledFor = twitterSchedule[i] || `Wednesday 12pm EST`;

    const prompt = `${GEELE_VOICE}

Write a Twitter/X post for Geele Evans (personal account).

TOPIC: ${topic}
CONTENT TYPE: ${type}
HORMOZI TECHNIQUE: ${technique}
CAMPAIGN THEME: ${brief.theme} — ${brief.angle}
TRENDING HOOKS AVAILABLE: ${(brief.trending_hooks || []).join(' | ')}

TWITTER SPECIFIC:
- Max 280 characters — punchy, direct, no filler
- One sharp idea per tweet
- Contrarian takes perform best
- No hashtags unless essential (max 1)
- First 3 words must hook — people see those before expanding
- End with a statement, not a question (questions = less engagement on Twitter)

Return ONLY the tweet text. No labels, no quotes.`;

    const copy = await callOpenRouter(prompt);
    const title = `X/Twitter — ${topic.slice(0, 55)}`;
    console.log(`Twitter post ${i + 1} written: ${topic.slice(0, 40)}...`);

    const { data, error: insertError } = await supabase.from('content_bank').insert({
      title,
      copy,
      platform: ['twitter'],
      type: 'tweet',
      status: 'draft',
      campaign: brief.theme,
      product: brief.product_focus || 'AI Receptionist',
      confidence: 0.80,
      author: 'mrx',
      ts: new Date().toISOString(),
      scheduled_for: getNextScheduledDate(scheduledFor),
      notes: `Schedule: ${scheduledFor} | Technique: ${technique} | Type: ${type}`
    }).select().single();
    if (insertError) console.error('Twitter insert error:', insertError.message);

    posts.push({ platform: 'twitter', topic, id: data?.id, scheduledFor });
    await new Promise(r => setTimeout(r, 1000));
  }

  // Generate Threads posts
  const threadsTopics = brief.platforms?.threads?.topics || [];
  const threadsSchedule = brief.platforms?.threads?.schedule || [];

  for (let i = 0; i < threadsTopics.length; i++) {
    const topicObj = threadsTopics[i];
    const topic = typeof topicObj === 'object' ? topicObj.topic : topicObj;
    const technique = typeof topicObj === 'object' ? topicObj.hormozi_technique : 'admission';
    const type = typeof topicObj === 'object' ? topicObj.type : 'founder';
    const scheduledFor = threadsSchedule[i] || `Wednesday 8am EST`;

    const prompt = `${GEELE_VOICE}

Write a Threads post for Geele Evans (personal account).

TOPIC: ${topic}
CONTENT TYPE: ${type}
HORMOZI TECHNIQUE: ${technique}
CAMPAIGN THEME: ${brief.theme} — ${brief.angle}

THREADS SPECIFIC:
- Most casual of all platforms — like texting a smart friend
- 3-5 short sentences max
- Conversational, relatable, real
- Emojis welcome but not forced
- Can be vulnerable, behind-the-scenes, raw
- No formal structure — just talk

Return ONLY the post text. No labels, no quotes.`;

    const copy = await callOpenRouter(prompt);
    const title = `Threads — ${topic.slice(0, 55)}`;
    console.log(`Threads post ${i + 1} written: ${topic.slice(0, 40)}...`);

    const { data, error: insertError } = await supabase.from('content_bank').insert({
      title,
      copy,
      platform: ['threads'],
      type: 'tweet',
      status: 'draft',
      campaign: brief.theme,
      product: brief.product_focus || 'AI Receptionist',
      confidence: 0.78,
      author: 'mrx',
      ts: new Date().toISOString(),
      scheduled_for: getNextScheduledDate(scheduledFor),
      notes: `Schedule: ${scheduledFor} | Technique: ${technique} | Type: ${type}`
    }).select().single();
    if (insertError) console.error('Threads insert error:', insertError.message);

    posts.push({ platform: 'threads', topic, id: data?.id, scheduledFor });
    await new Promise(r => setTimeout(r, 1000));
  }

  // Generate LinkedIn Company Page posts (MANUAL COPY-PASTE REQUIRED)
  const companyTopics = brief.platforms?.linkedin_company?.topics || [];
  const companySchedule = brief.platforms?.linkedin_company?.schedule || [];

  for (let i = 0; i < companyTopics.length; i++) {
    const topicObj = companyTopics[i];
    const topic = typeof topicObj === 'object' ? topicObj.topic : topicObj;
    const technique = typeof topicObj === 'object' ? topicObj.hormozi_technique : 'hook';
    const type = typeof topicObj === 'object' ? topicObj.type : 'stats';
    const scheduledFor = companySchedule[i] || 'Tuesday 10am EST';

    const prompt = `${GEELE_VOICE}

Write a LinkedIn post for the BORNE SYSTEMS COMPANY PAGE (not Geele's personal account).

TOPIC: ${topic}
CONTENT TYPE: ${type}
HORMOZI TECHNIQUE: ${technique}
CAMPAIGN THEME: ${brief.theme}

COMPANY PAGE SPECIFIC:
- This is the Borne Systems brand voice, not Geele's personal voice
- Focus on AI news, tech trends, cybersecurity stats, small business insights
- Position Borne Systems as an authority in AI automation for small businesses
- Educational and informative — build brand credibility
- 150-250 words
- End with a soft CTA: bornesystems.com or geele@bornesystems.com
- No pricing, no lead counts, no tech stack

Return ONLY the post text. No labels, no quotes.`;

    const rawCopy = await callOpenRouter(prompt);
    const copy = await humanize(rawCopy);
    const title = `[MANUAL POST] LinkedIn Company — ${topic.slice(0, 45)}`;
    console.log(`LinkedIn Company post ${i + 1} written: ${topic.slice(0, 40)}...`);

    const { data, error: insertError } = await supabase.from('content_bank').insert({
      title,
      copy,
      platform: ['linkedin_company'],
      type: 'tweet',
      status: 'draft',
      campaign: brief.theme,
      product: brief.product_focus || 'Borne Systems',
      confidence: 0.85,
      author: 'mrx',
      ts: new Date().toISOString(),
      scheduled_for: getNextScheduledDate(scheduledFor),
      notes: `⚠️ MANUAL COPY-PASTE REQUIRED → Post to Borne Systems LinkedIn Company Page: https://www.linkedin.com/company/112594293/ | Schedule: ${scheduledFor} | Technique: ${technique}`
    }).select().single();
    if (insertError) console.error('LinkedIn Company insert error:', insertError.message);

    posts.push({ platform: 'linkedin_company', topic, id: data?.id, scheduledFor });
    await new Promise(r => setTimeout(r, 1000));
  }

  // Log to Chronicle
  await supabase.from('activity_log').insert({
    agent_id: 'mrx',
    action_type: 'content_generated',
    title: `Content batch generated — Theme: ${brief.theme}`,
    description: `${posts.filter(p => p.platform === 'linkedin').length} LinkedIn + ${posts.filter(p => p.platform === 'twitter').length} Twitter + ${posts.filter(p => p.platform === 'threads').length} Threads posts written`,
    metadata: { theme: brief.theme, posts_count: posts.length, posts }
  });

  const linkedinCount = posts.filter(p => p.platform === 'linkedin').length;
  const twitterCount = posts.filter(p => p.platform === 'twitter').length;
  const threadsCount = posts.filter(p => p.platform === 'threads').length;
  const companyCount = posts.filter(p => p.platform === 'linkedin_company').length;

  const msg = `✍️ MrX Content Ready — ${brief.theme}

${linkedinCount} LinkedIn posts (Geele personal — auto-publishes)
${twitterCount} Twitter posts (@BorneSystems — auto-publishes)
${threadsCount} Threads posts (@BorneSystems — auto-publishes)
${companyCount} LinkedIn Company posts (⚠️ MANUAL COPY-PASTE → linkedin.com/company/112594293)

Approve auto-publish posts in Mission Control.
Company page posts saved with [MANUAL POST] label.

Theme: ${brief.theme}
Angle: ${brief.angle}`;

  console.log(msg);
  await sendTelegram(msg);
  console.log('MrX content generation complete.');
};

generateContent();
