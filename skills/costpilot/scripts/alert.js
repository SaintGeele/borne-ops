import { config } from 'dotenv';
config({ path: '/home/saint/.openclaw/.env' });
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const DAILY_LIMIT = parseFloat(process.env.COSTPILOT_DAILY_LIMIT || '5.00');
const MONTHLY_LIMIT = parseFloat(process.env.COSTPILOT_MONTHLY_LIMIT || '150.00');
const WARN_50 = parseFloat(process.env.COSTPILOT_WARN_50 || (DAILY_LIMIT * 0.5).toFixed(2));
const WARN_75 = parseFloat(process.env.COSTPILOT_WARN_75 || (DAILY_LIMIT * 0.75).toFixed(2));
const WARN_90 = parseFloat(process.env.COSTPILOT_WARN_90 || (DAILY_LIMIT * 0.9).toFixed(2));
const ALERT_COOLDOWN_MINUTES = parseInt(process.env.COSTPILOT_ALERT_COOLDOWN || '60');

const sendTelegram = async (message) => {
  if (!TELEGRAM_TOKEN) return;
  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message, parse_mode: 'HTML' })
  });
};

const getToday = () => new Date().toISOString().split('T')[0];

const getLatestDailySpend = async () => {
  const today = getToday();
  const { data } = await supabase
    .from('costpilot_daily_spend')
    .select('*')
    .eq('date', today)
    .single();
  return data;
};

// Track last alerted thresholds to avoid spam
const getLastAlert = async () => {
  const { data } = await supabase
    .from('activity_log')
    .select('created_at, metadata')
    .eq('agent_id', 'costpilot')
    .eq('action_type', 'budget_alert_sent')
    .order('created_at', { ascending: false })
    .limit(1);
  return data?.[0] || null;
};

const logAlertSent = async (threshold, spend, limit) => {
  await supabase.from('activity_log').insert({
    agent_id: 'costpilot',
    action_type: 'budget_alert_sent',
    title: `Budget alert ${threshold}%: $${spend.toFixed(2)} / $${limit}`,
    description: `Threshold: ${threshold}% | Spend: $${spend.toFixed(2)} | Limit: $${limit}`,
    metadata: { threshold, spend, limit, alert_type: 'budget' }
  });
};

const isInCooldown = (lastAlert) => {
  if (!lastAlert) return false;
  const cooldownMs = ALERT_COOLDOWN_MINUTES * 60 * 1000;
  return (Date.now() - new Date(lastAlert.created_at).getTime()) < cooldownMs;
};

const determineThreshold = (spend, limit) => {
  const pct = (spend / limit) * 100;
  if (pct >= 100) return 100;
  if (pct >= 90) return 90;
  if (pct >= 75) return 75;
  if (pct >= 50) return 50;
  return 0;
};

const runAlertCheck = async () => {
  console.log('[CostPilot Alert] Running threshold check...');

  const spendData = await getLatestDailySpend();
  const lastAlert = await getLastAlert();

  // Also check monthly
  const today = getToday();
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  const { data: monthData } = await supabase
    .from('costpilot_daily_spend')
    .select('total_spend')
    .gte('date', monthStart)
    .lte('date', today);

  const monthSpend = monthData?.reduce((sum, r) => sum + parseFloat(r.total_spend || 0), 0) || 0;

  // Use daily spend from latest record if available, otherwise estimate 0
  const dailySpend = spendData ? parseFloat(spendData.total_spend || 0) : 0;
  const dailyPct = DAILY_LIMIT > 0 ? (dailySpend / DAILY_LIMIT) * 100 : 0;
  const monthlyPct = MONTHLY_LIMIT > 0 ? (monthSpend / MONTHLY_LIMIT) * 100 : 0;

  console.log(`[CostPilot Alert] Daily: $${dailySpend.toFixed(4)} (${dailyPct.toFixed(1)}%)`);
  console.log(`[CostPilot Alert] Monthly: $${monthSpend.toFixed(2)} (${monthlyPct.toFixed(1)}%)`);

  // Determine highest threshold crossed
  const dailyThreshold = determineThreshold(dailySpend, DAILY_LIMIT);
  const monthlyThreshold = determineThreshold(monthSpend, MONTHLY_LIMIT);
  const activeThreshold = Math.max(dailyThreshold, monthlyThreshold);

  if (activeThreshold === 0) {
    console.log('[CostPilot Alert] No thresholds crossed. OK.');
    return;
  }

  // Check cooldown
  if (isInCooldown(lastAlert)) {
    const lastPct = lastAlert.metadata?.threshold || 0;
    if (activeThreshold <= lastPct) {
      console.log(`[CostPilot Alert] In cooldown. Last alert: ${lastAlert.metadata?.threshold}%, current: ${activeThreshold}%.`);
      return;
    }
  }

  // Send appropriate alert
  const thresholdConfig = {
    50: { emoji: '🟡', title: '50% DAILY BUDGET', action: 'Continue normal operations.' },
    75: { emoji: '🟠', title: '75% DAILY BUDGET', action: 'Auto-routing to cheaper models.' },
    90: { emoji: '🔴', title: '90% DAILY BUDGET', action: 'Blocking non-essential calls.' },
    100: { emoji: '🚨', title: 'DAILY LIMIT REACHED', action: 'Halting all non-essential operations.' }
  }[activeThreshold] || { emoji: '⚠️', title: 'BUDGET ALERT', action: 'Check spend immediately.' };

  const msg = [
    `${thresholdConfig.emoji} [COSTPILOT] ${thresholdConfig.title}`,
    ``,
    `Daily: $${dailySpend.toFixed(2)} / $${DAILY_LIMIT} (${dailyPct.toFixed(1)}%)`,
    `Monthly: $${monthSpend.toFixed(2)} / $${MONTHLY_LIMIT} (${monthlyPct.toFixed(1)}%)`,
    ``,
    `Action: ${thresholdConfig.action}`
  ].join('\n');

  console.log(msg);
  await sendTelegram(msg);
  await logAlertSent(activeThreshold, Math.max(dailySpend, monthSpend), activeThreshold === monthlyThreshold ? MONTHLY_LIMIT : DAILY_LIMIT);

  console.log('[CostPilot Alert] Alert sent. Complete.');
};

runAlertCheck().catch(e => {
  console.error('[CostPilot Alert] Fatal:', e.message);
  process.exit(1);
});
