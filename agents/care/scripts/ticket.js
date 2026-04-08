import { config } from 'dotenv';
config({ path: '/home/saint/.openclaw/.env' });
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

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
      max_tokens: 800,
      temperature: 0.6
    })
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim();
};

const generateDraftResponse = async (ticket) => {
  const prompt = `You are Care for Borne Systems. Respond in Geele's voice — direct, helpful, honest.

TICKET:
- Customer: ${ticket.requester || ticket.name || 'Customer'}
- Subject: ${ticket.subject || 'No subject'}
- Priority: ${ticket.priority || 'medium'}
- Message: ${ticket.message || ticket.description || 'No message'}

RULES:
- Max 3 paragraphs
- Acknowledge issue first, solution second
- If missing info, ask one specific question
- Never promise timelines you can't keep
- If needs Geele, say "let me loop in Geele on this"
- End with clear next step

Return ONLY the response text.`;

  return callOpenRouter(prompt);
};

const updateTicket = async (ticketId, draftResponse) => {
  await supabase.from('tickets').update({ draft_response: draftResponse, status: 'pending_review' }).eq('id', ticketId);
};

const runTicketHandler = async () => {
  console.log('[Care Ticket] Fetching open tickets...');

  const { data: tickets, error } = await supabase
    .from('tickets')
    .select('*')
    .eq('status', 'open')
    .order('created_at', { ascending: true })
    .limit(20);

  if (error) {
    console.error('[Care Ticket] Fetch error:', error.message);
    await sendTelegram('🤖 <b>Care Ticket Handler</b>\nFailed to fetch tickets.');
    return;
  }

  if (!tickets || tickets.length === 0) {
    console.log('[Care Ticket] No open tickets.');
    await sendTelegram('🤖 <b>Care Ticket Handler</b>\nNo open tickets.');
    return;
  }

  console.log(`[Care Ticket] Processing ${tickets.length} tickets...`);
  let drafted = 0;
  let skipped = 0;
  const results = [];

  for (const ticket of tickets) {
    if (!ticket.message && !ticket.description) { skipped++; continue; }
    if (ticket.draft_response) { skipped++; continue; }

    const draft = await generateDraftResponse(ticket);
    if (!draft) { results.push({ id: ticket.id, name: ticket.requester || ticket.name, status: 'failed' }); continue; }

    await updateTicket(ticket.id, draft);
    drafted++;
    results.push({ id: ticket.id, name: ticket.requester || ticket.name || 'Unknown', preview: draft.substring(0, 80) });

    await new Promise(r => setTimeout(r, 1500));
  }

  await supabase.from('activity_log').insert({
    agent_id: 'care',
    action_type: 'ticket_drafts_generated',
    title: `Care drafts: ${drafted} drafted, ${skipped} skipped`,
    description: `${tickets.length} tickets processed`,
    metadata: { total: tickets.length, drafted, skipped, results }
  });

  const previewLines = results.slice(0, 5).map(r =>
    r.status === 'failed' ? `  ❌ ${r.name} — failed` : `  ✅ ${r.name}: "${r.preview}…"`
  );

  const msg = [
    `🎧 <b>Care Ticket Handler</b>`,
    ``,
    `Processed: ${tickets.length}`,
    `Drafted: ${drafted}`,
    `Skipped: ${skipped}`,
    ``,
    ...previewLines,
    results.length > 5 ? `  … and ${results.length - 5} more` : ''
  ].filter(Boolean).join('\n');

  console.log(msg);
  await sendTelegram(msg);
};

runTicketHandler().catch(e => {
  console.error('[Care Ticket] Fatal:', e.message);
  process.exit(1);
});
