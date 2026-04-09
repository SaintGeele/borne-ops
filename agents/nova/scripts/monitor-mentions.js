#!/usr/bin/env node
/**
 * Nova — Mention & Engagement Monitor
 * Checks Twitter/X mentions every 30 min
 * Alerts Geele via Telegram for any engagement
 * Logs to Supabase activity_log
 */

import { config } from 'dotenv';
config({ path: '/home/saint/.openclaw/.env' });
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import fs from 'fs';
import { report, reportError } from '../../ops/discord-reporter.js';

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const LOG = '/home/saint/.openclaw/logs/nova-mentions.log';

// Twitter OAuth 1.0a
const TWITTER = {
  apiKey: process.env.X_API_KEY,
  apiSecret: process.env.X_CONSUMER_SECRET,
  accessToken: process.env.X_ACCESS_TOKEN,
  accessSecret: process.env.X_ACCESS_TOKEN_SECRET,
};

function log(entry) {
  fs.mkdirSync('/home/saint/.openclaw/logs', { recursive: true });
  fs.appendFileSync(LOG, JSON.stringify({ ts: new Date().toISOString(), ...entry }) + '\n');
}

async function sendTelegram(msg) {
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: msg, parse_mode: 'Markdown' })
    });
  } catch (e) { log({ error: 'telegram_failed', msg: e.message }); }
}

function oauthSign(method, url, params, consumerSecret, tokenSecret) {
  const baseParams = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
  const baseString = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(baseParams)}`;
  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`;
  return crypto.createHmac('sha1', signingKey).update(baseString).digest('base64');
}

function buildOauthHeader(method, url, extraParams = {}) {
  const oauthParams = {
    oauth_consumer_key: TWITTER.apiKey,
    oauth_nonce: crypto.randomBytes(16).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: TWITTER.accessToken,
    oauth_version: '1.0',
  };
  const allParams = { ...oauthParams, ...extraParams };
  oauthParams.oauth_signature = oauthSign(method, url, allParams, TWITTER.apiSecret, TWITTER.accessSecret);
  const header = 'OAuth ' + Object.entries(oauthParams)
    .map(([k, v]) => `${encodeURIComponent(k)}="${encodeURIComponent(v)}"`)
    .join(', ');
  return header;
}

async function getMentions() {
  // Get mentions timeline
  const url = 'https://api.twitter.com/2/tweets/search/recent';
  const params = {
    query: '@BorneSystems -is:retweet',
    max_results: '10',
    'tweet.fields': 'created_at,author_id,text',
    'expansions': 'author_id',
    'user.fields': 'name,username',
  };

  const queryString = new URLSearchParams(params).toString();
  const fullUrl = `${url}?${queryString}`;
  const authHeader = buildOauthHeader('GET', url, params);

  const res = await fetch(fullUrl, {
    headers: { Authorization: authHeader }
  });
  return await res.json();
}

async function getLastProcessedId() {
  const { data } = await sb
    .from('activity_log')
    .select('metadata')
    .eq('agent_id', 'nova')
    .eq('action_type', 'mention_check')
    .order('created_at', { ascending: false })
    .limit(1);
  return data?.[0]?.metadata?.last_tweet_id || null;
}

async function run() {
  log({ note: 'mention_check_started' });

  if (!TWITTER.apiKey || !TWITTER.accessToken) {
    log({ error: 'missing_twitter_credentials' });
    return;
  }

  const lastId = await getLastProcessedId();
  const data = await getMentions();

  if (data.errors || !data.data) {
    log({ error: 'twitter_api_error', details: JSON.stringify(data).slice(0, 200) });
    await sb.from('activity_log').insert({
      agent_id: 'nova',
      action_type: 'mention_check',
      title: 'Mention check — no results or error',
      metadata: { error: JSON.stringify(data).slice(0, 200), last_tweet_id: lastId }
    });
    return;
  }

  const tweets = data.data || [];
  const users = Object.fromEntries((data.includes?.users || []).map(u => [u.id, u]));

  // Filter new mentions only
  const newMentions = lastId
    ? tweets.filter(t => t.id > lastId)
    : tweets;

  log({ note: 'mentions_found', total: tweets.length, new: newMentions.length });

  if (newMentions.length > 0) {
    for (const tweet of newMentions) {
      const user = users[tweet.author_id];
      const username = user?.username || 'unknown';
      const name = user?.name || 'Someone';

      const msg = [
        `💬 *New @BorneSystems Mention*`,
        ``,
        `*From:* @${username} (${name})`,
        `*Tweet:* ${tweet.text.slice(0, 200)}`,
        ``,
        `*Reply:* https://twitter.com/intent/tweet?in_reply_to=${tweet.id}`,
        `*View:* https://twitter.com/${username}/status/${tweet.id}`,
      ].join('\n');

      await sendTelegram(msg);

      await sb.from('activity_log').insert({
        agent_id: 'nova',
        action_type: 'mention_detected',
        title: `@${username} mentioned @BorneSystems`,
        description: tweet.text.slice(0, 200),
        metadata: { tweet_id: tweet.id, username, text: tweet.text }
      });
    }
  }

  // Log the check with latest tweet ID
  const latestId = tweets[0]?.id || lastId;
  await sb.from('activity_log').insert({
    agent_id: 'nova',
    action_type: 'mention_check',
    title: `Mention check — ${newMentions.length} new`,
    metadata: { last_tweet_id: latestId, checked: tweets.length, new_mentions: newMentions.length }
  });

  log({ note: 'mention_check_complete', new_mentions: newMentions.length });

  await report('nova', {
    title: `Mention Monitor — ${newMentions.length} new mentions`,
    summary: `Checked ${tweets.length} tweets. ${newMentions.length} new mentions.`,
    details: newMentions.slice(0, 5).map(m => `• @${m.username}: ${m.text?.substring(0, 60)}…`).join('\n'),
    status: newMentions.length > 0 ? 'warning' : 'info',
    nextAction: newMentions.length > 0 ? `Review ${newMentions.length} new mentions` : 'No new mentions'
  }).catch(() => {});
}

run().catch(async (e) => {
  log({ error: e.message });
  await reportError('nova', e.message, 'monitor-mentions.js — Nova mention monitor').catch(() => {});
  process.exit(1);
});
