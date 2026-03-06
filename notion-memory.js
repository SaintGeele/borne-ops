#!/home/saint/.npm-global/bin/node

// Notion Memory Bridge - Live Integration
// This will create our persistent memory system once and for all

const { Client } = require('@notionhq/client');
const fs = require('fs');
const path = require('path');

const notion = new Client({ auth: process.env.NOTION_API_KEY });

// Ensure we have the database
async function setupDatabase() {
  const dbPath = path.join(process.env.HOME, '.openclaw/workspace', 'notion-memory-db.json');
  
  if (!fs.existsSync(dbPath)) {
    // Search for existing "OpenClaw Memories" database
    const searchResponse = await notion.search({
      query: 'OpenClaw'
    });

    let databaseId;

    if (searchResponse.results.length > 0) {
      databaseId = searchResponse.results[0].id;
    } else {
      // Find parent page
      const parentPage = await notion.search({
        query: 'OpenClaw',
        filter: {
          property: 'object',
          value: 'page'
        }
      });

      const parentId = parentPage.results.length > 0 ? parentPage.results[0].id : null;
      
      if (!parentId) {
        console.error('No OpenClaw parent page found. Please create one and share with the integration.');
        process.exit(1);
      }

      // Create database
      const dbResponse = await notion.databases.create({
        parent: { page_id: parentId },
        title: [{ type: 'text', text: { content: 'OpenClaw Memory System' } }],
        properties: {
          'Session ID': { title: {} },
          'Memory': { rich_text: {} },
          'Tags': { 
            multi_select: {
              options: [
                { name: 'academic', color: 'blue' },
                { name: 'professional', color: 'green' },
                { name: 'personal', color: 'orange' },
                { name: 'technical', color: 'purple' },
                { name: 'focus', color: 'red' },
                { name: 'priority', color: 'yellow' }
              ]
            }
          },
          'Type': {
            select: {
              options: [
                { name: 'conversation', color: 'gray' },
                { name: 'task', color: 'yellow' },
                { name: 'decision', color: 'red' },
                { name: 'insight', color: 'blue' },
                { name: 'reminder', color: 'green' }
              ]
            }
          },
          'Priority': { number: { format: 'number' } },
          'Date': { date: {} },
          'Context': { rich_text: {} }
        }
      });

      databaseId = dbResponse.id;
    }

    fs.writeFileSync(dbPath, JSON.stringify({ databaseId }, null, 2));
    console.log(`Database ready: ${databaseId}`);
    return databaseId;
  }

  const config = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  return config.databaseId;
}

async function addMemory(sessionId, content, tags = [], type = 'conversation', priority = 3, context = '') {
  const databaseId = await setupDatabase();
  
  await notion.pages.create({
    parent: { database_id: databaseId },
    properties: {
      'Name': { title: [{ text: { content: content.substring(0, 100) } }] }
    },
    children: [
      {
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: content.substring(0, 2000)
              }
            }
          ]
        }
      }
    ]
  });

  console.log(`✅ Memory stored: ${content.substring(0, 50)}...`);
}

async function searchMemories(query, tags = [], limit = 10) {
  const databaseId = await setupDatabase();
  
  const filter = {
    and: []
  };

  if (query) {
    filter.and.push({
      property: 'Memory',
      rich_text: {
        contains: query
      }
    });
  }

  if (tags.length > 0) {
    filter.and.push({
      property: 'Tags',
      multi_select: {
        contains: tags[0]
      }
    });
  }

  const response = await notion.databases.query({
    database_id: databaseId,
    filter: filter.and.length ? filter : undefined,
    sorts: [{ property: 'Name', direction: 'descending' }],
    page_size: limit
  });

  return response.results.map(page => ({
    sessionId: page.properties['Session ID']?.title[0]?.text.content,
    content: page.properties['Memory']?.rich_text[0]?.text.content,
    tags: page.properties['Tags']?.multi_select.map(t => t.name),
    type: page.properties['Type']?.select?.name,
    priority: page.properties['Priority']?.number,
    date: page.properties['Date']?.date?.start,
    context: page.properties['Context']?.rich_text[0]?.text.content
  }));
}

// CLI interface
const [, , action, ...args] = process.argv;

switch (action) {
  case 'add':
    const [content, tags = '', type, priority = '3', context = ''] = args;
    addMemory(
      process.env.OPENCLAW_SESSION || 'main',
      content,
      tags.split(',').filter(t => t),
      type || 'conversation',
      parseInt(priority),
      context
    ).then(() => process.exit(0));
    break;

  case 'search':
    const [searchQuery, searchTags = ''] = args;
    searchMemories(
      searchQuery || '',
      searchTags.split(',').filter(t => t),
      5
    ).then(results => {
      console.log(JSON.stringify(results, null, 2));
      process.exit(0);
    });
    break;

  case 'setup':
    setupDatabase().then(() => process.exit(0));
    break;

  default:
    console.log('Usage: node notion-memory.js [add|search|setup] [args]');
    console.log('add: content [tags] [type] [priority] [context]');
    console.log('search: [query] [tags]');
    console.log('setup: Initialize database');
}