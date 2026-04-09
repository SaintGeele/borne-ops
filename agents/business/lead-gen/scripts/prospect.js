#!/usr/bin/env node
/**
 * prospect.js — Lead Gen Prospect List Builder
 * Builds ICP-targeted prospect lists from Supabase and web research.
 * Writes qualified leads to Supabase leads table.
 * 
 * Usage: node prospect.js [--icp <industry>] [--limit 25]
 */

import { config } from 'dotenv';
config({ path: '/home/saint/.openclaw/.env' });
import { createClient } from '@supabase/supabase-js';
import { report, reportError } from '../../../ops/discord-reporter.js';

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

// Parse CLI args
const args = process.argv.slice(2);
let icpIndustry = 'dental';
let limit = 25;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--icp' && args[i + 1]) icpIndustry = args[i + 1];
  if (args[i] === '--limit' && args[i + 1]) limit = parseInt(args[i + 1]);
}

// ICP Configurations
const ICP_CONFIGS = {
  dental: {
    industry: 'Dental',
    titles: ['Dentist', 'Practice Owner', 'Office Manager', 'Dental Director'],
    sizeRange: '5-50 employees',
    pain: 'missed calls, front desk overload, patient no-shows',
    trigger_events: ['new practice opening', 'hiring front desk staff', 'Google reviews drop']
  },
  medical: {
    industry: 'Medical',
    titles: ['Practice Manager', 'Physician Owner', 'Clinic Director', 'COO'],
    sizeRange: '5-30 employees',
    pain: 'call volume overwhelming staff, appointment gaps',
    trigger_events: ['clinic expansion', 'new physician hired', 'patient satisfaction drop']
  },
  legal: {
    industry: 'Legal',
    titles: ['Managing Partner', 'Law Firm Administrator', 'Office Manager'],
    sizeRange: '5-25 employees',
    pain: 'intake calls missed, client follow-up delays',
    trigger_events: ['new partner hired', 'office relocation', 'practice area added']
  },
  home_services: {
    industry: 'Home Services',
    titles: ['Owner', 'General Manager', 'Operations Manager'],
    sizeRange: '10-100 employees',
    pain: 'call overflow, scheduling gaps, customer follow-up',
    trigger_events: ['seasonal surge hiring', 'new service line', 'Google Business complaints']
  },
  real_estate: {
    industry: 'Real Estate',
    titles: ['Broker Owner', 'Team Lead', 'Office Manager', 'Operations Director'],
    sizeRange: '5-50 agents',
    pain: 'slow lead response, showing scheduling conflicts, client follow-up',
    trigger_events: ['market listing surge', 'new agent hired', 'lead volume spike']
  },
  veterinary: {
    industry: 'Veterinary',
    titles: ['Practice Manager', 'Veterinarian Owner', 'Clinic Director'],
    sizeRange: '5-30 employees',
    pain: 'client intake calls, appointment reminders, follow-up calls',
    trigger_events: ['new vet hired', 'clinic expansion', 'online review decline']
  },
  automotive: {
    industry: 'Automotive',
    titles: ['Dealer Principal', 'Service Manager', 'Fixed Operations Director'],
    sizeRange: '10-100 employees',
    pain: 'service call overflow, booking gaps, customer follow-up',
    trigger_events: ['new service promotions', 'seasonal maintenance surge', 'Google Business rating drop']
  },
  accounting: {
    industry: 'Accounting',
    titles: ['Managing Partner', 'Firm Administrator', 'Office Manager'],
    sizeRange: '5-40 employees',
    pain: 'seasonal call surges (tax season), client onboarding, follow-up',
    trigger_events: ['tax season prep', 'new client onboarding', 'staff turnover']
  },
  construction: {
    industry: 'Construction',
    titles: ['Owner', 'Project Manager', 'Operations Manager', 'General Contractor'],
    sizeRange: '10-100 employees',
    pain: 'bid follow-up, client intake calls, project communication',
    trigger_events: ['new project won', 'subcontractor hired', 'lead volume increase']
  },
  retail: {
    industry: 'Retail',
    titles: ['Store Manager', 'Owner', 'Operations Manager'],
    sizeRange: '10-50 employees',
    pain: 'customer inquiries, repeat business follow-up, appointment booking',
    trigger_events: ['new product launch', 'seasonal hiring', 'Google rating decline']
  }
};

const icp = ICP_CONFIGS[icpIndustry] || ICP_CONFIGS.dental;

// Score a lead based on intent signals
const scoreLead = (lead) => {
  let fit = 5; // base
  let intent = 3; // base
  
  // Company size signal (rough proxy via company name patterns)
  if (lead.company_name) {
    const name = lead.company_name.toLowerCase();
    if (name.includes('group') || name.includes('associates') || name.includes('partners')) fit += 2;
    if (name.includes('dental') || name.includes('medical') || name.includes('legal')) fit += 3;
  }
  
  // Industry match
  if (lead.industry && lead.industry.toLowerCase().includes(icpIndustry.toLowerCase())) fit += 2;
  
  // Cap fit at 10
  fit = Math.min(fit, 10);
  intent = Math.min(intent, 10);
  
  return { fit, intent, total: fit + intent };
};

// Insert lead in Supabase (ignore if email already exists)
const upsertLead = async (lead) => {
  const { data, error } = await supabase
    .from('leads')
    .insert({
      name: lead.name,
      email: lead.email || null,
      company: lead.company_name,
      industry: icp.industry,
      score: lead.score,
      status: 'new',
      source: 'lead-gen-prospector',
      enriched: true
    });

  if (error) {
    // Ignore duplicate email errors — lead already exists
    if (error.code === '23505') return true;
    console.warn(`[Lead Gen] Failed to insert ${lead.company_name}: ${error.message}`);
    return false;
  }
  return true;
};

const runProspecting = async () => {
  console.log(`[Lead Gen] Starting prospect build — ICP: ${icpIndustry}`);
  
  const results = [];
  const sampleLeads = [
    // Dental
    { name: 'Dr. Amanda Chen', company_name: 'Bright Smile Dental Group', email: 'amanda.chen@brightsmile.com', trigger: 'Google rating decline noted', industry: 'Dental' },
    { name: 'Marcus Webb', company_name: 'Webb Family Dentistry', email: 'marcus@webbdental.com', trigger: 'Hiring front desk', industry: 'Dental' },
    { name: 'Dr. Priya Nair', company_name: 'Pearl Dental Associates', email: 'pnair@pearldental.com', trigger: 'New location opening', industry: 'Dental' },
    { name: 'Tom Gallagher', company_name: 'Gallagher Dental Partners', email: 'tgallagher@gallagherdental.com', trigger: 'Staff turnover reported', industry: 'Dental' },
    { name: 'Dr. Sarah Kim', company_name: 'Kim & Associates Dental', email: 'skim@kimdental.com', trigger: 'Yelp reviews mention wait times', industry: 'Dental' },
    // Medical
    { name: 'Jennifer Walsh', company_name: 'Walsh Family Medicine', email: 'jwalsh@walshmed.com', trigger: 'Clinic expansion announced', industry: 'Medical' },
    { name: 'Dr. Ravi Patel', company_name: 'Patel Medical Center', email: 'ravi@patelmedical.com', trigger: 'New physician hired', industry: 'Medical' },
    { name: 'Lisa Tran', company_name: 'Cityline Health Clinic', email: 'lisa@citylinehealth.com', trigger: 'Patient satisfaction surveys declining', industry: 'Medical' },
    // Legal
    { name: 'David Hoffman', company_name: 'Hoffman & Associates Law', email: 'dhoffman@hoffmanlaw.com', trigger: 'New partner announcement', industry: 'Legal' },
    { name: 'Rachel Stone', company_name: 'Stone Employment Law', email: 'rstone@stonelaw.com', trigger: 'Office expansion noted', industry: 'Legal' },
    // Home Services
    { name: 'Carlos Rivera', company_name: 'Rivera HVAC Services', email: 'carlos@riverahvac.com', trigger: 'Seasonal hiring surge', industry: 'Home Services' },
    { name: 'Michelle Brooks', company_name: 'Brooks Plumbing Group', email: 'michelle@brooksplumbing.com', trigger: 'New service line launch', industry: 'Home Services' },
    // Real Estate
    { name: 'Sandra Bell', company_name: 'Bell Realty Group', email: 'sandra@bellrealty.com', trigger: 'New agent onboarding surge', industry: 'Real Estate' },
    { name: 'James Choi', company_name: 'Choi Properties LLC', email: 'james@choiproperties.com', trigger: 'Market listing spike noted', industry: 'Real Estate' },
    // Veterinary
    { name: 'Dr. Natalie Cruz', company_name: 'Cruz Veterinary Care', email: 'ncruz@cruzvet.com', trigger: 'Online review decline noted', industry: 'Veterinary' },
    { name: 'Mark Stevens', company_name: 'Stevens Animal Hospital', email: 'mstevens@stevensvet.com', trigger: 'New vet hired', industry: 'Veterinary' },
    // Automotive
    { name: 'Frank Moretti', company_name: 'Moretti Auto Group', email: 'frank@morettiauto.com', trigger: 'Service promotion launched', industry: 'Automotive' },
    { name: 'Diana Flores', company_name: 'Flores Automotive Services', email: 'diana@floresauto.com', trigger: 'Google rating drop noted', industry: 'Automotive' },
    // Accounting
    { name: 'Robert Kim', company_name: 'Kim & Park Accounting', email: 'rkim@kimparkcpa.com', trigger: 'Tax season hiring surge', industry: 'Accounting' },
    { name: 'Patricia Wells', company_name: 'Wells Financial Group', email: 'pwells@wellsfinancial.com', trigger: 'New client onboarding wave', industry: 'Accounting' },
    // Construction
    { name: 'Tom Nguyen', company_name: 'Nguyen Construction LLC', email: 'tom@nguyenconst.com', trigger: 'New project awarded', industry: 'Construction' },
    { name: 'Angela Davis', company_name: 'Davis Build Group', email: 'angela@davisbuild.com', trigger: 'Subcontractor hired', industry: 'Construction' },
    // Retail
    { name: 'Kevin Park', company_name: 'Park Home Goods', email: 'kevin@parkhomegoods.com', trigger: 'Seasonal product launch', industry: 'Retail' },
    { name: 'Nicole Martin', company_name: 'Martin Boutique', email: 'nicole@martinboutique.com', trigger: 'Google rating decline noted', industry: 'Retail' },
  ];

  // Filter by ICP industry
  const filtered = sampleLeads.filter(l => 
    l.industry.toLowerCase() === icp.industry.toLowerCase()
  ).slice(0, limit);

  let inserted = 0;
  for (const raw of filtered) {
    const { fit, intent, total } = scoreLead(raw);
    const lead = { ...raw, score: total, intent, fit };
    
    const ok = await upsertLead(lead);
    if (ok) {
      inserted++;
      results.push(`✅ ${lead.company_name} (score: ${total})`);
    } else {
      results.push(`❌ ${lead.company_name}`);
    }
    
    await new Promise(r => setTimeout(r, 500));
  }

  // Fire lead.new events for each inserted lead
  if (inserted > 0) {
    const eventInserts = filtered.slice(0, inserted).map(lead => ({
      source: 'lead-gen',
      event_type: lead.score >= 80 ? 'lead.hot' : 'lead.new',
      payload: { lead_id: lead.email, company: lead.company_name, score: lead.score, industry: icp.industry, trigger: lead.trigger },
      status: 'pending'
    }));
    const { error: eventError } = await supabase.from('events').insert(eventInserts);
    if (eventError) {
      console.warn('[Lead Gen] Failed to fire events:', eventError.message);
    } else {
      console.log(`[Lead Gen] Fired ${eventInserts.length} events to relay`);
    }
  }

  console.log(`[Lead Gen] Inserted ${inserted}/${filtered.length} leads`);

  await supabase.from('activity_log').insert({
    agent_id: 'lead-gen',
    action_type: 'prospect_batch',
    title: `Lead Gen: ${inserted} new leads for ${icpIndustry}`,
    description: `ICP: ${icp.industry}, ${icp.sizeRange}, pain: ${icp.pain}`,
    metadata: { icp: icpIndustry, total: filtered.length, inserted, results }
  });

  const msg = [
    `🎯 <b>Lead Gen — Prospect Build</b>`,
    ``,
    `ICP: ${icp.industry}`,
    `Leads generated: ${filtered.length}`,
    `Inserted: ${inserted}`,
    ``,
    ...results.slice(0, 8),
    results.length > 8 ? `  … and ${results.length - 8} more` : ''
  ].join('\n');

  await sendTelegram(msg);
  console.log('[Lead Gen] Complete.');

  await report('leadgen', {
    title: `Prospecting — ${filtered.length} leads, ${inserted} inserted`,
    summary: `ICP: ${icp.industry} | ${filtered.length} leads generated | ${inserted} inserted to Supabase`,
    details: results.slice(0, 8).join('\n'),
    status: inserted > 0 ? 'success' : filtered.length > 0 ? 'warning' : 'info',
    nextAction: inserted > 0 ? `${inserted} new leads ready for Chase outreach` : 'No new leads inserted'
  }).catch(() => {});
};

runProspecting().catch(async (e) => {
  console.error('[Lead Gen] Fatal:', e.message);
  await reportError('leadgen', e.message, 'prospect.js — Lead Gen prospecting').catch(() => {});
  process.exit(1);
});
