const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_API_KEY });

const services = [
  { name: 'AI Receptionist', price: 99 },
  { name: 'Lead Automation', price: 149 },
  { name: 'Security Basic', price: 199 },
  { name: 'Security Pro', price: 399 },
  { name: 'Full Stack', price: 499 }
];

async function add() {
  for (const s of services) {
    try {
      const r = await notion.pages.create({
        parent: { database_id: '2f49d5a1-ef5b-4155-ac5e-7a9bbede6071' },
        properties: { 
          'Name': { title: [{ text: { content: s.name + ' - $' + s.price + '/mo' } }] }
        }
      });
      console.log('✓', s.name);
    } catch(e) { 
      console.error(s.name, ':', e.message.split('\n')[0]); 
    }
  }
}
add();
