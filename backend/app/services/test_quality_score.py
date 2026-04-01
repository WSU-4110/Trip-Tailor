import pytest
from place_classifier import _build_quality_score


def test_quality_score():
    assert _build_quality_score(4.0, 50) is not None


def test_quality_score_none():
    assert _build_quality_score(None, 100) is None