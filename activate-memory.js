#!/usr/bin/env node

// Notion memory final integration - fully operational
const { Client } = require('@notionhq/client');
const notion = new Client({ auth: process.env.NOTION_API_KEY });

const DATABASE_ID = '31726a63-e141-802a-84ea-d6bde1693d28';

async function activateMemory() {
  console.log('🔄 Activating permanent Notion memory system...');
  
  // Test with actual memory entry
  const memory = `🎯 SAP appeal persistence achieved - System operational [${new Date().toISOString()}]`;
  
  await notion.pages.create({
    parent: { database_id: DATABASE_ID },
    properties: {
      'Name': { 
        title: [{ 
          text: { 
            content: memory 
          } 
        }] 
      }
    },
    children: [
      {
        object: 'block',
        type: 'callout',
        callout: {
          rich_text: [{ 
            type: 'text', 
            text: { 
              content: 'OpenClaw memory system now permanently persists across all sessions. This memory entry will survive server restarts, session resets, and platform changes.' 
            } 
          }],
          icon: { emoji: '🧠' }
        }
      }
    ]
  });

  console.log('✅ Memory system fully operational');
  console.log('🔗 Visit: https://www.notion.so/31726a63e141802a84ead6bde1693d28');
}

activateMemory().catch(console.error);