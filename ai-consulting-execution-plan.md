# Borne Systems — AI Consultancy Execution Plan
**Based on:** Andrew Dunn's AI Consulting Course + Team Analysis
**Date:** April 5, 2026
**Owner:** BorneAI (Atlas coordinating)
**Version:** 1.0

---

## THE VISION

Shift Borne Systems from selling AI tools → running AI consultancies.

**4-Stage Model:**
```
STAGE 1: DIAGNOSE     →  STAGE 2: PRESCRIBE  →  STAGE 3: IMPLEMENT  →  STAGE 4: MAINTAIN
(AI Audit)                 (Recommend)            (Do the work)           (Monthly retainer)
$497-$15,000              $1,500-$3,000          Implementation $           $299-$3,000/mo
```

**Revenue potential:**
- 1 audit client ($5K) + implementation ($5K) + 1 maintenance client ($599/mo) = $10,599 + $599/mo
- 10 maintenance clients × $599 = $5,990/mo recurring
- 20 maintenance clients × $599 = $11,980/mo recurring
- Target: 50 maintenance clients × $599 = $29,950/mo by end of year

---

## WHAT WE ALREADY HAVE (DON'T REBUILD)

### Done / Spec'd by Team

| Deliverable | File | Status |
|------------|------|--------|
| Chase outreach scripts (audit-framed) | `content-updates/chase-outreach-scripts.md` | ✅ Ready to use |
| Content pillar article #1 | `content-updates/content-pillar-1-article-1.md` | ✅ Ready to publish |
| Content pillar article #2 | `content-updates/content-pillar-1-article-2.md` | ✅ Ready to publish |
| LinkedIn post | `content-updates/content-pillar-1-linkedin-post.md` | ✅ Ready to post |
| Lead magnet concept (AI Quiz) | `content-updates/lead-magnet-concept.md` | ✅ Spec complete |
| Audit proposal format | `chase-updates/audit-proposal-format.md` | ✅ Ready to use |
| Discovery call script | `chase-updates/chase-discovery-call-script.md` | ✅ Ready to use |
| Audit questionnaire spec | `forge-tasks/audit-questionnaire-spec.md` | ⚠️ Need to build |
| Audit report template spec | `forge-tasks/audit-report-template-spec.md` | ⚠️ Need to build |
| Audit offer page spec | `forge-tasks/audit-offer-page-spec.md` | ⚠️ Need to build |
| Maintenance dashboard plan | `forge-tasks/maintenance-dashboard-plan.md` | ⚠️ Need to build |
| Dental vertical package spec | `forge-tasks/dental-vertical-package.md` | ⚠️ Need to build |

### What Still Needs Building (Forge)

| Item | Effort | Priority | Dependencies |
|------|--------|----------|-------------|
| Audit questionnaire (web form) | 2-3 days | 1 | None |
| Audit report template (Canva/Notion) | 1-2 days | 2 | None |
| $497 self-service audit offer page | 1-2 days | 3 | Audit questionnaire |
| Maintenance dashboard | 3-5 days | 4 | Supabase schema |
| $5K full audit offer page | 1 day | 5 | Report template |
| Dental vertical package (build) | 3-5 days | 6 | Offer page live |
| Lead magnet funnel (quiz) | 3-5 days | 7 | Offer page live |

---

## PHASE 1: LAUNCH THE OFFER (Week 1-2)
**Goal:** Have a live audit offer that Chase can sell this week.

### Week 1 — Build the Audit Machine

**Forge:**
- [ ] Build audit questionnaire as a Typeform/Cal.com form or simple web form
  - Spec: `forge-tasks/audit-questionnaire-spec.md`
  - Questions: 25 across 5 sections (Business, Processes, Pain Points, Technology, Goals)
  - Must capture: company name, industry, employee count, current tools, top 3 frustrations
  - Output: Submits to Supabase leads table + notifies Chase via email
- [ ] Create audit report template in Canva
  - Spec: `forge-tasks/audit-report-template-spec.md`
  - Sections: Executive Summary → Stakeholder Findings → Process Map → Opportunity Matrix → Quick Wins → Big Swings → ROI Estimate → Roadmap → Proposal
  - Must include: Borne branding, editable sections, ROI calculator

**MrX / Mercury:**
- [ ] Finalize and publish Content Pillar #1 Article #1: "Why 95% of AI Projects Fail"
  - File: `content-updates/content-pillar-1-article-1.md`
  - Publish on: Borne website blog + LinkedIn
- [ ] Finalize and publish Content Pillar #1 Article #2: "The AI Maintenance Problem"
  - File: `content-updates/content-pillar-1-article-2.md`
  - Publish on: Borne website blog + LinkedIn
- [ ] Post LinkedIn content
  - File: `content-updates/content-pillar-1-linkedin-post.md`
  - Schedule for peak times (Tue-Thu, 8-10am ET)

**Chase:**
- [ ] Start using new outreach scripts IMMEDIATELY
  - File: `content-updates/chase-outreach-scripts.md`
  - 3-email cold sequence + LinkedIn DM + voicemail drop
  - Core message: "We help businesses find where AI is costing them money — then we fix it and stay."
- [ ] Begin outreach to warm leads: Carson Aesthetics, MA Home Improvement, Apex Home Improvement

### Week 2 — Build the Pages

**Forge:**
- [ ] Build $497 self-service audit landing page
  - Spec: `forge-tasks/audit-offer-page-spec.md`
  - Sections: Hero (problem), How It Works, What You Get, Pricing, FAQ, CTA
  - CTA: "Start Your Audit" → leads to audit questionnaire form
  - Tech: Update existing Borne website (React/AWS Amplify)
- [ ] Add $5K full audit page as separate page
  - Link from self-service page for larger prospects
- [ ] Set up email notification when audit form is submitted
  - Trigger: Supabase webhook → send email to Chase + BorneAI

**MrX / Mercury:**
- [ ] Write and publish 1 blog post per week (ongoing)
  - Week 2: "What Actually Happens in an AI Audit"
  - Week 3: "The Difference Between Diagnosis and Implementation"
  - Week 4: "Why Maintenance Is the Real Value"

---

## PHASE 2: RUN THE FIRST AUDIT (Week 3)
**Goal:** Close and deliver first paid audit client.

### Before Week 3
- [ ] 3+ discovery calls scheduled by Chase
- [ ] At least 1 audit sold ($497 or $5K)

### Week 3 — Deliver the Audit

**Chase:**
- [ ] Discovery calls using new script
  - File: `chase-updates/chase-discovery-call-script.md`
  - Goal: Qualify, not close. Schedule audit.
- [ ] Send audit proposal after discovery call
  - File: `chase-updates/audit-proposal-format.md`
  - Options: $497 self-service OR $5K full audit
- [ ] Onboard audit client: send questionnaire link, schedule interviews

**BorneAI (Operations):**
- [ ] Conduct stakeholder interview (30-45 min, record)
  - Use stakeholder interview template from blueprint
  - Questions: goals, KPIs, team structure, challenges, tech stack, pain points
- [ ] Conduct employee interviews (2-3 employees, 30 min each)
  - Use employee interview template from blueprint
  - Questions: daily tasks, repetitive work, workarounds, bottlenecks
- [ ] Map process using FigJam/Miro template
  - Acquisition → Delivery → Support
  - Mark: time sinks + quality risks
- [ ] Build opportunity matrix (quick wins vs big swings)
- [ ] Co-create roadmap with client (validation session)
- [ ] Deliver audit report via video call

**MrX:**
- [ ] Document case study from first audit (with client permission)
  - Before/after, specific ROI numbers, client quote
  - This becomes Pillar 3 content (proof)

---

## PHASE 3: ADD MAINTENANCE LAYER (Week 4)
**Goal:** Every implementation client gets a maintenance proposal.

### Week 4 — Maintenance Integration

**Forge:**
- [ ] Begin maintenance dashboard build
  - Spec: `forge-tasks/maintenance-dashboard-plan.md`
  - Phase 1: Uptime monitoring + call volume metrics
  - Phase 2: Lead tracking + conversion rates
  - Phase 3: Monthly PDF reports
- [ ] Define Supabase schema for maintenance metrics
  - Tables: clients, ai_systems, call_logs, lead_tracking, monthly_reports

**All Agents (when selling implementation):**
- [ ] Always propose Bronze Maintenance ($299/mo) with every implementation
- [ ] Frame maintenance as required: "We require a maintenance agreement because AI changes fast. Without it, your implementation will drift."
- [ ] Use maintenance as qualifier: "Are you committed to making this work long-term?"

**Chase:**
- [ ] First implementation proposal written
  - Bronze Implementation: $1,500 one-time + $299/mo Bronze Maintenance
  - Silver Implementation: $3,000 one-time + $599/mo Silver Maintenance
  - Gold Implementation: $5,000 one-time + $999/mo Gold Maintenance
- [ ] First maintenance proposal for existing clients (if any)

---

## PHASE 4: BUILD VERTICAL PACKAGES (Week 5-8)
**Goal:** Have a ready-to-deploy Dental AI Package.

### Week 5-6: Dental Vertical Build

**Forge:**
- [ ] Build Dental AI Package
  - Spec: `forge-tasks/dental-vertical-package.md`
  - Pre-configured AI Receptionist:
    - Appointment scheduling skill
    - Insurance verification handling
    - Recall reminders (6mo, 12mo, new patient)
    - Emergency call routing
    - New patient inquiry response
  - Pre-built SMS templates:
    - Appointment confirmation
    - Reminder (24hr before)
    - Recall (6 months)
    - Recall (12 months)
    - New patient welcome
    - After-hours message
  - QuoteHook configuration for treatment plan follow-up
  - Lead Automation for new patient inquiry response
  - Onboarding checklist (4 weeks)
- [ ] Test on 1 dental prospect (pilot)

**MrX:**
- [ ] Write Dental vertical content
  - "How Dental Practices Are Using AI to Fill Empty Chairs"
  - "The Real Cost of a Missed Dental Appointment"
  - Case study: Dental client results

**Chase:**
- [ ] Outreach specifically to dental practices
  - Lead list: 20-50 dental offices in CT/NY/NJ
  - Script: Dental-specific pain points (missed appointments, insurance confusion, recall gaps)

### Week 7-8: Home Services Vertical + Repeat

**Forge:**
- [ ] Build Home Services AI Package (HVAC, Plumbing, Contractors)
  - Pre-configured AI Receptionist:
    - Emergency call routing
    - Quote request capture
    - Appointment scheduling
    - After-hours routing
  - QuoteHook for project bid follow-up
  - Lead Automation for job site leads
  - SMS templates for service confirmations

**MrX:**
- [ ] Write Home Services vertical content
  - "The #1 Way Home Service Businesses Lose Leads (It's Not Price)"
  - "Why HVAC Companies Can't Afford to Miss Another Call"

---

## PHASE 5: SCALE (Month 2+)
**Goal:** Systematic client acquisition + recurring revenue base.

### Month 2 Targets
- 5 discovery calls scheduled
- 2 audits sold ($497 self-service)
- 1 full implementation sold
- 3 maintenance clients
- MRR: $1,796/mo

### Month 3 Targets
- 10 discovery calls scheduled
- 4 audits sold
- 2 implementations sold
- 8 maintenance clients
- MRR: $4,792/mo

### Month 6 Targets
- 20 discovery calls/month
- 8 audits sold/month
- 5 implementations/month
- 20 maintenance clients
- MRR: $11,980/mo

### Month 12 Targets
- 50 maintenance clients
- MRR: $29,950/mo
- 2 full-time equivalent clients serviced (10-15hrs/week with help)

---

## METRICS DASHBOARD

Track weekly in Notion or Google Sheets:

| Metric | Week 1 | Month 1 Target | Month 3 Target | Month 6 Target |
|--------|---------|----------------|----------------|----------------|
| Discovery calls | - | 5 | 10 | 20 |
| Audits sold | - | 2 | 4 | 8 |
| Implementations sold | - | 1 | 2 | 5 |
| Maintenance clients | - | 3 | 8 | 20 |
| MRR | $0 | $1,796 | $4,792 | $11,980 |
| LTV per client | - | - | $15K | $50K+ |

---

## PRICING SHEET (FINAL)

### Audit Products
| Product | Price | Description |
|---------|-------|-------------|
| Self-Service Audit | $497 | Questionnaire + 30-min debrief + 3 recommendations |
| Full AI Audit (Small) | $5,000 | 2-week assessment + interviews + matrix + roadmap + proposal |
| Full AI Audit (Medium) | $10,000 | 2-week + 10-15 interviews + full report + presentation |
| Full AI Audit (Enterprise) | $15,000-$50,000 | Custom scope |

### Implementation Products
| Product | One-Time | Monthly | Includes |
|---------|----------|---------|---------|
| Bronze Implementation | $1,500 | $299/mo | AI Receptionist setup + QuoteHook + 1 workflow |
| Silver Implementation | $3,000 | $599/mo | AI Receptionist + Lead Automation + QuoteHook + 3 workflows |
| Gold Implementation | $5,000 | $999/mo | Everything + Security Basic + dedicated onboarding |

### Maintenance Products
| Product | Price | Description |
|---------|-------|-------------|
| Bronze Maintenance | $299/mo | Uptime monitoring + monthly call report + 1 check-in/mo |
| Silver Maintenance | $599/mo | All Bronze + bi-weekly review + ad-hoc changes + new features |
| Gold Maintenance | $1,499/mo | All Silver + dedicated Slack + priority response + quarterly strategy |
| Platinum Maintenance | $3,000/mo | All Gold + on-call + custom development + monthly executive briefing |

---

## KEY TASKS BY OWNER

### Chase — Sales Execution
| Task | Due | Status |
|------|-----|--------|
| Use new outreach scripts (audit-framed) | Week 1 | 🔴 Do now |
| Outreach to warm leads (Carson, MA Home, Apex) | Week 1 | 🔴 Do now |
| Discovery call script (30-min qualify) | Week 1 | ✅ Ready |
| Audit proposal format | Week 1 | ✅ Ready |
| Dental vertical outreach list (50 dental offices) | Week 5 | 🟡 Queued |
| Track all activities in Notion Leads DB | Ongoing | 🟡 Queued |

### MrX / Mercury — Content & Messaging
| Task | Due | Status |
|------|-----|--------|
| Publish Article #1: "Why 95% of AI Projects Fail" | Week 1 | 🔴 Do now |
| Publish Article #2: "The AI Maintenance Problem" | Week 1 | 🔴 Do now |
| Post LinkedIn content (audit angle) | Week 1 | 🔴 Do now |
| Lead magnet: AI Opportunity Quiz funnel | Week 3-4 | 🟡 Queued |
| Write dental vertical content | Week 5 | 🟡 Queued |
| Write home services vertical content | Week 7 | 🟡 Queued |

### Forge — Product & Tech
| Task | Due | Status |
|------|-----|--------|
| Build audit questionnaire (web form) | Week 1 | 🔴 Do now |
| Create audit report template (Canva) | Week 1 | 🔴 Do now |
| Build $497 audit offer page | Week 2 | 🟡 Queued |
| Set up audit submission email notification | Week 2 | 🟡 Queued |
| Build $5K full audit page | Week 2 | 🟡 Queued |
| Maintenance dashboard (Phase 1-3) | Week 4-6 | 🟡 Queued |
| Dental AI Package build | Week 5-6 | 🟡 Queued |
| Home Services AI Package build | Week 7-8 | 🟡 Queued |

### BorneAI — Operations & Coordination
| Task | Due | Status |
|------|-----|--------|
| Sync Supabase leads → Notion Leads DB | Daily | 🔴 Background |
| First pilot audit delivery | Week 3 | 🟡 Queued |
| Notion workspace organization | Done | ✅ Complete |
| Monitor Chase outreach performance | Weekly | 🟡 Queued |

---

## WEEKLY OPERATING CADENCE

### Monday
- Review week's outreach activity (Chase)
- Check lead pipeline status (Notion)
- Plan week's content publish schedule (MrX)

### Tuesday-Thursday
- Chase: Discovery calls + outreach
- MrX: Content publishing + engagement
- Forge: Build tasks (morning focus)

### Friday
- Week review: What worked? What didn't?
- Update metrics dashboard
- Plan next week priorities

### Monthly
- Full metrics review (MRR, pipeline, conversion rates)
- Strategy adjustment
- Priority rebalancing

---

## BLOCKERS TO CLEAR NOW

| Blocker | Owner | Status |
|---------|-------|--------|
| Twilio A2P approval (needed for SMS) | Geele | 🔴 Waiting on Twilio |
| ClawMart Vercel 503 (marketplace down) | Geele | 🔴 Unpause needed |
| GBP postcard verification (5-14 days) | USPS | 🟡 Waiting |

---

## SUCCESS MEASUREMENT

**6 months from now, Borne Systems should have:**
- ✅ 50+ maintenance clients paying $299-$1,499/mo
- ✅ 10+ audit clients
- ✅ 5+ implementation clients
- ✅ MRR of $15,000-$30,000/mo
- ✅ Systematic sales process (discovery → audit → implement → maintain)
- ✅ Vertical packages for Dental + Home Services
- ✅ Content engine publishing weekly
- ✅ Dashboard live showing client ROI
