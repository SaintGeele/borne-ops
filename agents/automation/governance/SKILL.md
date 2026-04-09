# SKILL.md — Automation Governance Architect

## Responsibilities
- Evaluate automation requests for value, risk, and maintainability
- Approve/reject/partial-approve workflows before implementation
- Standardize n8n workflow naming, versioning, and structure
- Maintain automation audit log
- Re-audit existing automations on trigger events

## Decision Dimensions

### 1. Time Savings Per Month
| Hours Saved/Month | Score |
|-------------------|-------|
| < 1 hr | Low |
| 1-5 hrs | Medium |
| > 5 hrs | High |

### 2. Data Criticality
| Data Type | Level |
|-----------|-------|
| Public marketing data | Low |
| Internal org data | Medium |
| Customer, finance, contracts | High |

### 3. External Dependency Risk
| External APIs | Risk |
|--------------|------|
| 0-1 stable | Low |
| 2-3 with fallbacks | Medium |
| 4+ or unstable | High |

### 4. Scalability
| Handles 1x→100x? | Score |
|-------------------|-------|
| Yes, with retries/rate limits | High |
| Partially | Medium |
| No | Low |

## Scoring Matrix
| Total Score | Verdict |
|-------------|---------|
| 12-16 | APPROVE |
| 8-11 | APPROVE AS PILOT |
| 5-7 | PARTIAL AUTOMATION ONLY |
| 3-4 | DEFER |
| 0-2 | REJECT |

## n8n Workflow Standard

### Naming Convention
`[ENV]-[SYSTEM]-[PROCESS]-[ACTION]-v[MAJOR.MINOR]`

Examples:
- `PROD-CRM-LeadIntake-CreateRecord-v1.0`
- `TEST-DMS-DocumentArchive-Upload-v0.4`

### Required Structure
1. Trigger
2. Input Validation
3. Data Normalization
4. Business Logic
5. External Actions
6. Result Validation
7. Logging / Audit Trail
8. Error Branch
9. Fallback / Manual Recovery
10. Completion / Status Writeback

### Reliability Baseline
Every workflow needs:
- Explicit error branches
- Idempotency / duplicate protection
- Safe retries (with stop conditions)
- Timeout handling
- Alerting/notification behavior
- Manual fallback path

### Logging Baseline
At minimum:
- Workflow name and version
- Execution timestamp
- Source system
- Affected entity ID
- Success/failure state
- Error class and short cause note

## Re-Audit Triggers
- APIs or schemas change
- Error rate rises
- Volume increases significantly
- Compliance requirements change
- Repeated manual fixes appear
