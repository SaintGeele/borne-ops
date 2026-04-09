import { config } from 'dotenv';
config({ path: '/home/saint/.openclaw/.env' });
import { createClient } from '@supabase/supabase-js';
import { report, reportError } from '../../ops/discord-reporter.js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const QUEUE_FILE = join(process.cwd(), 'nova', 'nova-queue.json');

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
      max_tokens: 4000,
      temperature: 0.7
    })
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim();
};

const searchTrends = async () => {
  if (!TAVILY_API_KEY) {
    console.warn('[Mercury Calendar] TAVILY_API_KEY not set, skipping trend search');
    return [];
  }

  const queries = [
    'AI small business automation trends 2026',
    'cybersecurity threats small business 2026',
    'local service business technology adoption',
    'AI receptionist industry news 2026'
  ];

  const results = [];
  for (const query of queries) {
    try {
      const res = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TAVILY_API_KEY}` },
        body: JSON.stringify({ query, max_results: 2, include_answer: true })
      });
      const data = await res.json();
      if (data.results) {
        results.push(...data.results.map(r => ({ title: r.title, snippet: r.content?.slice(0, 150), answer: data.answer })));
      }
    } catch (e) {
      console.warn(`[Mercury Calendar] Trend search failed: ${query}`);
    }
  }
  return results.slice(0, 10);
};

const readQueue = () => {
  try {
    if (!existsSync(QUEUE_FILE)) return [];
    return JSON.parse(readFileSync(QUEUE_FILE, 'utf8'));
  } catch { return []; }
};

const appendQueue = (items) => {
  const existing = readQueue();
  const updated = [...existing, ...items];
  writeFileSync(QUEUE_FILE, JSON.stringify(updated, null, 2));
};

const generateCalendar = async () => {
  const now = new Date();
  const weekStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  console.log('[Mercury Calendar] Searching trends...');
  const trends = await searchTrends();
  const trendsSummary = trends.map(t => `- ${t.title}: ${t.snippet}`).join('\n');

  const prompt = `You are Mercury, the Marketing Strategist for Borne Systems.

ABOUT BORNE SYSTEMS:
Borne Systems — AI automation and cybersecurity for small businesses. Founded by Geele Evans.

THIS WEEK'S TRENDING RESEARCH:
${trendsSummary || 'No trend data — use general industry knowledge.'}

YOUR TASK:
Build a 7-day content calendar. For each day, generate 1 content brief per platform: X, LinkedIn, Instagram.

CONTENT RULES:
- NO pricing, costs, pipeline numbers, tech stack, personal info, or client names
- 40% industry stats/news, 35% founder journey, 25% educational
- CTA rotates: bornesystems.com | geele@bornesystems.com | (203) 439-4897

PLATFORMS:
- X: punchy, direct, veteran systems voice
- LinkedIn: founder building in public, professional
- Instagram: visual-friendly hooks, story-style angles

FOR EACH DAY provide:
- date (YYYY-MM-DD)
- platform
- brief (2-3 sentence content idea with hook, angle, CTA)
- scheduled_at (YYYY-MM-DDTHH:00:00Z — use 9am EST = 14:00 UTC or 12pm EST = 17:00 UTC)
- topic_tag (stats | founder | educational)
- image_suggestion (visual direction or null)

Return ONLY valid JSON array:
[
  {
    "id": "timestamp-based id",
    "date": "2026-04-07",
    "platform": "x|linkedin|instagram",
    "brief": "Full post content",
    "scheduled_at": "2026-04-07T14:00:00Z",
    "topic_tag": "stats|founder|educational",
    "image_suggestion": "visual direction or null",
    "status": "pending",
    "author": "mercury"
  }
]

Generate 15-21 total entries. Make briefs actionable and specific.`;

  const raw = await callOpenRouter(prompt);
  const cleaned = raw.replace(/```json|```/g, '').trim();
  const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('No JSON array found');

  let calendar;
  try {
    const sanitized = jsonMatch[0].replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, ' ').replace(/\n/g, '\\n').replace(/\r/g, '');
    calendar = JSON.parse(sanitized);
  } catch {
    const ultraClean = jsonMatch[0].replace(/[^\x20-\x7E\n\r\t]/g, '').replace(/\n\s*/g, ' ');
    calendar = JSON.parse(ultraClean);
  }

  const enriched = calendar.map((item, idx) => ({
    ...item,
    id: `mercury_${Date.now()}_${idx}`,
    brief: item.brief,
    platforms: [item.platform],
    image_url: item.image_suggestion === 'null' ? null : item.image_suggestion,
    scheduled_at: item.scheduled_at || `${item.date}T14:00:00Z`,
    status: 'pending',
    created_by: 'mercury'
  }));

  appendQueue(enriched);

  await supabase.from('activity_log').insert({
    agent_id: 'mercury',
    action_type: 'calendar_generated',
    title: `7-day calendar — ${weekStr}`,
    description: `${enriched.length} posts generated`,
    metadata: { posts: enriched.length, platforms: ['x', 'linkedin', 'instagram'] }
  });

  const byPlatform = { x: 0, linkedin: 0, instagram: 0 };
  enriched.forEach(p => byPlatform[p.platform] = (byPlatform[p.platform] || 0) + 1);

  const msg = [
    `📅 <b>Mercury 7-Day Calendar</b>\n\n${weekStr}\n\nPosts: ${enriched.length}`,
    `• X: ${byPlatform.x || 0}`,
    `• LinkedIn: ${byPlatform.linkedin || 0}`,
    `• Instagram: ${byPlatform.instagram || 0}`,
    `\nAll appended to nova-queue.json.`
  ].join('\n');

  console.log(msg);
  await sendTelegram(msg);

  await report('mercury', {
    title: `7-Day Calendar — ${enriched.length} posts queued`,
    summary: `Generated ${enriched.length} posts: X: ${byPlatform.x || 0}, LinkedIn: ${byPlatform.linkedin || 0}, Instagram: ${byPlatform.instagram || 0}`,
    details: msg,
    status: enriched.length > 0 ? 'success' : 'warning',
    nextAction: 'Nova to execute queued posts'
  }).catch(() => {});

  return enriched;
};

generateCalendar().catch(async (e) => {
  console.error('[Mercury Calendar] Fatal:', e.message);
  await reportError('mercury', e.message, 'calendar.js — Mercury 7-day calendar').catch(() => {});
  process.exit(1);
});
