# Installation Guide

## System Requirements

- Node.js 18+
- Python 3.11+
- PostgreSQL 14+
- Google Places API key
- Yelp Fusion API key

## 1. Clone the Repository

```bash
git clone https://github.com/WSU-4110/Trip-Tailor.git
cd Trip-Tailor
```

## 2. Database Setup

### Create the database and schemas

Connect to PostgreSQL and run the following:

```sql
CREATE DATABASE triptailor_dev;
\c triptailor_dev

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create schemas
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS data;
CREATE SCHEMA IF NOT EXISTS planner;
```

### Create tables

```sql
-- Auth: Users
CREATE TABLE auth.users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           TEXT NOT NULL UNIQUE,
    password_hash   TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Data: Places
CREATE TABLE data.places (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    address_line1   TEXT,
    address_line2   TEXT,
    city            TEXT,
    region          TEXT,
    postal_code     TEXT,
    country         TEXT,
    latitude        DOUBLE PRECISION,
    longitude       DOUBLE PRECISION,
    phone           TEXT,
    website_url     TEXT,
    google_maps_url TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    google_place_id TEXT,
    yelp_business_id TEXT
);

-- Data: Activities
CREATE TABLE data.activities (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    place_id                UUID REFERENCES data.places(id),
    title                   TEXT NOT NULL,
    description             TEXT,
    activity_type           TEXT NOT NULL DEFAULT 'activity',
    category                TEXT,
    tags                    TEXT[],
    estimated_cost_cents    INTEGER,
    duration_minutes        INTEGER,
    effort_level            SMALLINT,
    accessibility_notes     TEXT,
    wheelchair_accessible   BOOLEAN,
    family_friendly         BOOLEAN,
    source                  TEXT,
    source_url              TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    good_for_groups         BOOLEAN,
    good_for_kids           BOOLEAN,
    pet_friendly            BOOLEAN,
    indoor_outdoor          TEXT,
    noise_level             TEXT,
    activity_level          TEXT,
    reservations_required   BOOLEAN,
    ticket_required         BOOLEAN,
    provider_source         TEXT,
    provider_category_types TEXT[],
    matched_primary_type    TEXT,
    rating                  DOUBLE PRECISION,
    review_count            INTEGER,
    price_level             INTEGER,
    business_status         TEXT,
    quality_score           DOUBLE PRECISION
);

-- Data: City Coverage (tracks which cities have been seeded)
CREATE TABLE data.city_coverage (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city            TEXT NOT NULL,
    region          TEXT,
    country         TEXT NOT NULL DEFAULT 'US',
    last_seeded_at  TIMESTAMPTZ,
    place_count     INTEGER DEFAULT 0,
    is_seeded       BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (city, region, country)
);

-- Data: Place External IDs
CREATE TABLE data.place_external_ids (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    place_id    UUID NOT NULL REFERENCES data.places(id),
    source      TEXT NOT NULL,
    external_id TEXT NOT NULL,
    source_url  TEXT,
    raw_payload JSONB,
    fetched_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (source, external_id)
);

-- Planner: Trips
CREATE TABLE planner.trips (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID REFERENCES auth.users(id),
    title                   TEXT NOT NULL,
    destination_city        TEXT NOT NULL,
    destination_region      TEXT,
    destination_country     TEXT DEFAULT 'US',
    start_date              DATE NOT NULL,
    end_date                DATE NOT NULL,
    trip_days               INTEGER NOT NULL,
    status                  TEXT NOT NULL DEFAULT 'draft',
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Planner: Trip Preferences
CREATE TABLE planner.trip_preferences (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id                     UUID NOT NULL UNIQUE REFERENCES planner.trips(id),
    budget_level                TEXT,
    group_size                  INTEGER,
    has_kids                    BOOLEAN,
    family_friendly_required    BOOLEAN,
    good_for_groups_required    BOOLEAN,
    good_for_kids_required      BOOLEAN,
    indoor_outdoor_preference   TEXT,
    max_effort_level            INTEGER,
    preferred_categories        TEXT[],
    excluded_categories         TEXT[],
    raw_questionnaire           JSONB,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Planner: Trip Itinerary Items
CREATE TABLE planner.trip_itinerary_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id         UUID NOT NULL REFERENCES planner.trips(id),
    day_number      INTEGER NOT NULL,
    item_order      INTEGER NOT NULL,
    scheduled_date  DATE,
    place_id        UUID REFERENCES data.places(id),
    activity_id     UUID REFERENCES data.activities(id),
    locked_by_user  BOOLEAN NOT NULL DEFAULT false,
    source_type     TEXT NOT NULL DEFAULT 'generated',
    selection_reason TEXT,
    item_status     TEXT NOT NULL DEFAULT 'active',
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    custom_name     TEXT,
    custom_address  TEXT,
    CONSTRAINT uq_trip_day_order UNIQUE (trip_id, day_number, item_order) DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT chk_item_order CHECK (item_order > 0)
);
```

## 3. Backend Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` directory:

```env
GOOGLE_PLACES_API_KEY=your_google_places_api_key
YELP_API_KEY=your_yelp_api_key
DATABASE_URL=postgresql://username:password@localhost:5432/triptailor_dev
JWT_SECRET_KEY=your_secret_key
INGEST_MAX_RESULTS=20
INGEST_RATE_LIMIT_SLEEP_SECONDS=0.2
```

Start the backend server:

```bash
python run.py
```

The API will be available at `http://localhost:5050`.

## 4. Frontend Setup

From the project root:

```bash
npm install
npm run dev
```

The frontend will be available at `http://localhost:3000`.

## 5. Seeding Activity Data

TripTailor automatically seeds activity data the first time a trip is generated for a new city. You can also manually seed a city using the ingestion scripts:

```bash
# Google Places
cd backend
python scripts/ingest_google_places.py "museums in Detroit" --max-results 20

# Yelp
python scripts/ingest_yelp_places.py "museums" --latitude 42.3314 --longitude -83.0458 --limit 20
```

## API Keys

| Key | Where to get it |
|---|---|
| `GOOGLE_PLACES_API_KEY` | [Google Cloud Console](https://console.cloud.google.com/) — enable Places API |
| `YELP_API_KEY` | [Yelp Fusion](https://fusion.yelp.com/) — create an app |