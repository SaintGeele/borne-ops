-- QuoteHook Supabase Schema
-- Run this in the Supabase SQL editor or via migration

-- ─────────────────────────────────────────────────────────────────────────────
-- Table: quotes
-- Tracks each quote request and its current stage in the follow-up sequence
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS quotes (
  id               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name      TEXT        NOT NULL,
  client_email     TEXT        NOT NULL,
  client_phone     TEXT,
  quote_value      NUMERIC(12,2),
  stage            TEXT        NOT NULL DEFAULT 'pending'
                            CHECK (stage IN (
                              'pending', 'day1', 'day3', 'day7', 'day14', 'closed', 'expired'
                            )),
  source           TEXT,
  touch_count      INTEGER     NOT NULL DEFAULT 0,
  next_touch_date  DATE,
  close_reason     TEXT,
  closed_at        TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE quotes IS 'Quote requests tracked through the follow-up sequence';
COMMENT ON COLUMN quotes.stage           IS 'pending→day1→day3→day7→day14→closed|expired';
COMMENT ON COLUMN quotes.next_touch_date  IS 'Date when the next automated touch should fire';
COMMENT ON COLUMN quotes.close_reason     IS 'won | stopped | expired — how the quote was closed';

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_quotes_stage           ON quotes (stage);
CREATE INDEX IF NOT EXISTS idx_quotes_next_touch_date ON quotes (next_touch_date);
CREATE INDEX IF NOT EXISTS idx_quotes_email           ON quotes (client_email);
CREATE INDEX IF NOT EXISTS idx_quotes_phone           ON quotes (client_phone);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_quotes_updated_at ON quotes;
CREATE TRIGGER trigger_quotes_updated_at
  BEFORE UPDATE ON quotes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- Table: quote_touches
-- Full audit trail of every touch sent (SMS or email)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS quote_touches (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id    UUID        NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  touch_day   INTEGER     NOT NULL CHECK (touch_day IN (1, 3, 7, 14)),
  channel     TEXT        NOT NULL CHECK (channel IN ('sms', 'email')),
  message     TEXT        NOT NULL,
  message_id  TEXT,
  sent_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE quote_touches IS 'Audit log of every SMS and email touch sent';
COMMENT ON COLUMN quote_touches.message_id  IS 'Twilio SID or Resend message ID for delivery verification';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_quote_touches_quote_id  ON quote_touches (quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_touches_sent_at  ON quote_touches (sent_at);
CREATE INDEX IF NOT EXISTS idx_quote_touches_day       ON quote_touches (touch_day, channel);

-- ─────────────────────────────────────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_touches ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (for cron scripts)
CREATE POLICY "Service role full access on quotes"
  ON quotes FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on quote_touches"
  ON quote_touches FOR ALL USING (auth.role() = 'service_role');

-- ─────────────────────────────────────────────────────────────────────────────
-- Sample data (comment out in production)
-- ─────────────────────────────────────────────────────────────────────────────

-- INSERT INTO quotes (client_name, client_email, client_phone, quote_value, source, next_touch_date)
-- VALUES
--   ('Alice Johnson', 'alice@example.com', '+15550000001', 2500.00, 'ai_receptionist', CURRENT_DATE),
--   ('Bob Smith',     'bob@example.com',   '+15550000002', 1800.00, 'ai_receptionist', CURRENT_DATE),
--   ('Carol White',   'carol@example.com', '+15550000003', 3200.00, 'ai_receptionist', CURRENT_DATE + INTERVAL '2 days');
