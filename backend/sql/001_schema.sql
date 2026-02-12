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

  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),

  google_place_id  TEXT,
  yelp_business_id TEXT
);

-- Prevent duplicate places (same name in same city/region/country)
CREATE UNIQUE INDEX IF NOT EXISTS ux_places_identity
  ON data.places (name, city, region, country);
