-- Email Events and Pulse Alerts tables
-- Run this in Supabase SQL Editor

CREATE TABLE email_events (
 id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 ts TIMESTAMPTZ NOT NULL,
 event_type TEXT NOT NULL,
 email_id TEXT,
 recipient TEXT,
 subject TEXT,
 template TEXT,
 lead_id TEXT,
 campaign TEXT
);

CREATE TABLE pulse_alerts (
 id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 ts TIMESTAMPTZ NOT NULL,
 source TEXT,
 event TEXT,
 recipient TEXT,
 lead_id TEXT,
 action_required BOOLEAN DEFAULT false,
 resolved BOOLEAN DEFAULT false,
 notes TEXT
);

CREATE INDEX idx_email_events_type ON email_events(event_type);
CREATE INDEX idx_email_events_lead ON email_events(lead_id);
CREATE INDEX idx_email_events_ts ON email_events(ts);
CREATE INDEX idx_pulse_alerts_resolved ON pulse_alerts(resolved);
