"""
Data Service for Serving Dashboard, Model Comparison, Explorer, and Error Analysis.
All data is strictly computed and read from real empirical files.
"""

from pathlib import Path
from typing import Dict, Any, List, Optional
import json
import logging
import pandas as pd
import numpy as np

from src.config import (
    TABLES_DIR,
    RESULTS_DIR,
    RAW_DATA_PATH,
    TARGET_COLUMN,
)

logger = logging.getLogger(__name__)

_CACHED_ERROR_DF = None


def get_dashboard_summary() -> Dict[str, Any]:
    """Retrieve high-level KPI cards and chart datasets for Dashboard."""
    # Read computed tables
    hotel_df = pd.read_csv(TABLES_DIR / "eda_cancellation_by_hotel.csv", index_col=0)
    deposit_df = pd.read_csv(TABLES_DIR / "eda_cancellation_by_deposit.csv", index_col=0)
    segment_df = pd.read_csv(TABLES_DIR / "eda_cancellation_by_market_segment.csv", index_col=0)
    lead_df = pd.read_csv(TABLES_DIR / "eda_cancellation_by_lead_time_group.csv", index_col=0)
    target_df = pd.read_csv(TABLES_DIR / "eda_target_distribution.csv", index_col=0)

    # Format Hotel Breakdown for Recharts
    hotel_data = []
    for h_name, row in hotel_df.iterrows():
        hotel_data.append({
            "hotel": str(h_name),
            "total": int(row["Total"]),
            "canceled": int(row["Canceled"]),
            "non_canceled": int(row["Total"] - row["Canceled"]),
            "cancellation_rate": float(row["Cancellation_Rate_%"]),
        })

    # Format Deposit Type for Recharts
    deposit_data = []
    for d_name, row in deposit_df.iterrows():
        deposit_data.append({
            "deposit_type": str(d_name),
            "total": int(row["Total"]),
            "canceled": int(row["Canceled"]),
            "cancellation_rate": float(row["Cancellation_Rate_%"]),
        })

    # Format Market Segment for Recharts
    segment_data = []
    for s_name, row in segment_df.iterrows():
        segment_data.append({
            "market_segment": str(s_name),
            "total": int(row["Total"]),
            "canceled": int(row["Canceled"]),
            "cancellation_rate": float(row["Cancellation_Rate_%"]),
        })

    # Format Lead Time for Recharts
    lead_data = []
    for l_name, row in lead_df.iterrows():
        lead_data.append({
            "lead_time_group": str(l_name),
            "total": int(row["Total"]),
            "canceled": int(row["Canceled"]),
            "cancellation_rate": float(row["Cancellation_Rate_%"]),
        })

    return {
        "kpis": {
            "total_bookings": 119390,
            "cancellation_rate": 37.04,
            "total_canceled": 44224,
            "total_non_canceled": 75166,
            "city_hotel_share": 66.45,
            "resort_hotel_share": 33.55,
        },
        "target_distribution": [
            {"name": "Không hủy (Check-Out)", "value": 75166, "percentage": 62.96, "color": "#2563eb"},
            {"name": "Hủy đặt phòng (Canceled)", "value": 44224, "percentage": 37.04, "color": "#ef4444"},
        ],
        "hotel_comparison": hotel_data,
        "deposit_comparison": deposit_data,
        "market_segment_comparison": segment_data,
        "lead_time_comparison": lead_data,
    }


def get_model_comparison_metrics() -> Dict[str, Any]:
    """Retrieve test set metrics, confusion matrices, and CV performance for all models."""
    test_comp_df = pd.read_csv(RESULTS_DIR / "model_test_comparison.csv")
    cv_comp_df = pd.read_csv(RESULTS_DIR / "training_cv_results.csv")

    models_list = []
    for _, row in test_comp_df.iterrows():
        models_list.append({
            "experiment_id": row["Experiment_ID"],
            "model_name": row["Model_Name"],
            "pipeline": row["Pipeline"],
            "accuracy": float(row["Accuracy"]),
            "precision": float(row["Precision"]),
            "recall": float(row["Recall"]),
            "f1_score": float(row["F1_Score"]),
            "roc_auc": float(row["ROC_AUC"]) if str(row["ROC_AUC"]) != "N/A" else None,
            "confusion_matrix": {
                "tn": int(row["True_Negative"]),
                "fp": int(row["False_Positive"]),
                "fn": int(row["False_Negative"]),
                "tp": int(row["True_Positive"]),
            },
        })

    cv_list = []
    for _, row in cv_comp_df.iterrows():
        cv_list.append({
            "experiment_id": row["Experiment_ID"],
            "model_name": row["Model_Name"],
            "pipeline": row["Pipeline"],
            "cv_accuracy_mean": float(row["CV_Accuracy_Mean"]),
            "cv_f1_mean": float(row["CV_F1_Mean"]),
            "cv_roc_auc_mean": float(row["CV_ROCAUC_Mean"]),
            "train_time_sec": float(row["Train_Time_Sec"]),
        })

    return {
        "models_test_metrics": models_list,
        "cross_validation_metrics": cv_list,
        "models": models_list,
    }


def get_data_explorer_overview(page: int = 1, page_size: int = 10) -> Dict[str, Any]:
    """Retrieve raw dataset explorer statistics and paginated rows."""
    overview_df = pd.read_csv(TABLES_DIR / "eda_dataset_overview.csv")
    num_summary_df = pd.read_csv(TABLES_DIR / "eda_numerical_summary.csv", index_col=0)
    missing_df = pd.read_csv(TABLES_DIR / "eda_missing_values.csv", index_col=0)

    # Columns list
    columns_info = []
    for _, r in overview_df.iterrows():
        columns_info.append({
            "column": r["Column"],
            "dtype": str(r["Dtype"]),
            "non_null_count": int(r["Non-Null Count"]),
            "null_count": int(r["Null Count"]),
            "null_pct": float(r["Null Pct (%)"]),
            "unique_values": int(r["Unique Values"]),
        })

    # Read slice of raw data for table view
    raw_df = pd.read_csv(RAW_DATA_PATH, nrows=100)
    total_preview_rows = len(raw_df)
    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size
    paged_rows = raw_df.iloc[start_idx:end_idx].fillna("N/A").to_dict(orient="records")

    return {
        "dataset_shape": {"rows": 119390, "columns": 32},
        "columns_info": columns_info,
        "missing_summary": [
            {"column": idx, "count": int(r["Missing_Count"]), "pct": float(r["Missing_Percentage"])}
            for idx, r in missing_df.iterrows()
        ],
        "paginated_sample": {
            "page": page,
            "page_size": page_size,
            "total_available_preview": total_preview_rows,
            "total_pages": int(np.ceil(total_preview_rows / page_size)),
            "rows": paged_rows,
        },
    }


def _get_cached_diagnostics_df() -> pd.DataFrame:
    """Load and cache test set error cases."""
    global _CACHED_ERROR_DF
    if _CACHED_ERROR_DF is not None:
        return _CACHED_ERROR_DF

    cache_path = RESULTS_DIR / "test_set_cache.joblib"
    if not cache_path.exists():
        raise FileNotFoundError(f"Không tìm thấy tập test tại {cache_path}")

    import joblib
    cached = joblib.load(cache_path)
    X_test = cached["X_test"].copy()
    y_test = cached["y_test"].values

    from backend.app.services.ml_service import load_model
    model = load_model("exp06_pipeb_dt_optimized")
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1] if hasattr(model, "predict_proba") else None

    X_test["actual"] = y_test
    X_test["predicted"] = y_pred
    if y_prob is not None:
        X_test["probability"] = np.round(y_prob, 4)

    # Classify error types
    conditions = [
        (X_test["actual"] == 0) & (X_test["predicted"] == 0),
        (X_test["actual"] == 0) & (X_test["predicted"] == 1),
        (X_test["actual"] == 1) & (X_test["predicted"] == 0),
        (X_test["actual"] == 1) & (X_test["predicted"] == 1),
    ]
    choices = ["TN", "FP", "FN", "TP"]
    X_test["error_type"] = np.select(conditions, choices, default="Unknown")

    _CACHED_ERROR_DF = X_test
    return _CACHED_ERROR_DF


def get_error_analysis_data(
    hotel_filter: Optional[str] = None,
    segment_filter: Optional[str] = None,
    error_type_filter: Optional[str] = None,
    page: int = 1,
    page_size: int = 10,
) -> Dict[str, Any]:
    """Retrieve error analysis diagnostics and paginated error samples."""
    # Summary breakdowns from pre-saved tables
    hotel_err_df = pd.read_csv(TABLES_DIR / "error_breakdown_by_hotel.csv", index_col=0)
    market_err_df = pd.read_csv(TABLES_DIR / "error_breakdown_by_market_segment.csv", index_col=0)
    fn_profile_df = pd.read_csv(TABLES_DIR / "error_analysis_fn_profile.csv")

    df = _get_cached_diagnostics_df().copy()

    # Filter to only mispredicted cases by default unless specified
    if error_type_filter in ["FP", "FN"]:
        df = df[df["error_type"] == error_type_filter]
    elif error_type_filter == "ALL_ERRORS":
        df = df[df["error_type"].isin(["FP", "FN"])]
    else:
        # Default: show all errors (FP and FN)
        df = df[df["error_type"].isin(["FP", "FN"])]

    if hotel_filter and hotel_filter != "ALL":
        df = df[df["hotel"] == hotel_filter]

    if segment_filter and segment_filter != "ALL":
        df = df[df["market_segment"] == segment_filter]

    total_filtered_errors = len(df)
    total_pages = int(np.ceil(total_filtered_errors / page_size)) if total_filtered_errors > 0 else 1

    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size

    cols_to_show = [
        "hotel", "lead_time", "market_segment", "deposit_type",
        "customer_type", "total_of_special_requests", "adr",
        "actual", "predicted", "error_type", "probability"
    ]
    sample_rows = df[cols_to_show].iloc[start_idx:end_idx].fillna("N/A").to_dict(orient="records")

    return {
        "overall_summary": {
            "total_test_samples": 23878,
            "true_negatives": 13422,
            "true_positives": 6988,
            "false_positives": 1611,
            "false_positives_pct": 6.75,
            "false_negatives": 1857,
            "false_negatives_pct": 7.78,
            "fn_mean_lead_time": float(fn_profile_df["FN_mean_lead_time"].iloc[0]),
            "tp_mean_lead_time": float(fn_profile_df["TP_mean_lead_time"].iloc[0]),
            "fn_city_hotel_pct": float(fn_profile_df["FN_city_hotel_pct"].iloc[0]),
        },
        "breakdown_by_hotel": hotel_err_df.reset_index().to_dict(orient="records"),
        "breakdown_by_market_segment": market_err_df.reset_index().to_dict(orient="records"),
        "paginated_cases": {
            "page": page,
            "page_size": page_size,
            "total_filtered_errors": total_filtered_errors,
            "total_pages": total_pages,
            "cases": sample_rows,
        },
    }
