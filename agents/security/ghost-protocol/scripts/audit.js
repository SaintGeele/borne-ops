#!/usr/bin/env node
/**
 * audit.js — Ghost Protocol Data Separation Audit
 * Scans agent data flows, checks for violations of data classification rules.
 * Reports boundary violations and recommendations to Telegram.
 * 
 * Usage: node audit.js [--agent <name>] [--scope full|quick]
 */

import { config } from 'dotenv';
config({ path: '/home/saint/.openclaw/.env' });
import { createClient } from '@supabase/supabase-js';
import { readdirSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const AGENTS_DIR = '/home/saint/.openclaw/workspace/agents';

const sendTelegram = async (msg) => {
  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: msg, parse_mode: 'HTML' })
  });
};

// Data classification levels
const LEVELS = {
  0: 'Public',
  1: 'Internal',
  2: 'Confidential',
  3: 'Restricted'
};

// Agent access scopes
const AGENT_SCOPES = {
  'borneai': [0, 1, 2],
  'atlas': [0, 1, 2],
  'nexus': [0, 1, 2],
  'knox': [0, 1, 2, 3],
  'ivy': [0, 1],
  'forge': [0, 1, 2],
  'chase': [0, 1, 2],
  'lead-gen': [0, 1],
  'pipeline-analyst': [0, 1, 2],
  'sales-engineer': [0, 1, 2],
  'ghost-protocol': [0, 1, 2, 3],
  'automation-governance': [0, 1, 2],
  'self-healing-server': [0, 1],
  'ai-aeo-geo-strategist': [0, 1],
  'news-curator': [0, 1],
  'mercury': [0, 1, 2],
  'nova': [0, 1],
  'closer': [0, 1, 2],
  'default': [0, 1]
};

// Sensitive patterns that indicate data at risk
const SENSITIVE_PATTERNS = [
  { pattern: /supabase.*service.*key/i, level: 3, label: 'Service key in code' },
  { pattern: /api[_-]?key.*=.*['"][a-zA-Z0-9]{20,}/i, level: 3, label: 'Hardcoded API key' },
  { pattern: /password.*=.*['"][^'"]+['"]/i, level: 3, label: 'Hardcoded password' },
  { pattern: /leads.*select.*email/i, level: 2, label: 'Lead email query' },
  { pattern: /activity[_-]?log/i, level: 2, label: 'Activity log access' },
  { pattern: /client.*name|client.*data/i, level: 2, label: 'Client data reference' },
  { pattern: /\.env\b/i, level: 3, label: '.env file reference' },
];

// Check a file for violations
const scanFile = (filePath, agentName) => {
  if (!existsSync(filePath)) return [];
  
  const content = readFileSync(filePath, 'utf8');
  const violations = [];
  const agentScope = AGENT_SCOPES[agentName] || AGENT_SCOPES['default'];
  
  for (const { pattern, level, label } of SENSITIVE_PATTERNS) {
    if (pattern.test(content)) {
      const allowed = level <= Math.max(...agentScope);
      violations.push({
        file: filePath.replace(AGENTS_DIR + '/', ''),
        pattern: label,
        level,
        levelName: LEVELS[level],
        allowed,
        severity: allowed ? 'warn' : 'violation'
      });
    }
  }
  
  return violations;
};

// Scan all agent directories
const scanAgents = async () => {
  const allViolations = [];
  const agentDirs = readdirSync(AGENTS_DIR);
  
  for (const agent of agentDirs) {
    const agentPath = join(AGENTS_DIR, agent);
    const scriptsPath = join(agentPath, 'scripts');
    
    // Scan all JS/TS files in agent dir
    const scanDir = (dir) => {
      try {
        const files = readdirSync(dir);
        for (const file of files) {
          if (file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.md')) {
            const violations = scanFile(join(dir, file), agent);
            allViolations.push(...violations);
          }
        }
      } catch (e) {
        // Skip inaccessible dirs
      }
    };
    
    scanDir(agentPath);
    if (existsSync(scriptsPath)) scanDir(scriptsPath);
  }
  
  return allViolations;
};

const runAudit = async () => {
  console.log('[Ghost Protocol] Starting data separation audit...');
  
  const violations = await scanAgents();
  const critical = violations.filter(v => v.severity === 'violation');
  const warnings = violations.filter(v => v.severity === 'warn');
  
  console.log(`[Ghost Protocol] Found ${critical.length} violations, ${warnings.length} warnings`);
  
  await supabase.from('activity_log').insert({
    agent_id: 'ghost-protocol',
    action_type: 'data_separation_audit',
    title: `Ghost Protocol Audit: ${critical.length} violations, ${warnings.length} warnings`,
    description: `Data classification boundary check across ${Object.keys(AGENT_SCOPES).length} agents`,
    metadata: { violations: violations.length, critical: critical.length, warnings: warnings.length, findings: violations }
  });

  let msg = `👻 <b>Ghost Protocol — Data Separation Audit</b>\n\n`;
  
  if (critical.length === 0 && warnings.length === 0) {
    msg += `✅ No violations found. Agent data flows are clean.`;
  } else {
    if (critical.length > 0) {
      msg += `🚨 <b>${critical.length} Violation(s):</b>\n`;
      for (const v of critical.slice(0, 5)) {
        msg += `  • ${v.file}: ${v.pattern} [Level ${v.level} — ${v.levelName}]\n`;
      }
      if (critical.length > 5) msg += `  … and ${critical.length - 5} more\n`;
    }
    
    if (warnings.length > 0) {
      msg += `\n⚠️ <b>${warnings.length} Warning(s):</b>\n`;
      for (const v of warnings.slice(0, 5)) {
        msg += `  • ${v.file}: ${v.pattern} [Level ${v.level}]\n`;
      }
      if (warnings.length > 5) msg += `  … and ${warnings.length - 5} more\n`;
    }
  }
  
  await sendTelegram(msg);
  console.log('[Ghost Protocol] Audit complete.');
  
  if (critical.length > 0) process.exit(1);
};

runAudit().catch(e => {
  console.error('[Ghost Protocol] Fatal:', e.message);
  process.exit(1);
});
