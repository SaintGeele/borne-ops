# QuoteHook — Technical Specification

## 1. Overview

QuoteHook is an AI-powered quote follow-up agent for home service businesses. It automates SMS and email outreach on a fixed day schedule (Day 1 / 3 / 7 / 14) after a quote is issued, routing hot leads to live rep contact and removing dead leads after Day 14.

---

## 2. State Machine

### 2.1 States

| State | Description |
|-------|-------------|
| `new` | Lead created, Day 1 message pending |
| `awaiting_d3` | Day 1 sent, waiting for Day 3 |
| `awaiting_d7` | Day 3 sent, waiting for Day 7 |
| `awaiting_d14` | Day 7 sent, waiting for Day 14 |
| `hot` | Lead responded with conversion intent — escalate immediately |
| `dead` | Lead explicitly opted out, replied "no", or Day 14 exhausted |
| `converted` | Lead booked / confirmed — follow-up stops |

### 2.2 State Transition Table

| Day | Trigger | Action | Next State |
|-----|---------|--------|------------|
| 0 (intake) | Lead created | Store lead, schedule Day 1 SMS | `awaiting_d3` |
| 1 | Cron fires | Send Day 1 SMS | `awaiting_d3` |
| 3 | Cron fires | Send Day 3 SMS | `awaiting_d7` |
| 7 | Cron fires | Send Day 7 SMS + email | `awaiting_d14` |
| 14 | Cron fires | Send Day 14 final SMS + email | `dead` |
| Any | Lead replies with hot keyword | Mark `hot`, notify rep, stop sequence | `hot` |
| Any | Lead replies STOP | Opt out, mark `dead` | `dead` |
| Any | Lead replies "no thanks" / explicit decline | Mark `dead`, stop sequence | `dead` |
| Any | Rep marks lead converted | Stop all follow-up | `converted` |

### 2.3 Hot Lead Keywords

Case-insensitive match on any inbound SMS:

- `yes` / `yeah` / `yep` / `sure` / `book` / `schedule`
- `interested` / `lets do it` / `go ahead`
- `call me` / `call` / `phone`
- `available` (as in "I'm available")
- `ready` / `start` / `proceed`

If any keyword matches → state = `hot`, fire webhook to rep channel, stop further automated follow-up.

### 2.4 Dead Lead Conditions

- Lead replies `STOP` (Twilio handles opt-out natively — respect this)
- Lead replies with explicit `no`, `not interested`, `passed`, `gone with another`, `already booked`
- Day 14 sequence completed with no response
- Rep manually marks lead dead via API

---

## 3. Message Templates

### 3.1 SMS Templates

**Day 1 SMS:**
```
Hi {{first_name}}, this is {{business_name}}. Wanted to follow up on your {{service_type}} quote — happy to answer any questions. Reply here or call us at {{phone}}. — {{business_name}}
```

**Day 3 SMS:**
```
Hey {{first_name}}, just checking in on your {{service_type}} quote from {{business_name}}. Still have questions? I'm here to help — just reply! 📋
```

**Day 7 SMS:**
```
{{first_name}}, just a heads up — your {{service_type}} quote from {{business_name}} is set to expire in 7 days. Lock in your price while it's still available. Questions? Reply anytime! ⏰
```

**Day 14 SMS (final):**
```
{{first_name}}, this is your final reminder from {{business_name}} — your {{service_type}} quote expires today. Once it's gone, so is the price. Reply YES to lock it in or call {{phone}} to discuss. 💨
```

**Hot lead confirmation SMS (sent after keyword match):**
```
Thanks {{first_name}}! 🎉 A rep from {{business_name}} will reach out shortly to get you booked. Talk soon!
```

### 3.2 Email Templates

Email is sent alongside SMS on **Day 7** and **Day 14** only.

**Day 7 Email:**
- **Subject:** Your {{service_type}} quote is still valid — {{business_name}}
- **Body:** Friendly reminder, quote value, expiry warning (Day 14), CTA button linking to scheduling page or phone number.

**Day 14 Email:**
- **Subject:** ⏰ Final Notice: Your {{service_type}} quote expires today — {{business_name}}
- **Body:** Urgent final notice, expiry time, strong CTA, "Reply YES to extend" option.

### 3.3 Email vs SMS Logic

| Day | SMS | Email |
|-----|-----|-------|
| 1 | ✅ | ❌ |
| 3 | ✅ | ❌ |
| 7 | ✅ | ✅ |
| 14 | ✅ | ✅ |

Email is added on Day 7+ to reinforce urgency without relying solely on SMS character limits.

---

## 4. Twilio Integration

### 4.1 Phone Number Handling

- Accept E.164 format on intake: `+1XXXXXXXXXX`
- Normalize all incoming numbers to E.164 before storage
- Fail intake if number is invalid (not 10+ digits after country code)

### 4.2 Outbound Rate Limits

- **1 SMS/second** max on Twilio default
- **1 message per lead per day** (enforced by state machine, not just Twilio)
- Twilio's built-in ` VALIDATING_ADDRESSES` and `MESSAGES_PER_MINUTE_RATE_LIMIT` handled by SDK

### 4.3 Opt-Out Handling

- Twilio handles `STOP`, `UNSTOP` keywords automatically on their end
- QuoteHook receives the `inbound` webhook on any reply
- On any inbound message: check if number is opted-out before sending
- **Never** send to a number that has opted out

### 4.4 Inbound Webhook

Twilio POSTs to `/webhooks/twilio/inbound` on every incoming SMS.

```json
{
  "From": "+1XXXXXXXXXX",
  "Body": "yes I'm interested",
  "MessageSid": "SMxxx"
}
```

---

## 5. Resend Integration

### 5.1 Email Trigger

Email is triggered by the same cron job that fires the Day 7 or Day 14 SMS. No separate email schedule.

### 5.2 Email Fields

- **From:** `{{business_name}} <noreply@{{business_domain}}>`
- **To:** lead email address
- **Reply-To:** rep inbox (so replies come to a human)

### 5.3 Unsubscribe

- Include One-Click Unsubscribe header (`List-Unsubscribe: <mailto:...>`)
- Resend handles bounce/complaint detection
- Opt-out email addresses stored in leads table; no further emails sent to them

---

## 6. Data Model

### 6.1 Leads Table (SQLite)

```sql
CREATE TABLE leads (
  id            TEXT PRIMARY KEY,       -- UUID
  first_name    TEXT NOT NULL,
  last_name     TEXT,
  phone         TEXT NOT NULL,           -- E.164
  email         TEXT,
  quote_value   REAL,
  service_type  TEXT,                    -- HVAC, plumbing, electrical, roofing, etc.
  source        TEXT,                   -- intake_form, phone, referral, etc.
  status        TEXT DEFAULT 'new',     -- new, awaiting_d3, awaiting_d7, awaiting_d14, hot, dead, converted
  current_day   INTEGER DEFAULT 0,      -- 0=created, 1, 3, 7, 14
  next_send_at  TEXT,                    -- ISO8601 timestamp
  opted_out     INTEGER DEFAULT 0,      -- 0=false, 1=true
  rep_notified  INTEGER DEFAULT 0,      -- hot lead rep alert sent?
  created_at    TEXT DEFAULT (datetime('now')),
  updated_at    TEXT DEFAULT (datetime('now'))
);
```

### 6.2 Message Log Table

```sql
CREATE TABLE messages (
  id          TEXT PRIMARY KEY,         -- UUID
  lead_id     TEXT NOT NULL,
  channel     TEXT NOT NULL,            -- sms, email
  direction   TEXT NOT NULL,            -- outbound, inbound
  day         INTEGER,                  -- 1, 3, 7, 14, null for inbound
  content     TEXT,
  twilio_sid  TEXT,                     -- null for email
  sent_at     TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (lead_id) REFERENCES leads(id)
);
```

### 6.3 Status Enum

```
new → awaiting_d3 → awaiting_d7 → awaiting_d14 → dead
   ↓              ↓            ↓             ↓
  (hot)         (hot)        (hot)        (hot)
   ↓              ↓            ↓             ↓
  converted    converted    converted    converted
```

All intermediate states can transition to `hot` or `dead` at any time. `converted` and `dead` are terminal.

---

## 7. API / Webhook Surface

### 7.1 Internal API

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/leads` | Create a new lead |
| `GET` | `/api/leads/:id` | Get lead by ID |
| `PATCH` | `/api/leads/:id` | Update lead fields |
| `POST` | `/api/leads/:id/convert` | Mark lead as converted |
| `POST` | `/api/leads/:id/dead` | Mark lead as dead |
| `GET` | `/api/leads` | List leads (with filters: status, since) |
| `GET` | `/api/leads/:id/messages` | Get message history for lead |

### 7.2 Webhooks (Outbound)

| Event | Payload |
|-------|---------|
| `lead.hot` | `{ lead_id, first_name, phone, email, service_type, quote_value, source }` |
| `lead.converted` | `{ lead_id, first_name, phone, email, converted_at }` |
| `lead.dead` | `{ lead_id, reason, dead_at }` |

Webhook delivery: POST to configured URL with JSON body, 3 retries with exponential backoff, log success/failure.

### 7.3 Webhooks (Inbound)

| Path | Source | Description |
|------|--------|-------------|
| `POST /webhooks/twilio/inbound` | Twilio | Incoming SMS |
| `POST /webhooks/resend/inbound` | Resend | Inbound email (forward to rep) |

### 7.4 External CRM Webhook Config

```json
{
  "crm_webhook_url": "https://your-crm.com/api/hooks/quotehook",
  "events": ["lead.hot", "lead.converted", "lead.dead"]
}
```

---

## 8. MVP Tech Stack

| Component | Choice |
|-----------|--------|
| Runtime | Node.js 20+ |
| Framework | Express.js (minimal) |
| Database | SQLite via `better-sqlite3` |
| SMS | Twilio Programmable SMS (`twilio` SDK) |
| Email | Resend (`resend` SDK) |
| Scheduler | `node-cron` — cron job fires every minute, checks `next_send_at` |
| Agent framework | OpenClaw (existing) — runs the cron worker as a service |
| Config | `.env` — no hardcoded secrets |
| Deployment | Single VPS, `systemd` service, PM2 for process management |

### Directory Structure (MVP)

```
quotehook/
├── src/
│   ├── index.js          # Express entry, webhook routes
│   ├── db.js              # SQLite init, migrations
│   ├── leads.js           # Lead CRUD
│   ├── messages.js        # Message log CRUD
│   ├── smsm.js            # Twilio send/receive
│   ├── email.js           # Resend send
│   ├── scheduler.js       # Cron: fire due messages
│   ├── state.js           # State machine transitions
│   ├── keywords.js        # Hot/dead keyword matching
│   └── webhooks.js        # Outbound webhook dispatcher
├── templates/
│   ├── sms.js             # SMS template renderer
│   └── email.js           # Email template renderer
├── .env.example
├── package.json
└── SPEC.md
```

---

## 9. First Build: Day 1 System

**Build the Day 1 system first.** This is the minimum viable loop.

### What to build (in order):

1. **Database schema** — `leads` + `messages` tables, SQLite
2. **Lead intake API** — `POST /api/leads` that stores lead and sets `next_send_at = now + 1 day`, `status = awaiting_d3`
3. **Twilio outbound SMS** — `POST /api/leads` triggers Day 1 SMS immediately (not via cron, to test fast)
4. **Inbound webhook** — `POST /webhooks/twilio/inbound` that logs the message and checks keywords
5. **State transition** — if hot keyword detected, mark `hot`, fire `lead.hot` webhook
6. **Day 1 cron** — scheduler that fires every minute, queries leads where `next_send_at <= now` and `current_day = 1`, sends SMS, advances state
7. **Config/env** — all credentials via `.env`, no hardcoding

### What to skip for MVP:

- Email (add on Day 7)
- Day 3/7/14 scheduler logic (add after Day 1 loop works)
- Opt-out table (Twilio handles this natively for MVP)
- CRM webhook retries (add after basic delivery confirmed)
- Rep notification Discord/Telegram (add with `lead.hot` webhook)

### Success criteria for Day 1 build:

- `POST /api/leads` creates a lead and sends a Day 1 SMS within 2 seconds
- Incoming reply is received at `/webhooks/twilio/inbound` and logged
- Hot keyword in reply → lead status changes to `hot`
- Lead shows correct status when fetched via `GET /api/leads/:id`

---

## 10. Configuration Variables

```env
# .env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1XXXXXXXXXX

RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM="BusinessName <noreply@business.com>"
REP_EMAIL=rep@business.com

CRM_WEBHOOK_URL=https://your-crm.com/api/hooks/quotehook
CRM_WEBHOOK_EVENTS=lead.hot,lead.converted,lead.dead

BUSINESS_NAME=YourBusiness
BUSINESS_PHONE=+1XXXXXXXXXX
BUSINESS_DOMAIN=yourbusiness.com

DB_PATH=./data/quotehook.db
PORT=3001
SCHEDULER_CRON=*/1 * * * *
```
