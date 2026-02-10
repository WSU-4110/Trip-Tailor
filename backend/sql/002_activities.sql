-- sql/002_activities.sql
-- Activities (things to do; can reference a place)

SET search_path TO triptailor;

CREATE TABLE IF NOT EXISTS activities (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  place_id             UUID REFERENCES places(id) ON DELETE SET NULL,

  title               TEXT NOT NULL,
  description         TEXT,

  -- classification
  activity_type       TEXT NOT NULL DEFAULT 'activity',  -- activity | event
  category            TEXT,                               -- museum, food, outdoors, etc.
  tags                TEXT[],                             -- quick filter labels

  -- user-fit metadata
  estimated_cost_cents INTEGER CHECK (estimated_cost_cents >= 0),
  duration_minutes     INTEGER CHECK (duration_minutes > 0),

  -- accessibility + effort
  effort_level         SMALLINT CHECK (effort_level BETWEEN 1 AND 5), -- 1=low, 5=high
  accessibility_notes  TEXT,
  wheelchair_accessible BOOLEAN,
  family_friendly       BOOLEAN,

  -- links
  source               TEXT,   -- yelp/google/tripadvisor/manual
  source_url           TEXT,

  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);
