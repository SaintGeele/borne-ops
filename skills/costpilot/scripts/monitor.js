import { config } from 'dotenv';
config({ path: '/home/saint/.openclaw/.env' });
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// CostPilot thresholds
const DAILY_LIMIT = parseFloat(process.env.COSTPILOT_DAILY_LIMIT || '5.00');
const MONTHLY_LIMIT = parseFloat(process.env.COSTPILOT_MONTHLY_LIMIT || '150.00');

// Model pricing per 1M tokens (input, output) — Fallback if OpenRouter key not available
const MODEL_PRICES = {
  'minimax/minimax-m2.7':              { input: 0,      output: 0 },
  'minimax/minimax-m2.7-highspeed':    { input: 0,      output: 0 },
  'google/gemini-2.5-flash':           { input: 0.075,  output: 0.30 },
  'openai/gpt-5-nano':                 { input: 0.10,   output: 0.40 },
  'anthropic/claude-sonnet-4-6':       { input: 3.00,   output: 15.00 },
  'openai/gpt-4o':                     { input: 2.50,   output: 10.00 },
  'openai/gpt-4o-mini':                { input: 0.15,   output: 0.60 },
  'deepseek/deepseek-v3.2':            { input: 0.14,   output: 0.28 },
  'default':                           { input: 1.00,   output: 5.00 },
};

const sendTelegram = async (message) => {
  if (!TELEGRAM_TOKEN) return;
  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message, parse_mode: 'HTML' })
  });
};

const getModelPrice = (model) => {
  const m = model?.toLowerCase() || '';
  for (const [key, price] of Object.entries(MODEL_PRICES)) {
    if (key === 'default') continue;
    if (m.includes(key.replace('openrouter/', ''))) return price;
    if (m.includes(key)) return price;
  }
  return MODEL_PRICES['default'];
};

const calcCost = (model, promptTokens, completionTokens) => {
  const price = getModelPrice(model);
  return (price.input * promptTokens / 1_000_000) + (price.output * completionTokens / 1_000_000);
};

// Try to get real usage from OpenRouter key via /api/v1/me endpoint
const fetchOpenRouterUsage = async () => {
  if (!OPENROUTER_API_KEY) return null;
  try {
    const res = await fetch('https://openrouter.ai/api/v1/models', {
      headers: { 'Authorization': `Bearer ${OPENROUTER_API_KEY}` }
    });
    // OpenRouter doesn't have a direct usage API for all users
    // Fall back to estimated from our logs
    return null;
  } catch { return null; }
};

// Estimate from Supabase activity_log metadata (if agents log token usage)
const estimateFromActivityLog = async (since, until) => {
  const { data, error } = await supabase
    .from('activity_log')
    .select('metadata, agent_id, action_type, created_at')
    .gte('created_at', since)
    .lt('created_at', until);

  if (error || !data) return { totalCost: 0, requestCount: 0, byAgent: {} };

  let totalCost = 0;
  let requestCount = 0;
  const byAgent = {};
  const byModel = {};

  for (const row of data) {
    const meta = row.metadata || {};
    const promptTokens = meta.prompt_tokens || meta.input_tokens || 0;
    const completionTokens = meta.completion_tokens || meta.output_tokens || 0;
    const model = meta.model || meta.llm_model || 'default';
    const cost = calcCost(model, promptTokens, completionTokens);

    if (cost > 0) {
      totalCost += cost;
      requestCount++;
      byAgent[row.agent_id] = (byAgent[row.agent_id] || 0) + cost;
      byModel[model] = (byModel[model] || 0) + cost;
    }
  }

  return { totalCost, requestCount, byAgent, byModel };
};

const getToday = () => new Date().toISOString().split('T')[0];
const getMonthStart = () => new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

const getTopAgent = (byAgent) => {
  const entries = Object.entries(byAgent);
  if (!entries.length) return null;
  return entries.sort((a, b) => b[1] - a[1])[0][0];
};

const logDailySpend = async (date, totalSpend, requestCount, byAgent) => {
  const { error } = await supabase
    .from('costpilot_daily_spend')
    .upsert({
      date,
      total_spend: totalSpend,
      request_count: requestCount,
      avg_cost_per_request: requestCount > 0 ? totalSpend / requestCount : 0,
      top_agent: getTopAgent(byAgent),
      updated_at: new Date().toISOString()
    }, { onConflict: 'date' });

  if (error) console.warn('[CostPilot Monitor] Failed to upsert daily spend:', error.message);
};

const runMonitor = async () => {
  const today = getToday();
  const monthStart = getMonthStart();
  const now = new Date();

  console.log(`[CostPilot Monitor] Running at ${now.toISOString()}`);

  // Estimate today's cost from activity log
  const todayStart = `${today}T00:00:00Z`;
  const todayEnd = `${today}T23:59:59Z`;
  const todayData = await estimateFromActivityLog(todayStart, todayEnd);

  // Estimate month cost
  const monthData = await estimateFromActivityLog(monthStart, todayEnd);

  const dailyPct = DAILY_LIMIT > 0 ? (todayData.totalCost / DAILY_LIMIT) * 100 : 0;
  const monthlyPct = MONTHLY_LIMIT > 0 ? (monthData.totalCost / MONTHLY_LIMIT) * 100 : 0;

  console.log(`[CostPilot Monitor] Today: $${todayData.totalCost.toFixed(4)} / $${DAILY_LIMIT} (${dailyPct.toFixed(1)}%)`);
  console.log(`[CostPilot Monitor] Month: $${monthData.totalCost.toFixed(2)} / $${MONTHLY_LIMIT} (${monthlyPct.toFixed(1)}%)`);

  // Log to Supabase
  await logDailySpend(today, todayData.totalCost, todayData.requestCount, todayData.byAgent);

  // Alert conditions
  if (dailyPct >= 100) {
    console.warn('[CostPilot] DAILY LIMIT REACHED');
    await sendTelegram(`🚨 [COSTPILOT] DAILY LIMIT REACHED\n$${todayData.totalCost.toFixed(2)} / $${DAILY_LIMIT}\nHalting non-essential operations.`);
  } else if (dailyPct >= 90) {
    console.warn('[CostPilot] 90% budget — blocking non-essential calls');
    await sendTelegram(`🔴 [COSTPILOT] 90% DAILY BUDGET\n$${todayData.totalCost.toFixed(2)} / $${DAILY_LIMIT}\nBlocking non-essential calls.`);
  } else if (dailyPct >= 75) {
    console.warn('[CostPilot] 75% budget — auto-routing active');
    await sendTelegram(`🟠 [COSTPILOT] 75% DAILY BUDGET\n$${todayData.totalCost.toFixed(2)} / $${DAILY_LIMIT}\nAuto-routing to cheaper models.`);
  } else if (dailyPct >= 50) {
    console.log('[CostPilot] 50% budget — warning');
    await sendTelegram(`🟡 [COSTPILOT] 50% DAILY BUDGET\n$${todayData.totalCost.toFixed(2)} / $${DAILY_LIMIT}`);
  }

  // Also log activity
  await supabase.from('activity_log').insert({
    agent_id: 'costpilot',
    action_type: 'cost_monitor_run',
    title: `Cost monitor: $${todayData.totalCost.toFixed(4)} today (${dailyPct.toFixed(1)}%)`,
    description: `Month: $${monthData.totalCost.toFixed(2)} | ${todayData.requestCount} requests | Top: ${getTopAgent(todayData.byAgent) || 'none'}`,
    metadata: {
      daily_spend: todayData.totalCost,
      daily_limit: DAILY_LIMIT,
      daily_pct: dailyPct,
      monthly_spend: monthData.totalCost,
      monthly_limit: MONTHLY_LIMIT,
      monthly_pct: monthlyPct,
      request_count: todayData.requestCount,
      by_agent: todayData.byAgent,
      by_model: todayData.byModel
    }
  });

  console.log('[CostPilot Monitor] Complete.');
};

runMonitor().catch(e => {
  console.error('[CostPilot Monitor] Fatal:', e.message);
  process.exit(1);
});
