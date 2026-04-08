import { config } from 'dotenv';
config({ path: '/home/saint/.openclaw/.env' });
import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const FAQ_FILE = join(process.cwd(), 'care', 'faq.json');

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
      'X-Title': 'Borne Systems Care'
    },
    body: JSON.stringify({
      model: 'minimax/minimax-m2.7',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2000,
      temperature: 0.5
    })
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim();
};

const readFaq = () => {
  try {
    if (!existsSync(FAQ_FILE)) return [];
    return JSON.parse(readFileSync(FAQ_FILE, 'utf8'));
  } catch { return []; }
};

const writeFaq = (faq) => {
  writeFileSync(FAQ_FILE, JSON.stringify(faq, null, 2));
};

const clusterTickets = async (tickets) => {
  if (tickets.length < 3) return [];

  const prompt = `Group these support tickets into clusters of 3+ that represent the same question.

TICKETS:
${tickets.map((t, i) => `${i + 1}. [${t.id}] ${(t.subject || '')} ${(t.message || t.description || '').substring(0, 100)}`).join('\n')}

Return ONLY valid JSON array:
[
  {
    "topic": "2-5 word topic name",
    "ticket_ids": ["id1", "id2", "id3"],
    "shared_question": "What a customer would ask"
  }
]
Only clusters with 3+. Max 10 clusters.`;

  const raw = await callOpenRouter(prompt);
  const cleaned = raw.replace(/```json|```/g, '').trim();
  const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return [];

  try {
    return JSON.parse(jsonMatch[0]);
  } catch { return []; }
};

const generateFaqEntry = async (cluster, tickets) => {
  const prompt = `Generate a FAQ entry in Geele's voice for Borne Systems.

TOPIC: ${cluster.topic}
COMMON QUESTION: ${cluster.shared_question}

SAMPLE:
${tickets.slice(0, 3).map(t => `- "${t.message || t.description || t.subject}"`).join('\n')}

RULES:
- Question: natural customer phrasing
- Answer: 2-4 sentences, direct and helpful
- Start with answer, not "To..."
- No fluff, no sorry

Return ONLY valid JSON:
{
  "question": "the FAQ question",
  "answer": "the FAQ answer",
  "topic": "${cluster.topic}",
  "ticket_count": ${tickets.length}
}`;

  const raw = await callOpenRouter(prompt);
  const cleaned = raw.replace(/```json|```/g, '').trim();
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;

  try {
    const entry = JSON.parse(jsonMatch[0]);
    return { ...entry, source: 'ticket-cluster', created_at: new Date().toISOString() };
  } catch { return null; }
};

const runFaqUpdate = async () => {
  console.log('[Care FAQ Update] Fetching resolved tickets (last 30 days)...');

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: tickets, error } = await supabase
    .from('tickets')
    .select('*')
    .eq('status', 'resolved')
    .gte('updated_at', thirtyDaysAgo.toISOString())
    .order('updated_at', { ascending: false });

  if (error) { console.error('[Care FAQ Update] Fetch error:', error.message); return; }
  if (!tickets || tickets.length < 3) {
    await sendTelegram('🤖 <b>Care FAQ Update</b>\nFewer than 3 resolved tickets — skipping.');
    return;
  }

  console.log(`[Care FAQ Update] Clustering ${tickets.length} tickets...`);
  const clusters = await clusterTickets(tickets);
  if (!clusters || clusters.length === 0) { console.log('[Care FAQ Update] No clusters found.'); return; }

  const existingFaq = readFaq();
  const newEntries = [];
  const ticketMap = {};
  tickets.forEach(t => { ticketMap[t.id] = t; });

  for (const cluster of clusters) {
    const clusterTickets = cluster.ticket_ids.map(id => ticketMap[id]).filter(Boolean);
    const entry = await generateFaqEntry(cluster, clusterTickets);
    if (!entry) continue;

    const isDuplicate = existingFaq.some(e =>
      e.question.toLowerCase().trim() === entry.question.toLowerCase().trim()
    );
    if (isDuplicate) continue;

    newEntries.push(entry);
    existingFaq.push(entry);
    console.log(`[Care FAQ Update] Added: "${entry.question.substring(0, 60)}"`);
    await new Promise(r => setTimeout(r, 1500));
  }

  if (newEntries.length === 0) {
    await sendTelegram('🤖 <b>Care FAQ Update</b>\nNo new unique FAQ entries.');
    return;
  }

  writeFaq(existingFaq);

  await supabase.from('activity_log').insert({
    agent_id: 'care',
    action_type: 'faq_entries_added',
    title: `${newEntries.length} new FAQ entries`,
    description: `${tickets.length} tickets analyzed, ${clusters.length} clusters found`,
    metadata: { tickets_analyzed: tickets.length, clusters_found: clusters.length, new_entries: newEntries.length }
  });

  const previews = newEntries.slice(0, 5).map(e => `• Q: ${e.question.substring(0, 60)}${e.question.length > 60 ? '…' : ''}`);

  const msg = [
    `📚 <b>Care FAQ Update</b>`,
    ``,
    `${newEntries.length} new FAQ entries added`,
    `${tickets.length} tickets analyzed`,
    ``,
    ...previews,
    newEntries.length > 5 ? `  … and ${newEntries.length - 5} more` : '',
    ``,
    `Saved to: ${FAQ_FILE}`
  ].filter(Boolean).join('\n');

  console.log(msg);
  await sendTelegram(msg);
};

runFaqUpdate().catch(e => {
  console.error('[Care FAQ Update] Fatal:', e.message);
  process.exit(1);
});
