#!/usr/bin/env node
/**
 * evaluate.js — Automation Governance Evaluation Script
 * Evaluates a proposed automation against governance criteria.
 * 
 * Usage: node evaluate.js --name "CRM Lead Sync" --time-savings 5 --data-level high --deps 2 --scale high
 *   --time-savings: hours saved per month (number)
 *   --data-level: low | medium | high
 *   --deps: number of external API dependencies (0-5)
 *   --scale: low | medium | high
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

// Parse CLI args
const args = process.argv.slice(2);
const getArg = (flag, def) => {
  const idx = args.indexOf(flag);
  return idx >= 0 ? args[idx + 1] : def;
};

const automationName = getArg('--name', 'Unnamed Automation');
const timeSavings = parseFloat(getArg('--time-savings', '0'));
const dataLevel = getArg('--data-level', 'medium');
const deps = parseInt(getArg('--deps', '1'));
const scale = getArg('--scale', 'medium');

// Scoring
const scoreTimeSavings = (hrs) => {
  if (hrs > 5) return 4;
  if (hrs >= 1) return 3;
  if (hrs >= 0.5) return 2;
  return 1;
};

const scoreDataCriticality = (level) => ({ low: 1, medium: 2, high: 4 }[level] || 2);
const scoreDeps = (n) => n === 0 ? 4 : n === 1 ? 3 : n <= 3 ? 2 : 1;
const scoreScale = (s) => ({ low: 4, medium: 2, high: 1 }[s] || 2);

const computeVerdict = (total) => {
  if (total >= 12) return 'APPROVE';
  if (total >= 8) return 'APPROVE AS PILOT';
  if (total >= 5) return 'PARTIAL AUTOMATION ONLY';
  if (total >= 3) return 'DEFER';
  return 'REJECT';
};

const VERDICT_EMOJI = {
  'APPROVE': '✅',
  'APPROVE AS PILOT': '🟡',
  'PARTIAL AUTOMATION ONLY': '🟠',
  'DEFER': '⏸️',
  'REJECT': '❌'
};

const runEvaluation = async () => {
  console.log(`[Automation Governance] Evaluating: ${automationName}`);

  const tScore = scoreTimeSavings(timeSavings);
  const dScore = scoreDataCriticality(dataLevel);
  const depScore = scoreDeps(deps);
  const sScore = scoreScale(scale);
  const total = tScore + dScore + depScore + sScore;
  const verdict = computeVerdict(total);

  console.log(`[Automation Governance] Score: ${total}/16 — ${verdict}`);

  await supabase.from('activity_log').insert({
    agent_id: 'automation-governance',
    action_type: 'automation_evaluation',
    title: `Governance: ${automationName} → ${verdict}`,
    description: `Score ${total}/16 — time savings: ${timeSavings}h, data: ${dataLevel}, deps: ${deps}, scale: ${scale}`,
    metadata: { name: automationName, verdict, totalScore: total, breakdown: { timeSavings: tScore, dataCriticality: dScore, dependencies: depScore, scalability: sScore } }
  });

  const breakdown = [
    `Time Savings: ${tScore}/4 (${timeSavings}h/mo)`,
    `Data Criticality: ${dScore}/4 (${dataLevel})`,
    `Dependency Risk: ${depScore}/4 (${deps} external APIs)`,
    `Scalability: ${sScore}/4 (${scale})`,
  ];

  const emoji = VERDICT_EMOJI[verdict] || '❓';

  const msg = [
    `⚙️ <b>Automation Governance — Evaluation</b>`,
    ``,
    `<b>Automation:</b> ${automationName}`,
    ``,
    `<b>Scoring:</b>`,
    ...breakdown.map(b => `  ${b}`),
    ``,
    `<b>Total Score: ${total}/16</b>`,
    ``,
    `${emoji} <b>Verdict: ${verdict}</b>`,
  ].join('\n');

  await sendTelegram(msg);
  console.log(`[Automation Governance] Complete. Verdict: ${verdict}`);

  await report('governance', {
    title: `Governance Eval — ${automationName}: Score ${total}/16 (${verdict})`,
    summary: `${automationName} scored ${total}/16. Verdict: ${verdict}`,
    details: breakdown.map(b => `• ${b}`).join('\n'),
    status: verdict === 'APPROVED' ? 'success' : verdict === 'REJECTED' ? 'error' : 'warning',
    nextAction: verdict === 'REJECTED' ? 'Do not proceed — fix governance issues' : verdict === 'REVIEW' ? 'Review flagged criteria' : 'Automation approved'
  }).catch(() => {});
};

runEvaluation().catch(async (e) => {
  console.error('[Automation Governance] Fatal:', e.message);
  await reportError('governance', e.message, 'evaluate.js — Automation Governance evaluation').catch(() => {});
  process.exit(1);
});
