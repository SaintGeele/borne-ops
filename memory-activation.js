#!/usr/bin/env node

// Simple memory activation test
const { Client } = require('@notionhq/client');
const notion = new Client({ auth: process.env.NOTION_API_KEY });

const DATABASE_ID = '31726a63-e141-802a-84ea-d6bde1693d28';

async function testMemory() {
  try {
    console.log('🔄 Testing Notion memory system...');
    
    // Add current session memory
    const session = process.env.OPENCLAW_SESSION || 'agent:main:telegram:direct';
    const memory = `Session ${session} - SAP appeal persistence confirmed ✅`;
    
    // Create memory entry
    await notion.pages.create({
      parent: { database_id: DATABASE_ID },
      properties: {
        'Name': { title: [{ text: { content: memory } }] }
      },
      children: [
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [{ type: 'text', text: { content: `Full memory: Successfully integrated Notion database ${DATABASE_ID} for permanent cross-session memory storage at ${new Date().toISOString()}` } }]
          }
        }
      ]
    });

    // Query recent memories
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      page_size: 10,
      sorts: [{ property: 'Name', direction: 'descending' }]
    });

    console.log('\n📊 Recent memories:');
    response.results.forEach(page => {
      const name = page.properties.Name?.title[0]?.text.content;
      console.log(`   • ${name || 'Untitled'}`);
    });

    console.log('\n✅ Notion memory system fully operational');
    console.log(`🔗 Database: https://www.notion.so/${DATABASE_ID.replace(/-/g, '')}`);
    
  } catch (error) {
    console.error('❌ Memory system issue:', error.message);
    process.exit(1);
  }
}

testMemory();
