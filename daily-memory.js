#!/usr/bin/env node

// Daily Memory Generator - Automated template system
const { Client } = require('@notionhq/client');
const notion = new Client({ auth: process.env.NOTION_API_KEY });

const DATABASE_ID = '31726a63-e141-802a-84ea-d6bde1693d28';

async function createDailyMemory(customNote = '') {
  const now = new Date();
  const today = now.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const memoryData = {
    title: `Daily Memory - ${today}`,
    icon: '📅',
    note: customNote,
    timestamp: now.toISOString(),
    session: process.env.OPENCLAW_SESSION || 'agent:main:telegram:direct'
  };

  // Create structured daily memory entry
  const pageData = {
    parent: { database_id: DATABASE_ID },
    properties: {
      'Name': { title: [{ text: { content: memoryData.title } }] }
    },
    children: [
      {
        object: 'block',
        type: 'callout',
        callout: {
          rich_text: [{ 
            type: 'text', 
            text: { 
              content: `Session: ${memoryData.session}
Created: ${memoryData.timestamp}` 
            } 
          }],
          icon: { emoji: 'ℹ️' }
        }
      },
      {
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [{ type: 'text', text: { content: '🌅 Morning Focus' } }]
        }
      },
      {
        object: 'block',
        type: 'to_do',
        to_do: {
          rich_text: [{ type: 'text', text: { content: 'SAP appeal current status check' } }],
          checked: false
        }
      },
      {
        object: 'block',
        type: 'to_do',
        to_do: {
          rich_text: [{ type: 'text', text: { content: 'Study block 1 (academic)' } }],
          checked: false
        }
      },
      {
        object: 'block',
        type: 'to_do',
        to_do: {
          rich_text: [{ type: 'text', text: { content: 'CSCI 185 assignment progress' } }],
          checked: false
        }
      },
      {
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [{ type: 'text', text: { content: '📊 Academic Tracking' } }]
        }
      },
      {
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: customNote || 'Weekly progress tracking enabled' } }]
        }
      },
      {
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: 'Memory persists across all OpenClaw sessions' } }]
        }
      },
      {
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [{ type: 'text', text: { content: '🎯 Evening Reflection' } }]
        }
      },
      {
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [{ type: 'text', text: { content: 'Add wins, blockers, and tomorrow priorities here.' } }]
        }
      }
    ]
  };

  const response = await notion.pages.create(pageData);
  console.log('✅ Daily memory template created:', response.url);
  return response;
}

// CLI interface
const [,, customNote] = process.argv;
createDailyMemory(customNote).catch(console.error);