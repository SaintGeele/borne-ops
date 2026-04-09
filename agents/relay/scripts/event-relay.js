#!/usr/bin/env node
/**
 * event-relay.js — Relay Event Poller
 * Runs every 5 minutes via cron
 * Polls the events table for pending events and triggers downstream agents
 * Logs all activity to Supabase activity_log
 */

import { config } from 'dotenv';
config({ path: '/home/saint/.openclaw/.env' });
import { createClient } from '@supabase/supabase-js';
import { report, reportError } from '../../ops/discord-reporter.js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const HANDLERS = {
  'lead.new': async (event) => {
    // New lead found — trigger Chase outreach
    const { error } = await supabase.from('leads').update({ status: 'new' }).eq('id', event.payload.lead_id);
    return { action: 'chase_outreach', note: `Lead ${event.payload.lead_id} ready for outreach` };
  },

  'lead.hot': async (event) => {
    // Hot lead (score 80+) — trigger immediate Chase outreach
    const { error } = await supabase.from('leads').update({ status: 'hot', assigned_to: 'chase' }).eq('id', event.payload.lead_id);
    return { action: 'chase_priority', note: `Hot lead ${event.payload.lead_id} escalated to Chase` };
  },

  'demo.booked': async (event) => {
    // Demo booked — trigger Sales Engineer battlecard
    const { error } = await supabase.from('activity_log').insert({
      agent_id: 'relay',
      action_type: 'event_triggered',
      title: `Demo booked: ${event.payload.company || 'Unknown'}`,
      description: `Sales Engineer should prep demo for ${event.payload.company}`,
      metadata: { event_id: event.id, lead_id: event.payload.lead_id, demo_date: event.payload.demo_date }
    });
    return { action: 'sales_engineer', note: `Demo booked for ${event.payload.company}` };
  },

  'deal.won': async (event) => {
    await supabase.from('leads').update({ status: 'closed_won', stage: 'closed_won' }).eq('id', event.payload.lead_id);
    return { action: 'pipeline_update', note: `Deal won: ${event.payload.company}` };
  },

  'deal.lost': async (event) => {
    await supabase.from('leads').update({ status: 'closed_lost', stage: 'closed_lost' }).eq('id', event.payload.lead_id);
    return { action: 'pipeline_update', note: `Deal lost: ${event.payload.company}` };
  },

  'content.plan.ready': async (event) => {
    return { action: 'nova_queue', note: `Mercury content plan ready for Nova` };
  },

  'news.ready': async (event) => {
    return { action: 'nova_news', note: `${event.payload.count || 0} stories ready for Nova` };
  },

  'ticket.escalated': async (event) => {
    return { action: 'forge_handle', note: `Ticket ${event.payload.ticket_id} escalated` };
  },

  'cve.critical': async (event) => {
    const { error } = await supabase.from('activity_log').insert({
      agent_id: 'relay',
      action_type: 'critical_alert',
      title: `CRITICAL CVE: ${event.payload.cve_id}`,
      description: `CVSS: ${event.payload.cvss_score} — Atlas alerted`,
      metadata: { event_id: event.id, cve_id: event.payload.cve_id }
    });
    return { action: 'atlas_coordinate', note: `Critical CVE ${event.payload.cve_id} needs Atlas coordination` };
  },

  'server.unhealthy': async (event) => {
    return { action: 'self_healing', note: `Server ${event.payload.hostname} unhealthy: ${event.payload.issue}` };
  },

  'server.fixed': async (event) => {
    await supabase.from('activity_log').insert({
      agent_id: 'relay',
      action_type: 'incident_resolved',
      title: `Server resolved: ${event.payload.hostname}`,
      description: event.payload.resolution,
      metadata: { event_id: event.id, hostname: event.payload.hostname }
    });
    return { action: 'atlas_close', note: `Incident resolved on ${event.payload.hostname}` };
  },

  'automation.proposed': async (event) => {
    return { action: 'governance_eval', note: `New automation proposed: ${event.payload.name}` };
  },

  'governance.approved': async (event) => {
    return { action: 'atlas_deploy', note: `Automation approved: ${event.payload.name}` };
  },

  'governance.rejected': async (event) => {
    return { action: 'atlas_discard', note: `Automation rejected: ${event.payload.name} — ${event.payload.reason}` };
  },

  'pipeline.at_risk': async (event) => {
    return { action: 'closer_followup', note: `Deal at risk: ${event.payload.lead_id}` };
  },

  'data.violation': async (event) => {
    await supabase.from('activity_log').insert({
      agent_id: 'relay',
      action_type: 'data_boundary_violation',
      title: `DATA VIOLATION: ${event.payload.pattern}`,
      description: `${event.payload.file} violated data boundary`,
      metadata: { event_id: event.id, ...event.payload }
    });
    return { action: 'knox_review', note: `Ghost Protocol violation in ${event.payload.file}` };
  },

  'client.onboarded': async (event) => {
    return { action: 'care_takeover', note: `Client ${event.payload.company} onboarded — Care takes over` };
  },
};

async function pollEvents() {
  // Fetch pending events, oldest first, max 20 per run
  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'pending')
    .order('ts', { ascending: true })
    .limit(20);

  if (error) {
    console.error('[Relay Event] Failed to fetch events:', error.message);
    return { processed: 0, errors: 1 };
  }

  if (!events || events.length === 0) {
    return { processed: 0, errors: 0 };
  }

  console.log(`[Relay Event] Processing ${events.length} pending events`);

  let processed = 0;
  let errors = 0;

  for (const event of events) {
    try {
      // Mark as processing
      await supabase.from('events').update({ status: 'processing' }).eq('id', event.id);

      const handler = HANDLERS[event.event_type];
      if (!handler) {
        // No handler — skip
        await supabase.from('events').update({ status: 'skipped', processed_at: new Date().toISOString() }).eq('id', event.id);
        console.log(`[Relay] No handler for ${event.event_type} — skipped`);
        continue;
      }

      const result = await handler(event);

      // Mark as processed
      await supabase.from('events').update({
        status: 'processed',
        processed_by: 'relay',
        processed_at: new Date().toISOString()
      }).eq('id', event.id);

      console.log(`[Relay] ${event.event_type} → ${result.action}: ${result.note}`);
      processed++;

    } catch (err) {
      // Mark as failed
      await supabase.from('events').update({
        status: 'failed',
        processed_by: 'relay',
        processed_at: new Date().toISOString()
      }).eq('id', event.id);

      console.error(`[Relay] Failed to process ${event.event_type}:`, err.message);
      errors++;
    }
  }

  return { processed, errors };
}

async function main() {
  const result = await pollEvents();

  await supabase.from('activity_log').insert({
    agent_id: 'relay',
    action_type: 'event_poll',
    title: `Event poll: ${result.processed} processed, ${result.errors} errors`,
    description: `Checked for pending events`,
    metadata: result
  });

  console.log(`[Relay] Event poll complete: ${result.processed} processed, ${result.errors} errors`);
}

main().catch(async (e) => {
  console.error('[Relay Event] Fatal:', e.message);
  await reportError('relay', e.message, 'event-relay.js — Relay event poller').catch(() => {});
  process.exit(1);
});
