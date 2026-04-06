# Borne Systems — Case Study Build Plan
# 3 Client Offerings → Services

---

## Overview

Three case studies to build out as sellable service offerings. Each follows the same structure:
1. Discovery & Scoping
2. Build
3. Documentation (case study)
4. Package as service

---

## Case Study 1: Legal Services — Data Synthesis Pipeline

**Pitch:** "Automated contract review system capable of parsing thousands of documents to flag risks and anomalies instantly. 1,000+ Hours Saved."

**Target ICP:** Solo attorneys, small law firms (5-20 employees), in-house legal teams at SMBs

### Phase 1: Discovery & Scoping (1-2 days)
- [ ] Identify top 5-10 contract types the client handles most (NDA, MSA, employment, vendor agreements)
- [ ] Map current review process: who reviews, how long, what they look for
- [ ] Identify the top 3 risks they care about most (indemnification, IP ownership, termination clauses)
- [ ] Determine document formats: PDF, Word, email attachments
- [ ] Assess data sensitivity requirements (attorney-client privilege, bar compliance)
- [ ] Get 10-20 sample documents for testing (redacted if needed)

**Owner:** Ivy / Client discovery call

### Phase 2: Build (3-5 days)
- [ ] Set up document ingestion: upload folder, email drop, or API
- [ ] Connect GPT-4o-mini or Claude for document parsing
- [ ] Build risk flagging prompts for each contract type
- [ ] Create summary output: contract type, parties, key risks, recommended action
- [ ] Set up output delivery: email, Slack, or Notion page
- [ ] Test with sample documents, tune accuracy

**Owner:** Nexus / Forge

### Phase 3: Documentation (1 day)
- [ ] Write the case study: client type, problem, solution, results
- [ ] Name the service: "Legal Contract Intelligence" or "Legal Document Review Agent"
- [ ] Set pricing: $497-997/mo based on contract volume
- [ ] Create one-pager PDF for sales use

**Owner:** MrX / Mercury

### Phase 4: Package as Service
- [ ] Add to Borne Systems website as a service page
- [ ] Add Stripe product for monthly subscription
- [ ] Chase outreach: target law firms in CT/NY/NJ via LinkedIn
- [ ] Add to Cal.com as "Legal AI Consultation" event type

**Owner:** Forge / Chase

---

## Case Study 2: Consulting Firm — Automated Acquisition Engine

**Pitch:** "Lead capture, qualification, and routing — fully automated, no manual intervention. 20.6x Return."

**Target ICP:** Boutique consulting firms, solo consultants, B2B professional services (5-30 employees)

### Phase 1: Discovery & Scoping (1-2 days)
- [ ] Map current lead flow: where leads come from, how they're contacted, who follows up
- [ ] Identify bottlenecks: where leads drop, what causes the most lost revenue
- [ ] Define lead qualification criteria: budget, timeline, authority, need
- [ ] Audit current CRM or lead tracking system
- [ ] Document ideal client profile

**Owner:** Ivy / Chase discovery

### Phase 2: Build (3-5 days)
- [ ] Set up lead capture: form, landing page, or inbound webhook
- [ ] Build qualification logic: score leads by fit and readiness
- [ ] Set up routing: hot leads → Calendly / email to consultant; warm leads → nurture sequence; cold leads → unsubscribe
- [ ] Connect CRM (HubSpot, Salesforce, or Notion) for pipeline tracking
- [ ] Set up automated follow-up sequences (email + SMS if available)
- [ ] Build dashboard: leads captured, qualified, routed, conversion rate

**Owner:** Nexus

### Phase 3: Documentation (1 day)
- [ ] Write the case study: what the firm did before, what changed, ROI
- [ ] Name the service: "Acquisition Automation" or "Lead Intelligence Engine"
- [ ] Set pricing: $297-697/mo or % of lead value
- [ ] Create one-pager PDF

**Owner:** MrX / Mercury

### Phase 4: Package as Service
- [ ] Add service page to Borne Systems website
- [ ] Stripe product setup
- [ ] Chase outreach to consulting firms in target markets
- [ ] LinkedIn DM sequence targeting consultants

**Owner:** Forge / Chase

---

## Case Study 3: Property Management — Invoice Processing Agent

**Pitch:** "Autonomous agent collects invoices from clients, categorizes them, and prepares them for final accounting processing. 4 Hrs/Day Saved."

**Target ICP:** Small property management companies, landlords with 10-50 units, real estate investors

### Phase 1: Discovery & Scoping (1-2 days)
- [ ] Map current invoice flow: how invoices arrive (email, text, photos, portals), how they're routed, how they're approved
- [ ] Identify accounting software in use: QuickBooks, Buildium, Stripe, Excel
- [ ] Determine categorization needs: property, vendor, expense type
- [ ] Identify approval workflow: who approves, what thresholds
- [ ] Get sample invoices for testing

**Owner:** Ivy / Chase discovery

### Phase 2: Build (3-5 days)
- [ ] Set up invoice intake: email forwarding, photo capture, or form submission
- [ ] Build OCR/document parsing for invoice data extraction
- [ ] Create categorization logic by property and expense type
- [ ] Connect to accounting software (QuickBooks API or CSV export)
- [ ] Build approval routing for invoices over threshold
- [ ] Set up reconciliation report: invoices received, categorized, approved, paid

**Owner:** Nexus

### Phase 3: Documentation (1 day)
- [ ] Write the case study: before/after, time saved, accuracy improvement
- [ ] Name the service: "Invoice Intelligence" or "Accounts Payable Automation"
- [ ] Set pricing: $197-497/mo based on invoice volume
- [ ] Create one-pager PDF

**Owner:** MrX / Mercury

### Phase 4: Package as Service
- [ ] Add service page to Borne Systems website
- [ ] Stripe product setup
- [ ] Chase outreach: property managers, landlords, real estate investors in target markets
- [ ] Local SEO: optimize Google Business Profile for property management

**Owner:** Forge / Chase / Beacon

---

## Shared Infrastructure Needed

- [ ] Stripe products for all 3 new services (monthly + annual)
- [ ] Cal.com event types: discovery call for each service
- [ ] Notion CRM: add service lines to Lead Pipeline DB
- [ ] Chase outreach scripts: 1 per service (email + LinkedIn DM + voicemail)
- [ ] Case study one-pagers: 3 PDFs for sales collateral

---

## Build Order (Recommended)

1. **Invoice Processing Agent** — simplest build, clearest ROI (4 hrs/day), fastest to demo
2. **Acquisition Engine** — medium complexity, strong ROI story, popular ICP
3. **Contract Review** — most complex, highest price point, legal requires careful scoping

**Estimated total build time:** 3-4 weeks if running in parallel with client discovery

---

## Next Actions

- [ ] Confirm ICP priorities with Geele — which do we build first?
- [ ] Client discovery calls for all 3 verticals
- [ ] Forge builds service landing pages
- [ ] MrX writes outreach scripts
- [ ] Chase begins warm outreach to target verticals
