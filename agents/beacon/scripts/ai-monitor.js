import { config } from 'dotenv';
config({ path: '/home/saint/.openclaw/.env' });
import { createClient } from '@supabase/supabase-js';
import { writeFileSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { report, reportError } from '../../ops/discord-reporter.js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const OUTPUT_FILE = join(process.cwd(), 'beacon', 'ai-citations-report.json');
const BRAND_NAME = process.env.BUSINESS_NAME || 'Borne Systems';
const BRAND_DOMAIN = 'bornesystems.com';

const AI_SEARCH_PROMPTS = [
  'best AI receptionist for small business',
  'AI automation services for small business Connecticut',
  'cybersecurity service for small business New Haven',
  'virtual receptionist for medspa or salon',
  'best AI phone assistant for dental practice',
  'AI automation for local service business',
  'small business cybersecurity solutions affordable',
  'AI receptionist vs live receptionist cost benefit',
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
      body: JSON.stringify({ query, max_results: 10, include_answer: true })
    });
    return await res.json();
  } catch { return null; }
};

const checkBrandCitation = (result) => {
  if (!result) return { cited: false, method: null };

  const text = [
    result.answer || '',
    ...(result.results || []).map(r => `${r.title || ''} ${r.url || ''}`).join(' ')
  ].join(' ').toLowerCase();

  const brandLower = BRAND_NAME.toLowerCase();
  const domainLower = BRAND_DOMAIN.toLowerCase();

  if (text.includes(domainLower)) {
    return { cited: true, method: 'domain_mention', snippet: text.substring(Math.max(0, text.indexOf(domainLower) - 30), text.indexOf(domainLower) + 60) };
  }
  if (text.includes(brandLower.split(' ')[0])) {
    return { cited: true, method: 'brand_mention', snippet: text.substring(Math.max(0, text.indexOf(brandLower) - 30), text.indexOf(brandLower) + 60) };
  }

  return { cited: false, method: null, snippet: result.answer || '' };
};

const readPreviousReport = () => {
  try {
    if (!existsSync(OUTPUT_FILE)) return null;
    return JSON.parse(readFileSync(OUTPUT_FILE, 'utf8'));
  } catch { return null; }
};

const runAiMonitor = async () => {
  console.log('[AI Monitor] Starting AI search citation monitoring...');
  const previous = readPreviousReport();
  const prevMap = {};
  if (previous?.results) previous.results.forEach(r => { prevMap[r.prompt] = r.cited; });

  const results = [];
  const checkedAt = new Date().toISOString();

  for (const prompt of AI_SEARCH_PROMPTS) {
    console.log(`[AI Monitor] "${prompt}"...`);
    const searchResult = await searchTavily(prompt);
    const citation = checkBrandCitation(searchResult);

    results.push({
      prompt,
      cited: citation.cited,
      method: citation.method,
      snippet: citation.snippet || null,
      cited_by_url: citation.cited ? (searchResult?.results?.find(r => (r.url || '').toLowerCase().includes(BRAND_DOMAIN))?.url || null) : null,
      checked_at: checkedAt,
    });

    if (citation.cited) console.log(`[AI Monitor]   → CITED via ${citation.method}`);
    else console.log(`[AI Monitor]   → Not cited`);

    await new Promise(r => setTimeout(r, 1500));
  }

  const report = {
    business: BRAND_NAME,
    checked_at: checkedAt,
    previous_checked_at: previous?.checked_at || null,
    prompts: AI_SEARCH_PROMPTS,
    results,
    summary: {
      total: results.length,
      cited: results.filter(r => r.cited).length,
      not_cited: results.filter(r => !r.cited).length,
      citation_rate: Math.round((results.filter(r => r.cited).length / results.length) * 100),
    }
  };

  writeFileSync(OUTPUT_FILE, JSON.stringify(report, null, 2));

  await supabase.from('activity_log').insert({
    agent_id: 'beacon',
    action_type: 'ai_citation_monitor',
    title: `AI citations: ${report.summary.cited}/${report.summary.total} (${report.summary.citation_rate}%)`,
    description: `${report.summary.citation_rate}% citation rate`,
    metadata: { summary: report.summary }
  });

  const cited = results.filter(r => r.cited);
  const notCited = results.filter(r => !r.cited);
  const prevRate = previous?.summary?.citation_rate || 0;
  const rateDelta = report.summary.citation_rate - prevRate;

  const msg = [
    `🤖 <b>AI Search Citation Monitor</b>`,
    ``,
    `${new Date(checkedAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`,
    ``,
    `<b>Citation Rate: ${report.summary.citation_rate}%</b> (${report.summary.cited}/${report.summary.total})`,
    previous ? `Previous: ${prevRate}% | Change: ${rateDelta > 0 ? '+' : ''}${rateDelta}%` : '',
    ``,
    cited.length ? `<b>CITED (${cited.length})</b>` : '',
    ...cited.map(r => `  ✅ ${r.prompt}`),
    notCited.length ? `<b>NOT CITED (${notCited.length})</b>` : '',
    ...notCited.map(r => `  ❌ ${r.prompt}`),
    ``,
    `Report: ${OUTPUT_FILE}`
  ].filter(Boolean).join('\n');

  console.log(msg);
  await sendTelegram(msg);

  await report('beacon', {
    title: `AI Monitor — Citation Rate ${report.summary.citation_rate}%`,
    summary: `${report.summary.cited}/${report.summary.total} citations found. Rate: ${report.summary.citation_rate}%`,
    details: `Cited: ${cited.length}\nNot cited: ${notCited.length}\nRate change: ${rateDelta > 0 ? '+' : ''}${rateDelta}%`,
    status: report.summary.citation_rate < 50 ? 'error' : report.summary.citation_rate < 75 ? 'warning' : 'success',
    nextAction: notCited.length > 0 ? `Improve ${notCited.length} uncited sources` : 'Citation rate healthy'
  }).catch(() => {});
};

runAiMonitor().catch(async (e) => {
  console.error('[AI Monitor] Fatal:', e.message);
  await reportError('beacon', e.message, 'ai-monitor.js — Beacon AI citation monitor').catch(() => {});
  process.exit(1);
});
