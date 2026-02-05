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
