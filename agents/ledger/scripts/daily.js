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
const MONTHLY_BUDGET = 600;

const sendTelegram = async (message) => {
  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message })
  });
};

const logToSupabase = async (title, description, metadata = {}) => {
  await supabase.from('activity_log').insert({
    agent_id: 'ledger',
    action_type: 'financial_report',
    title,
    description,
    metadata
  });
};

const runDailyLedger = async () => {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  // Yesterday's variable spend (daily billing only)
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStart = new Date(yesterday); yesterdayStart.setHours(0,0,0,0);
  const yesterdayEnd = new Date(yesterday); yesterdayEnd.setHours(23,59,59,999);

  // Month to date window
  const mtdStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // Get all expenses
  const { data: allExpenses } = await supabase
    .from('expenses')
    .select();

  // Separate monthly fixed vs daily variable
  const monthlyFixed = (allExpenses || []).filter(e => e.billing === 'monthly');
  const dailyVariable = (allExpenses || []).filter(e => e.billing !== 'monthly');

  // Yesterday's variable spend
  const yesterdayVariable = dailyVariable.filter(e => {
    const ts = new Date(e.ts);
    return ts >= yesterdayStart && ts <= yesterdayEnd;
  });

  // MTD variable spend
  const mtdVariable = dailyVariable.filter(e => new Date(e.ts) >= mtdStart);

  // Fixed monthly total
  const fixedTotal = monthlyFixed.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
  const yesterdayTotal = yesterdayVariable.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
  const mtdVariableTotal = mtdVariable.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
  const mtdTotal = fixedTotal + mtdVariableTotal;

  // Group yesterday by vendor
  const byVendor = {};
  yesterdayVariable.forEach(e => {
    byVendor[e.vendor] = (byVendor[e.vendor] || 0) + parseFloat(e.amount || 0);
  });

  // Projection
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysElapsed = now.getDate();
  const projectedVariable = daysElapsed > 0 ? (mtdVariableTotal / daysElapsed) * daysInMonth : 0;
  const projectedTotal = fixedTotal + projectedVariable;

  // Build report
  let report = `💰 Ledger Daily — ${dateStr}\n\n`;

  report += `FIXED MONTHLY COSTS\n`;
  monthlyFixed.forEach(e => {
    report += `• ${e.vendor}: $${parseFloat(e.amount).toFixed(2)}\n`;
  });
  report += `Subtotal: $${fixedTotal.toFixed(2)}\n`;

  report += `\nVARIABLE SPEND (yesterday)\n`;
  if (Object.keys(byVendor).length > 0) {
    Object.entries(byVendor).forEach(([vendor, amount]) => {
      report += `• ${vendor}: $${amount.toFixed(2)}\n`;
    });
  } else {
    report += `• No variable spend yesterday\n`;
  }

  report += `\nMONTH TO DATE\n`;
  report += `• Fixed: $${fixedTotal.toFixed(2)}\n`;
  report += `• Variable: $${mtdVariableTotal.toFixed(2)}\n`;
  report += `• Total: $${mtdTotal.toFixed(2)} / $${MONTHLY_BUDGET} budget\n`;
  report += `• Projected: $${projectedTotal.toFixed(2)}\n`;

  const budgetStatus = projectedTotal > MONTHLY_BUDGET
    ? `Over budget by $${(projectedTotal - MONTHLY_BUDGET).toFixed(2)} ⚠️`
    : `On track ✅`;
  report += `• Status: ${budgetStatus}\n`;

  // Alerts
  const alerts = [];
  if (yesterdayTotal > 20) alerts.push(`High variable spend: $${yesterdayTotal.toFixed(2)}`);
  if (projectedTotal > MONTHLY_BUDGET) alerts.push(`Projected to exceed $${MONTHLY_BUDGET} budget`);

  if (alerts.length > 0) {
    report += `\nALERTS\n`;
    alerts.forEach(a => report += `• ${a}\n`);
  }

  report += `\n— Ledger`;

  console.log(report);
  await sendTelegram(report);
  await logToSupabase(
    `Daily ledger — ${dateStr}`,
    report,
    {
      fixed_total: fixedTotal,
      variable_yesterday: yesterdayTotal,
      mtd_total: mtdTotal,
      projected_total: projectedTotal,
      alerts: alerts.length
    }
  );

  console.log('Ledger daily complete.');

  await report('ledger', {
    title: `Daily Ledger — ${dateStr}`,
    summary: `MTD: $${mtdTotal.toFixed(2)}, Projected: $${projectedTotal.toFixed(2)}, Alerts: ${alerts.length}`,
    details: report,
    status: alerts.length > 0 ? 'warning' : 'success',
    nextAction: alerts.length > 0 ? `Review ${alerts.length} financial alerts` : 'On track'
  }).catch(() => {});
};

runDailyLedger().catch(async (e) => {
  console.error('[Ledger] Daily ledger failed:', e.message);
  await reportError('ledger', e.message, 'daily.js — Ledger daily financial report').catch(() => {});
  process.exit(1);
});
