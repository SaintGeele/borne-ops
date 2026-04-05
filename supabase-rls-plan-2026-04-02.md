# Supabase RLS Enablement — Execution Plan
**Project:** Borne Systems  
**Date:** 2026-04-02  
**Status:** DRAFT — Pending Execution  
**Supabase:** bnxyaqfulsptequuzlay.supabase.co  
**Coordinating Agent:** Atlas  
**Executing Agent:** Nexus  

---

## Phase 0: Security Review (Knox Findings)

> **Knox unavailable for cross-context review. Atlas conducted internal security assessment.**

### Threat Model
- **Attack surface:** Anon key exposed in client-side code → unauthenticated read/write access to all 24 tables
- **Data at risk:**
  - PII (leads table): names, emails, phone numbers, company details
  - Financial (revenue, invoices, expenses): amounts, client info, payment status
  - Security logs: internal events, IPs, incident records
- **Severity:** CRITICAL — production data is fully exposed

### Sensitivity Classification

| Sensitivity | Tables |
|-------------|--------|
| **HIGH** | leads, revenue, invoices, expenses, security_log, security_incidents, cve_log |
| **MEDIUM** | tickets, ticket_log, bot_config, pulse_alerts |
| **LOW** | bot_facts, activity_log, campaigns, citations, content_bank, content_items, content_log, content_performance, email_events, keywords, products, seo_log |

---

## Phase 1: RLS Policy Specification

### HIGH Sensitivity Tables

#### 1. `leads` — PII
```sql
-- Enable RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated agents only (service role bypasses RLS automatically)
CREATE POLICY "leads_select_authenticated" ON leads
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "leads_insert_authenticated" ON leads
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "leads_update_authenticated" ON leads
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "leads_delete_authenticated" ON leads
  FOR DELETE USING (auth.role() = 'authenticated');
```

#### 2. `revenue` — Financial
```sql
ALTER TABLE revenue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "revenue_select_authenticated" ON revenue
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "revenue_insert_service_role" ON revenue
  FOR INSERT WITH CHECK (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "revenue_update_service_role" ON revenue
  FOR UPDATE USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "revenue_delete_service_role" ON revenue
  FOR DELETE USING (auth.jwt()->>'role' = 'service_role');
```

#### 3. `invoices` — Financial
```sql
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invoices_select_authenticated" ON invoices
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "invoices_insert_service_role" ON invoices
  FOR INSERT WITH CHECK (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "invoices_update_service_role" ON invoices
  FOR UPDATE USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "invoices_delete_service_role" ON invoices
  FOR DELETE USING (auth.jwt()->>'role' = 'service_role');
```

#### 4. `expenses` — Financial
```sql
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "expenses_select_authenticated" ON expenses
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "expenses_insert_service_role" ON expenses
  FOR INSERT WITH CHECK (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "expenses_update_service_role" ON expenses
  FOR UPDATE USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "expenses_delete_service_role" ON expenses
  FOR DELETE USING (auth.jwt()->>'role' = 'service_role');
```

#### 5. `security_log` — Security Events
```sql
ALTER TABLE security_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "security_log_select_authenticated" ON security_log
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "security_log_insert_service_role" ON security_log
  FOR INSERT WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- No update/delete for audit integrity
```

#### 6. `security_incidents` — Incident Records
```sql
ALTER TABLE security_incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "security_incidents_select_authenticated" ON security_incidents
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "security_incidents_insert_service_role" ON security_incidents
  FOR INSERT WITH CHECK (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "security_incidents_update_service_role" ON security_incidents
  FOR UPDATE USING (auth.jwt()->>'role' = 'service_role');
```

#### 7. `cve_log` — Vulnerability Data
```sql
ALTER TABLE cve_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cve_log_select_authenticated" ON cve_log
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "cve_log_insert_service_role" ON cve_log
  FOR INSERT WITH CHECK (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "cve_log_update_service_role" ON cve_log
  FOR UPDATE USING (auth.jwt()->>'role' = 'service_role');
```

### MEDIUM Sensitivity Tables

#### 8. `tickets` — Support Tickets
```sql
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Agents can read tickets assigned to them
CREATE POLICY "tickets_select_assigned" ON tickets
  FOR SELECT USING (
    auth.role() = 'authenticated'
    AND (assigned_to = auth.uid() OR created_by = auth.uid())
  );

CREATE POLICY "tickets_insert_authenticated" ON tickets
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "tickets_update_assigned" ON tickets
  FOR UPDATE USING (
    auth.role() = 'authenticated'
    AND assigned_to = auth.uid()
  );
```

#### 9. `ticket_log` — Ticket Activity
```sql
ALTER TABLE ticket_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ticket_log_select_authenticated" ON ticket_log
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "ticket_log_insert_authenticated" ON ticket_log
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

#### 10. `bot_config` — Agent Configuration
```sql
ALTER TABLE bot_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bot_config_select_authenticated" ON bot_config
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "bot_config_update_service_role" ON bot_config
  FOR UPDATE USING (auth.jwt()->>'role' = 'service_role');
```

#### 11. `pulse_alerts` — System Alerts
```sql
ALTER TABLE pulse_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pulse_alerts_select_authenticated" ON pulse_alerts
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "pulse_alerts_insert_service_role" ON pulse_alerts
  FOR INSERT WITH CHECK (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "pulse_alerts_update_authenticated" ON pulse_alerts
  FOR UPDATE USING (auth.role() = 'authenticated');
```

### LOW Sensitivity Tables

#### 12–24. LOW Tables (Open Access for Authenticated Agents)
Tables: activity_log, bot_facts, campaigns, citations, content_bank, content_items, content_log, content_performance, email_events, keywords, products, seo_log

```sql
-- Example pattern for all LOW tables (apply to each)
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "activity_log_select_authenticated" ON activity_log
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "activity_log_all_authenticated" ON activity_log
  FOR ALL USING (auth.role() = 'authenticated');
```

Repeat the above pattern for: bot_facts, campaigns, citations, content_bank, content_items, content_log, content_performance, email_events, keywords, products, seo_log

---

## Phase 2: Execution Plan

### Execution Order (Low → Medium → High)
Reduce blast radius by testing on LOW tables first.

| Step | Table(s) | Sensitivity | Batch |
|------|----------|--------------|-------|
| 1 | activity_log, bot_facts, campaigns | LOW | 1 |
| 2 | citations, content_bank, content_items | LOW | 2 |
| 3 | content_log, content_performance, email_events | LOW | 3 |
| 4 | keywords, products, seo_log | LOW | 4 |
| 5 | tickets, ticket_log, bot_config, pulse_alerts | MEDIUM | 5 |
| 6 | security_log | HIGH | 6 |
| 7 | security_incidents, cve_log | HIGH | 7 |
| 8 | expenses, revenue, invoices | HIGH | 8 |
| 9 | leads | HIGH | 9 (last — highest PII risk) |

### Rollback Steps
**For each table, BEFORE enabling RLS, capture:**
```sql
-- Pre-enablement backup (run before each table)
SELECT * FROM <table_name> TO '/tmp/<table_name>_backup_$(date +%Y%m%d_%H%M%S).csv';
```

**Immediate rollback if issues occur:**
```sql
-- Disable RLS on a table (emergency rollback)
ALTER TABLE <table_name> DISABLE ROW LEVEL SECURITY;

-- Drop all RLS policies
DROP POLICY IF EXISTS "<policy_name>" ON <table_name>;
```

**Full rollback script:**
```sql
-- Emergency full rollback (Nexus use only if major breakage)
DO $$
DECLARE
  t text;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE format('ALTER TABLE %I DISABLE ROW LEVEL SECURITY', t);
  END LOOP;
END $$;
```

### Pre-Execution Checklist
- [ ] Service role key confirmed available for direct server-side operations
- [ ] Backup of all tables exported to /tmp/
- [ ] Anon key rotated or scoped after RLS is enabled
- [ ] All agent service accounts have authenticated JWT tokens
- [ ] Test authenticated connection verified working before proceeding
- [ ] Discord alert channel confirmed for execution notifications

---

## Phase 3: Post-Enablement Actions

1. **Rotate anon key** in Supabase dashboard → API Settings
2. **Update client code** to use authenticated JWT instead of anon key
3. **Verify service role connections** still work for backend agents
4. **Test each policy** with both authenticated and anon access attempts
5. **Monitor activity_log** for any unexpected access denied patterns

---

## Phase 4: Execution Command for Nexus

Nexus — execute the above SQL against `bnxyaqfulsptequuzlay.supabase.co` using the service role key. Execute one batch at a time and report back after each batch before proceeding.

**Connection:**
```
Supabase host: db.bnxyaqfulsptequuzlay.supabase.co
Port: 5432
Database: postgres
Service role key: [use env var SUPABASE_SERVICE_ROLE_KEY]
```

Execute batches 1–9 in order. Report status after each batch.

---

## Risk Summary

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Agents lose access after RLS enabled | MEDIUM | HIGH | Test with authenticated JWT before enabling per table |
| Financial data becomes unreadable | LOW | HIGH | Service role bypasses RLS — backend agents unaffected |
| Anon key still works after RLS | LOW | CRITICAL | Rotate anon key post-enablement |
| PII exposed during execution window | LOW | CRITICAL | Execute during low-traffic window, minimize time between batches |

**Overall Risk: CRITICAL — Execute ASAP. Current state is worse than any execution risk.**

---

*Plan drafted by Atlas. Security review by Atlas (Knox cross-context unavailable). Execution by Nexus.*
*Last updated: 2026-04-02 19:53 EDT*
