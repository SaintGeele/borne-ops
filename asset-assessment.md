# Borne Systems — Asset & Gap Assessment
**Date:** 2026-04-07
**By:** Skeptic (Borne Systems R&D)

---

## BOTTOM LINE
Borne Systems has exactly **one live paid product** (AI Receptionist, $99–$499/mo) and one paying client (Carson Aesthetics). Everything else is partially built, a stub, or not yet connected to revenue. The gap between "we have good ideas" and "we have a repeatable business" is large. The top revenue action is: **get the AI Receptionist to 3 paying clients before building anything new.**

---

## 1. CURRENT SERVICES

| Service | Status | Revenue | Gap | Priority |
|---------|--------|---------|-----|----------|
| **AI Receptionist** | ✅ Live — 1 client (Carson Aesthetics) | $99–$499/mo | No self-serve signup; onboarding is manual; no tiered pricing page | P1 |
| **Review Response AI** | 🔧 Half-built — package exists, no live client | $0 | Deployed but not connected to a paying customer; no fetch cron verified | P2 |
| **GBP Optimizer** | 🔧 Half-built — package exists, no live client | $0 | Same as Review Response AI; Notion + Supabase schemas need verification | P2 |
| **ClawMart Packages** | 🔧 Catalog exists (37 packages), no e-commerce or checkout | $0 | No actual store, no order fulfillment, no delivery pipeline | P3 |
| **QuoteHook** | 🚫 Planned, stalled | $0 | "Awaiting TCPA legal review" but no evidence review happened; $149–249/mo add-on blocked | P2 |

**Revenue readiness (services):** Only AI Receptionist can be sold today. Everything else needs client connection + verification.

---

## 2. TEAM

| Agent | Role | Status | Gap | Priority |
|-------|------|--------|-----|----------|
| **BorneAI** | Chief of Staff / Front Door | ✅ Active | None — operating correctly | — |
| **Atlas** | Execution coordinator | ⚠️ Stubs only | No SOUL.md, IDENTITY.md, or HEARTBEAT — not operational | P1 |
| **Nexus** | Engineering | ⚠️ Stubs only | No SOUL.md, IDENTITY.md, or HEARTBEAT — not operational | P1 |
| **Forge** | Website builder | ⚠️ Stubs only | No SOUL.md, IDENTITY.md, or HEARTBEAT — not operational | P1 |
| **Ivy** | Research | ⚠️ Stubs only | No SOUL.md, IDENTITY.md, or HEARTBEAT — not operational | P2 |
| **Knox** | Security | ⚠️ Stubs only | No SOUL.md, IDENTITY.md, or HEARTBEAT — not operational | P2 |
| **MrX** | Outreach / messaging | ⚠️ Stubs only | No SOUL.md, IDENTITY.md, or HEARTBEAT — not operational | P1 |
| **Mercury** | Marketing strategy | ⚠️ Partial | Has IDENTITY.md, no SOUL.md or HEARTBEAT; no active campaigns | P2 |
| **Chase** | Sales / lead pipeline | ⚠️ Partial | Has SOUL.md, no HEARTBEAT; workflow doc exists but not executing | P1 |
| **Inspector** | QA | ⚠️ Partial | Has IDENTITY.md, no SOUL.md or HEARTBEAT; not actively inspecting | P2 |
| **Beacon** | SEO / local search | ⚠️ Stubs only | No SOUL.md, IDENTITY.md, or HEARTBEAT — not operational | P2 |
| **Chronicle** | Documentation / logs | ⚠️ Stubs only | No SOUL.md, IDENTITY.md, or HEARTBEAT — not operational | P2 |
| **Ledger** | Financial ops | ⚠️ Stubs only | No SOUL.md, IDENTITY.md, or HEARTBEAT — not operational | P2 |
| **Pulse** | Reports / digest | ⚠️ Stubs only | No SOUL.md, IDENTITY.md, or HEARTBEAT — not operational | P2 |
| **Care** | Support / FAQ | ⚠️ Has workflow, workspace | No SOUL.md, IDENTITY.md, or HEARTBEAT in agents/; care-respond.js cron exists | P2 |
| **Nova / Closer / Relay** | Unclear | 🚫 Unclear | New agents with no clear role definition in org chart | P3 |

**Revenue readiness (team):** 14 of 17 named agents are stubs. Chase is the only sales-facing agent with a partial definition. Atlas/Nexus/MrX/Forge/Chase are the critical gaps to fill first.

---

## 3. REVENUE READINESS

| Revenue Stream | Sellable Today? | What Stops It | Priority |
|----------------|-----------------|---------------|----------|
| AI Receptionist (base) | ✅ Yes | Discovery call script exists but not in use; Geele doing all outreach manually | P1 |
| AI Receptionist — dental vertical | ✅ Yes | Offer doc exists; no outbound campaign targeting dentists | P1 |
| Review Response AI | 🔜 Soon | Package built but no client; needs a pilot or case study | P2 |
| GBP Optimizer | 🔜 Soon | Package built but no client; same as above | P2 |
| ClawMart packages | ❌ No | No store, no checkout, no delivery mechanism | P3 |
| QuoteHook | ❌ Blocked | TCPA review never happened; cannot launch SMS without legal clarity | P2 |
| Penetration testing | ❌ No | No offering, no portofolio, OSCP not yet achieved | P3 |

**Revenue readiness summary:** 1 active client, 1 product, ~$499/mo. The path to $1,500/mo is getting 2 more AI Receptionist clients. The path to $3,000+ requires a second product going live.

---

## 4. TECHNICAL GAPS

| Gap | Status | Risk | Priority |
|-----|--------|------|----------|
| **Billing / payments** | 🚫 Manual only | No Stripe, no subscription management; invoices done by hand | P1 |
| **Auth / access control** | ⚠️ Ad-hoc | OpenClaw handles some; Supabase anon key exposed in at least one place | P1 |
| **Client onboarding** | 🚫 Fully manual | No welcome flow, no setup checklist, no onboarding doc | P1 |
| **CRM** | ⚠️ Partial | Supabase + Notion hybrid; leads sync via scripts but no unified view | P2 |
| **Contracts / agreements** | ⚠️ One-off | One TOS exists (Carson Aesthetics); no template library | P2 |
| **Proposal generation** | 🚫 None | No formal quote/proposal template; relies on Geele writing each one | P2 |
| **Renewals tracking** | 🚫 None | No system to track renewal dates, churn signals, or expansion | P2 |
| **Lead scoring** | ⚠️ Manual | 50 leads in Notion, scored WARM/HOT/COLD by hand | P2 |
| **Monitoring / uptime** | ⚠️ Basic | Server Health Dashboard exists in ClawMart; not clearly deployed | P2 |
| **Self-serve signup** | 🚫 None | No web form → checkout → provisioning pipeline | P3 |

**Revenue impact:** Billing and onboarding are the two biggest blockers to scaling past 3 clients. Without them, Geele is doing everything manually.

---

## 5. BUSINESS GAPS

| Gap | Status | Revenue Impact | Priority |
|-----|--------|---------------|----------|
| **Pipeline management** | 🚫 Chase is a stub | Cannot reliably move leads to close without a working SDR | P1 |
| **Discovery call → close** | 🚫 Script exists but unused | No systematized demo call, no value framing, no close playbook | P1 |
| **HOT lead follow-through** | 🚫 3 HOT leads identified but not called | Apex, Carson Aesthetics (upsell), MA Home — all stalled | P1 |
| **Second product launch** | 🚫 GBP Optimizer / Review AI built but not sold | Risk: one product = one point of failure | P1 |
| **Client onboarding SOP** | 🚫 None | Every new client is a custom snowflake | P2 |
| **Proposal template** | 🚫 None | Each deal requires blank-page drafting | P2 |
| **TCPA legal review for QuoteHook** | 🚫 Never happened | $149–249/mo SMS upsell is blocked | P2 |
| **Website clarity** | ⚠️ Multiple versions | borne-systems-website-v2, v2-react, and live site at tail9c961 — unclear which is canonical | P2 |
| **Content / marketing engine** | 🚫 Mercury is a stub | No blog, no case studies, no outbound contentCadence | P2 |
| **Retention / renewals** | 🚫 None | No check-in system, no health monitoring, no renewal outreach | P2 |
| **ClawMart store** | 🚫 Catalog only | No e-commerce; packages cannot be purchased | P3 |

---

## TOP 5 ACTIONS (Ranked by Revenue Impact)

### 1. 🔴 Get 2 More AI Receptionist Clients (Revenue Impact: +$498–$998/mo)
- **What:** Close the 3 HOT leads (Apex, MA Home, Carson upsell) using the existing discovery call script
- **Why:** Goes from $499 to $997–$1,497/mo; validates the service can be sold more than once
- **Who:** Chase (needs to be built first) + Geele for first calls
- **Blocker:** No operational SDR agent; Geele doing manual outreach

### 2. 🔴 Fix Billing (Revenue Impact: Enables scaling)
- **What:** Add Stripe or LemonSqueezy for subscription management; replace manual Zelle invoices
- **Why:** Manual billing breaks at 3+ clients; no recurring revenue system = no predictable income
- **Who:** Nexus (needs to be built first) or Geele
- **Blocker:** No Stripe account, no subscription infrastructure

### 3. 🟡 Build Chase (Sales SDR) (Revenue Impact: Closes more leads)
- **What:** Give Chase a working HEARTBEAT, SOUL.md, and wire it to the outreach cron scripts
- **Why:** Chase auto-reply pipeline exists but is untested; no systematic outbound sequence running
- **Who:** Atlas → Nexus
- **Blocker:** Chase has SOUL.md but no execution environment

### 4. 🟡 Build Atlas (Execution Coordinator) (Revenue Impact: Reduces Geele overload)
- **What:** Give Atlas a working SOUL.md, IDENTITY.md, and HEARTBEAT
- **Why:** Geele is doing Atlas's job manually; nothing is being coordinated systematically
- **Who:** Geele or Nexus
- **Blocker:** Atlas is entirely stubs

### 5. 🟡 Launch Second Product with 1 Pilot Client (Revenue Impact: $99–$497/mo, diversifies revenue)
- **What:** Take GBP Optimizer or Review Response AI to one paying pilot client
- **Why:** Revenue concentration risk with only one product; one success story = marketing material
- **Who:** Chase (outreach) + Forge (deployment)
- **Blocker:** No pilot pipeline, no case study format, no outreach targeting these specific services

---

## SUMMARY TABLE

| Area | Status | Biggest Gap | Priority |
|------|--------|-------------|----------|
| AI Receptionist | ✅ Live | No self-serve, manual onboarding | P1 |
| Review Response AI | 🔧 Half-built | No live client | P2 |
| GBP Optimizer | 🔧 Half-built | No live client | P2 |
| ClawMart | 🔧 Catalog only | No store or fulfillment | P3 |
| QuoteHook | 🚫 Stalled | TCPA review never happened | P2 |
| Agent team (14 of 17) | ⚠️ Stubs | Atlas, Nexus, Forge, MrX, Chase are non-functional | P1 |
| Billing | 🚫 Manual | No Stripe or subscription system | P1 |
| Client onboarding | 🚫 None | No SOP, no welcome flow | P1 |
| CRM / pipeline | ⚠️ Partial | Supabase + Notion, manual lead scoring | P2 |
| Proposals / contracts | ⚠️ One-off | No template library | P2 |
| Marketing engine | 🚫 None | Mercury is a stub; no content cadence | P2 |
| Renewals / retention | 🚫 None | No tracking system | P2 |

---

*Assessment by Skeptic | 2026-04-07*
