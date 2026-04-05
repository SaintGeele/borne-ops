-- Content Bank
CREATE TABLE content_bank (
 id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 ts TIMESTAMPTZ DEFAULT now(),
 title TEXT NOT NULL,
 type TEXT NOT NULL CHECK (type IN ('tweet','email','landing_page','cta','hook','blog','ad_copy')),
 product TEXT NOT NULL CHECK (product IN ('AI Receptionist','SecretScout','Borne Systems','Other')),
 campaign TEXT,
 platform TEXT[],
 copy TEXT NOT NULL,
 status TEXT DEFAULT 'draft' CHECK (status IN ('draft','review','approved','published','archived')),
 confidence NUMERIC(3,2),
 version INTEGER DEFAULT 1,
 author TEXT DEFAULT 'MrX',
 reviewed_by TEXT,
 notion_page_id TEXT,
 notes TEXT
);

-- Campaigns
CREATE TABLE campaigns (
 id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 ts TIMESTAMPTZ DEFAULT now(),
 name TEXT NOT NULL,
 product TEXT NOT NULL,
 goal TEXT NOT NULL,
 status TEXT DEFAULT 'planning' CHECK (status IN ('planning','active','paused','complete')),
 owner TEXT DEFAULT 'Mercury',
 start_date DATE,
 end_date DATE,
 notes TEXT
);

-- Products
CREATE TABLE products (
 id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 name TEXT NOT NULL,
 division TEXT NOT NULL,
 price TEXT,
 status TEXT DEFAULT 'active',
 description TEXT,
 pain_points TEXT,
 target TEXT
);

-- Content Performance
CREATE TABLE content_performance (
 id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 ts TIMESTAMPTZ DEFAULT now(),
 content_id UUID REFERENCES content_bank(id),
 platform TEXT,
 published_at TIMESTAMPTZ,
 impressions INTEGER DEFAULT 0,
 engagements INTEGER DEFAULT 0,
 clicks INTEGER DEFAULT 0,
 opens INTEGER DEFAULT 0,
 logged_by TEXT
);

-- Content lifecycle log
CREATE TABLE content_log (
 id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 ts TIMESTAMPTZ DEFAULT now(),
 content_id UUID REFERENCES content_bank(id),
 agent TEXT,
 action TEXT CHECK (action IN ('created','revised','approved','published','archived')),
 version INTEGER,
 notes TEXT
);

-- Indexes
CREATE INDEX idx_content_bank_status ON content_bank(status);
CREATE INDEX idx_content_bank_type ON content_bank(type);
CREATE INDEX idx_content_bank_product ON content_bank(product);
CREATE INDEX idx_content_bank_campaign ON content_bank(campaign);
CREATE INDEX idx_content_performance_content ON content_performance(content_id);
