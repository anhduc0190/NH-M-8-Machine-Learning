"""
Preprocessing Pipeline Module for Hotel Booking Cancellation Prediction.

Constructs modular Scikit-Learn Pipelines and ColumnTransformers for:
- PIPELINE A: Baseline standard preprocessing
- PIPELINE B: Improved preprocessing with domain engineering and rare-category handling

Guarantees 100% prevention of Data Leakage by executing all transformations
exclusively inside Scikit-learn Pipeline objects.
"""

from typing import List, Optional
import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, RobustScaler, OneHotEncoder

from src.config import (
    NUMERICAL_FEATURES_BASE,
    CATEGORICAL_FEATURES_BASE,
    LEAKAGE_COLUMNS,
)
from src.feature_engineering import HotelFeatureEngineer


def get_pipeline_a_preprocessor(
    num_features: Optional[List[str]] = None,
    cat_features: Optional[List[str]] = None,
    scale_numeric: bool = True,
) -> ColumnTransformer:
    """
    Construct Pipeline A (Baseline Standard Preprocessor):
    - Numerical: Median imputation + optional StandardScaler
    - Categorical: Most frequent imputation + OneHotEncoder (handle_unknown='ignore')

    Args:
        num_features: List of numerical columns.
        cat_features: List of categorical columns.
        scale_numeric: Whether to apply StandardScaler to numerical features.

    Returns:
        ColumnTransformer ready to fit on training data.
    """
    if num_features is None:
        num_features = [col for col in NUMERICAL_FEATURES_BASE if col not in LEAKAGE_COLUMNS]
    if cat_features is None:
        cat_features = [col for col in CATEGORICAL_FEATURES_BASE if col not in LEAKAGE_COLUMNS]

    # Numeric sub-pipeline
    num_steps = [("imputer", SimpleImputer(strategy="median"))]
    if scale_numeric:
        num_steps.append(("scaler", StandardScaler()))
    num_pipe = Pipeline(steps=num_steps)

    # Categoric sub-pipeline
    cat_pipe = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("encoder", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
        ]
    )

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", num_pipe, num_features),
            ("cat", cat_pipe, cat_features),
        ],
        remainder="drop",
    )
    return preprocessor


def get_pipeline_b_preprocessor(
    num_features: Optional[List[str]] = None,
    cat_features: Optional[List[str]] = None,
    scale_numeric: bool = True,
    use_robust_scaler: bool = True,
) -> Pipeline:
    """
    Construct Pipeline B (Improved Preprocessor with Feature Engineering):
    - Feature Engineering step via HotelFeatureEngineer (total_nights, total_guests, etc.)
    - Handles rare categories using OneHotEncoder(min_frequency=0.01)
    - RobustScaler / StandardScaler on numeric features

    Args:
        num_features: List of numerical columns for Pipeline B.
        cat_features: List of categorical columns for Pipeline B.
        scale_numeric: Whether to scale numerical features.
        use_robust_scaler: Whether to use RobustScaler instead of StandardScaler.

    Returns:
        Scikit-learn Pipeline incorporating Feature Engineering and ColumnTransformer.
    """
    if num_features is None:
        num_features = [
            "lead_time",
            "lead_time_log",
            "arrival_date_year",
            "arrival_date_week_number",
            "arrival_date_day_of_month",
            "stays_in_weekend_nights",
            "stays_in_week_nights",
            "total_nights",
            "is_long_stay",
            "adults",
            "children",
            "babies",
            "total_guests",
            "is_family",
            "room_type_changed",
            "has_special_requests",
            "is_repeated_guest",
            "previous_cancellations",
            "previous_bookings_not_canceled",
            "booking_changes",
            "days_in_waiting_list",
            "adr",
            "required_car_parking_spaces",
            "total_of_special_requests",
        ]

    if cat_features is None:
        cat_features = [
            "hotel",
            "arrival_date_month",
            "meal",
            "country",
            "market_segment",
            "distribution_channel",
            "reserved_room_type",
            "assigned_room_type",
            "deposit_type",
            "customer_type",
        ]

    # Numeric sub-pipeline
    num_steps = [("imputer", SimpleImputer(strategy="median"))]
    if scale_numeric:
        scaler = RobustScaler() if use_robust_scaler else StandardScaler()
        num_steps.append(("scaler", scaler))
    num_pipe = Pipeline(steps=num_steps)

    # Categoric sub-pipeline (with rare category grouping at 1% threshold)
    cat_pipe = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="constant", fill_value="Unknown")),
            (
                "encoder",
                OneHotEncoder(
                    handle_unknown="ignore",
                    min_frequency=0.01,
                    sparse_output=False,
                ),
            ),
        ]
    )

    transformer = ColumnTransformer(
        transformers=[
            ("num", num_pipe, num_features),
            ("cat", cat_pipe, cat_features),
        ],
        remainder="drop",
    )

    full_pipeline_b = Pipeline(
        steps=[
            ("feature_engineer", HotelFeatureEngineer(add_log_transforms=True)),
            ("col_transformer", transformer),
        ]
    )

    return full_pipeline_b


def build_full_model_pipeline(
    pipeline_type: str,
    estimator,
    scale_numeric: bool = True,
) -> Pipeline:
    """
    Build an end-to-end Pipeline combining preprocessor and machine learning model.

    Args:
        pipeline_type: 'A' for Baseline Preprocessor, 'B' for Improved Preprocessor.
        estimator: Instantiated Scikit-learn estimator (e.g. DummyClassifier, KNN, DecisionTree).
        scale_numeric: Whether to scale numerical variables.

    Returns:
        Complete Pipeline ready for .fit(X_train, y_train) and .predict(X_test).
    """
    if pipeline_type.upper() == "A":
        preprocessor = get_pipeline_a_preprocessor(scale_numeric=scale_numeric)
    elif pipeline_type.upper() == "B":
        preprocessor = get_pipeline_b_preprocessor(scale_numeric=scale_numeric)
    else:
        raise ValueError(f"Không nhận diện pipeline_type: '{pipeline_type}'. Chỉ hỗ trợ 'A' hoặc 'B'.")

    full_pipe = Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("classifier", estimator),
        ]
    )
    return full_pipe
