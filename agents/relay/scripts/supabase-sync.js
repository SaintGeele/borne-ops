#!/usr/bin/env node
/**
 * supabase-sync.js
 * Bidirectional sync between Supabase and Notion.
 * Keeps lead records consistent across both systems.
 * 
 * Usage: node supabase-sync.js [mode]
 * Modes: full | incremental | check
 */

const https = require('https');

// ─── Config ───────────────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
const NOTION_TOKEN = process.env.NOTION_API_TOKEN;
const NOTION_LEADS_DB = process.env.NOTION_LEADS_DATABASE_ID;

const MODE = process.argv[2] || 'incremental';
const DRY_RUN = MODE === 'check';

// ─── Logging ──────────────────────────────────────────────────────────────────
function log(level, message, data = {}) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    script: 'supabase-sync',
    mode: MODE,
    message,
    ...data
  }));
}

// ─── Supabase helpers ─────────────────────────────────────────────────────────
async function supabaseQuery(table, params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}${qs ? '?' + qs : ''}`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json'
    }
  });
  if (!res.ok) {
    throw new Error(`Supabase query failed: ${res.status}`);
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
    throw new Error(`Supabase update failed: ${res.status}`);
  }
  return res.json();
}

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
    throw new Error(`Supabase insert failed: ${res.status}`);
  }
  return res.json();
}

// ─── Notion helpers ───────────────────────────────────────────────────────────
async function notionSearch(databaseId) {
  const res = await fetch('https://api.notion.com/v1/databases/query', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${NOTION_TOKEN}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28'
    },
    body: JSON.stringify({
      database_id: databaseId,
      page_size: 100
    })
  });
  if (!res.ok) {
    throw new Error(`Notion query failed: ${res.status}`);
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
    throw new Error(`Notion update failed: ${res.status}`);
  }
  return res.json();
}

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
    throw new Error(`Notion create page failed: ${res.status}`);
  }
  return res.json();
}

function extractNotionLead(page) {
  const props = page.properties;
  return {
    notion_page_id: page.id,
    name: props.Name?.title?.[0]?.text?.content || null,
    email: props.Email?.email || null,
    phone: props.Phone?.phone_number || null,
    status: props.Status?.select?.name || 'Unknown',
    score: props.Score?.number || 0,
    source: props.Source?.select?.name || null,
    notes: props.Notes?.rich_text?.map(t => t.plain_text).join('') || null,
    email_bounced: props['Email Bounced']?.checkbox || false,
    last_activity: page.last_edited_time
  };
}

// ─── Supabase → Notion sync ───────────────────────────────────────────────────
async function syncSupabaseToNotion(leads) {
  let synced = 0;
  let created = 0;
  let updated = 0;
  let errors = 0;

  for (const lead of leads) {
    try {
      if (lead.notion_page_id) {
        // Update existing Notion page
        if (!DRY_RUN) {
          await notionUpdatePage(lead.notion_page_id, {
            Status: { select: { name: lead.status } },
            Score: { number: lead.score || 0 },
            Notes: {
              rich_text: [{ text: { content: lead.notes || '' } }]
            }
          });
        }
        updated++;
      } else if (NOTION_LEADS_DB) {
        // Create new Notion page
        const properties = {
          Status: { select: { name: lead.status || 'New' } },
          Score: { number: lead.score || 0 },
          Source: { select: { name: lead.source || 'Unknown' } }
        };
        if (lead.name) properties['Name'] = { title: [{ text: { content: lead.name } }] };
        if (lead.email) properties['Email'] = { email: { email_address: lead.email } };
        if (lead.phone) properties['Phone'] = { phone_number: { phone_number: lead.phone } };

        if (!DRY_RUN) {
          const page = await notionCreatePage(NOTION_LEADS_DB, properties);
          await supabaseUpdate('leads', lead.id, { notion_page_id: page.id });
        }
        created++;
      }
      synced++;
    } catch (err) {
      log('error', `Failed to sync lead ${lead.id}`, { error: err.message });
      errors++;
    }
  }

  return { synced, created, updated, errors };
}

// ─── Notion → Supabase sync ───────────────────────────────────────────────────
async function syncNotionToSupabase(notionLeads) {
  let synced = 0;
  let updated = 0;
  let errors = 0;

  for (const notionLead of notionLeads) {
    try {
      // Find matching Supabase record
      let supabaseLeads = [];
      if (notionLead.email) {
        supabaseLeads = await supabaseQuery('leads', { email: `eq.${notionLead.email}`, select: 'id,notion_page_id' });
      } else if (notionLead.phone) {
        supabaseLeads = await supabaseQuery('leads', { phone: `eq.${notionLead.phone}`, select: 'id,notion_page_id' });
      }

      if (supabaseLeads.length === 0) {
        // Create new Supabase record from Notion
        if (!DRY_RUN) {
          const newLead = await supabaseInsert('leads', {
            name: notionLead.name,
            email: notionLead.email,
            phone: notionLead.phone,
            status: notionLead.status?.toLowerCase() || 'new',
            score: notionLead.score || 0,
            source: notionLead.source || 'notion',
            notion_page_id: notionLead.notion_page_id,
            created_at: new Date().toISOString()
          });
          log('info', `Created Supabase lead from Notion page ${notionLead.notion_page_id}`);
        }
        synced++;
      } else {
        // Update existing Supabase record
        const existing = supabaseLeads[0];
        if (!existing.notion_page_id && !DRY_RUN) {
          await supabaseUpdate('leads', existing.id, {
            notion_page_id: notionLead.notion_page_id,
            status: notionLead.status?.toLowerCase() || existing.status,
            score: notionLead.score || existing.score
          });
        }
        updated++;
      }
    } catch (err) {
      log('error', `Failed to sync Notion lead ${notionLead.notion_page_id}`, { error: err.message });
      errors++;
    }
  }

  return { synced, updated, errors };
}

// ─── Sync log ─────────────────────────────────────────────────────────────────
async function logSync(type, stats) {
  try {
    await supabaseInsert('sync_log', {
      sync_type: type,
      mode: MODE,
      records_synced: stats.synced || 0,
      created: stats.created || 0,
      updated: stats.updated || 0,
      errors: stats.errors || 0,
      dry_run: DRY_RUN,
      created_at: new Date().toISOString()
    });
  } catch (err) {
    log('error', 'Failed to log sync', { error: err.message });
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  log('info', `Starting ${MODE} sync`);

  if (!SUPABASE_URL || !SUPABASE_KEY || !NOTION_TOKEN) {
    log('fatal', 'Missing required env vars: SUPABASE_URL, SUPABASE_SERVICE_KEY, NOTION_API_TOKEN');
    process.exit(1);
  }

  if (DRY_RUN) {
    log('info', 'DRY RUN mode — no changes will be made');
  }

  try {
    if (MODE === 'full' || MODE === 'incremental') {
      // Sync Supabase leads → Notion
      log('info', 'Fetching Supabase leads...');
      const since = MODE === 'incremental'
        ? new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        : null;
      const supabaseLeads = await supabaseQuery('leads', {
        select: 'id,name,email,phone,status,score,source,notes,notion_page_id,updated_at',
        ...(since ? { updated_at: `gt.${since}` } : {})
      });

      log('info', `Found ${supabaseLeads.length} Supabase leads to sync`);
      if (supabaseLeads.length > 0) {
        const s2nStats = await syncSupabaseToNotion(supabaseLeads);
        log('info', `Supabase→Notion sync complete`, s2nStats);
        await logSync('supabase_to_notion', s2nStats);
      }

      // Sync Notion leads → Supabase
      if (NOTION_LEADS_DB) {
        log('info', 'Fetching Notion leads...');
        const notionData = await notionSearch(NOTION_LEADS_DB);
        const notionLeads = notionData.results.map(extractNotionLead);
        log('info', `Found ${notionLeads.length} Notion leads to sync`);
        if (notionLeads.length > 0) {
          const n2sStats = await syncNotionToSupabase(notionLeads);
          log('info', `Notion→Supabase sync complete`, n2sStats);
          await logSync('notion_to_supabase', n2sStats);
        }
      }
    } else if (MODE === 'check') {
      // Just report status
      const supabaseCount = await supabaseQuery('leads', { select: 'id', limit: 1 });
      const notionData = NOTION_LEADS_DB ? await notionSearch(NOTION_LEADS_DB) : { results: [] };
      log('info', 'Sync check complete', {
        supabaseLeads: supabaseCount.total_count || 'unknown',
        notionLeads: notionData.results?.length || 0
      });
    }

    log('info', 'Sync complete');
  } catch (err) {
    log('fatal', 'Sync failed', { error: err.message, stack: err.stack });
    process.exit(1);
  }
}

main();
