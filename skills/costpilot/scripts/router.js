import { config } from 'dotenv';
config({ path: '/home/saint/.openclaw/.env' });
import { createClient } from '@supabase/supabase-js';
import { spawn } from 'child_process';
import { readFileSync } from 'fs';
import { join } from 'path';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const DAILY_LIMIT = parseFloat(process.env.COSTPILOT_DAILY_LIMIT || '5.00');
const AUTO_ROUTE = process.env.COSTPILOT_AUTO_ROUTE !== 'false';
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Model routing chain — progressively cheaper
const MODEL_CHAIN = [
  { model: 'minimax/minimax-m2.7', threshold: 0 },       // default
  { model: 'openai/gpt-5-nano', threshold: 75 },         // 75%+
  { model: 'google/gemini-2.5-flash', threshold: 90 },    // 90%+
  { model: null, threshold: 100 },                        // block
];

const sendTelegram = async (message) => {
  if (!TELEGRAM_TOKEN) return;
  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message, parse_mode: 'HTML' })
  });
};

const getToday = () => new Date().toISOString().split('T')[0];

const getCurrentSpend = async () => {
  const today = getToday();
  const { data } = await supabase
    .from('costpilot_daily_spend')
    .select('total_spend')
    .eq('date', today)
    .single();
  return data ? parseFloat(data.total_spend || 0) : 0;
};

const determineRoute = (spend) => {
  if (!AUTO_ROUTE) return { route: 'minimax/minimax-m2.7', reason: 'auto_route_disabled' };

  const pct = DAILY_LIMIT > 0 ? (spend / DAILY_LIMIT) * 100 : 0;
  let route = MODEL_CHAIN[0];

  for (const step of MODEL_CHAIN) {
    if (pct >= step.threshold) route = step;
  }

  if (route.model === null) {
    return { route: null, reason: 'blocked', pct, spend };
  }

  return { route: route.model, reason: pct >= 75 ? `budget_${Math.floor(pct)}pct` : 'under_75pct', pct, spend };
};

// CLI: node router.js --model "openai/gpt-4o" --prompt "Hello"
const parseArgs = () => {
  const args = process.argv.slice(2);
  let model = null;
  let prompt = null;
  let costOnly = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--model' && args[i + 1]) model = args[++i];
    if (args[i] === '--prompt' && args[i + 1]) prompt = args[++i];
    if (args[i] === '--cost-only') costOnly = true;
  }
  return { model, prompt, costOnly };
};

const callOpenRouter = async (model, prompt) => {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://bornesystems.com',
      'X-Title': 'Borne Systems CostPilot'
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000
    })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'OpenRouter error');
  return data;
};

const estimateTokens = (text) => Math.ceil((text || '').length / 4);

const logRoutedCall = async (originalModel, routedModel, reason, prompt) => {
  const promptTokens = estimateTokens(prompt);
  const completionTokens = 0;

  const ORIGINAL_PRICES = { 'openai/gpt-4o': { input: 2.50, output: 10.00 }, 'anthropic/claude-sonnet-4-6': { input: 3.00, output: 15.00 } };
  const ROUTED_PRICES = { 'minimax/minimax-m2.7': { input: 0, output: 0 }, 'openai/gpt-5-nano': { input: 0.10, output: 0.40 }, 'google/gemini-2.5-flash': { input: 0.075, output: 0.30 } };

  const origPrice = ORIGINAL_PRICES[originalModel] || { input: 1.00, output: 5.00 };
  const routedPrice = ROUTED_PRICES[routedModel] || { input: 0, output: 0 };

  const origCost = (origPrice.input * promptTokens / 1_000_000) + (origPrice.output * completionTokens / 1_000_000);
  const routedCost = (routedPrice.input * promptTokens / 1_000_000) + (routedPrice.output * completionTokens / 1_000_000);
  const savings = origCost - routedCost;

  await supabase.from('activity_log').insert({
    agent_id: 'costpilot',
    action_type: 'model_routed',
    title: `Model routed: ${originalModel} → ${routedModel}`,
    description: `Reason: ${reason} | Est. savings: $${savings.toFixed(6)}`,
    metadata: { original_model: originalModel, routed_model: routedModel, reason, prompt_tokens: promptTokens, estimated_savings: savings }
  });
};

const runRouter = async ({ model, prompt, costOnly }) => {
  if (!model) {
    // Just print current route recommendation
    const spend = await getCurrentSpend();
    const { route, reason, pct } = determineRoute(spend);
    console.log(`[CostPilot Router] Current: $${spend.toFixed(4)} / $${DAILY_LIMIT} (${pct.toFixed(1)}%)`);
    console.log(`[CostPilot Router] Recommended model: ${route || 'BLOCKED'} | Reason: ${reason}`);
    return { recommended: route || 'BLOCKED', reason, spend, pct };
  }

  const spend = await getCurrentSpend();
  const { route, reason, pct } = determineRoute(spend);

  if (route === null) {
    console.warn(`[CostPilot Router] BLOCKED: 100% daily budget reached ($${spend.toFixed(4)} / $${DAILY_LIMIT})`);
    console.warn('[CostPilot Router] Non-essential call blocked. Use a cheaper model or wait until tomorrow.');
    await sendTelegram(`[COSTPILOT] Call blocked — 100% daily budget reached ($${spend.toFixed(4)} / $${DAILY_LIMIT}). Override requires COSTPILOT_AUTO_ROUTE=false.`);
    process.exit(1);
  }

  if (route === model || reason === 'auto_route_disabled') {
    console.log(`[CostPilot Router] Using requested model: ${model}`);
    return { recommended: model, reason, spend, pct };
  }

  console.log(`[CostPilot Router] Routing ${model} → ${route} (${pct.toFixed(1)}% daily budget)`);

  if (costOnly) {
    return { recommended: route, original: model, reason, spend, pct };
  }

  // Actually make the call with routed model
  try {
    const result = await callOpenRouter(route, prompt);
    await logRoutedCall(model, route, reason, prompt);
    console.log(`[CostPilot Router] Success via ${route}`);
    return { result, recommended: route, original: model, reason, spend, pct };
  } catch (e) {
    console.error(`[CostPilot Router] Routed call failed: ${e.message}`);
    console.error(`[CostPilot Router] Falling back to requested model: ${model}`);
    // Fall back to original model
    const result = await callOpenRouter(model, prompt);
    return { result, recommended: model, reason: 'fallback', spend, pct };
  }
};

const { model, prompt, costOnly } = parseArgs();
runRouter({ model, prompt, costOnly }).catch(e => {
  console.error('[CostPilot Router] Fatal:', e.message);
  process.exit(1);
});
