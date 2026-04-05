# AI Receptionist MVP - Task Breakdown

**Project:** AI Receptionist for Borne Systems  
**Target:** Small businesses (1-50 employees)  
**Test Client:** Carson Aesthetics  
**MVP Launch:** Answer calls, collect info, schedule jobs, SMS confirmations, admin dashboard

---

## Phase 1: Research (Week 1)

| Task | Description | Owner |
|------|-------------|-------|
| 1.1 | **Voice AI Provider Comparison** - Evaluate VAPI, Retell, Bland AI on pricing, latency, voice quality, API ease, reliability | Ivy |
| 1.2 | **Competitor Analysis** - Research Smith AI, Ruby, and similar solutions: features, pricing, market position, gaps | Ivy |
| 1.3 | **Pricing Models Research** - Analyze usage-based vs per-seat vs subscription pricing in voice AI space | Ivy |
| 1.4 | **Market Validation** - Validate SMB demand, willingness to pay, common use cases for vertical (beauty/wellness) | Ivy |

**Dependencies:** None  
**Output:** Research summary with recommendation for voice AI provider

---

## Phase 2: Architecture (Week 2)

| Task | Description | Owner |
|------|-------------|-------|
| 2.1 | **System Design** - Call flow diagram: incoming call → voice AI → collect info → check calendar → confirm → SMS | Nexus |
| 2.2 | **Tech Stack Selection** - Finalize voice, backend (Node/Python?), database (PostgreSQL/Supabase?), SMS (Twilio/Resend?) | Nexus |
| 2.3 | **API Design** - REST/GraphQL endpoints for: businesses, calls, appointments, customers, webhooks | Nexus |
| 2.4 | **Data Models** - Schema for: businesses, calls, appointments, customers, call_transcripts | Nexus |

**Dependencies:** 1.1, 1.2  
**Output:** Architecture doc, API spec, data models

---

## Phase 3: Security Review (Week 2-3)

| Task | Description | Owner |
|------|-------------|-------|
| 3.1 | **API Security** - Auth (JWT/API keys), rate limiting, input validation, HTTPS everywhere | Knox |
| 3.2 | **Data Protection** - PII handling (caller info), encryption at rest/transit, data retention policy | Knox |
| 3.3 | **Voice AI Security** - Call recording storage, transcript access, webhook signing | Knox |
| 3.4 | **Compliance Assessment** - HIPAA applicability (medical clients), TCPA (SMS), audit logging | Knox |

**Dependencies:** 2.3, 2.4  
**Output:** Security posture document, compliance notes

---

## Phase 4: MVP Build (Week 3-5)

| Task | Description | Owner |
|------|-------------|-------|
| 4.1 | **Voice AI Integration** - Connect to chosen provider, configure greeting, transfer logic | Nexus |
| 4.2 | **Backend Services** - Core API, business config, call handling, appointment engine | Nexus |
| 4.3 | **Database Setup** - Supabase/PostgreSQL with schema, migrations | Nexus |
| 4.4 | **SMS Integration** - Appointment confirmations, reminders via Resend/Twilio | Nexus |
| 4.5 | **Admin Dashboard** - Business config, call logs, appointment view, customer list | Nexus |
| 4.6 | **Calendar Integration** - Google Calendar/Cal.com for availability | Nexus |

**Dependencies:** 2.x, 3.x  
**Output:** Working MVP with test client (Carson Aesthetics)

---

## Phase 5: Documentation (Week 5-6)

| Task | Description | Owner |
|------|-------------|-------|
| 5.1 | **Architecture Diagrams** - System overview, data flow, component diagram | Chronicle |
| 5.2 | **API Documentation** - OpenAPI spec, endpoint reference, auth guide | Chronicle |
| 5.3 | **Admin Dashboard Guide** - How to configure business, view calls, manage appointments | Chronicle |
| 5.4 | **Deployment Guide** - Infrastructure setup, environment variables, CI/CD | Chronicle |

**Dependencies:** 4.x  
**Output:** Complete documentation package

---

## MVP Scope (v1.0)

**Must Have:**
- [ ] Voice AI answering inbound calls
- [ ] Collect caller name, phone, reason for call
- [ ] Check availability and book appointments
- [ ] SMS confirmation to customer
- [ ] Admin dashboard for business owner
- [ ] Call logging and transcripts

**Nice to Have (Post-MVP):**
- Outbound calling, voicemail detection, multi-language, CRM sync, Zapier integration

---

## Timeline Summary

| Week | Focus |
|------|-------|
| 1 | Research: Voice AI providers, competitors, market |
| 2 | Architecture: System design, tech stack, API, data models |
| 2-3 | Security: API, data protection, compliance review |
| 3-5 | Build: Voice AI, backend, SMS, dashboard, calendar |
| 5-6 | Docs: Architecture, API, admin guide, deployment |

**Estimated:** 6 weeks to MVP  
**Parallelization:** Research can start immediately; Security runs concurrent with Architecture/Build

---

## Key Decisions Needed

1. **Voice AI Provider** - Recommendation from research phase
2. **Tech Stack** - Backend language, database, SMS provider
3. **Calendar Solution** - Cal.com (open) vs Google Calendar API
4. **Pricing Strategy** - Per-business subscription vs usage-based
