-- Self-Healing Server: incidents table for infrastructure recovery logging
CREATE TABLE IF NOT EXISTS incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id text NOT NULL DEFAULT 'self-healing-server',
  severity text NOT NULL,  -- high, medium, low
  issue_type text NOT NULL,  -- container_exit, disk_full, zombie, ssl_expiry, container_repeated_failure
  service_name text,
  action_taken text,
  before_state jsonb,
  after_state jsonb,
  resolved_at timestamptz,
  escalated bool DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_incidents_agent_id ON incidents(agent_id);
CREATE INDEX IF NOT EXISTS idx_incidents_created_at ON incidents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON incidents(severity);
