-- sql/003_external_ids.sql
-- Maps external API identifiers to canonical places / activities

SET search_path TO triptailor;

-- External IDs for places
CREATE TABLE IF NOT EXISTS place_external_ids (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  place_id      UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,

  source        TEXT NOT NULL,        -- google, yelp, ticketmaster, etc.
  external_id   TEXT NOT NULL,        -- API-specific ID
  source_url    TEXT,

  raw_payload   JSONB,                -- full API response (optional but powerful)
  fetched_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (source, external_id)
);

-- External IDs for activities / events
CREATE TABLE IF NOT EXISTS activity_external_ids (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  activity_id   UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,

  source        TEXT NOT NULL,
  external_id   TEXT NOT NULL,
  source_url    TEXT,

  raw_payload   JSONB,
  fetched_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (source, external_id)
);
