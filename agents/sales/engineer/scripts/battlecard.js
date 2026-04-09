#!/usr/bin/env node
/**
 * battlecard.js — Sales Engineer Competitive Battlecard Generator
 * Generates FIA-framework battlecards for competitive positioning.
 * 
 * Usage: node battlecard.js --competitor "RingCentral" [--output path]
 */

import { config } from 'dotenv';
config({ path: '/home/saint/.openclaw/.env' });
import { createClient } from '@supabase/supabase-js';
import { writeFileSync, existsSync, mkdirSync } from 'fs';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const sendTelegram = async (msg) => {
  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: msg, parse_mode: 'HTML' })
  });
};

const args = process.argv.slice(2);
const competitor = args[args.indexOf('--competitor') + 1] || 'RingCentral';
const outputDir = args[args.indexOf('--output') + 1] || '/home/saint/.openclaw/workspace/agents/sales/engineer';

// Competitive battlecard templates (FIA Framework)
const BATTLECARDS = {
  'RingCentral': {
    acknowledged_strength: 'Established brand, broad device support, mature UCaaS platform',
    differentiator: 'Borne Systems AI Receptionist is purpose-built for front-desk automation — RingCentral is a communication platform with AI as an add-on',
    cards: [
      {
        fact: 'RingCentral requires manual configuration for AI call handling and typically needs IT involvement',
        impact: 'Your front desk staff cannot self-serve changes to call flows, greetings, or routing. Every change = IT ticket = days of delay.',
        act: 'Ask: "How long does it take your team to update a phone greeting today? With us, it\'s 60 seconds, no IT ticket."'
      },
      {
        fact: 'RingCentral\'s AI features are tiered by plan — advanced automation requires Enterprise tier',
        impact: 'The sticker price you see doesn\'t include the features that actually reduce front desk workload. True AI capability is 3-4x the base price.',
        act: 'Probe: "Which RingCentral tier are you evaluating? What\'s included vs. extra?"'
      },
      {
        fact: 'RingCentral processes calls centrally — latency-sensitive front desk scenarios can experience delays',
        impact: 'When a patient calls to book an emergency appointment, every second of delay risks losing them to a competitor who answers immediately.',
        act: 'Offer: "Let us show you what a 2-second response feels like versus 8 seconds."'
      }
    ]
  },
  'Twilio': {
    acknowledged_strength: 'Powerful API flexibility, developer-centric, highly customizable',
    differentiator: 'Twilio is for developers building custom solutions — Borne Systems is for businesses that want AI receptionists that work on day one',
    cards: [
      {
        fact: 'Twilio requires significant development resources to build a functional AI receptionist',
        impact: 'You\'re buying a platform and building a product. That means 3-6 months of dev time, ongoing maintenance, and the need to own the AI layer yourself.',
        act: 'Ask: "What\'s your timeline and budget to build this internally versus deploying something that works today?"'
      },
      {
        fact: 'Twilio AI Studio has limited out-of-the-box front-desk workflows',
        impact: 'You\'ll need to design, test, and iterate call flows yourself. Front-desk automation sounds simple until you handle the 20% of calls that are exceptions.',
        act: 'Share: "We\'ve handled 10,000+ front desk calls. What edge cases have you planned for?"'
      },
      {
        fact: 'Twilio pricing scales with call volume — high-traffic front desks get expensive fast',
        impact: 'At 500 calls/day, Twilio costs can rival dedicated AI receptionist solutions with none of the out-of-the-box workflows.',
        act: 'Compare: "Let\'s run the math on your expected call volume."'
      }
    ]
  },
  'default': {
    acknowledged_strength: 'Established solution in the market',
    differentiator: 'Borne Systems AI Receptionist is purpose-built for front-desk automation with faster deployment and lower total cost',
    cards: [
      {
        fact: 'Traditional solutions require months of implementation and ongoing IT support',
        impact: 'Every month of delay is missed appointments, dropped calls, and frustrated patients.',
        act: 'Ask: "What would it mean to your practice if you could cut no-shows by 30% in 2 weeks?"'
      }
    ]
  }
};

const buildBattlecard = (competitor) => {
  const data = BATTLECARDS[competitor] || BATTLECARDS['default'];
  
  const cards = data.cards.map((c, i) => `
### Card ${i + 1}: ${c.fact.substring(0, 60)}...

**Fact:** ${c.fact}

**Impact:** ${c.impact}

**Act:** ${c.act}
`).join('\n');

  return `# Battlecard: ${competitor}

> "${data.acknowledged_strength}"
> — Our differentiation: ${data.differentiator}

---

## Competitive Positioning

When a buyer mentions ${competitor}, the conversation should:

1. **Acknowledge** their consideration — they have a reason for evaluating it
2. **Redirect** to their stated problem, not our feature list
3. **Differentiate** on the dimension that matters most: time-to-value and total cost

---

## Technical Battlecards

${cards}

---

## Objection Map

| Objection | Decode | Response |
|-----------|--------|----------|
| "They're more established" | You're not sure AI is ready | "We work with ${competitor}. Here\'s what our customers say after switching." |
| "We already use their platform" | Lock-in fear | "No rip-and-replace. Our AI Receptionist sits on top." |
| "Their AI is more advanced" | Feature checkbox thinking | "Which specific AI capability matters to your front desk?" |
`;
};

const runBattlecard = async () => {
  console.log(`[Sales Engineer] Generating battlecard: ${competitor}`);
  
  const card = buildBattlecard(competitor);
  
  // Save to file
  const outDir = `${outputDir}/battlecards`;
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  const filename = `${outDir}/${competitor.toLowerCase().replace(/\s+/g, '-')}-battlecard.md`;
  writeFileSync(filename, card);

  console.log(`[Sales Engineer] Saved: ${filename}`);

  await supabase.from('activity_log').insert({
    agent_id: 'sales-engineer',
    action_type: 'battlecard_generated',
    title: `Battlecard: ${competitor}`,
    description: `FIA-framework competitive battlecard generated`,
    metadata: { competitor, filename }
  });

  const msg = [
    `🛠️ <b>Sales Engineer — Battlecard Generated</b>`,
    ``,
    `Competitor: ${competitor}`,
    `Output: ${filename}`,
    ``,
    `Run: <code>cat ${filename}</code> to view.`
  ].join('\n');

  await sendTelegram(msg);
  console.log('[Sales Engineer] Battlecard complete.');
};

runBattlecard().catch(e => {
  console.error('[Sales Engineer] Fatal:', e.message);
  process.exit(1);
});
