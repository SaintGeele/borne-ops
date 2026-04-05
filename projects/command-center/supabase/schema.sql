-- Command Center Supabase Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Metrics table for time-series data
CREATE TABLE metrics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  platform VARCHAR(50) NOT NULL,
  metric_type VARCHAR(100) NOT NULL,
  value NUMERIC NOT NULL,
  metadata JSONB DEFAULT '{}',
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for metrics
CREATE INDEX idx_metrics_platform_type ON metrics(platform, metric_type);
CREATE INDEX idx_metrics_recorded_at ON metrics(recorded_at DESC);
CREATE INDEX idx_metrics_platform_recorded ON metrics(platform, recorded_at DESC);

-- Sync logs table
CREATE TABLE sync_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  platform VARCHAR(50) NOT NULL,
  status VARCHAR(20) CHECK (status IN ('success', 'error', 'running')),
  records_written INTEGER DEFAULT 0,
  error_message TEXT,
  duration_ms INTEGER,
  synced_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sync_logs_platform ON sync_logs(platform);
CREATE INDEX idx_sync_logs_synced_at ON sync_logs(synced_at DESC);

-- Helper function: Insert metric
CREATE OR REPLACE FUNCTION insert_metric(
  p_platform TEXT,
  p_metric_type TEXT,
  p_value NUMERIC,
  p_metadata JSONB DEFAULT '{}'
) RETURNS VOID AS $$
BEGIN
  INSERT INTO metrics (platform, metric_type, value, metadata)
  VALUES (p_platform, p_metric_type, p_value, p_metadata);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function: Start sync
CREATE OR REPLACE FUNCTION start_sync(p_platform TEXT) RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO sync_logs (platform, status, synced_at)
  VALUES (p_platform, 'running', NOW())
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function: Complete sync
CREATE OR REPLACE FUNCTION complete_sync(
  p_id UUID,
  p_status TEXT,
  p_records_written INTEGER DEFAULT 0,
  p_error_message TEXT DEFAULT NULL,
  p_duration_ms INTEGER DEFAULT 0
) RETURNS VOID AS $$
BEGIN
  UPDATE sync_logs
  SET status = p_status,
      records_written = p_records_written,
      error_message = p_error_message,
      duration_ms = p_duration_ms
  WHERE id = p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Row Level Security (internal only)
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Internal access only
CREATE POLICY "Internal access" ON metrics
  FOR ALL USING (true);

CREATE POLICY "Internal access" ON sync_logs
  FOR ALL USING (true);