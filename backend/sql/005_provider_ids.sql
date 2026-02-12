-- 005_provider_ids.sql
-- Add provider identifiers to places for external API ingestion (Google/Yelp)

BEGIN;

ALTER TABLE data.places
  ADD COLUMN IF NOT EXISTS google_place_id TEXT,
  ADD COLUMN IF NOT EXISTS yelp_business_id TEXT;

-- Prevent duplicate provider IDs (NULLs allowed; uniqueness enforced when present)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'ux_places_google_place_id'
      AND conrelid = 'data.places'::regclass
  ) THEN
    ALTER TABLE data.places
      ADD CONSTRAINT ux_places_google_place_id UNIQUE (google_place_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'ux_places_yelp_business_id'
      AND conrelid = 'data.places'::regclass
  ) THEN
    ALTER TABLE data.places
      ADD CONSTRAINT ux_places_yelp_business_id UNIQUE (yelp_business_id);
  END IF;
END $$;

COMMIT;
