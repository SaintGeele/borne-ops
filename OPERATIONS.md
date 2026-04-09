# Borne Systems — Operations Reference

## Org Chart

```
Geele Evans (Founder)
│
├── Operations
│   ├── Atlas — execution coordinator, task orchestration
│   ├── Relay — workflow trigger engine, handoff manager
│   └── Pulse — daily briefing, schedule guardian
│
├── Revenue
│   ├── Chase — outbound lead outreach, demo booking
│   ├── Closer — proposal, negotiation, closing
│   ├── Lead Gen — ICP prospecting, trigger detection
│   ├── Pipeline Analyst — forecast, velocity, risk
│   └── Sales Engineer — demos, battlecards, technical positioning
│
├── Marketing & Content
│   ├── Mercury — strategy, campaigns, launches
│   ├── MrX — messaging, outreach copy, brand voice
│   └── Nova — social publishing, content distribution
│
├── Client Success
│   ├── Care — tickets, FAQ, onboarding
│   └── Forge — client delivery, implementation
│
├── Visibility & Growth
│   ├── Beacon — SEO, citations, local search
│   ├── News Curator — competitive intel
│   └── AI AEO/GEO — brand in AI search results
│
├── Security & Infrastructure
│   ├── Knox — CVE monitoring, hardening
│   ├── Ghost Protocol — data boundary enforcement
│   ├── Self-Healing Server — auto-remediation
│   └── Governance — automation audit, approval
│
├── Research
│   ├── Ivy — market research, competitive intel
│   └── Insight — lead enrichment, prospect data
│
├── QA & Finance
│   ├── Inspector — product quality, pre-launch checks
│   └── Ledger — spend tracking, burn rate, cost per lead
│
└── Documentation
    └── Chronicle — decision logs, milestone summaries, lessons learned
```

## Discord Channels (source of truth)

| Category | Channel | Purpose |
|----------|---------|---------|
| 👔 Leadership | #ceo-update | Pipeline reports, financial summaries, high-level decisions |
| 👔 Leadership | #chief-of-staff | BorneAI reports, Geele briefing, agent coordination |
| 🏗️ Engineering | #development | Nexus builds, code reviews, deployment status |
| 🏗️ Engineering | #task-orchestration | Atlas task assignments, sprint tracking |
| 🏗️ Engineering | #mission-control | Cron health, system alerts, deployment pipeline |
| 🏗️ Engineering | #code-reviews | PR reviews, technical decisions |
| 🔬 Research | #lead-research | Ivy/Insight findings, competitive intel |
| 🔬 Research | #documentation | Beacon SEO reports, Chronicle summaries, docs |
| 🛡️ Security & Ops | #vulnerability-scanning | Knox CVE alerts, Ghost Protocol violations |
| 🛡️ Security & Ops | #client-management | Care escalations, Forge delivery status |
| 📢 Content & Social | #cold-outreach | Chase/Lead Gen pipeline activity, sales motion |
| 📢 Content & Social | #content-automation | Mercury/Nova content calendar, publishing status |
| AI Operations | #agent-status | Inspector QA reports, health checks |
| AI Operations | #task-board | Active task tracking across all agents |
| AI Operations | #atlas-coordination | Atlas coordination signals, workflow triggers |
| AI Operations | #errors-and-alerts | All agent errors — immediate attention |
| 🏠 General | #welcome, #announcements, #rules | Public-facing |
| 🛡️ Borne Security | general, vuln-reports, client-updates | Security comms |
| 🤖 Borne AI | general, projects, integrations | Internal AI team comms |
| 🧪 Borne Labs | general, beta-tests, ideas | Sandbox, experimentation |
| 🎫 Client Portal | tickets, faq, carson-aesthetics | Client-facing |

## Agent → Owner Map

| Agent | Owner | Reports To |
|-------|-------|------------|
| Atlas | Geele | Geele |
| Relay | Atlas | Atlas |
| Pulse | Geele | Geele |
| Chase | Geele | Geele |
| Lead Gen | Atlas | Atlas |
| Closer | Geele | Geele |
| Pipeline Analyst | Geele | Geele |
| Sales Engineer | Atlas | Atlas |
| Mercury | Geele | Geele |
| MrX | Mercury | Mercury |
| Nova | Mercury | Mercury |
| Care | Geele | Geele |
| Forge | Atlas | Atlas |
| Beacon | Atlas | Atlas |
| News Curator | Atlas | Atlas |
| AI AEO/GEO | Atlas | Atlas |
| Knox | Geele | Geele |
| Ghost Protocol | Knox | Knox |
| Self-Healing Server | Atlas | Atlas |
| Governance | Atlas | Atlas |
| Ivy | Atlas | Atlas |
| Insight | Ivy | Ivy |
| Inspector | Geele | Geele |
| Ledger | Geele | Geele |
| Chronicle | Atlas | Atlas |

## Supabase Event System

Agents communicate via an `events` table instead of direct messaging.

### events table

```sql
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ts TIMESTAMPTZ DEFAULT NOW(),
  source TEXT NOT NULL,          -- agent that fired the event
  event_type TEXT NOT NULL,       -- what happened
  payload JSONB,                  -- event data
  status TEXT DEFAULT 'pending',  -- pending, processed, failed
  processed_by TEXT,              -- agent that handled it
  processed_at TIMESTAMPTZ
);

CREATE INDEX ON events (event_type, status);
CREATE INDEX ON events (status, ts);
```

### Event Types

| Event | Fired By | Expected Handler |
|-------|----------|-----------------|
| `lead.new` | Lead Gen | Chase starts outreach |
| `lead.hot` | Lead Gen | Closer follows up |
| `demo.booked` | Chase | Sales Engineer prepares demo |
| `content.queued` | Mercury | Nova publishes |
| `news.digested` | News Curator | Nova creates posts |
| `ticket.escalated` | Care | Forge handles |
| `cve.critical` | Knox | Atlas coordinates fix |
| `data.violation` | Ghost Protocol | Knox reviews |
| `server.unhealthy` | Self-Healing | Atlas triages |
| `automation.proposed` | any agent | Governance evaluates |
| `governance.approved` | Governance | Atlas implements |
| `governance.rejected` | Governance | Atlas discards |
| `pipeline.at_risk` | Pipeline Analyst | Closer follows up |
| `content.published` | Nova | Mercury reports |
| `client.onboarded` | Forge | Care takes over |

### Event Workflow

```
Agent detects event → writes to events table
    ↓
Relay (cron) reads pending events → triggers downstream agent
    ↓
Downstream agent processes → marks event processed
    ↓
Result written to events table or activity_log
```

## Workflow Triggers

### Lead → Close Pipeline

```
Lead Gen (prospect.js) fires `lead.new`
    → Chase (outreach.js) picks up uncontacted leads
    → Chase fires `demo.booked` when meeting set
    → Sales Engineer (battlecard.js) builds demo kit
    → Closer fires `deal.won` or `deal.lost`
    → Pipeline Analyst (report.js) updates forecast
```

### Content Pipeline

```
Mercury (brief.js) generates content plan
    → Mercury fires `content.plan.ready`
    → Nova (queue.js) queues posts
    → Nova fires `content.queued`
    → News Curator (digest.js) runs daily
    → News Curator fires `news.ready`
    → Nova creates posts for new stories
```

### Security Response

```
Knox (cve-check.js) finds critical CVE → fires `cve.critical`
    → Atlas reads `cve.critical` → triggers Self-Healing Server
    → Self-Healing Server fires `server.fixed` or `server.fix_failed`
    → Ghost Protocol (audit.js) runs on changes → fires `data.violation` or `data.clean`
```

## Daily Ops Cadence

| Time | Who Runs | Script | Channel |
|------|----------|---------|---------|
| 6:00 AM | Inspector | daily.js | #agent-status |
| 6:30 AM | Ledger | daily.js | #ceo-update |
| 7:00 AM | Pulse | daily.js | #ceo-update |
| 8:00 AM | Atlas | morning-coordination.js | #atlas-coordination |
| 9:00 AM | Chase | outreach.js | #cold-outreach |
| 9:00 AM | Lead Gen | prospect.js | #cold-outreach |
| 12:00 PM | News Curator | digest.js | #lead-research |
| 2:00 PM | Care | ticket.js | #client-management |
| 5:00 PM | Atlas | status-report.js | #atlas-coordination |
| 6:00 PM | Beacon | rank-tracker.js | #documentation |
| 8:00 PM | Nova | queue.js | #content-automation |
| 12:00 AM | Chronicle | digest.js | #documentation |

## Weekly Ops Cadence

| Day | Who | What |
|-----|-----|------|
| Monday | Pipeline Analyst | report.js → #ceo-update |
| Monday | Ivy | weekly-brief.js → #lead-research |
| Monday | Mercury | brief.js → #content-automation |
| Wednesday | Nova | engage.js → #content-automation |
| Friday | Nova | post.js → #content-automation |
| Friday | Inspector | weekly QA review → #agent-status |
| Sunday | Chronicle | weekly digest → #documentation |

## Current Git Repos

| Repo | Purpose |
|------|---------|
| borne-ops | Main agent scripts, ops layer, Supabase schema |
| borne-ai-copilot | AI Co-pilot SaaS product |
| openclaw-scripts | Individual agent scripts (published) |

## Next Actions

1. Build Supabase `events` table
2. Wire Relay to poll events table and trigger downstream agents
3. Update each agent script to fire events instead of just posting to Discord
4. Create handoff documentation for each workflow chain
5. Set up Supabase cron to run Relay every 5 minutes
