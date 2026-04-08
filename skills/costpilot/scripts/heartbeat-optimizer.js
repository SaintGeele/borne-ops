import { config } from 'dotenv';
config({ path: '/home/saint/.openclaw/.env' });
import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Premium models that should NEVER be used for heartbeats
const PREMIUM_BANNED = [
  'opus', 'sonnet', 'gpt-4', 'gpt4', 'claude-3', 'claude-4',
  'o1', 'o3', 'o4', 'mini-max', 'deepseek-v3'
];

// Recommended free/cheap models for heartbeats
const RECOMMENDED_HEARTBEAT_MODEL = 'minimax/minimax-m2.7-highspeed';

const sendTelegram = async (message) => {
  if (!TELEGRAM_TOKEN) return;
  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message, parse_mode: 'HTML' })
  });
};

const isPremiumModel = (model) => {
  if (!model) return false;
  const m = model.toLowerCase();
  return PREMIUM_BANNED.some(b => m.includes(b));
};

const scanHeartbeatMd = () => {
  const hbPath = join(process.cwd(), 'HEARTBEAT.md');
  try {
    if (!require('fs').existsSync(hbPath)) return null;
    const content = readFileSync(hbPath, 'utf8');
    return content;
  } catch { return null; }
};

const findPremiumHeartbeats = (content) => {
  if (!content) return [];
  const issues = [];

  // Check if heartbeat prompt uses premium model
  if (content.match(/model\s*[=:]\s*["']?(opus|sonnet|gpt-4|gpt4|claude-3|o1|o3)/i)) {
    issues.push({ location: 'HEARTBEAT.md', issue: 'Heartbeat uses premium model in prompt', severity: 'critical' });
  }

  // Check cron jobs for premium models
  const cronModelMatches = content.match(/model\s*[=:]\s*["']([^"']+)["']/gi) || [];
  for (const match of cronModelMatches) {
    const model = match.replace(/model\s*[=:]\s*["']/, '').replace(/["']/g, '');
    if (isPremiumModel(model)) {
      issues.push({ location: 'HEARTBEAT.md cron', issue: `Cron uses premium model: ${model}`, severity: 'critical', fix: `Change to ${RECOMMENDED_HEARTBEAT_MODEL}` });
    }
  }

  return issues;
};

const scanOpenClawCron = () => {
  const cronConfigPath = join(process.env.HOME || '/home/saint', '.openclaw', 'gateway.json');
  try {
    if (!require('fs').existsSync(cronConfigPath)) return [];
    const content = readFileSync(cronConfigPath, 'utf8');
    const config = JSON.parse(content);
    const issues = [];

    // Check cron jobs in config
    if (config.crons) {
      for (const cron of config.crons) {
        const payload = cron.payload || {};
        if (payload.model && isPremiumModel(payload.model)) {
          issues.push({
            location: `cron:${cron.name || 'unnamed'}`,
            issue: `Cron job uses premium model: ${payload.model}`,
            severity: 'critical',
            fix: `Change to ${RECOMMENDED_HEARTBEAT_MODEL}`
          });
        }
      }
    }
    return issues;
  } catch { return []; }
};

const checkActivityLogForPremium = async () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString();

  // Look for heartbeat-like actions using premium models in recent logs
  const { data } = await supabase
    .from('activity_log')
    .select('agent_id, action_type, metadata, created_at')
    .eq('agent_id', 'pulse')
    .gte('created_at', yesterdayStr)
    .order('created_at', { ascending: false })
    .limit(10);

  if (!data || data.length === 0) return [];

  const issues = [];
  for (const row of data) {
    const model = row.metadata?.model || '';
    if (isPremiumModel(model)) {
      issues.push({
        location: `activity_log:${row.agent_id}:${row.action_type}`,
        issue: `Premium model used: ${model}`,
        severity: 'critical',
        fix: `Change to ${RECOMMENDED_HEBBEAT_MODEL}`
      });
    }
  }
  return issues;
};

const generateFixScript = (issues) => {
  const lines = ['#!/bin/bash', '# CostPilot Heartbeat Fix Script', `# Generated: ${new Date().toISOString()}`, ''];

  for (const issue of issues) {
    if (issue.location.startsWith('HEARTBEAT.md')) {
      lines.push(`# FIX: ${issue.issue}`);
      lines.push(`# File: ${issue.location}`);
      lines.push(`# Replace premium model with: ${RECOMMENDED_HEARTBEAT_MODEL}`);
      lines.push('');
    }
    if (issue.location.startsWith('cron:')) {
      lines.push(`# FIX: ${issue.issue}`);
      lines.push(`# Cron: ${issue.location}`);
      lines.push(`openclaw cron update <job-id> --model ${RECOMMENDED_HEARTBEAT_MODEL}`);
      lines.push('');
    }
  }

  lines.push(`echo "Recommended heartbeat model: ${RECOMMENDED_HEARTBEAT_MODEL}"`);
  lines.push(`echo "Update gateway config or HEARTBEAT.md to use this model."`);

  return lines.join('\n');
};

const runHeartbeatOptimizer = async () => {
  console.log('[CostPilot Heartbeat Optimizer] Scanning...');

  const allIssues = [];

  // Scan HEARTBEAT.md
  const hbContent = scanHeartbeatMd();
  if (hbContent) {
    const hbIssues = findPremiumHeartbeats(hbContent);
    allIssues.push(...hbIssues);
    hbIssues.forEach(i => console.log(`  [ISSUE] ${i.location}: ${i.issue}`));
  }

  // Scan OpenClaw cron config
  const cronIssues = scanOpenClawCron();
  allIssues.push(...cronIssues);
  cronIssues.forEach(i => console.log(`  [ISSUE] ${i.location}: ${i.issue}`));

  // Scan recent activity log for premium models
  const logIssues = await checkActivityLogForPremium();
  allIssues.push(...logIssues);
  logIssues.forEach(i => console.log(`  [ISSUE] ${i.location}: ${i.issue}`));

  const criticalCount = allIssues.filter(i => i.severity === 'critical').length;

  // Generate fix script
  const fixScript = generateFixScript(allIssues);
  const fixScriptPath = join(process.cwd(), 'skills', 'costpilot', 'scripts', 'heartbeat-fix.sh');
  writeFileSync(fixScriptPath, fixScript);

  // Log to Supabase
  await supabase.from('activity_log').insert({
    agent_id: 'costpilot',
    action_type: 'heartbeat_audit',
    title: `Heartbeat audit: ${criticalCount} premium model issues found`,
    description: allIssues.length === 0 ? 'No premium models detected in heartbeats' : `${allIssues.length} issues across heartbeat configs`,
    metadata: { issues: allIssues, critical_count: criticalCount, recommended_model: RECOMMENDED_HEARTBEAT_MODEL }
  });

  if (allIssues.length === 0) {
    const msg = `✅ [COSTPILOT] Heartbeat audit clean\n\nNo premium models detected in heartbeats.\nRecommended model: ${RECOMMENDED_HEARTBEAT_MODEL}`;
    console.log(msg);
    await sendTelegram(msg);
    return;
  }

  const msg = [
    `⚠️ [COSTPILOT] Heartbeat Optimization`,
    ``,
    `Found: ${allIssues.length} premium model issues`,
    `Critical: ${criticalCount}`,
    ``,
    ...allIssues.slice(0, 5).map(i => `• ${i.location}: ${i.issue}`),
    allIssues.length > 5 ? `  … and ${allIssues.length - 5} more` : '',
    ``,
    `Fix script: ${fixScriptPath}`,
    ``,
    `Replace all with: ${RECOMMENDED_HEARTBEAT_MODEL}`
  ].filter(Boolean).join('\n');

  console.log(msg);
  await sendTelegram(msg);

  console.log(`[CostPilot Heartbeat Optimizer] Complete. ${allIssues.length} issues found. Fix script written to ${fixScriptPath}.`);
};

runHeartbeatOptimizer().catch(e => {
  console.error('[CostPilot Heartbeat Optimizer] Fatal:', e.message);
  process.exit(1);
});
