import { config } from 'dotenv';
config({ path: '/home/saint/.openclaw/.env' });
import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { report, reportError } from '../../ops/discord-reporter.js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const OUTPUT_FILE = join(process.cwd(), 'beacon', 'rank-report.json');
const BRAND_NAME = process.env.BUSINESS_NAME || 'Borne Systems';

const TARGET_KEYWORDS = [
  'AI receptionist Connecticut',
  'AI receptionist New Haven CT',
  'cybersecurity small business Connecticut',
  'cybersecurity small business CT',
  'AI automation small business New Haven',
  'AI automation New Haven Connecticut',
  'virtual receptionist CT',
  'small business automation Connecticut',
  'AI services small business Connecticut',
  'AI receptionist service New England',
];

const sendTelegram = async (message) => {
  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message, parse_mode: 'HTML' })
  });
};

const searchTavily = async (query) => {
  if (!TAVILY_API_KEY) return null;
  try {
    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TAVILY_API_KEY}` },
      body: JSON.stringify({ query, max_results: 10 })
    });
    return await res.json();
  } catch { return null; }
};

const readPreviousReport = () => {
  try {
    if (!existsSync(OUTPUT_FILE)) return null;
    return JSON.parse(readFileSync(OUTPUT_FILE, 'utf8'));
  } catch { return null; }
};

const findBrandRank = (results, brandName) => {
  if (!results) return null;
  const brandLower = brandName.toLowerCase();
  const website = 'bornesystems.com';
  for (let i = 0; i < results.length; i++) {
    const title = (results[i].title || '').toLowerCase();
    const url = (results[i].url || '').toLowerCase();
    if (title.includes(brandLower) || url.includes(website)) {
      return { position: i + 1, title: results[i].title, url: results[i].url };
    }
  }
  return null;
};

const runRankTracker = async () => {
  console.log('[Rank Tracker] Starting...');
  const previous = readPreviousReport();
  const prevMap = {};
  if (previous?.results) previous.results.forEach(r => { prevMap[r.keyword] = r.position; });

  const results = [];
  const checkedAt = new Date().toISOString();

  for (const keyword of TARGET_KEYWORDS) {
    console.log(`[Rank Tracker] "${keyword}"...`);
    const searchResult = await searchTavily(keyword);
    const rank = findBrandRank(searchResult?.results, BRAND_NAME);

    const entry = {
      keyword,
      position: rank?.position || null,
      url: rank?.url || null,
      title: rank?.title || null,
      checked_at: checkedAt,
    };

    if (prevMap[keyword] !== undefined) {
      entry.previous_position = prevMap[keyword];
      entry.delta = (prevMap[keyword] || 999) - (entry.position || 999);
    }

    results.push(entry);
    if (rank) console.log(`[Rank Tracker]   → #${rank.position}`);
    else console.log(`[Rank Tracker]   → Not found`);

    await new Promise(r => setTimeout(r, 1500));
  }

  const found = results.filter(r => r.position !== null);
  const report = {
    business: BRAND_NAME,
    checked_at: checkedAt,
    previous_checked_at: previous?.checked_at || null,
    results,
    summary: {
      tracked: results.length,
      found: found.length,
      not_found: results.length - found.length,
      avg_position: found.length ? Math.round(found.reduce((sum, r) => sum + r.position, 0) / found.length) : null,
      top_position: found.length ? Math.min(...found.map(r => r.position)) : null,
    }
  };

  writeFileSync(OUTPUT_FILE, JSON.stringify(report, null, 2));

  await supabase.from('activity_log').insert({
    agent_id: 'beacon',
    action_type: 'rank_tracking',
    title: `Rank tracker: ${report.summary.found}/${report.summary.tracked} found, avg #${report.summary.avg_position || 'N/A'}`,
    description: `${TARGET_KEYWORDS.length} keywords tracked`,
    metadata: { summary: report.summary }
  });

  const header = `${'Keyword'.padEnd(40)} ${'Now'.padEnd(7)} ${'Prev'.padEnd(7)} ${'Δ'}`;
  const rows = results.map(r => {
    const kw = r.keyword.length > 39 ? r.keyword.substring(0, 38) + '…' : r.keyword;
    const posStr = r.position ? `#${r.position}` : 'Not found';
    const prevStr = r.previous_position ? `#${r.previous_position}` : '—';
    const deltaStr = r.delta !== undefined ? (r.delta > 0 ? `+${r.delta}` : r.delta === 0 ? '0' : `${r.delta}`) : '';
    return `${kw.padEnd(40)} ${posStr.padEnd(7)} ${prevStr.padEnd(7)} ${deltaStr}`;
  });

  const deltas = results.filter(r => r.delta !== undefined);
  const improved = deltas.filter(r => r.delta > 0).length;
  const declined = deltas.filter(r => r.delta < 0).length;

  const msg = [
    `🔍 <b>Local Rank Tracker</b>`,
    ``,
    `${new Date(checkedAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`,
    ``,
    `\`${header}\``,
    ...rows.map(r => `\`${r}\``),
    ``,
    `<b>Summary:</b>`,
    `Found: ${report.summary.found}/${report.summary.tracked}`,
    report.summary.avg_position ? `Avg: #${report.summary.avg_position}` : '',
    report.summary.top_position ? `Best: #${report.summary.top_position}` : '',
    ``,
    previous ? `<b>Change:</b> ${improved} 📈 ${declined} 📉 ${deltas.length - improved - declined} ➖` : '',
    ``,
    `Report: ${OUTPUT_FILE}`
  ].filter(Boolean).join('\n');

  console.log(msg);
  await sendTelegram(msg);

  const status = declined > improved ? 'warning' : improved > 0 ? 'success' : 'info';
  await report('beacon', {
    title: `Rank Tracker — ${report.summary.found}/${report.summary.tracked} found`,
    summary: `Tracked ${report.summary.tracked} keywords. ${improved} improved, ${declined} declined.`,
    details: rows.slice(0, 10).join('\n'),
    status,
    nextAction: declined > 0 ? `Review ${declined} keywords that lost position` : 'Continue monitoring'
  }).catch(() => {});
};

runRankTracker().catch(async (e) => {
  console.error('[Rank Tracker] Fatal:', e.message);
  await reportError('beacon', e.message, 'rank-tracker.js — SEO rank tracking').catch(() => {});
  process.exit(1);
});
