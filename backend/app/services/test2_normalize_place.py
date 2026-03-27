import pytest
from normalize_place import _parse_us_formatted_address


def test_full_valid_address():
    result = _parse_us_formatted_address(
        "5402 Woodward Ave, Detroit, MI 48202, USA"
    )
    assert result == {
        "address_line1": "5402 Woodward Ave",
        "city": "Detroit",
        "region": "MI",
        "postal_code": "48202",
        "country": "US",
    }


def test_with_zip_plus4():
    result = _parse_us_formatted_address(
        "1234 Main St, Ann Arbor, MI 48104-1234, USA"
    )
    assert result["postal_code"] == "48104-1234"
    assert result["region"] == "MI"


def test_missing_zip():
    result = _parse_us_formatted_address(
        "1234 Main St, Ann Arbor, MI, USA"
    )
    assert result["region"] == "MI"
    assert result["postal_code"] is None


def test_missing_city():
    result = _parse_us_formatted_address(
        "1234 Main St, MI 48104, USA"
    )
    assert result["city"] is None
    assert result["region"] == "MI"


def test_missing_country_defaults_to_us():
    result = _parse_us_formatted_address(
        "1234 Main St, Detroit, MI 48202"
    )
    assert result["country"] == "US"


def test_non_usa_country_passthrough():
    result = _parse_us_formatted_address(
        "1234 Main St, Toronto, ON M5V 3L9, Canada"
    )
    assert result["country"] == "CANADA"


def test_only_address_line():
    result = _parse_us_formatted_address("1234 Main St")
    assert result["address_line1"] == "1234 Main St"
    assert result["city"] is None


def test_empty_string():
    result = _parse_us_formatted_address("")
    assert result == {
        "address_line1": None,
        "city": None,
        "region": None,
        "postal_code": None,
        "country": None,
    }


def test_none_input():
    result = _parse_us_formatted_address(None)
    assert result == {
        "address_line1": None,
        "city": None,
        "region": None,
        "postal_code": None,
        "country": None,
    }


def test_extra_spaces_and_commas():
    result = _parse_us_formatted_address(
        "  1234 Main St  ,  Detroit  , MI   48202 ,  USA  "
    )
    assert result["address_line1"] == "1234 Main St"
    assert result["city"] == "Detroit"
    assert result["region"] == "MI"
    assert result["postal_code"] == "48202"
    assert result["country"] == "US"