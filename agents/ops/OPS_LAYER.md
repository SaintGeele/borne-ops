# Discord Ops Layer — Agent Reporting Standard

Every agent script in Borne Systems reports execution results to Discord after running.

## Quick Start

```javascript
import { report, reportError } from '../../ops/discord-reporter.js';

try {
  // ... agent work ...
  await report('chase', {
    title: 'Daily Outreach — Complete',
    summary: 'Sent 15 emails to hot leads.',
    details: '2 bounces, 0 replies',
    status: 'success',
    nextAction: 'Follow-up in 3 days'
  });
} catch (err) {
  await reportError('chase', err.message, 'outreach.js').catch(() => {});
  throw err;
}
```

## Status Values

| Status | When | Color |
|--------|------|-------|
| `success` | Completed normally | Green |
| `warning` | Completed with issues | Yellow |
| `error` | Script failed | Red |
| `info` | Informational | Blue |

## Channel Map

| Agent | Channel |
|-------|---------|
| borneai | #chief-of-staff |
| atlas | #atlas-coordination |
| nexus | #development |
| knox | #vulnerability-scanning |
| ivy, insight | #lead-research |
| mrx, chase, closer, leadgen | #cold-outreach |
| mercury, nova | #content-automation |
| care | #client-management |
| forge | #client-management |
| beacon, aeogeo, chronicle | #documentation |
| inspector, governance, self-healing | #agent-status |
| pulse, ledger, pipeline | #ceo-update |
| ghost-protocol | #vulnerability-scanning |
| news-curator | #lead-research |
| errors | #errors-and-alerts |

## Error Reporting

Every catch block must call `reportError()`:

```javascript
await reportError('agentname', err.message, 'script.js — what it was doing').catch(() => {});
```

## Daily Summaries

Use `reportDailySummary()` for agents running on a daily cadence (Pulse, Ledger, Inspector).

## Adding a New Agent

1. Add import: `import { report, reportError } from '../../ops/discord-reporter.js';`
2. Add channel assignment to `CHANNELS` map in `discord-reporter.js`
3. Call `report()` after every successful run
4. Call `reportError()` in every catch block
5. Test by running manually and checking Discord
