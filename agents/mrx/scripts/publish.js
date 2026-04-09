import { config } from 'dotenv';
config({ path: '/home/saint/.openclaw/.env' });
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { report, reportError } from '../../ops/discord-reporter.js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const credsPath = path.join(process.env.HOME, '.openclaw/credentials/linkedin.json');
const linkedinCreds = JSON.parse(fs.readFileSync(credsPath, 'utf8'));

const sendTelegram = async (message) => {
  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message })
  });
};

const postToLinkedIn = async (text) => {
  const { access_token, person_id } = linkedinCreds;
  const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${access_token}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0'
    },
    body: JSON.stringify({
      author: `urn:li:person:${person_id}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text },
          shareMediaCategory: 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    })
  });
  const data = await res.json();
  if (data.status && data.status !== 201) throw new Error(data.message || JSON.stringify(data));
  return data.id;
};

const postToTwitter = async (text) => {
  const OAuth = (await import('oauth-1.0a')).default;
  const crypto = (await import('crypto')).default;

  const oauth = new OAuth({
    consumer: {
      key: process.env.X_API_KEY,
      secret: process.env.X_API_SECRET
    },
    signature_method: 'HMAC-SHA1',
    hash_function(base, key) {
      return crypto.createHmac('sha1', key).update(base).digest('base64');
    }
  });

  const token = {
    key: process.env.X_ACCESS_TOKEN,
    secret: process.env.X_ACCESS_TOKEN_SECRET
  };

  const url = 'https://api.twitter.com/2/tweets';
  const requestData = { url, method: 'POST' };
  const authHeader = oauth.toHeader(oauth.authorize(requestData, token));

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      ...authHeader,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ text })
  });

  const data = await res.json();
  if (data.errors) throw new Error(data.errors[0].message);
  return data.data?.id;
};

const publish = async () => {
  const now = new Date().toISOString();
  const { data: approved } = await supabase
    .from('content_bank')
    .select()
    .eq('status', 'approved')
    .or(`scheduled_for.is.null,scheduled_for.lte.${now}`)
    .order('scheduled_for', { ascending: true });

  if (!approved || approved.length === 0) {
    console.log('No approved posts to publish.');
    return;
  }

  console.log(`Publishing ${approved.length} approved posts...`);

  const results = { published: [], failed: [] };

  for (const post of approved) {
    const platform = post.platform?.[0];
    try {
      let postId = null;

      if (platform === 'linkedin') {
        postId = await postToLinkedIn(post.copy);
      } else if (platform === 'threads') {
        const { postToThreads } = await import('/home/saint/.openclaw/workspace/scripts/threads-post.js');
        postId = await postToThreads(post.copy);
      } else if (platform === 'twitter') {
        // Skip if no Twitter token
        if (!process.env.X_API_KEY) {
          console.log(`Skipping Twitter post — no X_API_KEY set`);
          results.failed.push({ title: post.title, reason: 'No X API key' });
          continue;
        }
        postId = await postToTwitter(post.copy);
      } else {
        console.log(`Skipping unknown platform: ${platform}`);
        continue;
      }

      // Mark as published
      await supabase
        .from('content_bank')
        .update({ status: 'published', notes: `Published. Post ID: ${postId}` })
        .eq('id', post.id);

      // Log to Chronicle
      await supabase.from('activity_log').insert({
        agent_id: 'mrx',
        action_type: 'post_published',
        title: `Published to ${platform}: ${post.title.slice(0, 50)}`,
        description: post.copy.slice(0, 150),
        metadata: { post_id: post.id, platform, external_id: postId }
      });

      results.published.push({ title: post.title, platform, postId });
      console.log(`Published: ${post.title.slice(0, 50)} → ${platform}`);

      // Rate limit buffer
      await new Promise(r => setTimeout(r, 2000));

    } catch (err) {
      console.error(`Failed: ${post.title} — ${err.message}`);
      results.failed.push({ title: post.title, platform, reason: err.message });

      await supabase.from('activity_log').insert({
        agent_id: 'mrx',
        action_type: 'publish_failed',
        title: `Failed to publish: ${post.title.slice(0, 50)}`,
        description: err.message,
        metadata: { post_id: post.id, platform, error: err.message }
      });
    }
  }

  // Report
  const msg = `🚀 MrX Publisher Report

Published: ${results.published.length}
Failed: ${results.failed.length}

${results.published.map(p => `✅ ${p.platform}: ${p.title.slice(0, 40)}`).join('\n')}
${results.failed.map(p => `❌ ${p.platform}: ${p.reason}`).join('\n')}`;

  console.log(msg);
  await sendTelegram(msg);
  console.log('Publisher complete.');

  await report('mrx', {
    title: `Publisher — ${results.published.length} posted, ${results.failed.length} failed`,
    summary: `${results.published.length} posts published. ${results.failed.length} failed.`,
    details: results.failed.length > 0 ? results.failed.map(p => `❌ ${p.platform}: ${p.reason}`).join('\n') : 'No failures',
    status: results.failed.length === 0 ? 'success' : results.failed.length < results.published.length ? 'warning' : 'error',
    nextAction: results.failed.length > 0 ? `Review ${results.failed.length} failed posts` : 'All posts published'
  }).catch(() => {});
};

publish().catch(async (e) => {
  console.error('[MrX] Publisher failed:', e.message);
  await reportError('mrx', e.message, 'publish.js — MrX publisher').catch(() => {});
  process.exit(1);
});
