import { config } from 'dotenv';
config({ path: '/home/saint/.openclaw/.env' });
import { createClient } from '@supabase/supabase-js';
import { report, reportError } from '../../ops/discord-reporter.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const sendTelegram = async (message) => {
  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message })
  });
};

const logToSupabase = async (title, description, metadata = {}) => {
  await supabase.from('activity_log').insert({
    agent_id: 'inspector',
    action_type: 'qa_report',
    title,
    description,
    metadata
  });
};

const runInspector = async () => {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const yesterdayStart = new Date(now);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  yesterdayStart.setHours(0,0,0,0);
  const yesterdayEnd = new Date(yesterdayStart);
  yesterdayEnd.setHours(23,59,59,999);

  const issues = [];
  const passes = [];

  // 1. Check Chase emails for placeholder text
  const { data: emailLogs } = await supabase
    .from('activity_log')
    .select()
    .eq('agent_id', 'chase')
    .in('action_type', ['email_sent', 'followup_sent'])
    .gte('created_at', yesterdayStart.toISOString())
    .lte('created_at', yesterdayEnd.toISOString());

  (emailLogs || []).forEach(log => {
    const text = JSON.stringify(log);
    if (text.includes('{{') || text.includes('undefined')) {
      issues.push({
        agent: 'chase',
        score: 'CRITICAL',
        item: log.title,
        reason: 'Placeholder text detected in email'
      });
    } else {
      passes.push({ agent: 'chase', item: log.title });
    }
  });

  // 2. Check Care ticket confidence scores
  const { data: careTickets } = await supabase
    .from('activity_log')
    .select()
    .eq('agent_id', 'care')
    .eq('action_type', 'ticket_responded')
    .gte('created_at', yesterdayStart.toISOString())
    .lte('created_at', yesterdayEnd.toISOString());

  (careTickets || []).forEach(log => {
    const confidence = log.metadata?.confidence;
    if (confidence !== undefined && confidence < 0.5) {
      issues.push({
        agent: 'care',
        score: 'CRITICAL',
        item: log.title,
        reason: `Confidence too low: ${confidence}`
      });
    } else if (confidence !== undefined && confidence < 0.75) {
      issues.push({
        agent: 'care',
        score: 'FAIL',
        item: log.title,
        reason: `Low confidence response: ${confidence}`
      });
    } else {
      passes.push({ agent: 'care', item: log.title });
    }
  });

  // 3. Check Ledger for expense anomalies
  const { data: expenses } = await supabase
    .from('expenses')
    .select()
    .gte('ts', yesterdayStart.toISOString())
    .lte('ts', yesterdayEnd.toISOString());

  (expenses || []).forEach(e => {
    if (parseFloat(e.amount) > 20) {
      issues.push({
        agent: 'ledger',
        score: 'FAIL',
        item: `${e.vendor} expense`,
        reason: `High single-day spend: $${parseFloat(e.amount).toFixed(2)}`
      });
    } else {
      passes.push({ agent: 'ledger', item: `${e.vendor}: $${parseFloat(e.amount).toFixed(2)}` });
    }
  });

  // 4. Check for silent agents (should have logged something)
  const EXPECTED_AGENTS = ['chase', 'care', 'insight'];
  const { data: allLogs } = await supabase
    .from('activity_log')
    .select('agent_id')
    .gte('created_at', yesterdayStart.toISOString())
    .lte('created_at', yesterdayEnd.toISOString());

  const activeAgents = [...new Set((allLogs || []).map(l => l.agent_id))];
  EXPECTED_AGENTS.forEach(agent => {
    if (!activeAgents.includes(agent)) {
      issues.push({
        agent,
        score: 'FAIL',
        item: `${agent} daily activity`,
        reason: 'No activity logged — agent may be down'
      });
    }
  });

  // Build report
  const criticals = issues.filter(i => i.score === 'CRITICAL');
  const fails = issues.filter(i => i.score === 'FAIL');

  let report = `🔍 Inspector Daily QA — ${dateStr}\n\n`;
  report += `REVIEWED: ${passes.length + issues.length} items\n`;
  report += `PASSED: ${passes.length}\n`;
  report += `FAILED: ${fails.length}\n`;
  report += `CRITICAL: ${criticals.length}\n`;

  if (issues.length > 0) {
    report += `\nISSUES FOUND\n`;
    issues.forEach(i => {
      report += `• [${i.score}] ${i.agent} — ${i.reason}\n`;
      report += `  Item: ${i.item}\n`;
    });
  } else {
    report += `\nAll checks passed ✅\n`;
  }

  report += `\n— Inspector`;

  console.log(report);
  await sendTelegram(report);
  await logToSupabase(
    `Daily QA — ${dateStr}`,
    report,
    {
      reviewed: passes.length + issues.length,
      passed: passes.length,
      failed: fails.length,
      criticals: criticals.length,
      issues: issues.map(i => ({ agent: i.agent, score: i.score, reason: i.reason }))
    }
  );

  // Immediate Telegram alert for criticals
  if (criticals.length > 0) {
    await sendTelegram(
      `🚨 INSPECTOR CRITICAL ALERT\n\n${criticals.map(c => `${c.agent}: ${c.reason}`).join('\n')}\n\nImmediate action required.`
    );
  }

  console.log('Inspector QA complete.');

  await report('inspector', {
    title: `Daily QA — ${dateStr}`,
    summary: `Reviewed: ${passes.length + issues.length}, Passed: ${passes.length}, Failed: ${fails.length}, Criticals: ${criticals.length}`,
    details: report,
    status: criticals.length > 0 ? 'error' : fails.length > 0 ? 'warning' : 'success',
    nextAction: criticals.length > 0 ? `Fix ${criticals.length} critical issues immediately` : fails.length > 0 ? `Review ${fails.length} failures` : 'All checks passed'
  }).catch(() => {});
};

runInspector().catch(async (e) => {
  console.error('[Inspector] QA failed:', e.message);
  await reportError('inspector', e.message, 'daily.js — Inspector daily QA').catch(() => {});
  process.exit(1);
});
