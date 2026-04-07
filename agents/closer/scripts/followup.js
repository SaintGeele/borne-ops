#!/usr/bin/env node
/**
 * followup.js — Closer Follow-Up Sequence Tracker
 * Track and manage follow-up sequences for open deals
 * Usage: node followup.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

const DATA_DIR = path.join(__dirname, '..', 'followup-data');
const DB_FILE = path.join(DATA_DIR, 'sequences.json');

function ensureDb() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2));
}

function loadDb() {
  ensureDb();
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

function saveDb(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function prompt(question) {
  return new Promise(resolve => rl.question(question, resolve));
}

async function mainMenu() {
  console.log('\n===========================================');
  console.log('  CLOSER — Follow-Up Sequence Tracker');
  console.log('  Borne Systems');
  console.log('===========================================');
  console.log('  1. Add new follow-up');
  console.log('  2. View active sequences');
  console.log('  3. Log a touch (email/call/message)');
  console.log('  4. Mark sequence complete');
  console.log('  5. Show overdue follow-ups');
  console.log('  6. Exit');
  console.log('===========================================\n');

  const choice = await prompt('Select option (1-6): ');
  return choice.trim();
}

async function addFollowUp() {
  console.log('\n--- ADD NEW FOLLOW-UP SEQUENCE ---\n');

  const name = await prompt('Prospect/company name: ');
  const contact = await prompt('Contact email: ');
  const stage = await prompt('Stage (proposal-sent / negotiation / verbal-commit / waiting-decision): ');
  const nextDate = await prompt('Next follow-up date (YYYY-MM-DD): ');
  const nextType = await prompt('Follow-up type (email / call / message / meeting): ');
  const notes = await prompt('Notes / context: ');

  const sequence = {
    id: Date.now().toString(),
    prospect: name,
    contact,
    stage,
    steps: [
      { date: nextDate, type: nextType, done: false, notes: '' }
    ],
    createdAt: new Date().toISOString(),
    status: 'active',
    notes
  };

  const db = loadDb();
  db.push(sequence);
  saveDb(db);

  console.log(`\n✓ Follow-up sequence created for ${name}`);
}

async function viewActive() {
  const db = loadDb();
  const active = db.filter(s => s.status === 'active');

  if (active.length === 0) {
    console.log('\nNo active follow-up sequences.\n');
    return;
  }

  console.log('\n--- ACTIVE FOLLOW-UP SEQUENCES ---\n');
  active.forEach(s => {
    const nextStep = s.steps.find(st => !st.done);
    console.log(`[${s.id}] ${s.prospect} | ${s.stage}`);
    console.log(`  Next: ${nextStep ? `${nextStep.date} (${nextStep.type})` : 'None — complete'}`);
    console.log(`  Contact: ${s.contact}`);
    console.log('');
  });
}

async function logTouch() {
  const db = loadDb();
  const active = db.filter(s => s.status === 'active');

  if (active.length === 0) {
    console.log('\nNo active sequences to log.\n');
    return;
  }

  console.log('\n--- LOG A TOUCH ---\n');
  active.forEach(s => console.log(`[${s.id}] ${s.prospect}`));

  const id = await prompt('\nSequence ID: ');
  const sequence = db.find(s => s.id === id.trim());

  if (!sequence) {
    console.log('Sequence not found.');
    return;
  }

  const touchDate = await prompt('Date of touch (YYYY-MM-DD): ');
  const touchType = await prompt('Type (email / call / message / meeting): ');
  const touchNotes = await prompt('What happened? ');

  // Mark any step on or before this date as done
  sequence.steps.forEach(st => {
    if (!st.done && st.date <= touchDate) {
      st.done = true;
      st.notes = touchNotes;
    }
  });

  // Add a new next step
  const nextDate = await prompt('Next follow-up date (YYYY-MM-DD, or Enter to skip): ');
  const nextType = await prompt('Next follow-up type (email / call / message / meeting): ');

  if (nextDate && nextType) {
    sequence.steps.push({ date: nextDate, type: nextType, done: false, notes: '' });
  }

  saveDb(db);
  console.log(`\n✓ Touch logged for ${sequence.prospect}`);
}

async function markComplete() {
  const db = loadDb();
  const active = db.filter(s => s.status === 'active');

  if (active.length === 0) {
    console.log('\nNo active sequences.\n');
    return;
  }

  console.log('\n--- MARK COMPLETE ---\n');
  active.forEach(s => console.log(`[${s.id}] ${s.prospect}`));

  const id = await prompt('\nSequence ID to mark complete: ');
  const sequence = db.find(s => s.id === id.trim());

  if (!sequence) {
    console.log('Sequence not found.');
    return;
  }

  const outcome = await prompt('Outcome (closed-won / declined / not-a-fit): ');
  sequence.status = outcome;
  sequence.completedAt = new Date().toISOString();

  saveDb(db);
  console.log(`\n✓ Sequence marked as: ${outcome}`);
}

async function showOverdue() {
  const db = loadDb();
  const today = new Date().toISOString().split('T')[0];
  const overdue = [];

  db.forEach(s => {
    if (s.status !== 'active') return;
    const nextStep = s.steps.find(st => !st.done);
    if (nextStep && nextStep.date < today) {
      overdue.push({ ...s, nextStep });
    }
  });

  if (overdue.length === 0) {
    console.log('\nNo overdue follow-ups.\n');
    return;
  }

  console.log('\n--- OVERDUE FOLLOW-UPS ---\n');
  overdue.forEach(s => {
    console.log(`[${s.id}] ${s.prospect} — was due ${s.nextStep.date} (${s.nextStep.type})`);
    console.log(`  Contact: ${s.contact} | Stage: ${s.stage}`);
    console.log('');
  });
}

async function main() {
  let running = true;
  while (running) {
    const choice = await mainMenu();
    switch (choice) {
      case '1': await addFollowUp(); break;
      case '2': await viewActive(); break;
      case '3': await logTouch(); break;
      case '4': await markComplete(); break;
      case '5': await showOverdue(); break;
      case '6': running = false; break;
      default: console.log('Invalid option. Try 1-6.');
    }
  }
  rl.close();
}

main().catch(console.error);
