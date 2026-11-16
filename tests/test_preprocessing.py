"""
Unit tests for preprocessing and feature engineering modules.
"""

import pandas as pd
import numpy as np
from src.feature_engineering import HotelFeatureEngineer
from src.preprocessing import (
    get_pipeline_a_preprocessor,
    get_pipeline_b_preprocessor,
    build_full_model_pipeline,
)
from sklearn.dummy import DummyClassifier
from sklearn.tree import DecisionTreeClassifier


def _get_dummy_dataframe():
    """Create a minimal synthetic dataframe matching the schema for quick testing."""
    return pd.DataFrame({
        "hotel": ["Resort Hotel", "City Hotel", "City Hotel"],
        "lead_time": [10, 200, 50],
        "arrival_date_year": [2016, 2017, 2016],
        "arrival_date_month": ["July", "August", "December"],
        "arrival_date_week_number": [27, 33, 50],
        "arrival_date_day_of_month": [1, 15, 20],
        "stays_in_weekend_nights": [0, 2, 1],
        "stays_in_week_nights": [2, 5, 2],
        "adults": [2, 2, 1],
        "children": [0.0, 1.0, 0.0],
        "babies": [0, 0, 0],
        "meal": ["BB", "HB", "FB"],
        "country": ["PRT", "GBR", "FRA"],
        "market_segment": ["Direct", "Online TA", "Offline TA/TO"],
        "distribution_channel": ["Direct", "TA/TO", "TA/TO"],
        "is_repeated_guest": [0, 0, 1],
        "previous_cancellations": [0, 1, 0],
        "previous_bookings_not_canceled": [0, 0, 2],
        "reserved_room_type": ["A", "A", "D"],
        "assigned_room_type": ["A", "D", "D"],
        "booking_changes": [0, 1, 0],
        "deposit_type": ["No Deposit", "Non Refund", "No Deposit"],
        "agent": [14.0, 9.0, np.nan],
        "company": [np.nan, np.nan, 45.0],
        "days_in_waiting_list": [0, 0, 10],
        "customer_type": ["Transient", "Transient-Party", "Contract"],
        "adr": [100.0, 150.0, 80.0],
        "required_car_parking_spaces": [0, 1, 0],
        "total_of_special_requests": [0, 2, 1],
    })


def test_hotel_feature_engineer():
    """Verify HotelFeatureEngineer creates engineered features properly."""
    df = _get_dummy_dataframe()
    fe = HotelFeatureEngineer(add_log_transforms=True)
    df_transformed = fe.transform(df)

    assert "total_nights" in df_transformed.columns
    assert "total_guests" in df_transformed.columns
    assert "is_family" in df_transformed.columns
    assert "room_type_changed" in df_transformed.columns
    assert "lead_time_log" in df_transformed.columns

    # Test values
    assert df_transformed.loc[0, "total_nights"] == 2
    assert df_transformed.loc[1, "total_nights"] == 7
    assert df_transformed.loc[1, "room_type_changed"] == 1
    assert df_transformed.loc[0, "room_type_changed"] == 0


def test_pipeline_a_fit_transform():
    """Verify Pipeline A preprocessor fits and transforms data into 2D array."""
    df = _get_dummy_dataframe()
    preprocessor = get_pipeline_a_preprocessor(scale_numeric=True)
    X_proc = preprocessor.fit_transform(df)

    assert isinstance(X_proc, np.ndarray)
    assert X_proc.shape[0] == len(df)
    assert not np.isnan(X_proc).any()


def test_pipeline_b_fit_transform():
    """Verify Pipeline B preprocessor fits and transforms data."""
    df = _get_dummy_dataframe()
    preprocessor = get_pipeline_b_preprocessor(scale_numeric=True)
    X_proc = preprocessor.fit_transform(df)

    assert isinstance(X_proc, np.ndarray)
    assert X_proc.shape[0] == len(df)
    assert not np.isnan(X_proc).any()


def test_full_model_pipeline_end_to_end():
    """Verify complete Pipeline with an estimator can fit and predict."""
    df = _get_dummy_dataframe()
    y = pd.Series([0, 1, 0])

    pipe_a = build_full_model_pipeline("A", DummyClassifier(strategy="most_frequent"))
    pipe_a.fit(df, y)
    preds_a = pipe_a.predict(df)
    assert len(preds_a) == len(df)

    pipe_b = build_full_model_pipeline("B", DecisionTreeClassifier(max_depth=2, random_state=42))
    pipe_b.fit(df, y)
    preds_b = pipe_b.predict(df)
    assert len(preds_b) == len(df)
