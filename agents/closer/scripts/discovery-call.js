#!/usr/bin/env node
/**
 * discovery-call.js — Closer Discovery Call Script
 * Structured 30-minute discovery call for Borne Systems
 * Run before each outbound discovery call or use as live guide
 */

const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function prompt(question) {
  return new Promise(resolve => rl.question(question, resolve));
}

async function runDiscoveryCall() {
  console.log('\n===========================================');
  console.log('  CLOSER — Discovery Call Script');
  console.log('  Borne Systems | 30-Minute Structure');
  console.log('===========================================\n');

  const lead = await prompt('Lead name: ');
  const company = await prompt('Company: ');
  const role = await prompt('Lead role/title: ');
  const source = await prompt('Lead source (Chase/Inbound/Referral): ');
  const callDate = new Date().toISOString().split('T')[0];

  const notes = {
    lead,
    company,
    role,
    source,
    callDate,
    sections: {}
  };

  // =========================================
  // SECTION 1: RAPPORT (2 min)
  // =========================================
  console.log('\n--- SECTION 1: RAPPORT (2 min) ---\n');

  const rapport = await prompt('Opening / rapport building notes:\n');

  const rapportScript = `Hi [Name], thanks for making time today. I'm [Your Name] from Borne Systems — we help [target vert] automate their [pain point]. Before we dive in, is now still a good time?`;

  console.log(`\n[Script]: ${rapportScript}`);
  notes.sections.rapport = { script: rapportScript, notes: rapport };

  // =========================================
  // SECTION 2: DISCOVERY QUESTIONS (15 min)
  // =========================================
  console.log('\n--- SECTION 2: DISCOVERY (15 min) ---\n');

  const discovery = {};

  discovery.business = await prompt('1. What does [Company] do? What\'s the core business?\n');
  discovery.challenge = await prompt('2. What\'s the biggest challenge driving them to look at solutions like ours?\n');
  discovery.currentSolution = await prompt('3. What are they currently using to solve this? (or "nothing yet")\n');
  discovery.frustrations = await prompt('4. What\'s frustrating about their current solution / status quo?\n');
  discovery.decisionMaker = await prompt('5. Who else is involved in this decision? (Are you the final decision-maker?)\n');
  discovery.budget = await prompt('6. Do you have a budget range in mind for a solution like this?\n');
  discovery.timeline = await prompt('7. When are they looking to have something in place?\n');
  discovery.success = await prompt('8. What would "success" look like 90 days after implementing this?\n');

  notes.sections.discovery = discovery;

  // =========================================
  // SECTION 3: DEMO WALKTHROUGH (10 min)
  // =========================================
  console.log('\n--- SECTION 3: DEMO WALKTHROUGH (10 min) ---\n');

  const demo = {};

  demo.relevantFeatures = await prompt('Key features to demo based on their pain points:\n');
  demo.demoPath = await prompt('Demo path used (AI Receptionsist / Automation / Full Suite):\n');
  demo.reactions = await prompt('How did they react? (Engaged / Neutral / Concerned):\n');
  demo.questionsAsked = await prompt('Questions they asked during demo:\n');

  notes.sections.demo = demo;

  // =========================================
  // SECTION 4: PROPOSAL DISCUSSION (3 min)
  // =========================================
  console.log('\n--- SECTION 4: PROPOSAL DISCUSSION (3 min) ---\n');

  const proposal = {};

  proposal.pricingMentioned = await prompt('Did you mention pricing? (Y/N) and details:\n');
  proposal.recommendedPackage = await prompt('Recommended package tier:\n');
  proposal.objections = await prompt('Any objections raised and how you handled them:\n');

  notes.sections.proposal = proposal;

  // =========================================
  // SECTION 5: NEXT STEPS (2 min)
  // =========================================
  console.log('\n--- SECTION 5: NEXT STEPS (2 min) ---\n');

  const nextSteps = {};

  nextSteps.closingStatement = await prompt('Closing statement used:\n');
  nextSteps.nextAction = await prompt('Agreed next step (Proposal / Follow-up call / Trial / Declined):\n');
  nextSteps.followUpDate = await prompt('Follow-up date (YYYY-MM-DD or N/A):\n');
  nextSteps.decisionDate = await prompt('Expected decision date (YYYY-MM-DD or N/A):\n');
  nextSteps.commitment = await prompt('Did they give a clear commitment? (Y/N — details):\n');

  notes.sections.nextSteps = nextSteps;

  // =========================================
  // OUTCOME
  // =========================================
  console.log('\n--- OUTCOME ---\n');

  const outcome = await prompt(
    'Outcome: (closed-won / follow-up / not-a-fit / no-show / declined)\n'
  );

  notes.outcome = outcome;
  notes.completedAt = new Date().toISOString();

  // =========================================
  // SAVE
  // =========================================
  const fs = require('fs');
  const path = require('path');

  const outputDir = path.join(__dirname, '..', 'call-notes');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const fileName = `${lead.replace(/\s+/g, '-').toLowerCase()}-${callDate}.json`;
  const filePath = path.join(outputDir, fileName);

  fs.writeFileSync(filePath, JSON.stringify(notes, null, 2));

  console.log('\n===========================================');
  console.log(`  Call notes saved to: ${filePath}`);
  console.log('===========================================\n');

  rl.close();
}

runDiscoveryCall().catch(console.error);
