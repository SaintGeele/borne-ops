# SKILL.md - Dental AI Receptionist Builder

## Description

Build a production-ready AI voice receptionist that answers calls for dental practices 24/7. Complete tech stack, conversation flows, and outreach templates.

## Prerequisites

- Vapi account (https://vapi.ai)
- Twilio account with A2P 10DLC registration
- OpenAI API key (or compatible LLM)
- Notion or Airtable for lead/data capture

## Setup

1. Create Vapi account and get API key
2. Set up Twilio and register for A2P 10DLC
3. Create assistant in Vapi with the conversation flow below
4. Configure Twilio to route to Vapi
5. Test with test calls
6. Deploy for client

## Commands

- "Set up dental AI receptionist"
- "Create dental call flow"
- "Build dental outreach campaign"
- "Calculate dental ROI"
- "Write dental proposal"

## Conversation Flow Template

### Opening
"Thanks for calling [Practice Name]. This is [AI Name], the virtual receptionist. How can I help you today?"

### Intent Detection
- New patient inquiry
- Existing patient appointment
- Existing patient question
- Insurance question
- Emergency
- Other

### New Patient Flow
1. Collect: Name, Phone, Email
2. Collect: Reason for visit
3. Collect: Insurance provider
4. Collect: Preferred appointment time
5. Summarize and confirm

### Emergency Keywords
- Toothache
- Pain
- Bleeding
- Broken
- Emergency
- Urgent

When emergency detected: transfer to on-call dentist immediately

### After Hours
"We're currently closed. For emergencies, please call [emergency number]. Otherwise, leave a message and we'll return your call tomorrow morning."

## Tech Stack Configuration

### Vapi Settings
- Model: GPT-4o-mini (cost optimization) or GPT-4o
- Voice: alloy, echo, or nova
- End-of-speech-timeout: 500ms
- Attention-keywords: [dentist, doctor, emergency, pain, crown, filling]

### Twilio Configuration
- Buy phone number in area code matching client
- Enable A2P 10DLC
- Configure voice URL to Vapi webhook

### Cost Estimation (per client)
| Item | Cost |
|------|------|
| Vapi voice | $0.40/min |
| Twilio number | $1.00/mo |
| AI (GPT-4o-mini) | ~$0.003/call |
| **Total COGS** | **$65-125/mo** |

## Outreach Templates

### Cold Email - Email 1
Subject: Stop missing calls? 

Hi [Name],

I noticed [Practice Name] is missing calls during busy hours. Most dental offices we work with miss 15-30 calls monthly — each one potentially $500-$1,500 in lost revenue.

We built an AI receptionist that:
- Answers 24/7 (including after hours)
- Books appointments directly
- Handles insurance questions
- Routes emergencies to your on-call dentist

Would you be open to a 10-minute call to see if it makes sense for your practice?

Geele Evans
Borne Systems

## Pricing

| Tier | Features | Price |
|------|----------|-------|
| Basic | 24/7 answering, voicemail capture | $297/mo |
| Standard | + appointment booking | $397/mo |
| Premium | + insurance verification | $497/mo |

Setup Fee: $497 one-time

## ROI Example
- 20 missed calls/month × $750 avg = $15,000 lost revenue
- Our service: $297/mo = 50x ROI