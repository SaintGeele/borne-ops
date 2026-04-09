import { config } from 'dotenv';
config({ path: '/home/saint/.openclaw/.env' });
import { createClient } from '@supabase/supabase-js';
import { report, reportError } from '../../ops/discord-reporter.js';

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

const callOpenRouter = async (prompt) => {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://bornesystems.com',
      'X-Title': 'Borne Systems Mercury'
    },
    body: JSON.stringify({
      model: 'minimax/minimax-m2.5',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 3000,
      temperature: 0.7
    })
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim();
};

const searchTrends = async () => {
  const searches = [
    'AI small business statistics 2026',
    'cybersecurity small business breach cost 2026',
    'missed calls small business revenue loss statistics',
    'AI automation startup news this week',
    'small business technology adoption trends 2026'
  ];

  const results = [];
  for (const query of searches) {
    try {
      const res = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.TAVILY_API_KEY}`
        },
        body: JSON.stringify({
          query,
          max_results: 2,
          search_depth: 'basic',
          include_answer: true
        })
      });
      const data = await res.json();
      if (data.results) {
        results.push(...data.results.map(r => ({
          title: r.title,
          url: r.url,
          snippet: r.content?.slice(0, 200),
          answer: data.answer
        })));
      }
    } catch(e) {
      console.log(`Search failed: ${query}`);
    }
  }
  return results.slice(0, 8);
};

const generateBrief = async () => {
  const now = new Date();
  const weekStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  console.log('Searching for trending stats and news...');
  const trends = await searchTrends();
  const trendsSummary = trends.map(t => `- ${t.title}: ${t.snippet}`).join('\n');

  const prompt = `You are Mercury, the Marketing Strategist for Borne Systems.

ABOUT GEELE EVANS:
- Veteran with 8+ years military systems administration background
- Founder of Borne Systems — building AI automation for small businesses
- Direct, no BS, earned everything the hard way
- Comfortable being the face of Borne Systems but not on video yet
- Goal: help small businesses grow and make more money

CONTENT RULES (non-negotiable):
- NO pricing or costs mentioned ever
- NO lead counts or pipeline numbers
- NO tech stack details
- NO personal information
- NO client names or specific client results
- DO post: behind the scenes building, founder journey struggles, industry stats, AI/tech/cybersecurity news with Geele's spin

CONTENT GOALS:
- Get small business owners to reach out to Borne Systems
- Build trust and authority as a veteran systems engineer who builds practical AI
- Show the value of AI automation without being salesy
- CTA rotates between: bornesystems.com | geele@bornesystems.com | (203) 439-4897

TARGET AUDIENCES ON LINKEDIN:
- HVAC companies, plumbers, electricians, contractors
- Real estate agents
- Salons, barber shops, auto detailing
- Pest control, landscaping, junk removal, fencing
- Pool maintenance, property management
- Veterinary clinics, accounting firms
- Commercial cleaning, self-storage

CONTENT MIX (stick to this ratio):
- 40% Industry stats/news — AI, cybersecurity, small business tech, startup news — add Geele's perspective as a veteran systems engineer
- 35% Founder journey — real struggles building Borne Systems, behind the scenes, lessons learned, honest building in public
- 25% Educational — what small businesses are losing (missed calls, no follow-up, manual work) without pitching

HORMOZI TECHNIQUES:
- Hook with a stat or painful truth
- Specific numbers from research (not from Borne Systems pipeline)
- Before/after scenarios
- The admission — honest about the struggle
- Soft CTA — never a hard sell

POSTING SCHEDULE (data-backed 2026 EST):
- LinkedIn personal (Geele): Tue-Thu 9am & 12pm
- Twitter personal: Tue-Thu 9am, 12pm, 5pm
- Threads personal: Wed-Thu 8am, 12pm, 7pm

TRENDING STATS AND NEWS THIS WEEK:
${trendsSummary}

Generate a weekly content brief. Return ONLY valid JSON:
{
  "week": "${weekStr}",
  "theme": "one word theme",
  "angle": "the main story this week",
  "content_focus": "what aspect of Geele's journey or industry stats drives this week",
  "trending_stats": [
    {"stat": "specific statistic from research", "source": "source name", "angle": "how Geele would spin this"}
  ],
  "founder_moments": [
    "a real behind-the-scenes moment to share this week related to building Borne Systems"
  ],
  "platforms": {
    "linkedin": {
      "posts_count": 3,
      "account": "personal",
      "tone": "founder building in public, direct, veteran perspective",
      "schedule": ["Tuesday 9am EST", "Wednesday 12pm EST", "Thursday 9am EST"],
      "topics": [
        {"topic": "topic description", "type": "stats|founder|educational", "hormozi_technique": "hook|contrast|callout|admission|teach", "cta": "bornesystems.com|geele@bornesystems.com|(203) 439-4897"}
      ]
    },
    "twitter": {
      "posts_count": 5,
      "account": "BorneSystems",
      "tone": "punchy, direct, contrarian, veteran systems engineer",
      "schedule": ["Tuesday 12pm EST", "Wednesday 9am EST", "Wednesday 5pm EST", "Thursday 12pm EST", "Thursday 5pm EST"],
      "topics": [
        {"topic": "topic description", "type": "stats|founder|educational", "hormozi_technique": "hook|contrast|callout|admission|teach", "cta": "bornesystems.com|geele@bornesystems.com|(203) 439-4897"}
      ]
    },
    "threads": {
      "posts_count": 3,
      "account": "BorneSystems",
      "tone": "casual, honest, behind the scenes",
      "schedule": ["Wednesday 8am EST", "Wednesday 7pm EST", "Thursday 12pm EST"],
      "topics": [
        {"topic": "topic description", "type": "stats|founder|educational", "hormozi_technique": "hook|contrast|callout|admission|teach", "cta": "bornesystems.com|geele@bornesystems.com|(203) 439-4897"}
      ]
    },
    "linkedin_company": {
      "posts_count": 3,
      "account": "Borne Systems Company Page — MANUAL COPY-PASTE REQUIRED",
      "url": "https://www.linkedin.com/company/112594293/",
      "tone": "brand authority, educational, AI and tech focused",
      "schedule": ["Monday 10am EST", "Wednesday 10am EST", "Friday 10am EST"],
      "topics": [
        {"topic": "AI or cybersecurity or small business tech news/stat with Borne Systems angle", "type": "stats|news|educational", "hormozi_technique": "hook|contrast|teach", "cta": "bornesystems.com|geele@bornesystems.com"}
      ]
    }
  },
  "avoid": "what NOT to do this week",
  "notes": "strategic notes for MrX"
}`;

  const raw = await callOpenRouter(prompt);
  const cleaned = raw.replace(/```json|```/g, '').trim();
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON found in response');
  // Clean control characters that break JSON.parse
  const sanitized = jsonMatch[0]
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, ' ')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '')
    .replace(/([^\\])\\([^"\\/bfnrtu])/g, '$1 $2');
  let brief;
  try {
    brief = JSON.parse(sanitized);
  } catch(e) {
    // Fallback: try extracting with a more aggressive clean
    const ultraClean = jsonMatch[0].replace(/[^\x20-\x7E\n\r\t]/g, '').replace(/\n\s*/g, ' ');
    brief = JSON.parse(ultraClean);
  }

  await supabase.from('activity_log').insert({
    agent_id: 'mercury',
    action_type: 'weekly_brief',
    title: `Weekly brief — ${weekStr} — Theme: ${brief.theme}`,
    description: brief.angle,
    metadata: brief
  });

  const statsPreview = (brief.trending_stats || []).slice(0, 3).map(s => `• ${s.stat}`).join('\n');

  const msg = `📋 Mercury Weekly Brief — ${weekStr}

THEME: ${brief.theme}
ANGLE: ${brief.angle}
FOCUS: ${brief.content_focus}

TRENDING STATS TO USE:
${statsPreview}

LINKEDIN: ${brief.platforms.linkedin.posts_count} posts
TWITTER: ${brief.platforms.twitter.posts_count} posts
THREADS: ${brief.platforms.threads.posts_count} posts

AVOID: ${brief.avoid}
NOTES: ${brief.notes}`;

  console.log(msg);
  await sendTelegram(msg);
  console.log('Mercury brief complete.');

  await report('mercury', {
    title: `Weekly Brief — ${weekStr}`,
    summary: `Theme: ${brief.theme} | Angle: ${brief.angle}`,
    details: `Focus: ${brief.content_focus}\nLinkedIn: ${brief.platforms?.linkedin?.posts_count} posts\nTwitter: ${brief.platforms?.twitter?.posts_count} posts`,
    status: 'success',
    nextAction: 'MrX to execute content plan from brief'
  }).catch(() => {});

  return brief;
};

generateBrief().catch(async (e) => {
  console.error('[Mercury] Brief failed:', e.message);
  await reportError('mercury', e.message, 'brief.js — Mercury weekly brief').catch(() => {});
  process.exit(1);
});
