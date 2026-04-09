DROP POLICY IF EXISTS "Allow all reads" ON activity_log;
CREATE POLICY "Allow all reads" ON activity_log FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all inserts" ON activity_log;
CREATE POLICY "Allow all inserts" ON activity_log FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all reads" ON content_bank;
CREATE POLICY "Allow all reads" ON content_bank FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all inserts" ON content_bank;
CREATE POLICY "Allow all inserts" ON content_bank FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all reads" ON email_events;
CREATE POLICY "Allow all reads" ON email_events FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all inserts" ON email_events;
CREATE POLICY "Allow all inserts" ON email_events FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all reads" ON security_log;
CREATE POLICY "Allow all reads" ON security_log FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all inserts" ON security_log;
CREATE POLICY "Allow all inserts" ON security_log FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all reads" ON security_risks;
CREATE POLICY "Allow all reads" ON security_risks FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all inserts" ON security_risks;
CREATE POLICY "Allow all inserts" ON security_risks FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all reads" ON tickets;
CREATE POLICY "Allow all reads" ON tickets FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all inserts" ON tickets;
CREATE POLICY "Allow all inserts" ON tickets FOR INSERT WITH CHECK (true);

-- Events table for inter-agent event communication
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ts TIMESTAMPTZ DEFAULT NOW(),
  source TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'processed', 'failed', 'skipped')),
  processed_by TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS events_status_ts ON events (status, ts ASC);
CREATE INDEX IF NOT EXISTS events_event_type ON events (event_type);
CREATE INDEX IF NOT EXISTS events_source ON events (source);
