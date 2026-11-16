"""
Feature Engineering Module for Hotel Booking Cancellation Prediction.

Provides Scikit-Learn compatible transformer to create domain-driven features:
- total_nights: Combined weekend and weekday nights
- total_guests: Total party size (adults + children + babies)
- is_family: Binary flag indicating traveling with children or infants
- room_type_changed: Whether assigned room differs from reserved room
- has_special_requests: Binary flag for presence of special requests
- is_long_stay: Whether booking exceeds 5 nights
- lead_time_log: Log-transformed lead time to reduce right-skewness

Strictly prevents data leakage by only computing transformations from row-level input features.
"""

from typing import Optional
import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, TransformerMixin


class HotelFeatureEngineer(BaseEstimator, TransformerMixin):
    """
    Scikit-learn compatible transformer for feature engineering on hotel bookings.
    Can be safely placed inside an sklearn Pipeline.
    """

    def __init__(self, add_log_transforms: bool = True):
        self.add_log_transforms = add_log_transforms

    def fit(self, X: pd.DataFrame, y: Optional[pd.Series] = None):
        """Fit method (stateless transformation, returns self)."""
        return self

    def transform(self, X: pd.DataFrame) -> pd.DataFrame:
        """
        Create domain-specific engineered features.

        Args:
            X: Input DataFrame of features.

        Returns:
            X_out: Transformed DataFrame with newly engineered features.
        """
        X_out = X.copy()

        # 1. Total nights of stay
        if "stays_in_weekend_nights" in X_out.columns and "stays_in_week_nights" in X_out.columns:
            X_out["total_nights"] = (
                X_out["stays_in_weekend_nights"] + X_out["stays_in_week_nights"]
            )
            X_out["is_long_stay"] = (X_out["total_nights"] > 5).astype(int)

        # 2. Total guests & Family travel indicator
        children_safe = X_out["children"].fillna(0) if "children" in X_out.columns else 0
        babies_safe = X_out["babies"].fillna(0) if "babies" in X_out.columns else 0
        adults_safe = X_out["adults"].fillna(0) if "adults" in X_out.columns else 0

        X_out["total_guests"] = adults_safe + children_safe + babies_safe
        X_out["is_family"] = ((children_safe > 0) | (babies_safe > 0)).astype(int)

        # 3. Room type disparity (assigned vs reserved)
        # Note: If room assignment is changed at check-in or earlier, this is a strong operational indicator
        if "reserved_room_type" in X_out.columns and "assigned_room_type" in X_out.columns:
            X_out["room_type_changed"] = (
                X_out["reserved_room_type"] != X_out["assigned_room_type"]
            ).astype(int)

        # 4. Binary flag for special requests
        if "total_of_special_requests" in X_out.columns:
            X_out["has_special_requests"] = (
                X_out["total_of_special_requests"] > 0
            ).astype(int)

        # 5. Log-transformation for heavily right-skewed variables
        if self.add_log_transforms and "lead_time" in X_out.columns:
            X_out["lead_time_log"] = np.log1p(np.maximum(0, X_out["lead_time"]))

        return X_out
