#!/usr/bin/env node
/**
 * webhook-handler.js
 * Receives webhooks and routes them to the appropriate pipeline handler.
 * 
 * Supported sources:
 * - VAPI (call events)
 * - Form submissions (website lead forms)
 * - n8n (workflow completion callbacks)
 * - Email bounce notifications
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

// ─── Config ───────────────────────────────────────────────────────────────────
const PORT = process.env.RELAY_WEBHOOK_PORT || 3001;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
const NOTION_TOKEN = process.env.NOTION_API_TOKEN;
const N8N_BASE = process.env.N8N_BASE_URL || 'http://localhost:5678';
const N8N_API_KEY = process.env.N8N_API_KEY;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_ALERT_CHAT = process.env.TELEGRAM_ALERT_CHAT_ID;
const LEAD_NOTION_DB = process.env.NOTION_LEADS_DATABASE_ID;

// ─── Logging ──────────────────────────────────────────────────────────────────
function log(level, source, message, data = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    source,
    message,
    ...data
  };
  console.log(JSON.stringify(entry));
}

// ─── Telegram Alert ──────────────────────────────────────────────────────────
async function alertTelegram(message) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_ALERT_CHAT) return;
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_ALERT_CHAT,
        text: `🔴 *Relay Alert*\n${message}`,
        parse_mode: 'Markdown'
      })
    });
  } catch (err) {
    log('error', 'telegram', 'Failed to send alert', { error: err.message });
  }
}

// ─── Supabase helpers ─────────────────────────────────────────────────────────
async function supabaseInsert(table, row) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(row)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase insert failed: ${res.status} ${text}`);
  }
  return res.json();
}

async function supabaseUpdate(table, id, updates) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(updates)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase update failed: ${res.status} ${text}`);
  }
  return res.json();
}

// ─── Notion helpers ───────────────────────────────────────────────────────────
async function notionCreatePage(databaseId, properties) {
  const res = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${NOTION_TOKEN}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28'
    },
    body: JSON.stringify({
      parent: { database_id: databaseId },
      properties
    })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Notion create page failed: ${res.status} ${text}`);
  }
  return res.json();
}

async function notionUpdatePage(pageId, properties) {
  const res = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${NOTION_TOKEN}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28'
    },
    body: JSON.stringify({ properties })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Notion update page failed: ${res.status} ${text}`);
  }
  return res.json();
}

// ─── n8n trigger ──────────────────────────────────────────────────────────────
async function triggerN8N(workflowId, payload) {
  const res = await fetch(`${N8N_BASE}/webhook/${workflowId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(N8N_API_KEY ? { 'X-N8N-API-KEY': N8N_API_KEY } : {})
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`n8n trigger failed: ${res.status} ${text}`);
  }
  return res.json();
}

// ─── Lead Scoring ─────────────────────────────────────────────────────────────
function scoreLead(callData) {
  let score = 50; // baseline
  const reasons = [];

  // Duration scoring
  if (callData.duration && callData.duration > 300) {
    score += 20;
    reasons.push('5+ min call');
  } else if (callData.duration && callData.duration > 120) {
    score += 10;
    reasons.push('2+ min call');
  }

  // Keyword indicators from transcript
  const transcript = (callData.transcript || '').toLowerCase();
  const positiveKeywords = ['interested', 'yes', 'schedule', 'demo', 'pricing', 'quote', 'buy'];
  const negativeKeywords = ['not now', 'later', 'maybe', 'busy', 'no thanks'];

  positiveKeywords.forEach(kw => {
    if (transcript.includes(kw)) {
      score += 5;
      reasons.push(`said "${kw}"`);
    }
  });

  negativeKeywords.forEach(kw => {
    if (transcript.includes(kw)) {
      score -= 10;
      reasons.push(`said "${kw}"`);
    }
  });

  return {
    score: Math.max(0, Math.min(100, score)),
    reasons: reasons.slice(0, 3)
  };
}

// ─── Pipeline Handlers ─────────────────────────────────────────────────────────

async function handleVAPICallEnd(payload) {
  log('info', 'vapi', 'Processing VAPI call end', { callId: payload.call_id });

  const { call_id, phone_number, duration, transcript, ended_reason } = payload;

  if (!phone_number) {
    throw new Error('VAPI payload missing phone_number');
  }

  // Score the lead
  const scoring = scoreLead({ duration, transcript });

  // Create lead in Supabase
  const supabaseLead = await supabaseInsert('leads', {
    source: 'vapi',
    phone: phone_number,
    call_id,
    duration,
    transcript,
    score: scoring.score,
    score_reasons: scoring.reasons,
    status: 'new',
    disposition: ended_reason,
    created_at: new Date().toISOString()
  });

  const leadId = supabaseLead[0]?.id;

  // Create lead in Notion
  if (LEAD_NOTION_DB) {
    try {
      const notionPage = await notionCreatePage(LEAD_NOTION_DB, {
        Phone: { phone_number: { phone_number: phone_number } },
        Status: { select: { name: 'New' } },
        Score: { number: scoring.score },
        Source: { select: { name: 'VAPI' } },
        Notes: { rich_text: [{ text: { content: transcript?.slice(0, 2000) || '' } }] }
      });

      // Update Supabase with Notion page ID
      if (leadId) {
        await supabaseUpdate('leads', leadId, { notion_page_id: notionPage.id });
      }
    } catch (err) {
      log('error', 'vapi', 'Notion lead creation failed', { error: err.message });
      // Continue — don't fail the whole pipeline
    }
  }

  // Route hot leads (score >= 70) to Chase
  if (scoring.score >= 70) {
    await supabaseInsert('chase_queue', {
      lead_id: leadId,
      phone: phone_number,
      score: scoring.score,
      source: 'vapi',
      priority: scoring.score >= 85 ? 'high' : 'medium',
      status: 'pending'
    });
    log('info', 'vapi', 'Hot lead routed to Chase', { leadId, score: scoring.score });
  }

  await supabaseInsert('pipeline_events', {
    event_type: 'vapi_call_end',
    source: 'vapi',
    payload: payload,
    outcome: 'success',
    lead_id: leadId
  });

  return { leadId, score: scoring.score, routedToChase: scoring.score >= 70 };
}

async function handleFormSubmission(payload) {
  log('info', 'forms', 'Processing form submission', { email: payload.email });

  const { name, email, phone, message, source_url } = payload;

  if (!email && !phone) {
    throw new Error('Form submission missing both email and phone');
  }

  // Create lead in Supabase
  const supabaseLead = await supabaseInsert('leads', {
    source: 'form',
    name: name || null,
    email: email || null,
    phone: phone || null,
    message: message || null,
    source_url: source_url || null,
    score: 30, // default score for form leads
    status: 'new',
    created_at: new Date().toISOString()
  });

  const leadId = supabaseLead[0]?.id;

  // Create lead in Notion
  if (LEAD_NOTION_DB) {
    try {
      const properties = {
        Name: name ? { title: [{ text: { content: name } }] } : undefined,
        Status: { select: { name: 'New' } },
        Score: { number: 30 },
        Source: { select: { name: 'Form' } }
      };
      if (email) {
        properties['Email'] = { email: { email_address: email } };
      }

      const notionPage = await notionCreatePage(LEAD_NOTION_DB, properties);

      if (leadId) {
        await supabaseUpdate('leads', leadId, { notion_page_id: notionPage.id });
      }
    } catch (err) {
      log('error', 'forms', 'Notion lead creation failed', { error: err.message });
    }
  }

  // Trigger n8n onboarding workflow if configured
  const workflowId = process.env.N8N_ONBOARDING_WORKFLOW_ID;
  if (workflowId && email) {
    try {
      await triggerN8N(workflowId, { leadId, name, email, phone, source: 'form' });
    } catch (err) {
      log('error', 'forms', 'n8n onboarding trigger failed', { error: err.message });
    }
  }

  await supabaseInsert('pipeline_events', {
    event_type: 'form_submission',
    source: 'form',
    payload,
    outcome: 'success',
    lead_id: leadId
  });

  return { leadId };
}

async function handleN8NWorkflowComplete(payload) {
  log('info', 'n8n', 'Processing n8n workflow completion', { workflowId: payload.workflowId });

  await supabaseInsert('pipeline_events', {
    event_type: 'n8n_workflow_complete',
    source: 'n8n',
    payload,
    outcome: 'success'
  });

  return { logged: true };
}

async function handleEmailBounce(payload) {
  log('warn', 'email', 'Processing email bounce', { email: payload.email });

  const { email, bounce_reason, lead_id } = payload;

  // Flag lead in Notion if we have a notion_page_id
  if (lead_id) {
    const leadRes = await fetch(`${SUPABASE_URL}/rest/v1/leads?id=eq.${lead_id}&select=notion_page_id`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    const leads = await leadRes.json();
    const notionPageId = leads[0]?.notion_page_id;

    if (notionPageId) {
      try {
        await notionUpdatePage(notionPageId, {
          'Email Bounced': { checkbox: true },
          'Bounce Reason': { rich_text: [{ text: { content: bounce_reason || 'Unknown' } }] }
        });
      } catch (err) {
        log('error', 'email', 'Notion bounce flag update failed', { error: err.message });
      }
    }

    await supabaseUpdate('leads', lead_id, {
      email_bounced: true,
      bounce_reason: bounce_reason || null
    });
  }

  await supabaseInsert('pipeline_events', {
    event_type: 'email_bounce',
    source: 'email',
    payload,
    outcome: 'success'
  });

  await alertTelegram(`📧 Email bounce detected for lead ${lead_id}: ${bounce_reason}`);

  return { flagged: true };
}

// ─── Router ───────────────────────────────────────────────────────────────────
async function routeEvent(eventType, payload) {
  switch (eventType) {
    case 'vapi.call_end':
    case 'vapi.call.ended':
      return handleVAPICallEnd(payload);
    case 'form.submission':
    case 'form.submit':
      return handleFormSubmission(payload);
    case 'n8n.workflow.complete':
    case 'n8n.workflow.completed':
      return handleN8NWorkflowComplete(payload);
    case 'email.bounce':
    case 'email.bounced':
      return handleEmailBounce(payload);
    default:
      log('warn', 'router', 'Unhandled event type', { eventType });
      await supabaseInsert('pipeline_events', {
        event_type: eventType,
        source: 'unknown',
        payload,
        outcome: 'unhandled'
      });
      await alertTelegram(`⚠️ Unhandled event type: ${eventType}`);
      return { handled: false, eventType };
  }
}

// ─── HTTP Server ──────────────────────────────────────────────────────────────
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error('Invalid JSON payload'));
      }
    });
    req.on('error', reject);
  });
}

async function handleRequest(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Webhook-Secret'
    });
    res.end();
    return;
  }

  // Only accept POST
  if (req.method !== 'POST') {
    res.writeHead(405);
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  // Webhook secret validation (optional)
  const webhookSecret = process.env.WEBHOOK_SECRET;
  if (webhookSecret) {
    const provided = req.headers['x-webhook-secret'];
    if (provided !== webhookSecret) {
      res.writeHead(401);
      res.end(JSON.stringify({ error: 'Unauthorized' }));
      return;
    }
  }

  let payload;
  try {
    payload = await parseBody(req);
  } catch (err) {
    res.writeHead(400);
    res.end(JSON.stringify({ error: 'Invalid JSON' }));
    return;
  }

  // Determine event type from path or payload
  const path = url.pathname.replace(/^\/|\/$/g, '');
  let eventType = path || payload.event_type || 'unknown';

  // Normalize VAPI event types
  if (payload.type) {
    eventType = payload.type;
  }

  log('info', 'http', 'Received webhook', { path, eventType });

  try {
    const result = await routeEvent(eventType, payload);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, ...result }));
  } catch (err) {
    log('error', 'http', 'Pipeline error', { eventType, error: err.message });

    // Log to pipeline_errors
    try {
      await supabaseInsert('pipeline_errors', {
        event_type: eventType,
        payload,
        error: err.message,
        created_at: new Date().toISOString()
      });
    } catch (logErr) {
      log('error', 'http', 'Failed to log pipeline error', { error: logErr.message });
    }

    await alertTelegram(`🔴 Pipeline error [${eventType}]: ${err.message}`);

    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
}

const server = http.createServer(handleRequest);

server.listen(PORT, () => {
  log('info', 'relay', `Relay webhook handler listening on port ${PORT}`);
});

process.on('uncaughtException', async (err) => {
  log('fatal', 'relay', 'Uncaught exception', { error: err.message, stack: err.stack });
  await alertTelegram(`💥 Relay fatal error: ${err.message}`);
  process.exit(1);
});

process.on('unhandledRejection', async (reason) => {
  log('fatal', 'relay', 'Unhandled rejection', { reason: String(reason) });
  await alertTelegram(`💥 Relay unhandled rejection: ${reason}`);
  process.exit(1);
});
