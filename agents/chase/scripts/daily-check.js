#!/usr/bin/env node
/**
 * daily-check.js — Chase Daily Pipeline Check
 * Fetches leads from Notion, scores uncontacted leads,
 * executes follow-up sequences, and reports to Geele.
 * 
 * Usage: node daily-check.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const DATA_DIR = path.join(__dirname, '..');
const LOG_FILE = path.join(DATA_DIR, 'activity-log.json');
const NOTION_DB = '31b26a63-e141-81e9-b4af-cce2e9c60055';

// ─── Config ───────────────────────────────────────────────────────────────────
const NOTION_TOKEN = process.env.NOTION_API_KEY;

// ─── Logging ─────────────────────────────────────────────────────────────────
function log(level, message, data = {}) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    agent: 'chase',
    script: 'daily-check.js',
    message,
    ...data
  };
  console.log(JSON.stringify(entry));
  writeLocalLog(entry);
}

function writeLocalLog(entry) {
  try {
    let logs = [];
    if (fs.existsSync(LOG_FILE)) {
      logs = JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'));
    }
    logs.push(entry);
    // Keep last 500 entries
    if (logs.length > 500) logs = logs.slice(-500);
    fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2));
  } catch (e) {
    console.error('Failed to write local log:', e.message);
  }
}

// ─── Notion API ──────────────────────────────────────────────────────────────
async function notionQuery(databaseId) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ page_size: 100 });
    const options = {
      hostname: 'api.notion.com',
      path: '/v1/databases/' + databaseId + '/query',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + NOTION_TOKEN,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
        'Content-Length': Buffer.byteLength(body)
      }
    };
    const req = https.request(options, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        try {
          resolve(JSON.parse(Buffer.concat(chunks).toString()));
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function notionUpdatePage(pageId, properties) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ properties });
    const options = {
      hostname: 'api.notion.com',
      path: '/v1/pages/' + pageId,
      method: 'PATCH',
      headers: {
        'Authorization': 'Bearer ' + NOTION_TOKEN,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
        'Content-Length': Buffer.byteLength(body)
      }
    };
    const req = https.request(options, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(JSON.parse(Buffer.concat(chunks).toString())));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ─── Parse Notion Lead ───────────────────────────────────────────────────────
function parseLead(page) {
  const p = page.properties;
  return {
    notionId: page.id,
    name: p.Name?.title?.[0]?.text?.content || '(no name)',
    email: p.Email?.email || null,
    phone: p.Phone?.phone_number || null,
    status: p.Status?.select?.name || 'NEW',
    score: p.Score?.number || 0,
    source: p.Source?.select?.name || null,
    notes: p.Notes?.rich_text?.map(t => t.plain_text).join('') || '',
    emailBounced: p['Email Bounced']?.checkbox || false,
    lastEdited: page.last_edited_time
  };
}

// ─── Scoring ────────────────────────────────────────────────────────────────
// Score: 1-3 per category, max 12
function scoreLead(lead) {
  // If already scored (Score > 0), use existing
  if (lead.score > 0) return lead.score;
  return lead.score; // Will be computed by caller if needed
}

// ─── Supabase logging ────────────────────────────────────────────────────────
async function logToSupabase(entry) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    log('warn', 'Supabase not configured, using local log only');
    return;
  }
  try {
    const body = JSON.stringify(entry);
    const res = await new Promise((resolve, reject) => {
      const req = https.request({
        hostname: new URL(url).hostname,
        path: '/rest/v1/activity_log',
        method: 'POST',
        headers: {
          'apikey': key,
          'Authorization': 'Bearer ' + key,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body)
        }
      }, resolve);
      req.on('error', reject);
      req.write(body);
      req.end();
    });
    if (!res.statusCode || res.statusCode >= 300) {
      log('warn', 'Supabase insert failed, using local log');
    }
  } catch (e) {
    log('warn', 'Supabase logging failed: ' + e.message);
  }
}

// ─── Follow-up logic ─────────────────────────────────────────────────────────
function getDaysSince(dateStr) {
  if (!dateStr) return 999;
  const then = new Date(dateStr);
  const now = new Date();
  return Math.floor((now - then) / (1000 * 60 * 60 * 24));
}

function getTemplateForStage(stage, daysSinceContact) {
  if (stage === 'NEW') return 'nurture-touch-1.md';
  if (stage === 'WARM') {
    if (daysSinceContact >= 14) return 'nurture-touch-4.md';
    if (daysSinceContact >= 7) return 'nurture-touch-3.md';
    if (daysSinceContact >= 3) return 'nurture-touch-2.md';
    return null; // No action needed yet
  }
  if (stage === 'HOT') return 'demo-request.md';
  return null;
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  const today = new Date().toISOString().split('T')[0];
  log('info', 'Daily pipeline check started', { date: today });

  if (!NOTION_TOKEN) {
    log('fatal', 'NOTION_API_KEY not set in environment');
    process.exit(1);
  }

  let leads = [];
  try {
    const data = await notionQuery(NOTION_DB);
    if (data.object === 'error') {
      log('error', 'Notion API error: ' + data.message);
      process.exit(1);
    }
    leads = data.results.map(parseLead);
    log('info', 'Fetched leads from Notion', { count: leads.length });
  } catch (e) {
    log('error', 'Failed to fetch Notion leads: ' + e.message);
    process.exit(1);
  }

  const hot = leads.filter(l => l.status === 'HOT');
  const warm = leads.filter(l => l.status === 'WARM');
  const newLeads = leads.filter(l => l.status === 'NEW');
  const demoScheduled = leads.filter(l => l.status === 'DEMO');
  const proposal = leads.filter(l => l.status === 'PROPOSAL');
  const closed = leads.filter(l => l.status === 'CLOSED');

  log('info', 'Pipeline snapshot', {
    total: leads.length,
    hot: hot.length,
    warm: warm.length,
    new: newLeads.length,
    demo: demoScheduled.length,
    proposal: proposal.length,
    closed: closed.length
  });

  // Score uncontacted leads
  const unscored = leads.filter(l => (l.score === 0 || l.score == null) && l.status === 'NEW');
  if (unscored.length > 0) {
    log('info', 'Unscored leads found — manual qualification needed', { count: unscored.length });
  }

  // Log activity
  await logToSupabase({
    agent: 'chase',
    action: 'pipeline_check',
    lead_id: null,
    lead_name: null,
    stage_from: null,
    stage_to: null,
    notes: `Pipeline check: ${leads.length} total, ${hot.length} HOT, ${warm.length} WARM, ${newLeads.length} NEW`
  });

  // Print pipeline report
  console.log('\n===========================================');
  console.log('  CHASE PIPELINE REPORT — ' + today);
  console.log('===========================================');
  console.log('  HOT:    ' + hot.length + ' leads');
  hot.forEach(l => console.log('    → ' + l.name + (l.notes ? ' | ' + l.notes.split('\n')[0] : '')));
  console.log('  WARM:   ' + warm.length + ' leads');
  warm.forEach(l => console.log('    → ' + l.name));
  console.log('  NEW:    ' + newLeads.length + ' leads');
  console.log('  DEMO:   ' + demoScheduled.length + ' leads');
  console.log('  PROPOSAL: ' + proposal.length + ' leads');
  console.log('  CLOSED: ' + closed.length + ' leads');
  console.log('===========================================\n');

  log('info', 'Daily pipeline check complete');
}

main().catch(e => {
  log('fatal', 'Daily check failed: ' + e.message);
  process.exit(1);
});
