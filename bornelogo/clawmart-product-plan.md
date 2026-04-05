# ClawMart Product Plan — April 2026

**Context:** ClawMart (clawmart.ai) is currently **PAUSED** on Vercel. ~33 products exist in `clawmart-packages/`. Geele mentioned ~19 were live. This plan audits the current stack, identifies gaps, and proposes new products and agent personas.

---

## PART 1: EXISTING PRODUCTS AUDIT

### Current Packages (33 total)

| Product | Category | Status |
|---------|----------|--------|
| Knox Security Hardening | Skill | ✅ Built |
| SecretScout | Security Tool | ✅ Built (full CLI) |
| CVE Monitor | Security | ✅ Built |
| OpenClaw Security Stack | Bundle | ✅ Built |
| GitHub Automation | DevOps | ✅ Built |
| DeployOps | DevOps | ✅ Built |
| Server Health Dashboard | Tool | ✅ Built |
| Server Health Lite | Tool (free) | ✅ Built |
| Analytics Viewer | Tool | ✅ Built |
| Auto-Backup Toolkit | Tool | ✅ Built |
| Notion Sync | Integration | ✅ Built |
| Notion Starter Templates | Template | ✅ Built |
| Lead Pipeline Manager | CRM | ✅ Built |
| Sales Agent | Persona | ✅ Built |
| Support Agent | Persona | ✅ Built |
| Research Agent | Persona | ✅ Built |
| Mercury Brand Studio | Persona/Bundle | ✅ Built |
| Content Factory | Content | ✅ Built |
| X/Twitter Agent Lite | Social (free) | ✅ Built |
| Mini Website Audit | SEO (free) | ✅ Built |
| AI Visibility Scanner | SEO | ✅ Built |
| Operator Cookbook | Education | ✅ Built |
| Prompt Engineering Guide | Education | ✅ Built |
| Prompt Starter Pack | Education (free) | ✅ Built |
| OpenClaw Quick Start | Onboarding (free) | ✅ Built |
| Academic Assistant | Education | ✅ Built |
| Morning Briefing Engine | Productivity | ✅ Built |
| Coding Sessions | DevOps | ✅ Built |
| Travel Director | Persona | ✅ Built |
| Job Application System | Productivity | ✅ Built |
| NotebookLM Audio Pipeline | Education | ✅ Built |
| NotebookLM Study Buddy | Education | ✅ Built |

### ⚠️ Issues Found

1. **ClawMart is paused** — needs unpausing before any revenue can flow
2. **AI Receptionist (priority) is NOT in the packages** — exists separately at `ai-receptionist-mvp/` but not published to ClawMart
3. **No pricing/version metadata** in most SKILL.md files — needs standardization
4. **Several products have empty/minimal SKILL.md files** — need content before publishing
5. **Persona products (Sales Agent, Support Agent, Research Agent) have no pricing** — need to finalize

---

## PART 2: GAPS IDENTIFIED

### 🔴 Critical Gaps (revenue-ready products missing)

1. **AI Receptionist** — The #1 product being built, NOT in ClawMart. MVP exists but unpublished.
2. **Review Response AI** — Auto-respond to Google/Yelp reviews. Natural companion to AI Receptionist.
3. **GBP Optimizer** — Google Business Profile management and posting. High demand from SMBs.

### 🟡 Security Gaps (Geele's OSCP angle — no current coverage)

4. **PenTest Recon Tool** — Automated reconnaissance: subdomain enumeration, port scanning, screenshotting. Geo: "tools that complement OSCP workflow."
5. **PhishSim** — Phishing simulation tool for internal security training.
6. **Password Auditor** — Check HIBP integration, password strength auditing for teams.
7. **SOC Alert Builder** — Lightweight alerting stack: log aggregation + anomaly detection.

### 🟡 SMB / Home Services Gaps

8. **Home Services CRM** — Specialized for plumbers, HVAC, electricians. Job scheduling + lead routing.
9. **Contractor Proposal Generator** — AI-generated quotes/proposals from a chat conversation.
10. **Appointment Reminder Bot** — SMS/email reminders via VAPI. 2-way texting for confirmations.

### 🟢 Adjacent Products (quick wins)

11. **Review Response Bot** — Sentiment detection + auto-generate review replies.
12. **Local Citation Builder** — Auto-submit business listings to directories.
13. **Email Warmup Tool** — Warm new email domains to improve deliverability.

---

## PART 3: NEW PRODUCT IDEAS

### P1 — AI Receptionist for ClawMart
**What:** Voice AI receptionist with VAPI. Answers calls, books appointments, handles FAQ.
**Problem:** Small businesses miss calls = lost revenue. Receptionists are expensive.
**Target:** Dental offices, salons, HVAC, home services, legal offices
**Positioning:** Secure, affordable, 24/7 — built by people who take security seriously
**Price:** $99–199/mo or $299 setup + $99/mo
**Effort:** Medium — MVP exists at `ai-receptionist-mvp/`, needs packaging + ClawMart listing
**Status:** Priority 1 — unblock revenue**

---

### P2 — KnoxPen (PenTest Recon Suite)
**What:** CLI tool for automated reconnaissance: subdomain enum, port scan, screenshot capture, service fingerprinting. Think "automated recon that feeds OSCP workflow."
**Problem:** Geele is OSCP-focused. This builds his portfolio AND serves security customers.
**Target:** Security practitioners, pentesters, red teamers, Geele himself
**Positioning:** Built by an OSCP candidate — for practitioners who want real automation
**Price:** $49 one-time or $19/mo
**Effort:** Quick win — leverages existing Knox Security Hardening skill, adds active recon modules
**Status:** High differentiator for Borne Systems' security identity

---

### P3 — Review Response AI
**What:** Connects to Google/Yelp APIs. Detects sentiment. Auto-generates professional, personalized responses to ALL reviews.
**Problem:** Businesses get reviews and either ignore them or spend hours responding manually.
**Target:** Any SMB with Google Business Profile — restaurants, salons, medical, retail
**Positioning:** "Never let a review go unanswered. Even while you sleep."
**Price:** $49–79/mo
**Effort:** Quick win — uses existing VAPI + Notion stack. Resend for email notifications.
**Synergy:** Complements AI Receptionist. Same customer buys both.

---

### P4 — GBP Optimizer
**What:** Auto-manage Google Business Profile: generate posts, fill missing fields, track insights, auto-respond to reviews (see P3).
**Problem:** Most SMBs set up GBP once and forget it. Incomplete profiles lose local search visibility.
**Target:** Local service businesses (the same as AI Receptionist)
**Positioning:** "Your GBP, always fresh. No effort required."
**Price:** $79/mo
**Effort:** Medium — requires Google Business Profile API access
**Synergy:** Sold as bundle with AI Receptionist ("LocalDomination Package" $149/mo)

---

### P5 — PhishSim
**What:** Phishing simulation tool. Send simulated phishing emails to employees, track click rates, generate training reports.
**Problem:** Companies need phishing training but real services (KnowBe4) are expensive.
**Target:** Small IT MSPs, internal IT teams, Geele's future pen testing clients
**Positioning:** Security-minded phishing training at SMB prices
**Price:** $29–59/mo or $199 one-time
**Effort:** Medium — needs email sending infrastructure (Resend already in stack)
**Security note:** Requires careful scoping — mark as "authorized simulation only"

---

### P6 — Home Services CRM
**What:** Specialized CRM for plumbers, HVAC, electricians. Job scheduling, route optimization hints, customer history, quote generation.
**Problem:** Generic CRMs are too complex for small contractors. They need simple job → payment flow.
**Target:** Home service contractors, 1–10 employee shops
**Positioning:** "CRM built for guys who fix things — not office people"
**Price:** $49/mo
**Effort:** Significant — requires Notion template work + potentially a UI layer
**Low priority** unless Home Services vertical is chosen as primary focus

---

### P7 — Appointment Reminder Bot
**What:** VAPI-powered SMS/voice reminder system. Texts appt reminders, confirms, handles reschedules via 2-way texting.
**Problem:** No-shows cost SMBs money. Manual reminder texts are tedious.
**Target:** Same as AI Receptionist — dental, medical, services
**Positioning:** "Cut your no-shows in half. Automatically."
**Price:** $29–49/mo (add-on to AI Receptionist) or $79 standalone
**Effort:** Quick win — leverages existing VAPI infrastructure
**Synergy:** Natural add-on to AI Receptionist

---

### P8 — Local Citation Builder
**What:** Automated submission to 50+ local directories (Yelp, Apple Maps, Bing, industry-specific).
**Problem:** Inconsistent NAP (Name, Address, Phone) across directories hurts local SEO.
**Target:** Local agencies managing multiple client listings, or single-location SMBs
**Positioning:** "Get found everywhere. Without the paperwork."
**Price:** $49 one-time setup + $19/mo monitoring
**Effort:** Medium — many directory APIs are free, some require outreach
**Note:** Beacon already does citation work — this is a packaged version for clients

---

### P9 — SOC Lite (Alerting Stack)
**What:** Lightweight alerting: log aggregation + anomaly detection + Telegram alerts. For SMBs who want security visibility without Splunk costs.
**Problem:** SMBs have no idea when their server is being attacked.
**Target:** Tech-savvy SMBs, MSPs, Geele's future managed security clients
**Positioning:** "Security visibility for businesses that can't afford a SOC"
**Price:** $39/mo
**Effort:** Medium — uses existing Telegram + log scripts + Knox brand
**Synergy:** Knox Security Hardening + SOC Lite = "Security Starter Kit"

---

### P10 — Email Warmup Tool
**What:** Automated email warmup: daily sent emails + positive interactions to build domain reputation.
**Problem:** New domains get spam-filtered. Warmup services are expensive or fake.
**Target:** Cold emailers, new VAPI deployments using email, outbound agencies
**Positioning:** "Land in the inbox. Not spam."
**Price:** $19/mo
**Effort:** Quick win — uses Resend (already in stack) + warmup email patterns
**Note:** Could be bundled with outbound sales tools

---

## PART 4: NEW AGENT PERSONAS

### 1. Harbor (HR / People Ops)
**What:** HR assistant for small teams. Onboarding checklists, policy drafting, PTO tracking, compliance reminders.
**Reports to:** BorneAI
**Stack use:** Notion (already a strength), Resend
**Why:** Fills a common SMB gap. Easy to sell as "your virtual HR assistant."
**Price concept:** Could be sold as a persona skill ($39 one-time) or $99/mo retainer

### 2. Clause (Legal / Contract Review)
**What:** Reviews contracts, flags problematic clauses, summarizes terms. Not legal advice — organizational clarity.
**Reports to:** BorneAI
**Stack use:** Document parsing, Resend for delivery
**Why:** Geele's contract work for clients would benefit. Could be a paid add-on for clients.
**Caution:** Must be clearly positioned as "review assistance" not legal advice
**Price:** $29 one-time for review, or $149/mo retainer

### 3. Scout (Field Sales / Territory Rep)
**What:** Automated outbound prospecting for a specific territory/vertical. Researches leads, drafts outreach, qualifies interest — all in a defined geography or ICP.
**Reports to:** Chase
**Why:** Geo's sales pipeline is manual. Scout automates territory research + first contact.
**Synergy:** Works with Lead Enrichment + Chase outreach scripts
**Price:** Could be a persona skill ($49) or integrated into Sales Agent product

### 4. Nova (Content Distribution Manager)
**What:** Not just posting — distributing, monitoring, and reporting on content across platforms. Tracks what lands, what flops, recommends next moves.
**Reports to:** Mercury
**Status:** Already exists in some form (Mercury → Nova pipeline noted in memory)
**Gap:** Nova isn't clearly defined as a sellable persona
**Price:** $29/mo or bundled with Content Factory

### 5. Vault (Data / Compliance Officer)
**What:** GDPR/CCPA compliance assistant. Tracks data retention, handles deletion requests, maintains consent logs.
**Reports to:** BorneAI (security chain)
**Why:** Compliance is a growing SMB concern. Aligns with Borne's security brand.
**Stack use:** Supabase, Notion, existing security infra
**Price:** $59/mo

### 6. Cipher (Encryption / Secure Communications)
**What:** Handles sensitive communications with encryption tooling. PGP encrypt/decrypt, secure file sharing links, expiring messages.
**Reports to:** Knox (security chain)
**Why:** Security differentiator. No current ClawMart product does encryption tooling.
**Price:** $19/mo or $199 one-time

---

## PART 5: PRIORITIZATION

### Must Do First (Revenue unblockers)

| # | Product | Why | Effort |
|---|---------|-----|--------|
| 1 | **Unpause ClawMart** | Nothing sells if store is down | 2 min (Vercel resume) |
| 2 | **Package + list AI Receptionist** | #1 revenue product, already built | Medium |
| 3 | **Add pricing to all existing packages** | Most SKILL.md files lack price fields | Quick |

### Then (High-value quick wins)

| # | Product | Why | Effort |
|---|---------|-----|--------|
| 4 | **Review Response AI** | Synergy with Receptionist, quick build | Quick |
| 5 | **KnoxPen (PenTest Recon)** | Security identity, Geele's OSCP prep | Quick |
| 6 | **Appointment Reminder Bot** | Same stack as Receptionist | Quick |
| 7 | **SOC Lite** | Security brand, SMB need | Medium |

### Then (Medium-term products)

| # | Product | Why | Effort |
|---|---------|-----|--------|
| 8 | **GBP Optimizer** | Local SEO bundle with Receptionist | Medium |
| 9 | **PhishSim** | Security + Geele portfolio | Medium |
| 10 | **Harbor (HR persona)** | New vertical, easy to build | Medium |

### Later (Lower priority)

| # | Product | Why |
|---|---------|-----|
| 11 | Home Services CRM | Significant build, unclear demand |
| 12 | Local Citation Builder | Beacon already does this |
| 13 | Email Warmup Tool | Niche use case |
| 14 | Clause (Legal) | Liability risk without careful positioning |

---

## PART 6: IMMEDIATE ACTION ITEMS

1. **[2 min]** Resume ClawMart on Vercel — store is paused
2. **[30 min]** Add `price:`, `category:`, `x402-ready:` fields to all SKILL.md files
3. **[1 day]** Package AI Receptionist for ClawMart — write SKILL.md + decide pricing
4. **[1 day]** Build Review Response AI (P3) — uses Resend + VAPI + Notion, already in stack
5. **[1 day]** Build KnoxPen (P2) — add recon modules to Knox Security Hardening
6. **[1 day]** Create Harbor HR persona — Notion-based onboarding checklists
7. **[2 days]** Build Appointment Reminder Bot (P7) — VAPI + SMS

---

## SUMMARY

**Borne Systems is sitting on a solid foundation of 33 products** — but the store is down and the #1 revenue product (AI Receptionist) isn't listed. The immediate play is:

1. **Open the store**
2. **Publish the AI Receptionist**
3. **Add pricing to everything**
4. **Build the quick wins** (Review Response, KnoxPen, Reminder Bot)

**The security angle is underleveraged.** Geele's OSCP focus is a genuine differentiator — KnoxPen, PhishSim, and SOC Lite can position Borne Systems as the security-minded AI company, not just another automation shop.

**The SMB vertical is the clearest revenue path.** AI Receptionist + Review Response + GBP Optimizer + Appointment Reminders = a "local business AI stack" that can be sold as a bundle.

**Agent personas are mostly built internally** — the gap is packaging them as sellable products with clear positioning, not building new ones.

---

*Generated: 2026-04-05 | Context: ClawMart paused, 33 packages in clawmart-packages/, AI Receptionist MVP exists but unpublished*
