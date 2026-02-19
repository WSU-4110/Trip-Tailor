-- 004_indexes_constraints.sql
-- Minimal indexes to support common API queries.
-- Schema: data

BEGIN;

-- 1) Speed up joins and place-scoped activity queries
CREATE INDEX IF NOT EXISTS idx_activities_place_id
  ON data.activities (place_id);

-- 2) Common place filtering (city/region)
CREATE INDEX IF NOT EXISTS idx_places_city
  ON data.places (city);

CREATE INDEX IF NOT EXISTS idx_places_region
  ON data.places (region);

-- 3) Common activity filtering (type/category)
CREATE INDEX IF NOT EXISTS idx_activities_activity_type
  ON data.activities (activity_type);

CREATE INDEX IF NOT EXISTS idx_activities_category
  ON data.activities (category);

--- array filtering based on tags/categories ---
CREATE INDEX IF NOT EXISTS idx_places_categories_gin
  ON data.places USING GIN (categories);

CREATE INDEX IF NOT EXISTS idx_places_tags_gin
  ON data.places USING GIN (tags);

CREATE INDEX IF NOT EXISTS idx_activities_tags_gin
  ON data.activities USING GIN (tags);

COMMIT;
