import { config } from 'dotenv';
config({ path: '/home/saint/.openclaw/.env' });
import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { report, reportError } from '../../ops/discord-reporter.js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const OUTPUT_FILE = join(process.cwd(), 'beacon', 'gbp-report.json');

const CANONICAL = {
  name: process.env.BUSINESS_NAME || 'Borne Systems',
  website: process.env.BUSINESS_WEBSITE || 'https://bornesystems.com',
  phone: process.env.BUSINESS_PHONE || '',
  address: process.env.BUSINESS_ADDRESS || '',
  city: process.env.BUSINESS_CITY || '',
  state: process.env.BUSINESS_STATE || '',
  zip: process.env.BUSINESS_ZIP || '',
  hours: process.env.BUSINESS_HOURS || '',
  description: process.env.BUSINESS_DESCRIPTION || 'AI automation and cybersecurity services for small businesses.',
  categories: (process.env.BUSINESS_CATEGORIES || 'AI Automation, Cybersecurity').split(',').map(s => s.trim()),
};

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
      body: JSON.stringify({ query, max_results: 5, include_answer: true })
    });
    return await res.json();
  } catch { return null; }
};

const checkListingInfo = async () => {
  const issues = [];
  const recommendations = [];

  const result = await searchTavily(`${CANONICAL.name} Google Business Profile`);
  const found = result?.results?.[0];

  if (!found) {
    issues.push({ field: 'listing_found', severity: 'critical', current: 'No GBP listing found', recommended: 'Claim and verify GBP listing immediately' });
    return { issues, recommendations, found: null };
  }

  const pageContent = (result.answer || '') + (found.url || '');
  const domain = CANONICAL.website.replace('https://', '').replace('http://', '').split('/')[0];
  if (!pageContent.toLowerCase().includes(domain)) {
    issues.push({ field: 'website', severity: 'high', current: 'Website may not be linked', recommended: `Set ${CANONICAL.website} as website URL` });
  }

  const phoneNorm = (p) => (p || '').replace(/\D/g, '');
  if (CANONICAL.phone && !pageContent.includes(phoneNorm(CANONICAL.phone).substring(7))) {
    issues.push({ field: 'phone', severity: 'high', current: 'Phone not confirmed', recommended: `Ensure ${CANONICAL.phone} is set` });
  }

  if (!result.answer || result.answer.length < 100) {
    recommendations.push({ field: 'description', severity: 'medium', current: 'Description missing or short', recommended: 'Add 200-750 word description' });
  }

  const hasRelevantCategory = CANONICAL.categories.some(c => pageContent.toLowerCase().includes(c.toLowerCase()));
  if (!hasRelevantCategory) {
    recommendations.push({ field: 'categories', severity: 'medium', current: 'Primary category unclear', recommended: 'Set primary category to AI Automation or Cybersecurity' });
  }

  if (result.answer && !result.answer.match(/week|month|post/i)) {
    recommendations.push({ field: 'posts', severity: 'medium', current: 'No recent posts detected', recommended: 'Post on GBP weekly — offers, updates, events' });
  }

  return { issues, recommendations, found: found.url };
};

const rankByImpact = (items) => {
  const order = { critical: 0, high: 1, medium: 2, low: 3 };
  return items.sort((a, b) => order[a.severity] - order[b.severity]);
};

const runGbpOptimization = async () => {
  console.log('[GBP] Starting GBP optimization check...');
  const { issues, recommendations, found } = await checkListingInfo();

  const report = {
    business: CANONICAL.name,
    checked_at: new Date().toISOString(),
    listing_url: found || 'Not found',
    issues: rankByImpact(issues),
    recommendations: rankByImpact(recommendations),
    gbp_url: 'https://business.google.com',
    total_actionable: issues.length + recommendations.length,
  };

  writeFileSync(OUTPUT_FILE, JSON.stringify(report, null, 2));

  await supabase.from('activity_log').insert({
    agent_id: 'beacon',
    action_type: 'gbp_optimization',
    title: `GBP audit: ${report.total_actionable} actionable items`,
    description: `${issues.length} issues, ${recommendations.length} recommendations`,
    metadata: { issues: issues.length, recommendations: recommendations.length, listing_found: !!found }
  });

  const emoji = (s) => ({ critical: '🔴', high: '🟠', medium: '🟡', low: '🟢' }[s] || '⚪');
  const issueLines = rankByImpact(issues).map(i => `${emoji(i.severity)} ${i.field}: ${i.current}\n   → ${i.recommended}`);
  const recLines = rankByImpact(recommendations).slice(0, 5).map(r => `${emoji(r.severity)} ${r.field}: ${r.recommended}`);

  const msg = [
    `📍 <b>GBP Optimization Report</b>`,
    ``,
    `Listing: ${found ? `<a href="${found}">Found</a>` : '❌ NOT FOUND'}`,
    `Actionable items: ${report.total_actionable}`,
    ``,
    issues.length ? `<b>ISSUES (${issues.length})</b>` : '',
    ...issueLines,
    ``,
    recommendations.length ? `<b>RECOMMENDATIONS (${recommendations.length})</b>` : '',
    ...recLines,
    recommendations.length > 5 ? `  … and ${recommendations.length - 5} more` : '',
    ``,
    `Full report: ${OUTPUT_FILE}`
  ].filter(Boolean).join('\n');

  console.log(msg);
  await sendTelegram(msg);

  await report('beacon', {
    title: `GBP Optimization — ${report.total_actionable} actionable items`,
    summary: `${issues.length} issues found. ${recommendations.length} recommendations. Listing ${found ? 'found' : 'NOT FOUND'}.`,
    details: `Actionable: ${report.total_actionable}\n${issueLines.slice(0, 3).join('\n')}`,
    status: issues.length === 0 ? 'success' : issues.length < 5 ? 'warning' : 'error',
    nextAction: issues.length > 0 ? `Address ${issues.length} GBP issues` : 'GBP listing healthy'
  }).catch(() => {});
};

runGbpOptimization().catch(async (e) => {
  console.error('[GBP] Fatal:', e.message);
  await reportError('beacon', e.message, 'gbp.js — Beacon GBP optimization').catch(() => {});
  process.exit(1);
});
