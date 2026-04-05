# Dental Vertical Package — AI Configuration Guide
**Product:** Dental AI Package
**Implementation price:** $3,000 one-time
**Maintenance price:** $597/month
**Target:** Dental practices (1-50 employees) in CT, NY, NJ, MA

---

## Overview

Dental practices have a specific, predictable workflow. They deal with:
- Appointment scheduling and confirmation
- Insurance verification
- New patient intake
- Recall reminders (the #1 revenue leak in dentistry)
- Treatment plan follow-up
- Emergency inquiries
- After-hours call handling

Most AI vendors sell them a generic voice AI. We sell them a *pre-configured dental AI system* that understands the language, the workflows, and the patient experience.

**Differentiation:** We're not selling AI. We're selling a dental practice operations upgrade with AI as the delivery mechanism.

---

## AI Receptionist — Pre-Configured for Dental

### System Prompt / Voice Configuration

**Name:** [Practice Name] Virtual Receptionist

**Greeting:**
"Hi, you've reached [Practice Name]. This is [AI name], your virtual reception assistant. I'm here to help you schedule an appointment, verify your insurance, or answer common questions. How can I assist you today?"

### Skill 1: Appointment Scheduling
**Trigger phrases:** "I need to schedule an appointment," "I want to book," "Do you have any openings," "I'd like to make an appointment"

**AI handles:**
- Ask for patient name and reason for visit
- Confirm if they're a new or existing patient
- Check available slots (integration with practice management system — Dentrix, Eaglesoft, Open Dental, etc.)
- Confirm appointment date/time
- Send SMS confirmation (or email if preferred)
- Add to practice management system
- If no slots available: offer waitlist, suggest alternative times, or transfer to front desk

**Key language:**
- "Great, I have [date] at [time] available with Dr. [name] — does that work for you?"
- "Perfect. I've confirmed your appointment for [date] at [time]. You'll receive a text confirmation shortly."
- "It looks like the schedule is tight that day. Would you like me to put you on a waitlist in case a slot opens up?"

**Escalation triggers:**
- Patient requests a specific doctor (not the available one)
- Patient has a complex medical history to discuss
- Patient is in pain / emergency situation → TRANSFER TO FRONT DESK IMMEDIATELY
- Patient asks about pricing / insurance coverage beyond what's in the database → TRANSFER

---

### Skill 2: Insurance Verification
**Trigger phrases:** "I want to verify my insurance," "Can you check my coverage," "Do you take my insurance," "Is [insurance name] accepted"

**AI handles:**
- Collect: patient name, date of birth, insurance company name, member ID
- Confirm practice accepts their insurance (from database)
- Provide basic benefit check (if integrated with verification tool)
- If not integrated: "Our team will verify your benefits before your appointment and reach out if there's anything you should know"
- Schedule the appointment after verification

**Key language:**
- "Sure — can I get the name on the insurance, the insurance company name, and your member ID?"
- "Yes, we do accept [insurance name] at our practice. We'll verify your specific benefits before your appointment and let you know about any co-pays or deductibles."
- "It looks like we may not be in-network with [insurance] — let me transfer you to our front desk to discuss your options."

**Escalation triggers:**
- Patient asks about specific procedure coverage → "I'll note that you'd like to know about coverage for [procedure] — our team will review that and get back to you"
- Patient disputes coverage → TRANSFER

---

### Skill 3: New Patient Intake
**Trigger phrases:** "I'm a new patient," "I haven't been there before," "First time patient," "New patient appointment"

**AI handles:**
- Welcome the patient
- Collect: name, phone, email, reason for visit, how they heard about the practice
- Ask if they have dental insurance (and collect if yes)
- Explain what to expect at first appointment
- Schedule the new patient appointment (typically longer slot)
- Send new patient forms via SMS/email (automated)

**Key language:**
- "Welcome! We're so glad you're joining us. To get you scheduled as a new patient, I'll need just a few things."
- "As a new patient, your first visit will be about [X] minutes. We'll do a comprehensive exam and cleaning. Does that sound good?"
- "I've scheduled you for [date/time]. You'll receive a text shortly with a link to fill out your new patient forms — it takes about 5 minutes. Bring your insurance card if you have one."

**Escalation triggers:**
- Patient asks medical history questions → TRANSFER
- Patient needs ADA codes for specific procedures → TRANSFER

---

### Skill 4: Recall Reminders
**Trigger:** Automated outbound call/SMS at [configurable intervals: 6 months, annual, post-procedure]

**AI handles:**
- Friendly reminder: "[Name], this is [AI name] from [Practice Name]. Just a reminder that it's been about [6 months / a year] since your last cleaning. We'd love to see you! Press 1 to schedule, or press 2 to be added to our reminder list for later."
- If patient presses 1: schedule directly
- If patient declines: mark as "declined" for this cycle, not "lost"
- If no response: log as "no answer" for retry

**Key language:**
- "Hi [Name], it's [AI name] from [Practice Name] calling with a friendly reminder — your last cleaning was about [6 months] ago. Regular cleanings are the best way to prevent bigger problems. We'd love to see you!"

**Escalation triggers:** None — this is outbound, fully automated

---

### Skill 5: Treatment Plan Follow-Up
**Trigger:** 3 days, 7 days, 14 days after treatment plan presented (configurable)

**AI handles:**
- "Hi [Name], this is [AI name] from [Practice Name]. Following up on your recent visit — did you have any questions about the treatment plan we discussed? Press 1 to schedule, or press 2 if you're all set!"
- If patient has questions: TRANSFER
- If patient ready to schedule: book directly
- If patient declined: "No problem — we'll check back in [X months]"

**Key language:**
- "We want to make sure you're comfortable with the plan before moving forward. If you have any questions at all, our front desk is happy to help — we can transfer you right now if you'd like."

---

### Skill 6: Emergency / After-Hours Handling
**Trigger:** Any call during after-hours (configurable schedule) or keywords like "emergency," "pain," "broken," "chipped"

**AI handles:**
- "I see you'd like to reach us urgently. For dental emergencies, please call [emergency line] or proceed to [nearest urgent care / ER]. For everything else, leave a message and we'll call you back first thing in the morning."
- Collect voicemail if patient leaves one
- Log emergency calls immediately to front desk via alert

**Key language:**
- "It sounds like you're dealing with something urgent — for anything that needs immediate attention, please call [emergency number]. Otherwise, please leave a message and our team will call you back as soon as we open."

---

## Lead Automation — Pre-Built for Dental

### Web Form → Immediate Response
**Trigger:** New patient inquiry form submitted on website

**AI handles:**
- Auto-reply via SMS and/or email within 5 minutes
- "Hi [Name] — thanks for reaching out to [Practice Name]! We'll have someone from our team reach out within 2 hours to get you scheduled. In the meantime, you can book directly at [link] or call us at [number]."
- Log lead in CRM with source, timestamp, inquiry type

### Google / Yelp Review Monitoring
**Trigger:** New review posted (via Google Alerts or integration)

**AI handles:**
- If positive: auto-reply thanking the patient
- If negative: alert front desk / office manager for human response
- Log for monthly review summary

### Appointment Confirmation
**Trigger:** 24 hours before appointment

**AI handles:**
- SMS: "Hi [Name] — reminder: you have an appointment tomorrow at [time] with Dr. [name]. Reply YES to confirm, or call us to reschedule."
- If no response: second reminder 2 hours before

---

## SMS / Email Templates — Pre-Written

### Template 1: New Patient Welcome
"Welcome to [Practice Name]! 🎉 We're so glad you're here. Your first appointment is scheduled for [date] at [time] with Dr. [name]. Please arrive 10 minutes early to fill out paperwork. You can also fill out your forms ahead of time here: [link]. See you soon!"

### Template 2: Appointment Confirmation
"Hi [Name] — you're all set for [date] at [time] with Dr. [name] at [Practice Name]. Reply YES to confirm, or call us at [number] to reschedule."

### Template 3: Appointment Reminder (24 hrs)
"Reminder: You have an appointment tomorrow at [time]. We look forward to seeing you! Reply C to confirm or call us to make any changes."

### Template 4: Recall Reminder (6 months)
"Hi [Name] — it's been about 6 months since your last visit to [Practice Name]. Regular cleanings keep your smile healthy! Would you like to schedule your next appointment? Just reply with a date that works for you, or call us at [number]."

### Template 5: Treatment Plan Follow-Up
"Hi [Name] — Dr. [name] wanted me to check in after your recent visit. Do you have any questions about your treatment plan? We're happy to help — just reply here or call us at [number]."

### Template 6: After-Hours Emergency
"Hi — we've received your message and will return your call first thing in the morning. If you're experiencing a dental emergency, please call [emergency number] or go to your nearest urgent care. We'll be in touch at 8am!"

---

## Onboarding Checklist — Dental Practice

### Week 1: Setup
- [ ] Connect AI Receptionist to practice phone system
- [ ] Import practice management system integration (if applicable)
- [ ] Configure office hours and after-hours schedule
- [ ] Load accepted insurance provider list
- [ ] Configure recall intervals (6 months default, configurable per patient)
- [ ] Set up SMS sender number
- [ ] Configure emergency keywords and routing
- [ ] Test all 6 skills with internal team

### Week 2: Training + Testing
- [ ] Train front desk staff on escalation handling
- [ ] Run 10 test calls (internal) across all skills
- [ ] Run 5 test web form submissions (lead capture)
- [ ] Review AI transcripts and correct any misroutes
- [ ] Confirm Google Business Profile is accurate and monitored

### Week 3: Go-Live
- [ ] Go-live announcement to staff
- [ ] Monitor first 50 calls and review AI performance
- [ ] Correct any routing issues in real time
- [ ] Confirm recall system is scheduling correctly
- [ ] Send new patient welcome SMS test

### Week 4: Review
- [ ] 30-day check-in call with practice manager
- [ ] Review: call handling rate, missed calls, lead capture rate
- [ ] Identify quick wins for optimization
- [ ] Set up maintenance schedule (monthly review)

---

## Expected Outcomes (Per Month, Per Practice)

| Metric | Baseline (Before) | Expected (After) |
|--------|------------------|-----------------|
| Missed calls | 15–25 | < 3 |
| Lead response time | 2–4 hours | < 5 minutes |
| New patient lead capture | 60–70% | 90%+ |
| Recall scheduling rate | 20–30% | 50–60% |
| After-hours call handling | Voicemail only | 100% (with routing) |
| Appointment confirmation rate | 50–60% | 85%+ |

---

## Competitive Advantages for This Vertical

1. **Pre-built dental language** — knows insurance terms, procedure names, dental scheduling norms
2. **Recall automation** — targets the #1 revenue leak in dentistry
3. **Insurance verification** — reduces front desk workload, improves patient experience
4. **New patient intake automation** — reduces front desk time on phone
5. **After-hours coverage** — emergency routing prevents lost patients

---

## Pricing Justification (For Sales)

**Without AI maintenance (typical outcome):**
- 20 missed calls/month × $350 average patient value = $7,000/month in lost revenue
- 30% recall lapse rate = $X in unbooked hygiene revenue per year
- Front desk overwhelmed = higher staff turnover

**With Dental AI Package:**
- Missed calls reduced to < 3/month
- Recall lapse cut by 50%+
- Front desk focused on patient experience, not phones

**ROI:** Most practices see payback within 60–90 days.
