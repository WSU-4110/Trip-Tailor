# Backend

Flask-based API for TripTailor


### Backend has 3 different responsibilities that we want to separate:
- Routes (API layer): recieves HTTP requests and returns HTTP responses
- Repositories (data access Layer): talks to the SQL database
- DB helper (connection layer): opens a DB connection consistently

#### app/db.py = connection helper
- get_conn() returns a new Postgres connection configured with:
    - host/port/db/user/pass or a single DATABASE_URL
    - a cursor that returns rows as dicts via RealDictCursor instead of tuples
- Saves connection setup, cursor setup, and env var handling to automatically configure across each route.

#### app/repositories/activities_repo.py
- Repository = design pattern whose job = give me data from the DB and write data to the DB
- list_activities: prepares a SQL query, executes it using a parameterized query (%s), and returns the results as a list of dicts
- Allows us to keep routes small, readable, and testable

#### app/repositories/places_repo.py
- Same idea as activities_repo.py but for place data
- Especially helpful because activites and places are linked by place_id

### Database schema
All application tables live in the `triptailor` schema and are referenced explicitly
in repository queries to avoid search_path ambiguity.

### Running tests
Use:
python -m pytest
to ensure tests run in the project virtual environment.


### Why this structure?
This separation keeps the backend maintainable as the project grows:

- Routes stay small and focused on HTTP concerns.
- Database logic lives in one place and can be reused across endpoints.
- Future changes (new DB tables, new API endpoints, or external API ingestion)
  can be made without rewriting existing routes.

This pattern also makes unit testing and future refactors significantly easier.


