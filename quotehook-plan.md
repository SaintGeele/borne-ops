# QuoteHook — Development & Launch Plan
**Prepared by:** BorneAI  
**For:** Geele Evans | Atlas | Nexus | Chase  
**Date:** 2026-04-05  
**Status:** Ready for Geele Approval

---

## BOTTOM LINE

QuoteHook is a high-probability upsell to existing AI Receptionist clients and a viable standalone product for home-service SMBs. The MVP is technically straightforward given existing Twilio/Resend infrastructure, but the regulatory surface (TCPA) is the biggest non-technical risk and must be addressed before any SMS goes out. Sequence the build as: **state machine → SMS → CRM tracking → email → dashboard**, and launch as an add-on first, not standalone.

---

## 1. TECHNICAL MVP PLAN

### Build Sequence (Recommended Order)

| # | Component | Why First | Complexity |
|---|-----------|-----------|------------|
| 1 | **Follow-up state machine** | Core logic. Everything else depends on this. | Medium |
| 2 | **Twilio SMS integration** | Borne already has Twilio. Low-lift wiring. | Low-Medium |
| 3 | **CRM-like lead tracking** | Track quote recipients, statuses, replies. | Medium |
| 4 | **Resend email integration** | Borne already has Resend. Mirror SMS logic. | Low |
| 5 | **Client dashboard** | Read-only activity view. Can defer post-MVP. | Medium |

### Component Details

**1. Follow-up State Machine**
- States: `QUOTED` → `DAY_1_SENT` → `DAY_3_SENT` → `DAY_7_SENT` → `DAY_14_SENT` → `REPLIED` / `CONVERTED` / `CANCELLED`
- Triggered by: quote creation event (manual entry or AI Receptionist capture)
- Persistence: Supabase (Borne's existing DB)
- Logic: Cron job or event-driven scheduler checks daily for leads in each state and fires next-step actions
- Hardest part: reply detection (customer replies to a follow-up — need to route back and stop escalation)

**2. Twilio SMS Integration**
- Borne already has Twilio credentials and voice AI integration — reuse the account
- Outbound only at first (no 2-way SMS required for MVP; can add conversational reply detection later)
- Use Twilio Copilot or standard messaging API
- Store `last_sms_sent_at`, `sms_opt_out` flags per contact
- **Risk:** TCPA consent capture must happen BEFORE any SMS is sent (see Section 2)

**3. CRM-like Lead Tracking**
- Minimal schema: `contacts(id, name, phone, email, quote_amount, quote_date, follow_up_state, state_updated_at, converted_at)`
- Track state transitions in an `activity_log` table
- Link to AI Receptionist client account
- This is not a full CRM — it's a thin overlay on existing contact data

**4. Resend Email Integration**
- Borne already has Resend — mirror the SMS message logic with email templates
- Plain-text first, HTML templates later
- Track open events via Resend webhooks (optional for MVP)

**5. Client Dashboard**
- Shows: contacts in follow-up funnel, conversion rate, last activity
- Read-only — no data entry here (that happens in AI Receptionist or directly in DB for MVP)
- Can be deferred 2–3 weeks post-launch to reduce initial scope

### Hardest/Most Complex Component

**State machine reply detection** is the most complex. Options:
- **Simple (MVP):** No 2-way SMS. Customer replies → Borne staff marks as "replied" manually, or reads reply in Twilio SMS logs
- **Better:** Twilio inbound webhook → Borne detects reply → auto-transitions state to `REPLIED`
- **Best:** AI Receptionist already handles inbound calls/voicemail — extend it to handle SMS replies

**Recommendation:** Start simple (manual reply flag). Add 2-way SMS detection in Week 2 iteration.

---

## 2. REGULATORY CHECK — TCPA COMPLIANCE

### The Core Rule
The Telephone Consumer Protection Act (TCPA) requires **prior express written consent** before sending SMS marketing messages to US cellular numbers. This is not optional. Violations carry **$500–$1,500 per text** in statutory damages — class action exposure is severe.

### What Borne Must Have Before Sending Any QuoteHook SMS

| Requirement | Details |
|-------------|---------|
| **Consent at point of capture** | The home-service business (Borne's client) must collect SMS consent from their customer at time of quote/inquiry — e.g., "Can we text you updates about your project?" with a checkbox or signature |
| **Consent language** | Must clearly state: (1) the number will be used for marketing, (2) msg & data rates may apply, (3) opt-out instructions |
| **Consent record** | Store consent timestamp, method, and exact language used per contact — this is your legal shield |
| **Opt-out mechanism** | Every SMS must include "Reply STOP to opt out" — Twilio handles this natively if configured correctly |
| **Do Not Contact list** | Honor opt-outs immediately; remove from all future sequences |
| **Time-of-day restrictions** | No SMS before 8am or after 9pm local recipient time |

### Borne's Position: Are You the Sender or the Tool Provider?

This is the critical legal question. There are two models:

**Model A — Borne as the SMS Sender (Carrier)**
Borne sends SMS directly from Borne's Twilio number to end customers.
- Borne bears full TCPA liability
- Requires robust consent verification, consent records, scrubbing
- Cleanest for compliance if done right; highest risk if done wrong

**Model B — Borne as the Platform/Tool Provider**
The home-service business sends SMS from their own Twilio number or business name, Borne automates the scheduling and content.
- TCPA liability sits primarily with the business (they are the "sender")
- Borne's liability is reduced but not zero if marketed as "Borne sends texts for you"
- Requires client agreement acknowledging their consent obligations

**Recommendation for MVP:** Model B (Tool Provider) for launch. Borne provides the automation and orchestration, but the SMS appears to come from the client's business or is sent through their Twilio account. This shifts primary TCPA liability to the client. Include a strong TCPA compliance clause in the client services agreement that requires the client to obtain and maintain consent.

**Important:** This is legal guidance, not legal advice. Geele should have an attorney review the client agreement language before launch.

---

## 3. PRICING & PACKAGING

### Recommendation: Phase 1 = Add-on, Phase 2 = Standalone

**Why add-on first:**
1. Existing AI Receptionist clients already trust Borne — lower sales friction, faster first revenue
2. TCPA/consent infrastructure benefits from existing client relationships (existing clients already have consent flows for calls)
3. Can test messaging, pricing, and delivery without building new acquisition pipeline
4. Adds $149–249 MRR per existing client — high-margin expansion revenue

### Proposed Packaging

| Tier | Price | Follow-ups | Notes |
|------|-------|------------|-------|
| Add-on Starter | $49/mo | 30/mo | Existing AI Receptionist clients only |
| Add-on Pro | $99/mo | Unlimited | Existing AI Receptionist clients only |
| Standalone Starter | $149/mo | 30/mo | Net new clients |
| Standalone Pro | $249/mo | Unlimited | Net new clients |

**Rationale:** Lower add-on pricing creates a low-friction upgrade path for existing clients. Standalone pricing matches original brief.

### Migration Path: Add-on → Standalone
- Month 1–3: Sell as add-on to warm AI Receptionist clients
- Month 4+: Package as standalone product with its own landing page and sales motion
- Add-on clients can migrate to standalone at any time; data exports cleanly from Supabase

---

## 4. SALES STRATEGY

### Sell to Existing AI Receptionist Clients (Chase's Primary Focus)

**Pitch:**  
"Your AI Receptionist is booking leads — but what happens after the quote goes out? QuoteHook follows up automatically at Day 1, 3, 7, and 14 so your quotes stop disappearing into silence. Same inbox, same team, $49/mo add-on."

**Talk Track (30 seconds):**
> "Hey [Name], quick question — when you send a quote out, do you have a follow-up process? Most home service shops send it and wait. QuoteHook watches that quote and sends a follow-up text at 1, 3, 7, and 14 days automatically. We handle the outreach, you just answer the phone when they call back. It's $49/mo for 30 follow-ups. Want to add it to your account?"

**Key selling points:**
- Already integrated with their existing setup
- Low monthly cost, high perceived value
- Fits the "set it and forget it" mindset of home service owners
- No extra work for their team

### Net New Clients (Standalone Motion)

**Target:** Home service businesses who do NOT have an AI Receptionist

**Channels:**
1. Cold outreach via email/SMS to HVAC, plumbing, roofing, landscaping businesses in local markets
2. Google Business Profile + local SEO plays (Beacon owns this)
3. Referrals from existing clients

**Pitch (Standalone):**
> "You've probably sent out quotes and never heard back. QuoteHook is an AI follow-up agent that texts and emails your prospects automatically after you send a quote — Day 1, 3, 7, Day 14. It tracks who replied, who converted, and who went dark. $149/mo, no long-term contract."

**Content assets needed for standalone:**
- Standalone landing page (Forge builds, Mercury writes copy)
- One-pager or email sequence for cold outreach

---

## 5. MVP LAUNCH SEQUENCE

**From where Borne is today → First paid QuoteHook client**

| Step | Owner | Action | Duration |
|------|-------|--------|----------|
| 1 | **Geele** | Approve plan + decide legal structure (add-on vs standalone priority) | Day 1 |
| 2 | **Nexus** | Build follow-up state machine in Supabase (states, transitions, cron/scheduler) | Days 1–3 |
| 3 | **Nexus** | Wire Twilio SMS send (outbound only, no 2-way yet) | Days 3–4 |
| 4 | **Nexus** | Build contact tracking table + activity log in Supabase | Days 4–5 |
| 5 | **Nexus** | Wire Resend email send (mirror SMS templates) | Days 5–6 |
| 6 | **Chase** | Identify 5 warm AI Receptionist clients for pilot | Day 5 |
| 7 | **Chase + Nexus** | Onboard 1 pilot client (consent flow, contact load, test follow-ups) | Days 6–8 |
| 8 | **Nexus** | Build minimal client dashboard (follow-up funnel view) | Days 7–10 |
| 9 | **Chase** | Convert pilot to first paid QuoteHook client ($49/mo add-on) | Day 10–14 |
| 10 | **Atlas** | Review metrics, capture learnings, hand off to Chase for outreach playbook | Day 14 |

**Total estimated time to first paid client: ~2 weeks**

---

## 6. OPEN QUESTIONS FOR GEELE

The following must be answered before Nexus begins any build work:

1. **Legal structure decision:** Does Borne operate as the SMS sender (full TCPA liability, higher control) or as the platform/tool provider (client bears TCPA liability, Borne is downstream)? This changes contract language, consent flows, and risk profile.

2. **Consent flow design:** Where does the home-service client capture SMS consent from their customer? At the quote request? At booking? Borne needs to specify the integration point for consent data to enter the system.

3. **Existing AI Receptionist data:** Can QuoteHook read quote/lead data from the AI Receptionist system today, or does it need a new data entry mechanism? What's the lead ingestion path?

4. **Twilio account setup:** Is there one Twilio account shared across products, or does QuoteHook need its own subaccount for tracking?

5. **Priority target:** Which 5 existing AI Receptionist clients should Chase approach first for the pilot? (Look for clients with active quote volume and existing SMS consent on file.)

6. **Dashboard scope for MVP:** Is a live dashboard required at launch, or can Chase manually report pilot results to the client via screenshot for the first 2–3 weeks?

7. **Contract/agreement:** Is there an existing AI Receptionist services agreement that can be amended to include QuoteHook as an add-on, or does a new agreement need to be drafted? (Relates to TCPA liability language.)

---

## WHAT ATLAS CAN ASSIGN TO NEXUS (Post-Geele Approval)

Once Geele clears the open questions:

**Nexus owns:**
1. Supabase schema (follow-up states, contacts, activity log)
2. State machine cron/scheduler logic
3. Twilio outbound SMS wiring
4. Resend email wiring
5. Consent validation gate (block SMS if no consent flag)
6. Minimal dashboard

**Chase owns:**
1. Pilot client identification and outreach
2. Onboarding checklist for pilot (consent verification, contact upload)
3. Launch pitch and talk track for existing clients
4. First pilot → paid conversion

---

*This plan is ready to execute the moment Geele approves. Priority recommendation: get Nexus building the state machine immediately while Chase starts identifying pilot clients in parallel.*
