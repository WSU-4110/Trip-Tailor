-- TripTailor: initial schema

CREATE SCHEMA IF NOT EXISTS triptailor AUTHORIZATION andersoncolburn;

-- put new objects in triptailor by default
SET search_path TO triptailor;

-- UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Simple first table
CREATE TABLE IF NOT EXISTS places (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  city            TEXT,
  region          TEXT,
  country         TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Prevent duplicate places (same name in same city/region/country)
CREATE UNIQUE INDEX IF NOT EXISTS ux_places_identity
ON places (name, city, region, country);

-- Prevent duplicate activities (same title at same place)
CREATE UNIQUE INDEX IF NOT EXISTS ux_activities_identity
ON activities (place_id, title);

