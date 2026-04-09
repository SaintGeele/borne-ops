#!/usr/bin/env node
/**
 * report.js — Pipeline Analyst Weekly Report
 * Pulls lead data from Supabase, calculates velocity metrics,
 * identifies at-risk deals, and generates a forecast.
 * 
 * Usage: node report.js
 */

import { config } from 'dotenv';
config({ path: '/home/saint/.openclaw/.env' });
import { createClient } from '@supabase/supabase-js';
import { report, reportError } from '../../../ops/discord-reporter.js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const sendTelegram = async (msg) => {
  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: msg, parse_mode: 'HTML' })
  });
};

// MEDDPICC scoring helper
const scoreMEDDPICC = (lead) => {
  let score = 0;
  if (lead.economic_buyer) score += 2;
  if (lead.decision_criteria) score += 2;
  if (lead.decision_process) score += 2;
  if (lead.paper_process) score += 1;
  if (lead.implicated_pain) score += 2;
  if (lead.champion) score += 2;
  if (lead.competition) score += 2;
  if (lead.metrics) score += 2;
  return score; // out of 16
};

// Calculate velocity metrics
const getVelocityMetrics = async () => {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .not('status', 'in', '("closed_won","closed_lost")');

  if (error) throw error;
  return data || [];
};

// Stage conversion benchmarks (industry standard days)
const STAGE_BENCHMARKS = {
  new: 3,
  contacted: 5,
  qualified: 7,
  demo: 10,
  proposal: 14,
  negotiation: 14
};

const getStaleDeals = async (leads) => {
  const now = new Date();
  return leads.filter(lead => {
    const lastActivity = lead.outreach_sent_at ? new Date(lead.outreach_sent_at) : (lead.enriched_at ? new Date(lead.enriched_at) : new Date(lead.created_at));
    const daysSince = (now - lastActivity) / (1000 * 60 * 60 * 24);
    const stageBenchmark = STAGE_BENCHMARKS[lead.status] || 7;
    return daysSince > stageBenchmark * 2; // 2x benchmark = stalled
  });
};

const getAtRiskDeals = async (leads) => {
  return leads.filter(lead => {
    const isLateStage = ['demo', 'proposal', 'negotiation'].includes(lead.status);
    const hasLowScore = lead.score < 8;
    const lastActivity = lead.outreach_sent_at ? new Date(lead.outreach_sent_at) : (lead.enriched_at ? new Date(lead.enriched_at) : new Date(lead.created_at));
    const isStale = (new Date() - lastActivity) > 14 * 24 * 60 * 60 * 1000;
    return isLateStage && (hasLowScore || isStale);
  });
};

const buildForecast = async (leads) => {
  // Commit: closed_won in last 30 days
  const { data: recentWins } = await supabase
    .from('leads')
    .select('score')
    .eq('status', 'closed_won')
    .gte('updated_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
  
  const commitAmount = (recentWins || []).reduce((sum, l) => sum + (l.score || 0) * 100, 0);

  // Best case: active late-stage with high score
  const lateStage = leads.filter(l => ['demo', 'proposal', 'negotiation'].includes(l.status));
  const bestCaseAmount = lateStage.reduce((sum, l) => sum + (l.score || 0) * 100, 0);

  // Upside: qualified pipeline
  const qualifiedAmount = leads
    .filter(l => ['qualified', 'demo'].includes(l.status))
    .reduce((sum, l) => sum + (l.score || 0) * 50, 0);

  return { commitAmount, bestCaseAmount, upsideAmount: bestCaseAmount + qualifiedAmount };
};

const runReport = async () => {
  console.log('[Pipeline Analyst] Generating weekly report...');
  
  const leads = await getVelocityMetrics();
  const totalPipeline = leads.reduce((sum, l) => sum + (l.score || 0) * 100, 0);
  
  // Stage distribution
  const byStage = {};
  for (const lead of leads) {
    byStage[lead.status] = (byStage[lead.status] || 0) + 1;
  }

  // Stale and at-risk
  const staleDeals = await getStaleDeals(leads);
  const atRiskDeals = await getAtRiskDeals(leads);
  const forecast = await buildForecast(leads);

  console.log(`[Pipeline Analyst] ${leads.length} active deals, $${totalPipeline.toFixed(0)} pipeline`);

  await supabase.from('activity_log').insert({
    agent_id: 'pipeline-analyst',
    action_type: 'weekly_pipeline_report',
    title: `Pipeline Report: ${leads.length} deals, $${totalPipeline.toFixed(0)}`,
    description: `${staleDeals.length} stale, ${atRiskDeals.length} at-risk`,
    metadata: { totalDeals: leads.length, pipeline: totalPipeline, byStage, staleCount: staleDeals.length, atRiskCount: atRiskDeals.length, forecast }
  });

  const stageRows = Object.entries(byStage).map(([stage, count]) => 
    `  ${stage}: ${count} deal${count !== 1 ? 's' : ''}`
  ).join('\n');

  const atRiskRows = atRiskDeals.slice(0, 5).map(l => 
    `  • ${l.company || l.name} (${l.status}) — score: ${l.score}/10`
  ).join('\n');

  const msg = [
    `📊 <b>Pipeline Analyst — Weekly Report</b>`,
    ``,
    `<b>Pipeline Overview:</b>`,
    `Total deals: ${leads.length}`,
    `Total pipeline: $${totalPipeline.toFixed(0)}`,
    ``,
    `<b>By Stage:</b>`,
    stageRows,
    ``,
    `<b>At-Risk (${atRiskDeals.length}):</b>`,
    atRiskDeals.length > 0 ? atRiskRows : '  None — pipeline is healthy',
    ``,
    `<b>Stale Deals (>2x stage benchmark):</b> ${staleDeals.length}`,
    ``,
    `<b>Forecast:</b>`,
    `  Commit: $${forecast.commitAmount.toFixed(0)}`,
    `  Best Case: $${forecast.bestCaseAmount.toFixed(0)}`,
    `  Upside: $${forecast.upsideAmount.toFixed(0)}`,
  ].join('\n');

  await sendTelegram(msg);
  console.log('[Pipeline Analyst] Report sent.');

  await report('pipeline', {
    title: `Pipeline Report — ${forecast.commitAmount.toFixed(0)} commit`,
    summary: `Pipeline: ${forecast.commitAmount.toFixed(0)} commit, ${forecast.bestCaseAmount.toFixed(0)} best case. ${atRiskDeals.length} at-risk deals.`,
    details: `Commit: $${forecast.commitAmount.toFixed(0)}\nBest Case: $${forecast.bestCaseAmount.toFixed(0)}\nUpside: $${forecast.upsideAmount.toFixed(0)}\nAt-risk: ${atRiskDeals.length}\nStale: ${staleDeals.length}`,
    status: atRiskDeals.length > 0 ? 'warning' : 'success',
    nextAction: atRiskDeals.length > 0 ? `Rescue ${atRiskDeals.length} at-risk deals` : 'Pipeline healthy'
  }).catch(() => {});
};

runReport().catch(async (e) => {
  console.error('[Pipeline Analyst] Fatal:', e.message);
  await reportError('pipeline', e.message, 'report.js — Pipeline Analyst weekly report').catch(() => {});
  process.exit(1);
});
