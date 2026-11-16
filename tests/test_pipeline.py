"""
Comprehensive Pipeline and Anti-Leakage Integration Tests.
"""

import pytest
import numpy as np
import pandas as pd
from sklearn.dummy import DummyClassifier
from sklearn.tree import DecisionTreeClassifier

from src.config import TARGET_COLUMN, LEAKAGE_COLUMNS, RANDOM_STATE
from src.data_loader import load_features_and_target, get_train_test_split
from src.preprocessing import build_full_model_pipeline


@pytest.fixture(scope="module")
def sample_train_test():
    """Load and prepare a stratified subset of real data for integration testing."""
    X, y = load_features_and_target(drop_leakage=True)
    # Use small subset for quick integration test
    X_train, X_test, y_train, y_test = get_train_test_split(
        X.iloc[:2000], y.iloc[:2000], test_size=0.25, random_state=RANDOM_STATE
    )
    return X_train, X_test, y_train, y_test


def test_target_not_in_features(sample_train_test):
    """Ensure target variable is not present in features."""
    X_train, X_test, _, _ = sample_train_test
    assert TARGET_COLUMN not in X_train.columns
    assert TARGET_COLUMN not in X_test.columns


def test_no_leakage_columns_in_features(sample_train_test):
    """Ensure temporal/outcome leakage columns are strictly dropped."""
    X_train, X_test, _, _ = sample_train_test
    for col in LEAKAGE_COLUMNS:
        assert col not in X_train.columns
        assert col not in X_test.columns


def test_pipeline_a_integration(sample_train_test):
    """Test full Pipeline A with DecisionTree classifier."""
    X_train, X_test, y_train, y_test = sample_train_test
    pipe = build_full_model_pipeline("A", DecisionTreeClassifier(max_depth=5, random_state=RANDOM_STATE))

    pipe.fit(X_train, y_train)
    preds = pipe.predict(X_test)

    assert len(preds) == len(X_test)
    assert set(np.unique(preds)).issubset({0, 1})


def test_pipeline_b_integration(sample_train_test):
    """Test full Pipeline B with DecisionTree classifier."""
    X_train, X_test, y_train, y_test = sample_train_test
    pipe = build_full_model_pipeline("B", DecisionTreeClassifier(max_depth=5, random_state=RANDOM_STATE))

    pipe.fit(X_train, y_train)
    preds = pipe.predict(X_test)

    assert len(preds) == len(X_test)
    assert set(np.unique(preds)).issubset({0, 1})
