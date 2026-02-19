-- sql/001_schema
-- base schemas and extensions

CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS data;

-- put new objects in data by default for the rest of the SQL scripts
SET search_path TO data, public;

-- UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;

-- Core table: places (API-ingested canonical place)
CREATE TABLE IF NOT EXISTS data.places (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT NOT NULL,

  address_line1    TEXT,
  address_line2    TEXT,
  city             TEXT,
  region           TEXT,
  postal_code      TEXT,
  country          TEXT,

  latitude         DOUBLE PRECISION,
  longitude        DOUBLE PRECISION,

  phone            TEXT,
  website_url      TEXT,
  google_maps_url  TEXT,

  -- provider identifiers (005 will only enforce constraints)
  google_place_id  TEXT,
  yelp_business_id TEXT,

  --- questionnaire/ranking fields (safe nullable wide schema for more accurate questionnaire) ---
  category_primary TEXT,
  categories       TEXT[],
  tags             TEXT[],

  rating           NUMERIC(3,2),
  rating_count     INTEGER CHECK (rating_count >= 0),

  price_level      SMALLINT CHECK (price_level BETWEEN 0 AND 4),

  is_open_now      BOOLEAN,
  hours_text       TEXT,
  hours_json       JSONB,
  timezone         TEXT,
  utc_offset_minutes INTEGER,

  neighborhood     TEXT,

  wheelchair_accessible BOOLEAN,
  family_friendly       BOOLEAN,
  good_for_groups       BOOLEAN,
  good_for_kids         BOOLEAN,
  pet_friendly          BOOLEAN,

  indoor_outdoor   TEXT,  -- indoor|outdoor|both|unknown
  noise_level      TEXT,  -- quiet|average|loud|unknown
  activity_level   TEXT,  -- low|medium|high|unknown

  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Prevent duplicate places (same name in same city/region/country)
CREATE UNIQUE INDEX IF NOT EXISTS ux_places_identity
  ON data.places (name, city, region, country);
