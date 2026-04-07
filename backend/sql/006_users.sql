-- Migration 006: Users table for authentication
-- Run this after 005_provider_ids.sql

CREATE TABLE IF NOT EXISTS triptailor.users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    email       TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT users_email_unique UNIQUE (email)
);

CREATE INDEX IF NOT EXISTS idx_users_email ON triptailor.users (email);

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION triptailor.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON triptailor.users;
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON triptailor.users
    FOR EACH ROW EXECUTE FUNCTION triptailor.set_updated_at();
