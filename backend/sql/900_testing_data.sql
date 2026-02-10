-- sql/900_testing_data.sql
-- Dev-only test data to make implementing APIs more consistent

SET search_path TO triptailor;

-- Places
INSERT INTO places (name, city, region, country)
VALUES ('Detroit Institute of Arts', 'Detroit', 'MI', 'US')
ON CONFLICT (name, city, region, country) DO NOTHING;

-- Activities (linked to DIA by looking up the place id)
INSERT INTO activities (place_id, title, category, duration_minutes, estimated_cost_cents, activity_type, source)
SELECT p.id,
       'Visit the Detroit Institute of Arts',
       'museum',
       120,
       2000,
       'activity',
       'manual'
FROM places p
WHERE p.name = 'Detroit Institute of Arts'
ON CONFLICT (place_id, title) DO NOTHING;
