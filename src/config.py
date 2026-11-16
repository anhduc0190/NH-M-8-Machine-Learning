"""
Configuration Module for Hotel Booking Cancellation Prediction.

Centralizes paths, hyperparameters, column mappings, and experimental settings.
Adheres to PEP 8 standards and supports reproducible experimentation.
"""

from pathlib import Path

# ==============================================================================
# 1. DIRECTORY PATHS (OS-Independent via pathlib)
# ==============================================================================
# Base project root (parent of 'src')
PROJECT_ROOT = Path(__file__).resolve().parent.parent

# Data paths
DATA_DIR = PROJECT_ROOT / "data"
DATA_RAW_DIR = DATA_DIR / "raw"
DATA_PROCESSED_DIR = DATA_DIR / "processed"
RAW_DATA_PATH = DATA_RAW_DIR / "hotel_bookings.csv"

# Models and serialization
MODELS_DIR = PROJECT_ROOT / "models"

# Reports and outputs
REPORTS_DIR = PROJECT_ROOT / "reports"
FIGURES_DIR = REPORTS_DIR / "figures"
TABLES_DIR = REPORTS_DIR / "tables"
RESULTS_DIR = REPORTS_DIR / "results"
REPORT_LATEX_DIR = REPORTS_DIR / "report"

# Notebooks and docs
NOTEBOOKS_DIR = PROJECT_ROOT / "notebooks"
DOCS_DIR = PROJECT_ROOT / "docs"

# ==============================================================================
# 2. EXPERIMENTAL & REPRODUCIBILITY CONSTANTS
# ==============================================================================
RANDOM_STATE = 42
TEST_SIZE = 0.20
CV_FOLDS = 5

# ==============================================================================
# 3. DATA SCHEMA & FEATURE GROUPS
# ==============================================================================
TARGET_COLUMN = "is_canceled"

# Critical: Target and Temporal Leakage Columns (MUST be dropped before modeling)
# - 'reservation_status': Directly encodes Check-Out vs Canceled/No-Show after booking ends.
# - 'reservation_status_date': Date of the final event (future information at booking time).
LEAKAGE_COLUMNS = [
    "reservation_status",
    "reservation_status_date",
]

# Baseline Numerical Features in Raw Dataset
NUMERICAL_FEATURES_BASE = [
    "lead_time",
    "arrival_date_year",
    "arrival_date_week_number",
    "arrival_date_day_of_month",
    "stays_in_weekend_nights",
    "stays_in_week_nights",
    "adults",
    "children",
    "babies",
    "is_repeated_guest",
    "previous_cancellations",
    "previous_bookings_not_canceled",
    "booking_changes",
    "agent",
    "company",
    "days_in_waiting_list",
    "adr",
    "required_car_parking_spaces",
    "total_of_special_requests",
]

# Baseline Categorical Features in Raw Dataset
CATEGORICAL_FEATURES_BASE = [
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

# Engineered Features for Pipeline B
ENGINEERED_FEATURES = [
    "total_nights",
    "total_guests",
    "is_family",
    "room_type_changed",
    "lead_time_group",
    "cancellation_rate_history",
]

# ==============================================================================
# 4. MODEL HYPERPARAMETERS & GRIDS
# ==============================================================================
# K-Nearest Neighbors
KNN_PARAM_GRID = {
    "classifier__n_neighbors": [3, 5, 7, 9, 11],
    "classifier__weights": ["uniform", "distance"],
    "classifier__metric": ["euclidean", "manhattan"],
}

# Decision Tree Classifier
DT_PARAM_GRID = {
    "classifier__criterion": ["gini", "entropy"],
    "classifier__max_depth": [5, 10, 15, 20, None],
    "classifier__min_samples_split": [2, 5, 10, 20],
    "classifier__min_samples_leaf": [1, 2, 5, 10],
    "classifier__class_weight": [None, "balanced"],
}

# Default Fast Training Params (for baseline verification)
DEFAULT_KNN_PARAMS = {
    "n_neighbors": 5,
    "weights": "uniform",
    "metric": "minkowski",
    "p": 2,
    "n_jobs": -1,
}

DEFAULT_DT_PARAMS = {
    "criterion": "gini",
    "max_depth": 10,
    "min_samples_split": 10,
    "min_samples_leaf": 5,
    "random_state": RANDOM_STATE,
}
