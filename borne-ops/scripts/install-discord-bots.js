#!/usr/bin/env node
/**
 * install-discord-bots.js
 * One-time setup: give each agent bot access to its Discord channel.
 * Run this whenever a new agent bot is added to .env.
 *
 * Usage: node install-discord-bots.js
 */

import { config } from 'dotenv';
config({ path: '/home/saint/.openclaw/.env' });

const GUILD_ID = '1479519793378885894';

// Map of agent name → channel ID
const AGENT_CHANNELS = {
  borneai:    '1480000668021428415', // chief-of-staff
  nexus:      '1480000719724482744', // development
  atlas:      '1482611132077314088', // atlas-coordination
  knox:       '1480000802302202061', // vulnerability-scanning
  ghost:      '1480000802302202061', // vulnerability-scanning
  ivy:        '1480000762988728393', // lead-research
  chase:      '1480000844672794876', // cold-outreach
  leadgen:    '1480000844672794876', // cold-outreach
  mrx:        '1480000844672794876', // cold-outreach
  closer:     '1480000844672794876', // cold-outreach
  salesengineer: '1480000844672794876', // cold-outreach
  pipeline:   '1480000667392147568', // ceo-update
  mercury:    '1480000846065307732', // content-automation
  nova:       '1480000846065307732', // content-automation
  care:       '1480000803321155759', // client-management
  forge:      '1480000803321155759', // client-management
  beacon:     '1480000766428188763', // documentation
  aeogeo:     '1480000766428188763', // documentation
  chronicle:  '1480000766428188763', // documentation
  inspector:  '1482611004507685044', // agent-status
  governance: '1482611004507685044', // agent-status
  selfhealing: '1482611004507685044', // agent-status
  ledger:     '1480000667392147568', // ceo-update
  pulse:      '1480000667392147568', // ceo-update
  newscurator: '1480000762988728393', // lead-research
  aiageogeo:  '1480000766428188763', // documentation
  professor:  '1480000762988728393', // lead-research
};

// Permissions: VIEW_CHANNEL + SEND_MESSAGES + EMBED_LINKS = 1024 + 2048 + 1280 = 3072
const CHANNEL_ALLOW = 3072;

const getBotToken = (agent) => {
  const key = `DISCORD_${agent.toUpperCase()}_TOKEN`;
  return process.env[key] || process.env.DISCORD_BOT_TOKEN;
};

const getAppId = (agent) => {
  const key = `DISCORD_${agent.toUpperCase()}_APPLICATION_ID`;
  return process.env[key] || null;
};

const addMemberToChannel = async (agent, channelId, appId) => {
  const token = getBotToken(agent);
  if (!token) {
    console.log(`  ⏭️  No token for ${agent} — skipping`);
    return false;
  }

  const url = `https://discord.com/api/v10/channels/${channelId}/permissions/${appId}`;

  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bot ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 1, // member overwrite
        allow: CHANNEL_ALLOW,
        deny: 0,
      }),
    });

    if (res.ok) {
      console.log(`  ✅ ${agent} → channel access granted`);
      return true;
    } else {
      const text = await res.text();
      console.log(`  ❌ ${agent} → ${res.status}: ${text}`);
      return false;
    }
  } catch (e) {
    console.log(`  ❌ ${agent} → ${e.message}`);
    return false;
  }
};

const generateOAuthUrl = (appId, permissions = 18432) => {
  return `https://discord.com/oauth2/authorize?client_id=${appId}&permissions=${permissions}&scope=bot`;
};

const main = async () => {
  console.log('\n=== Discord Bot Channel Installer ===\n');

  const toInstall = Object.entries(AGENT_CHANNELS).filter(([agent]) => {
    const token = getBotToken(agent);
    if (!token) {
      console.log(`⏭️  ${agent}: no token in .env — will skip`);
      return false;
    }
    return true;
  });

  console.log(`Found ${toInstall.length} agents with tokens\n`);
  console.log('--- Granting channel access ---\n');

  // Use BorneAI admin token to set up all bots at once
  const adminToken = process.env.DISCORD_BOT_TOKEN;
  let success = 0;

  for (const [agent, channelId] of toInstall) {
    const appId = getAppId(agent);
    if (!appId) {
      console.log(`  ⏭️  ${agent}: no Application ID — generate OAuth URL first`);
      continue;
    }

    // Use admin bot to add each agent to their channel
    const url = `https://discord.com/api/v10/channels/${channelId}/permissions/${appId}`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bot ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 1,
        allow: CHANNEL_ALLOW,
        deny: 0,
      }),
    });

    if (res.ok) {
      console.log(`  ✅ ${agent} (${appId}) → channel access granted`);
      success++;
    } else {
      const text = await res.text();
      console.log(`  ❌ ${agent} → ${res.status}: ${text}`);
    }
  }

  console.log(`\n✅ ${success}/${toInstall.length} agents wired to channels\n`);

  // Generate OAuth URLs for any new bots that need installing
  console.log('--- OAuth URLs for new bots ---\n');
  for (const [agent, channelId] of Object.entries(AGENT_CHANNELS)) {
    const appId = getAppId(agent);
    const token = getBotToken(agent);
    if (appId && token) {
      const perms = agent === 'borneai' ? '8' : '18432';
      console.log(`${agent}: ${generateOAuthUrl(appId, perms)}`);
    }
  }

  console.log('\nNote: Bots need MANAGE_CHANNELS permission in OAuth to self-provision.');
  console.log('For future bots, use permissions=8 (admin) or add MANAGE_CHANNELS to the URL.\n');
};

main().catch(console.error);
