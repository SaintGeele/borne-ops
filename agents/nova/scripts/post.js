#!/usr/bin/env node
/**
 * Nova — Social Publishing Script
 * Takes a content brief and publishes to X/Twitter and LinkedIn
 * Logs all activity to Supabase activity_log
 * 
 * Usage:
 *   node post.js --brief "Post text" --platforms x,linkedin --image "optional image path" --schedule "2026-04-07T10:00:00Z"
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// === CONFIG ===
const CONFIG = {
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_KEY,
  twitterApiKey: process.env.TWITTER_API_KEY,
  twitterApiSecret: process.env.TWITTER_API_SECRET,
  twitterAccessToken: process.env.TWITTER_ACCESS_TOKEN,
  twitterAccessSecret: process.env.TWITTER_ACCESS_SECRET,
  linkedinClientId: process.env.LINKEDIN_CLIENT_ID,
  linkedinClientSecret: process.env.LINKEDIN_CLIENT_SECRET,
  linkedinAccessToken: process.env.LINKEDIN_ACCESS_TOKEN,
  n8nWebhookUrl: process.env.N8N_WEBHOOK_URL,
};

// Brand colors for image generation references
const BRAND_COLORS = {
  blue: '#0066CC',
  orange: '#FF6B35',
  olive: '#7A8B5A',
};

// === CLI PARSING ===
function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {
    brief: '',
    platforms: [],
    image: null,
    schedule: null,
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--brief' && args[i + 1]) {
      parsed.brief = args[++i];
    } else if (args[i] === '--platforms' && args[i + 1]) {
      parsed.platforms = args[++i].split(',').map(p => p.trim().toLowerCase());
    } else if (args[i] === '--image' && args[i + 1]) {
      parsed.image = args[++i];
    } else if (args[i] === '--schedule' && args[i + 1]) {
      parsed.schedule = args[++i];
    }
  }

  return parsed;
}

// === SUPABASE LOGGING ===
async function logToSupabase({ action, details, agent = 'nova', platform = null }) {
  if (!CONFIG.supabaseUrl || !CONFIG.supabaseKey) {
    console.warn('[Nova] Supabase credentials not configured, skipping log');
    return null;
  }

  const payload = {
    agent,
    action,
    details: typeof details === 'string' ? details : JSON.stringify(details),
    platform,
    created_at: new Date().toISOString(),
  };

  try {
    const response = await fetch(`${CONFIG.supabaseUrl}/rest/v1/activity_log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': CONFIG.supabaseKey,
        'Authorization': `Bearer ${CONFIG.supabaseKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.warn('[Nova] Failed to log to Supabase:', response.status);
      return null;
    }

    const result = await response.json();
    console.log(`[Nova] Logged to Supabase: ${action}`);
    return result;
  } catch (err) {
    console.error('[Nova] Supabase log error:', err.message);
    return null;
  }
}

// === X/TWITTER POSTING ===
async function postToTwitter(content, imagePath = null) {
  if (!CONFIG.twitterAccessToken || !CONFIG.twitterAccessSecret) {
    console.warn('[Nova] Twitter credentials not configured, skipping X post');
    return { success: false, reason: 'credentials_missing' };
  }

  try {
    // Note: In production, use a proper Twitter API v2 client
    // This is a simplified example using the Twitter API
    console.log(`[Nova] Posting to X/Twitter: "${content.substring(0, 50)}..."`);

    // Simulate API call (replace with actual Twitter API integration)
    const postData = {
      text: content,
      ...(imagePath && { media: { media_ids: [imagePath] } }),
    };

    // TODO: Implement actual Twitter API v2 call using credentials
    // Example: 
    // const response = await twitterClient.v2.tweet(content);
    
    await logToSupabase({
      action: 'post_twitter',
      details: { content, imagePath, status: 'simulated' },
      platform: 'x',
    });

    return { success: true, platform: 'x', postId: `simulated_${Date.now()}` };
  } catch (err) {
    console.error('[Nova] Twitter post failed:', err.message);
    return { success: false, reason: err.message, platform: 'x' };
  }
}

// === LINKEDIN POSTING ===
async function postToLinkedIn(content, imagePath = null) {
  if (!CONFIG.linkedinAccessToken) {
    console.warn('[Nova] LinkedIn credentials not configured, skipping LinkedIn post');
    return { success: false, reason: 'credentials_missing' };
  }

  try {
    console.log(`[Nova] Posting to LinkedIn: "${content.substring(0, 50)}..."`);

    // Note: In production, use LinkedIn's API
    // Simplified example:
    // const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    //   method: 'POST',
    //   headers: { 'Authorization': `Bearer ${CONFIG.linkedinAccessToken}` },
    //   body: JSON.stringify({ ... }),
    // });

    await logToSupabase({
      action: 'post_linkedin',
      details: { content, imagePath, status: 'simulated' },
      platform: 'linkedin',
    });

    return { success: true, platform: 'linkedin', postId: `simulated_${Date.now()}` };
  } catch (err) {
    console.error('[Nova] LinkedIn post failed:', err.message);
    return { success: false, reason: err.message, platform: 'linkedin' };
  }
}

// === N8N SCHEDULING ===
async function scheduleViaN8n({ content, platforms, imagePath, scheduledTime }) {
  if (!CONFIG.n8nWebhookUrl) {
    console.warn('[Nova] n8n webhook not configured, skipping schedule');
    return { success: false, reason: 'n8n_not_configured' };
  }

  try {
    const payload = {
      content,
      platforms,
      imagePath,
      scheduledTime,
      source: 'nova',
    };

    const response = await fetch(CONFIG.n8nWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`n8n returned ${response.status}`);
    }

    await logToSupabase({
      action: 'schedule_n8n',
      details: { content, platforms, scheduledTime },
      platform: 'n8n',
    });

    console.log(`[Nova] Scheduled via n8n for ${scheduledTime}`);
    return { success: true, platform: 'n8n' };
  } catch (err) {
    console.error('[Nova] n8n scheduling failed:', err.message);
    return { success: false, reason: err.message };
  }
}

// === MAIN ===
async function main() {
  const args = parseArgs();

  if (!args.brief) {
    console.error('[Nova] Error: --brief is required');
    console.error('Usage: node post.js --brief "Post text" --platforms x,linkedin [--image path] [--schedule ISO date]');
    process.exit(1);
  }

  if (args.platforms.length === 0) {
    console.error('[Nova] Error: --platforms is required (x, linkedin, or both)');
    process.exit(1);
  }

  console.log('[Nova] Starting social publish job');
  console.log(`[Nova] Brief: ${args.brief}`);
  console.log(`[Nova] Platforms: ${args.platforms.join(', ')}`);
  console.log(`[Nova] Image: ${args.image || 'none'}`);
  console.log(`[Nova] Schedule: ${args.schedule || 'immediate'}`);

  const results = [];

  // Handle scheduled posts via n8n
  if (args.schedule) {
    const scheduleResult = await scheduleViaN8n({
      content: args.brief,
      platforms: args.platforms,
      imagePath: args.image,
      scheduledTime: args.schedule,
    });
    results.push(scheduleResult);
  } else {
    // Immediate posting
    for (const platform of args.platforms) {
      if (platform === 'x' || platform === 'twitter') {
        results.push(await postToTwitter(args.brief, args.image));
      } else if (platform === 'linkedin') {
        results.push(await postToLinkedIn(args.brief, args.image));
      }
    }
  }

  // Summary
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log('\n[Nova] === Publishing Summary ===');
  console.log(`[Nova] Successful: ${successful}`);
  console.log(`[Nova] Failed: ${failed}`);
  
  if (failed > 0) {
    const failedDetails = results.filter(r => !r.success);
    console.log('[Nova] Failures:', JSON.stringify(failedDetails, null, 2));
  }

  await logToSupabase({
    action: 'publish_job_complete',
    details: { brief: args.brief, platforms: args.platforms, results },
    platform: 'all',
  });

  process.exit(failed > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('[Nova] Fatal error:', err);
  process.exit(1);
});
