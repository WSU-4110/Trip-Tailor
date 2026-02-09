-- 004_indexes_constraints.sql
-- Minimal indexes to support common API queries.
-- Schema: triptailor

BEGIN;

-- 1) Speed up joins and place-scoped activity queries
CREATE INDEX IF NOT EXISTS idx_activities_place_id
  ON triptailor.activities (place_id);

-- 2) Common place filtering (city/region)
CREATE INDEX IF NOT EXISTS idx_places_city
  ON triptailor.places (city);

CREATE INDEX IF NOT EXISTS idx_places_region
  ON triptailor.places (region);

-- 3) Common activity filtering (type/category)
CREATE INDEX IF NOT EXISTS idx_activities_activity_type
  ON triptailor.activities (activity_type);

CREATE INDEX IF NOT EXISTS idx_activities_category
  ON triptailor.activities (category);

COMMIT;
