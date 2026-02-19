-- 005_provider_ids.sql
-- Enforce provider identifier uniqueness for external API ingestion (Google/Yelp)

BEGIN;

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

-- auth schema table
SET search_path TO auth, public;

CREATE TABLE IF NOT EXISTS auth.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
