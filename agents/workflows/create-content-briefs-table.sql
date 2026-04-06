-- Content Briefs Table
-- Mercury briefs MrX through this table
CREATE TABLE IF NOT EXISTS content_briefs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week        TEXT NOT NULL,          -- e.g. "2026-W15"
  topic       TEXT NOT NULL,          -- what to create content about
  platforms   TEXT[] NOT NULL,        -- array: ["twitter", "linkedin", "email"]
  audience    TEXT NOT NULL,          -- who this is for
  outcome     TEXT NOT NULL,          -- what the content should achieve
  must_haves  TEXT[],                -- keywords, links, CTAs that must appear
  brand_notes TEXT,                   -- Mercury's brand guidance
  status      TEXT DEFAULT 'open',    -- open, in_progress, complete
  assigned_to  TEXT,                  -- MrX
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- MrX creates content_bank entries and links them back to the brief
ALTER TABLE content_briefs ADD COLUMN IF NOT EXISTS content_ids UUID[];

-- Comments for brief context
CREATE TABLE IF NOT EXISTS content_brief_comments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brief_id    UUID REFERENCES content_briefs(id) ON DELETE CASCADE,
  author      TEXT NOT NULL,
  comment     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
