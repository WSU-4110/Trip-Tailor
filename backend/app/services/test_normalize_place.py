import pytest
from normalize_place import _country_to_iso


@pytest.mark.parametrize(
    "input_val, expected",
    [
        ("usa", "US"),
        ("USA", "US"),
        ("us", "US"),
        ("United States", "US"),
        ("united states of america", "US"),
        ("  usa  ", "US"),  # leading/trailing spaces
        ("Canada", "CANADA"),
        (" germany ", "GERMANY"),
        ("Uk", "UK"),
    ],
)
def test_country_to_iso_valid_inputs(input_val, expected):
    assert _country_to_iso(input_val) == expected


def test_country_to_iso_none():
    assert _country_to_iso(None) is None


def test_country_to_iso_empty_string():
    assert _country_to_iso("") is None


def test_country_to_iso_whitespace_only():
    assert _country_to_iso("   ") == ""  # matches current implementation


def test_country_to_iso_case_preservation_for_non_usa():
    assert _country_to_iso("FrAnCe") == "FRANCE"