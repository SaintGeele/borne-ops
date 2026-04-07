#!/usr/bin/env node
/**
 * proposal.js — Closer Proposal Generator
 * Generates branded proposals for Borne Systems prospects
 * Usage: node proposal.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function prompt(question) {
  return new Promise(resolve => rl.question(question, resolve));
}

async function generateProposal() {
  console.log('\n===========================================');
  console.log('  CLOSER — Proposal Generator');
  console.log('  Borne Systems');
  console.log('===========================================\n');

  const info = {};

  info.prospectName = await prompt('Prospect name: ');
  info.company = await prompt('Company name: ');
  info.prospectTitle = await prompt('Your title/name: ');
  info.date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  info.package = await prompt('Package name (e.g., AI Receptionist Pro): ');
  info.price = await prompt('Monthly price (e.g., $299/mo): ');
  info.term = await prompt('Contract term (monthly / annual): ');
  info.deliveryTimeline = await prompt('Delivery timeline (e.g., 5 business days): ');
  info.primaryPain = await prompt('Primary pain point being solved: ');
  info.features = await prompt('Features included (comma-separated): ');
  info.support = await prompt('Support level (Standard / Priority / Dedicated): ');
  info.goals = await prompt('Success goals from discovery call: ');
  info.paymentMethod = await prompt('Payment method (Invoice / Card / ACH): ');
  info.proposalNumber = `BS-${Date.now().toString().slice(-6)}`;

  rl.close();

  const proposal = buildProposal(info);
  outputProposal(proposal, info);
}

function buildProposal(info) {
  const featureList = info.features.split(',').map(f => `  — ${f.trim()}`).join('\n');
  const goalList = info.goals.split(';').map(g => `  — ${g.trim()}`).join('\n');

  return `
===========================================
PROPOSAL
===========================================

Proposal #: ${info.proposalNumber}
Date: ${info.date}
Prepared for: ${info.company}
Prepared by: ${info.prospectName}, Borne Systems

--------------------------------------------
EXECUTIVE SUMMARY
--------------------------------------------

${info.company} is looking to solve: ${info.primaryPain}.

Borne Systems will deliver an AI-powered solution tailored to
${info.company}'s workflow, starting with ${info.package}.

This proposal outlines the scope, pricing, and next steps.

--------------------------------------------
PROPOSED SOLUTION
--------------------------------------------

Package: ${info.package}
Timeline: ${info.deliveryTimeline}

What's included:
${featureList}

Support Level: ${info.support}

--------------------------------------------
SUCCESS METRICS
--------------------------------------------

We will measure success against:
${goalList}

--------------------------------------------
INVESTMENT
--------------------------------------------

${info.package}
Price: ${info.price}
Term: ${info.term}
Payment: ${info.paymentMethod}

Annual discount available for annual contracts.

--------------------------------------------
NEXT STEPS
--------------------------------------------

1. Review and approve this proposal
2. Sign the service agreement (attached)
3. Submit first payment
4. Kickoff call scheduled within 48 hours

Upon signature, expect your first deliverable within
${info.deliveryTimeline}.

--------------------------------------------
TERMS
--------------------------------------------

- Month-to-month agreements require 30 days notice
- Annual agreements include a 10% discount
- All services include our standard SLA

--------------------------------------------
CONTACT
--------------------------------------------

${info.prospectName}
Borne Systems
www.bornesystems.com

This proposal is valid for 14 days from the date above.

===========================================
`;
}

function outputProposal(proposal, info) {
  // Save as .txt for easy viewing
  const outputDir = path.join(__dirname, '..', 'proposals');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const fileName = `${info.company.replace(/\s+/g, '-').toLowerCase()}-proposal-${info.proposalNumber}.txt`;
  const filePath = path.join(outputDir, fileName);

  fs.writeFileSync(filePath, proposal);

  console.log(proposal);
  console.log(`\nProposal saved to: ${filePath}\n`);

  // Also save structured JSON for CRM use
  const jsonPath = filePath.replace('.txt', '.json');
  fs.writeFileSync(jsonPath, JSON.stringify({ ...info, savedAt: new Date().toISOString() }, null, 2));
  console.log(`JSON data saved to: ${jsonPath}\n`);
}

generateProposal().catch(console.error);
