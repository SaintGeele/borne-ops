-- Knox Enhanced CVE Monitor - Supabase Schema
-- Run this in Supabase Dashboard > SQL Editor

-- Add missing columns to cve_alerts
ALTER TABLE cve_alerts ADD COLUMN IF NOT EXISTS epss_score NUMERIC DEFAULT 0;
ALTER TABLE cve_alerts ADD COLUMN IF NOT EXISTS is_kev BOOLEAN DEFAULT FALSE;
ALTER TABLE cve_alerts ADD COLUMN IF NOT EXISTS sla_hours INTEGER;
ALTER TABLE cve_alerts ADD COLUMN IF NOT EXISTS sla_deadline TIMESTAMPTZ;
ALTER TABLE cve_alerts ADD COLUMN IF NOT EXISTS patch_command TEXT;
ALTER TABLE cve_alerts ADD COLUMN IF NOT EXISTS restart_required BOOLEAN DEFAULT FALSE;

-- Create weekly_digests table
CREATE TABLE IF NOT EXISTS weekly_digests (
  week_of DATE PRIMARY KEY,
  total_cves INTEGER DEFAULT 0,
  relevant_cves INTEGER DEFAULT 0,
  critical_count INTEGER DEFAULT 0,
  high_count INTEGER DEFAULT 0,
  emergency_count INTEGER DEFAULT 0,
  kev_count INTEGER DEFAULT 0,
  top_threats JSONB DEFAULT '[]',
  patched JSONB DEFAULT '[]',
  pending_action JSONB DEFAULT '[]',
  report_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE weekly_digests ENABLE ROW LEVEL SECURITY;

-- Create policy (service role has full access)
CREATE POLICY "Service role full access" ON weekly_digests
  FOR ALL USING (true) WITH CHECK (true);
