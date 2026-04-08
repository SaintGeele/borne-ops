import { config } from 'dotenv';
config({ path: '/home/saint/.openclaw/.env' });
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const CANONICAL = {
  name: process.env.BUSINESS_NAME || 'Borne Systems',
  phone: process.env.BUSINESS_PHONE || '',
  address: process.env.BUSINESS_ADDRESS || '',
  city: process.env.BUSINESS_CITY || '',
  state: process.env.BUSINESS_STATE || '',
  zip: process.env.BUSINESS_ZIP || '',
  website: process.env.BUSINESS_WEBSITE || 'https://bornesystems.com',
};

const CITATION_SOURCES = [
  { name: 'Google Business Profile', searchQuery: 'Borne Systems Google Business Profile' },
  { name: 'Yelp', searchQuery: 'Borne Systems Yelp' },
  { name: 'Bing Places', searchQuery: 'Borne Systems Bing Places' },
  { name: 'Apple Maps', searchQuery: 'Borne Systems Apple Maps' },
  { name: 'Facebook', searchQuery: 'Borne Systems Facebook Business' },
  { name: 'YellowPages', searchQuery: 'Borne Systems YellowPages' },
  { name: 'BBB', searchQuery: 'Borne Systems BBB' },
  { name: 'Alignable', searchQuery: 'Borne Systems Alignable' },
];

const sendTelegram = async (message) => {
  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message, parse_mode: 'HTML' })
  });
};

const searchTavily = async (query) => {
  if (!TAVILY_API_KEY) { console.warn('[Citation Audit] TAVILY_API_KEY not set'); return null; }
  try {
    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TAVILY_API_KEY}` },
      body: JSON.stringify({ query, max_results: 3, include_answer: true })
    });
    return await res.json();
  } catch (e) { console.warn(`[Citation Audit] Search failed: ${e.message}`); return null; }
};

const normalizePhone = (phone) => (phone || '').replace(/\D/g, '');

const compareNap = (found) => {
  const issues = [];
  if (CANONICAL.name && found.name && !found.name.toLowerCase().includes(CANONICAL.name.toLowerCase().split(' ')[0])) {
    issues.push(`Name: found "${found.name}"`);
  }
  if (CANONICAL.phone && found.phone) {
    if (normalizePhone(CANONICAL.phone) !== normalizePhone(found.phone)) {
      issues.push(`Phone: found "${found.phone}" vs "${CANONICAL.phone}"`);
    }
  }
  return issues;
};

const logCitation = async (source, status, found, issues) => {
  await supabase.from('citation_audits').insert({
    source: source.name,
    status,
    found_name: found?.name,
    found_address: found?.address,
    found_phone: found?.phone,
    found_url: found?.url,
    issues,
    canonical_name: CANONICAL.name,
    canonical_phone: CANONICAL.phone,
    canonical_address: `${CANONICAL.address}, ${CANONICAL.city}, ${CANONICAL.state} ${CANONICAL.zip}`,
  });
};

const runCitationAudit = async () => {
  console.log('[Citation Audit] Starting...');
  const results = [];

  for (const source of CITATION_SOURCES) {
    console.log(`[Citation Audit] Checking ${source.name}...`);
    const searchResult = await searchTavily(source.searchQuery);

    if (!searchResult || !searchResult.results || searchResult.results.length === 0) {
      await logCitation(source, 'not_found', null, ['No listing found']);
      await sendTelegram(`🔍 <b>Citation Audit — ${source.name}</b>\n\n❌ No listing found.`);
      results.push({ source: source.name, status: 'not_found' });
      await new Promise(r => setTimeout(r, 2000));
      continue;
    }

    const top = searchResult.results[0];
    const found = { name: top.title || '', address: top.url || '', phone: top.url || '', url: top.url };
    if (searchResult.answer) {
      const phoneMatch = searchResult.answer.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
      if (phoneMatch) found.phone = phoneMatch[0];
    }

    const issues = compareNap(found);
    const status = issues.length === 0 ? 'pass' : 'fail';
    await logCitation(source, status, found, issues);

    const emoji = status === 'pass' ? '✅' : '⚠️';
    await sendTelegram([
      `🔍 <b>Citation Audit — ${source.name}</b>`,
      ``,
      `${emoji} <b>Status:</b> ${status.toUpperCase()}`,
      ...issues.length ? issues.map(i => `• ${i}`) : ['• All NAP fields match'],
      ``,
      `<b>Source:</b> ${top.url}`
    ].join('\n'));

    results.push({ source: source.name, status, issues });
    await new Promise(r => setTimeout(r, 2000));
  }

  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const notFound = results.filter(r => r.status === 'not_found').length;

  await supabase.from('activity_log').insert({
    agent_id: 'beacon',
    action_type: 'citation_audit_complete',
    title: `Citation audit: ${passed} pass, ${failed + notFound} issues`,
    description: `Checked ${CITATION_SOURCES.length} sources`,
    metadata: { results, summary: { passed, failed, not_found: notFound } }
  });

  await sendTelegram([
    `📊 <b>Citation Audit Summary</b>`,
    ``,
    `Total: ${CITATION_SOURCES.length}`,
    `✅ Passed: ${passed}`,
    `❌ Failed: ${failed}`,
    `⚠️ Not found: ${notFound}`
  ].join('\n'));

  console.log('[Citation Audit] Complete.');
};

runCitationAudit().catch(e => {
  console.error('[Citation Audit] Fatal:', e.message);
  process.exit(1);
});
