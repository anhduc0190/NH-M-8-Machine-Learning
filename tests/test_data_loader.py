"""
Unit tests for data loader and validation modules.
"""

from pathlib import Path
import pytest
import pandas as pd

from src.config import (
    RAW_DATA_PATH,
    TARGET_COLUMN,
    LEAKAGE_COLUMNS,
    TEST_SIZE,
    RANDOM_STATE,
)
from src.data_loader import (
    load_raw_data,
    load_features_and_target,
    get_train_test_split,
)
from src.data_validation import validate_raw_dataset


def test_raw_data_file_exists():
    """Verify that hotel_bookings.csv exists at the configured path."""
    assert RAW_DATA_PATH.exists(), f"File does not exist at {RAW_DATA_PATH}"
    assert RAW_DATA_PATH.stat().st_size > 0, "File is empty"


def test_load_raw_data_shape():
    """Verify raw data loads properly with expected dimensions."""
    df = load_raw_data()
    assert isinstance(df, pd.DataFrame)
    assert df.shape[0] == 119390, f"Expected 119,390 rows, got {df.shape[0]}"
    assert df.shape[1] == 32, f"Expected 32 columns, got {df.shape[1]}"
    assert TARGET_COLUMN in df.columns, f"Target '{TARGET_COLUMN}' missing"


def test_load_features_and_target_leakage_removal():
    """Verify that target is separated and leakage columns are strictly removed."""
    X, y = load_features_and_target(drop_leakage=True)

    # Target checks
    assert TARGET_COLUMN not in X.columns
    assert len(y) == len(X)
    assert set(y.unique()) == {0, 1}

    # Leakage checks
    for col in LEAKAGE_COLUMNS:
        assert col not in X.columns, f"Leakage column '{col}' detected in features X!"


def test_get_train_test_split():
    """Verify stratified train-test split properties."""
    X, y = load_features_and_target(drop_leakage=True)
    X_train, X_test, y_train, y_test = get_train_test_split(
        X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE
    )

    expected_test_len = int(round(len(X) * TEST_SIZE))
    assert abs(len(X_test) - expected_test_len) <= 1
    assert len(X_train) + len(X_test) == len(X)

    # Stratification check (class proportions should match within 0.1%)
    train_prop = y_train.mean()
    test_prop = y_test.mean()
    overall_prop = y.mean()

    assert abs(train_prop - overall_prop) < 0.001
    assert abs(test_prop - overall_prop) < 0.001


def test_validate_raw_dataset_output():
    """Verify data validation report schema and values."""
    report = validate_raw_dataset()
    assert report["total_rows"] == 119390
    assert report["total_columns"] == 32
    assert report["target_exists"] is True
    assert "reservation_status" in report["leakage_columns_present"]
