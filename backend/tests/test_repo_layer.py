import pytest
from unittest.mock import MagicMock, patch


# Helper: builds a mock DB connection/cursor chain
# We build fake objects that behave like real psycopg2 connections/cursor
# so that the repo functions can run normally without opening an actual DB connection
# this avoids having a live postgres instance which would be slow and fragile for testing

def _make_mock_conn(fetchone_return=None, fetchall_return=None):
    mock_cur = MagicMock()
    # mock_cur pretends to be a real psycopg2 cursor, fetchone and fetchall are programmed to return whatever we pass in
    mock_cur.fetchone.return_value = fetchone_return
    mock_cur.fetchall.return_value = fetchall_return if fetchall_return is not None else []

    mock_conn = MagicMock()
    # mock_conn pretends to be a real psycopg2 connection
    mock_conn.__enter__ = MagicMock(return_value=mock_conn)
    mock_conn.__exit__ = MagicMock(return_value=False)
    mock_conn.cursor.return_value.__enter__ = MagicMock(return_value=mock_cur)
    mock_conn.cursor.return_value.__exit__ = MagicMock(return_value=False)

    return mock_conn, mock_cur


# 1. auth_repo.get_user_by_email
def test_get_user_by_email_returns_user():
    # Simulate a DB row being found by pre-loading fetchone with a fake user dict
    # then we patch get_conn so the function uses our mock conn instead of the real DB
    expected = {"id": "abc123", "email": "test@example.com", "password_hash": "hashed", "created_at": "2024-01-01"}
    mock_conn, _ = _make_mock_conn(fetchone_return=expected)

    with patch("app.repositories.auth_repo.get_conn", return_value=mock_conn):
        from app.repositories.auth_repo import get_user_by_email
        result = get_user_by_email("test@example.com")

    # confirm the function passes back exactly what the DB cursor returned
    assert result == expected


def test_get_user_by_email_returns_none_when_not_found():
    # simulate no row being found by setting fetchone to return none
    # This tests the user does not exist path
    mock_conn, _ = _make_mock_conn(fetchone_return=None)

    with patch("app.repositories.auth_repo.get_conn", return_value=mock_conn):
        from app.repositories.auth_repo import get_user_by_email
        result = get_user_by_email("ghost@example.com")

    # confirm None is returned so that we know the user was not found
    assert result is None



# 2. auth_repo.create_user
def test_create_user_returns_new_user():
    # simulate the insert by pre-loading fetchone with a fake user
    # verify that the function returns the new SQL row
    expected = {"id": "newid", "email": "new@example.com", "created_at": "2024-01-01"}
    mock_conn, _ = _make_mock_conn(fetchone_return=expected)

    with patch("app.repositories.auth_repo.get_conn", return_value=mock_conn):
        from app.repositories.auth_repo import create_user
        result = create_user("new@example.com", "hashed_pw")

    # confirm that the new user dict is returned
    assert result == expected


def test_create_user_calls_commit():
    # Check that the commit is called exactly once to ensure the function does not skip it
    # make sure that commit() is called, if its not, the insert is never saved to the DB
    mock_conn, _ = _make_mock_conn(fetchone_return={"id": "y", "email": "y@y.com", "created_at": ""})

    with patch("app.repositories.auth_repo.get_conn", return_value=mock_conn):
        from app.repositories.auth_repo import create_user
        create_user("y@y.com", "pw")

    # fails is commit was never called or called more than once
    mock_conn.commit.assert_called_once()


# 3. city_coverage_repo.get_city_coverage
def test_get_city_coverage_returns_row():
    # simulate the city exsisting in the DB by pre-loading fetchonee with a fake city row
    # this row includes the is_seeded which the trip generator should check before ingesting new city data
    expected = {"city": "Detroit", "region": "MI", "country": "US", "is_seeded": True}
    mock_conn, _ = _make_mock_conn(fetchone_return=expected)

    with patch("app.repositories.city_coverage_repo.get_conn", return_value=mock_conn):
        from app.repositories.city_coverage_repo import get_city_coverage
        result = get_city_coverage("Detroit", "MI")

    # confirm the full row is returned
    assert result == expected


def test_get_city_coverage_returns_none_when_missing():
    # Simulate the city not existing by setting the fetchone to return None
    # The trip generator uses the None to decide whether or not to run a live ingestion cycle
    mock_conn, _ = _make_mock_conn(fetchone_return=None)

    with patch("app.repositories.city_coverage_repo.get_conn", return_value=mock_conn):
        from app.repositories.city_coverage_repo import get_city_coverage
        result = get_city_coverage("UnknownCity", "XX")

    # confirm None tells the function that the city has never been seeded
    assert result is None


# 4. city_coverage_repo.mark_city_seeded
def test_mark_city_seeded_executes_with_correct_params():
    # check that the SQL call receives the exact values that we pass in
    # If the SQL does an upsert with the wrong parameters, it would insert that back record
    mock_conn, mock_cur = _make_mock_conn()

    with patch("app.repositories.city_coverage_repo.get_conn", return_value=mock_conn):
        from app.repositories.city_coverage_repo import mark_city_seeded
        mark_city_seeded("Detroit", "MI", "US", place_count=42)

    # extract the arguments passed to the cursor.execute and check the SQL parameters
    args = mock_cur.execute.call_args[0]
    assert args[1] == ("Detroit", "MI", "US", 42)


def test_mark_city_seeded_defaults_place_count_to_zero():
    # When no place_count is given, it should default to 0 to ensure the function is safe to call right after ingestion
    mock_conn, mock_cur = _make_mock_conn()

    with patch("app.repositories.city_coverage_repo.get_conn", return_value=mock_conn):
        from app.repositories.city_coverage_repo import mark_city_seeded
        mark_city_seeded("Austin", "TX")

    # index[3] of the parameters tuple is where place_count is passed to the SQL query
    args = mock_cur.execute.call_args[0]
    assert args[1][3] == 0


# 5. external_ids_repo.upsert_place_external_id
def test_upsert_place_external_id_executes_insert():
    # verify that the function called cursor.execute with the right place_id, source, and external_id
    # these are the most important keys that map the links of our internal place to the provider id of a place
    mock_conn, mock_cur = _make_mock_conn()

    with patch("app.repositories.external_ids_repo.get_conn", return_value=mock_conn):
        from app.repositories.external_ids_repo import upsert_place_external_id
        upsert_place_external_id(place_id="p1", source="google", external_id="ChIJabc")

    # Check each position in the SQL params that we passed in
    args = mock_cur.execute.call_args[0]
    assert args[1][0] == "p1" # checks the place_id
    assert args[1][1] == "google" # checks the source
    assert args[1][2] == "ChIJabc" # checks the external_id


def test_upsert_place_external_id_skips_when_empty():
    # if external_id is empty, skip the DB call entirely
    # We cant store a place with an empty external_id without corrupting the mapping of our places
    mock_conn, mock_cur = _make_mock_conn()

    with patch("app.repositories.external_ids_repo.get_conn", return_value=mock_conn):
        from app.repositories.external_ids_repo import upsert_place_external_id
        upsert_place_external_id(place_id="p1", source="google", external_id="")

    # confirms our gaurd worked and no SQL query was executed
    mock_cur.execute.assert_not_called()


# 6. recommendations_repo.get_candidate_activities_for_city
def test_get_candidate_activities_returns_list():
    # we pre-load the fetchall iwth 2 fake activity rows and confirm the function returns them correctly
    # this is the main query that the trip generator relies on to build itineraries
    expected = [
        {"place_id": "p1", "place_name": "Detroit Institute of Arts", "category": "museum"},
        {"place_id": "p2", "place_name": "Belle Isle Park", "category": "park"},
    ]
    mock_conn, _ = _make_mock_conn(fetchall_return=expected)

    with patch("app.repositories.recommendations_repo.get_conn", return_value=mock_conn):
        from app.repositories.recommendations_repo import get_candidate_activities_for_city
        result = get_candidate_activities_for_city("Detroit", "MI")

    # confirm both rows came back and the list length is correct
    assert result == expected
    assert len(result) == 2


def test_get_candidate_activities_returns_empty_list_when_none():
    # simulate a city with no seeded activities by setting fetchall to return and empty list []
    # The trip generator must not crash when this happens
    mock_conn, _ = _make_mock_conn(fetchall_return=[])

    with patch("app.repositories.recommendations_repo.get_conn", return_value=mock_conn):
        from app.repositories.recommendations_repo import get_candidate_activities_for_city
        result = get_candidate_activities_for_city("EmptyCity", "ZZ")

    # confirm the empty list is returned, NOT None, so that we can safely iterator over it
    assert result == []

# all tests passed