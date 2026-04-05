# Audit Questionnaire Spec — AI Discovery Audit
**Purpose:** Structured web form for $497 self-service audit intake
**Based on:** Blueprint stakeholder + employee interview templates

---

## Form Overview

**Name:** AI Opportunity Intake Form
**Estimated completion time:** 8–10 minutes
**Fields:** ~25 questions across 5 sections
**Output:** Structured data for audit team + qualification signal for sales

---

## SECTION 1: About Your Business

**Purpose:** Basic context. Size, industry, location. Sets the audit scope and pricing tier.

### Fields:

**Q1.1 — Company / Practice Name**
- Type: Short text
- Required: Yes
- Validation: None

**Q1.2 — Your Role**
- Type: Single select dropdown
- Options:
  - Owner / Founder
  - Practice Manager / Office Manager
  - Operations Manager
  - Marketing Manager
  - Other (specify)
- Required: Yes

**Q1.3 — Industry**
- Type: Single select dropdown
- Options:
  - Dental Practice
  - HVAC / Heating & Cooling
  - Plumbing
  - Electrical
  - General Contracting
  - Home Services (Other)
  - Medical / Healthcare
  - Legal
  - Real Estate
  - Other (specify)
- Required: Yes

**Q1.4 — Number of Employees**
- Type: Single select dropdown
- Options:
  - 1–5
  - 6–10
  - 11–25
  - 26–50
  - 51+
- Required: Yes
- Note: Maps to audit pricing tier

**Q1.5 — Location (City, State)**
- Type: Short text (city + state)
- Required: Yes
- Validation: Basic text only
- Note: Used for local SEO alignment and regional norms

**Q1.6 — How did you hear about us?**
- Type: Single select dropdown
- Options:
  - Google / Search
  - LinkedIn
  - Referral
  - Email
  - Podcast / Blog
  - Other (specify)
- Required: Yes
- Note: Attribution tracking

---

## SECTION 2: Current AI & Technology Stack

**Purpose:** Map what they already have. Identify gaps, redundancies, and drift risk.

### Fields:

**Q2.1 — Do you currently use any AI-powered tools in your business?**
- Type: Yes/No radio
- Required: Yes
- Branch: If No, skip to Q2.4

**Q2.2 — Which AI tools are you currently using? (Select all that apply)**
- Type: Multi-select checkboxes
- Options:
  - AI Receptionist / Voice AI (call handling)
  - Lead Automation / Chatbot
  - Quote / Proposal Automation
  - Email Automation
  - SMS Automation
  - Scheduling / Calendar AI
  - CRM with AI features
  - Other (specify)
- Required: If answering Q2.1

**Q2.3 — How long have you been using your current AI tools?**
- Type: Single select
- Options:
  - Less than 6 months
  - 6–12 months
  - 1–2 years
  - More than 2 years
  - Not sure
- Required: If answering Q2.1
- Note: Longer usage = higher drift probability

**Q2.4 — Who manages / configured your current AI tools?**
- Type: Single select
- Options:
  - Internal team
  - Outside vendor / consultant
  - We set it up once and haven't touched it
  - Not applicable / no AI
  - Not sure
- Required: Yes

**Q2.5 — Have you had any performance issues with your current AI in the last 3 months?**
- Type: Multi-select (select all that apply)
- Options:
  - More missed calls than before
  - AI giving outdated or incorrect information
  - Slow response times
  - Leads not being captured properly
  - Customers complaining about automated responses
  - I haven't noticed any issues
  - Not applicable / no AI
- Required: Yes

**Q2.6 — Do you track your AI's performance metrics (call handling rate, response time, lead capture rate)?**
- Type: Single select
- Options:
  - Yes, monthly
  - Occasionally
  - No — I don't have visibility into this
  - Not applicable
- Required: Yes
- Note: If no visibility = likely drift happening

---

## SECTION 3: Customer Acquisition & Lead Flow

**Purpose:** Map where leads come in, where they go, and where they leak. This is the core audit territory.

### Fields:

**Q3.1 — How do new leads / customers primarily find you? (Select all that apply)**
- Type: Multi-select
- Options:
  - Google Ads / Search
  - Organic Google / SEO
  - Referrals (word of mouth)
  - Facebook / Instagram
  - Yelp / Google Business Profile
  - Website form
  - Phone calls (cold / walk-in)
  - Other (specify)
- Required: Yes

**Q3.2 — When a new lead comes in, what happens next? (Brief description)**
- Type: Long text (textarea)
- Placeholder: "e.g., They call and our front desk handles it / They fill out a form and we email them within an hour / ..."
- Required: Yes
- Character minimum: 30 characters
- Note: Open-ended — lets them describe their actual flow

**Q3.3 — Where do you feel you're losing the most leads right now? (Select your top pain point)**
- Type: Single select
- Options:
  - Phone calls that go unanswered or missed
  - Inquiries that don't get followed up on fast enough
  - Forms / website leads that never convert
  - Quote requests that don't turn into sales
  - Customers who don't come back for repeat visits
  - Other (specify)
- Required: Yes
- Note: This is the primary audit target

**Q3.4 — On average, how quickly do you respond to a new lead?**
- Type: Single select
- Options:
  - Within 5 minutes
  - Within 1 hour
  - Within 24 hours
  - A few days
  - We don't have a consistent process
- Required: Yes
- Note: Speed is a strong predictor of conversion impact

**Q3.5 — Do you have a system for following up with cold / inactive leads?**
- Type: Yes/No + description
- If Yes: "Briefly describe your follow-up process"
- If No: "No follow-up system"
- Required: Yes

---

## SECTION 4: Business Goals & Investment Readiness

**Purpose:** Qualification. Understand what they want to achieve and whether they're ready to invest.

### Fields:

**Q4.1 — What is the #1 business goal you're trying to achieve right now?**
- Type: Long text (textarea)
- Placeholder: "e.g., Fill my appointment calendar / Close more jobs / Reduce no-shows / ..."
- Required: Yes
- Character minimum: 20

**Q4.2 — What would it mean for you if we found $10,000/year in recoverable revenue through better AI?**
- Type: Long text (textarea)
- Placeholder: "e.g., I'd actually consider it seriously / I'd want to see the math first / ..."
- Required: Yes
- Note: Opens the value conversation

**Q4.3 — How frustrated are you with your current lead/customer handling process? (1–10)**
- Type: Slider or number input (1–10)
- Required: Yes
- Note: **Primary qualifying question.** Below 6 = nurture track. 7+ = audit candidate.

**Q4.4 — Are you the decision-maker for investing in solutions like this?**
- Type: Single select
- Options:
  - Yes — I decide
  - I decide with input from others
  - Someone else decides
  - Not sure
- Required: Yes
- Note: Decision authority affects sales cycle

**Q4.5 — When are you looking to make a decision on this?**
- Type: Single select
- Options:
  - Immediately (within 30 days)
  - 1–3 months
  - 3–6 months
  - Just exploring right now
- Required: Yes
- Note: Timeline qualification

**Q4.6 — What would make you confident that an AI solution is worth the investment?**
- Type: Long text (textarea)
- Placeholder: "e.g., Seeing a clear ROI breakdown / Talking to a reference client / A free pilot / ..."
- Required: Yes
- Note: Tailors the proposal to their buying style

---

## SECTION 5: Schedule Your Audit

**Purpose:** Convert to discovery call booking.

### Fields:

**Q5.1 — Your Name**
- Type: Short text
- Required: Yes

**Q5.2 — Email**
- Type: Email input
- Required: Yes
- Validation: Standard email format

**Q5.3 — Phone**
- Type: Phone input
- Required: Yes
- Validation: US phone format
- Note: For scheduling the debrief call

**Q5.4 — Preferred times for a 30-minute audit debrief call?**
- Type: Multi-select checkboxes
- Options:
  - Monday morning
  - Monday afternoon
  - Tuesday morning
  - Tuesday afternoon
  - Wednesday morning
  - Wednesday afternoon
  - Thursday morning
  - Thursday afternoon
  - Friday morning
  - Friday afternoon
- Required: Yes

**Q5.5 — Anything else we should know before your audit?**
- Type: Long text (optional)
- Placeholder: "Context, specific challenges, questions for us, etc."
- Required: No

---

## Form Output Notes

**Scoring logic:**
- Q4.3 (frustration score) is primary qualifier
- Q2.5 (recent issues) + Q2.6 (no visibility) = drift risk score
- Q3.4 (slow response) + Q3.5 (no follow-up) = automation gap score
- Q4.4 (decision authority) + Q4.5 (timeline) = sales readiness

**Lead routing:**
- Frustration 7+ → Priority pipeline, Chase follows up within 24 hours
- Frustration 4–6 → Nurture track, send lead magnet + follow-up sequence
- Frustration 1–3 → Educational content, check in quarterly

**Integration:**
- Push completed forms to Supabase or Google Sheets
- Auto-notify Chase via Discord/Telegram when a high-score form comes in
- CRM entry created automatically with all field data
