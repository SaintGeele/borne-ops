#!/usr/bin/env node
/**
 * generate-oauth-urls.js
 * Generate OAuth install URLs for new Discord bots.
 * Bots need MANAGE_CHANNELS (16) + SEND_MESSAGES (2048) + EMBED_LINKS (1280) = 3344
 *
 * Usage: node generate-oauth-urls.js [agentName] [appId]
 *   node generate-oauth-urls.js leadgen 1491615304038481960
 *   node generate-oauth-urls.js all
 */

import { config } from 'dotenv';
config({ path: '/home/saint/.openclaw/.env' });

// Permissions: VIEW_CHANNEL(1024) + SEND_MESSAGES(2048) + EMBED_LINKS(1280) + MANAGE_CHANNELS(16) = 4368
const BASE_PERMS = 4368;

// Agents that have bots but might not be installed yet
const KNOWN_AGENTS = {
  boreai:     { appId: '1476443281956143136', channel: 'chief-of-staff' },
  nexus:      { appId: '1479573890601582734', channel: 'development' },
  ivy:        { appId: '1479574030607581366', channel: 'lead-research' },
  knox:       { appId: '1479574172664463360', channel: 'vulnerability-scanning' },
  mrx:        { appId: '1479574324485685359', channel: 'cold-outreach' },
  professor:  { appId: '1479574472016269352', channel: 'lead-research' },
  chronicle:  { appId: '1480939045646241812', channel: 'documentation' },
  atlas:      { appId: '1480942533356949526', channel: 'atlas-coordination' },
  forge:      { appId: '1481041542453133392', channel: 'client-management' },
  beacon:     { appId: '1486458886733959242', channel: 'documentation' },
  leadgen:    { appId: '1491615304038481960', channel: 'cold-outreach' },
  chase:      { appId: '1491645429107130448', channel: 'cold-outreach' },
  nova:       { appId: '1491646996833112154', channel: 'content-automation' },
  care:       { appId: '1491648535802937344', channel: 'client-management' },
};

const CHANNEL_IDS = {
  'chief-of-staff':       '1480000668021428415',
  'ceo-update':            '1480000667392147568',
  'development':          '1480000719724482744',
  'atlas-coordination':    '1482611132077314088',
  'lead-research':         '1480000762988728393',
  'documentation':        '1480000766428188763',
  'vulnerability-scanning':'1480000802302202061',
  'client-management':     '1480000803321155759',
  'cold-outreach':         '1480000844672794876',
  'content-automation':   '1480000846065307732',
  'agent-status':          '1482611004507685044',
  'errors-and-alerts':     '1482611166349103166',
};

const generateUrl = (appId, permissions = BASE_PERMS) =>
  `https://discord.com/oauth2/authorize?client_id=${appId}&permissions=${permissions}&scope=bot`;

const main = () => {
  const args = process.argv.slice(2);

  if (args[0] === 'all') {
    console.log('\n=== All Known Bot OAuth URLs ===\n');
    for (const [name, { appId, channel }] of Object.entries(KNOWN_AGENTS)) {
      console.log(`${name} → #${channel}`);
      console.log(`${generateUrl(appId)}\n`);
    }
    console.log(`Permissions: ${BASE_PERMS} (VIEW + SEND + EMBED + MANAGE_CHANNELS)\n`);
    return;
  }

  if (args[0] && args[1]) {
    const name = args[0];
    const appId = args[1];
    const channel = args[2] || 'cold-outreach';
    console.log(`\n${name} → #${channel}`);
    console.log(`URL: ${generateUrl(appId)}\n`);
    console.log(`Channel ID: ${CHANNEL_IDS[channel] || channel}\n`);
    return;
  }

  console.log('\nUsage:');
  console.log('  node generate-oauth-urls.js all');
  console.log('  node generate-oauth-urls.js [name] [appId] [channel]');
  console.log('\nChannels:', Object.keys(CHANNEL_IDS).join(', '));
  console.log('\nKnown agents:', Object.keys(KNOWN_AGENTS).join(', '));
  console.log(`\nDefault permissions: ${BASE_PERMS}\n`);
};

main();
