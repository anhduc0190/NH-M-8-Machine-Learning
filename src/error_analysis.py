"""
Error Analysis Module for Hotel Booking Cancellation Prediction.

Conducts rigorous diagnostic investigation into classification errors:
1. False Positives (FP - Type I Error): Customer predicted to cancel, but showed up.
2. False Negatives (FN - Type II Error): Customer predicted to show up, but canceled.
   (The most damaging error in hospitality management due to unrecovered perishable inventory).

Segments error distributions across:
- Hotel type
- Market segment
- Deposit type
- Customer type
- Lead time brackets
- Special requests
"""

from pathlib import Path
from typing import Dict, Any
import logging
import joblib
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

from src.config import (
    MODELS_DIR,
    RESULTS_DIR,
    FIGURES_DIR,
    TABLES_DIR,
    TARGET_COLUMN,
)
from src.utils import setup_visualization_style, save_figure, save_table_csv

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


def run_error_analysis(
    model_name: str = "exp06_pipeb_dt_optimized.joblib",
) -> Dict[str, Any]:
    """
    Perform deep error analysis on the specified trained model.

    Args:
        model_name: Filename of the model to diagnose in models/ directory.

    Returns:
        Summary dictionary with key diagnostic statistics.
    """
    logger.info(f"=== BẮT ĐẦU PHÂN TÍCH LỖI (ERROR ANALYSIS) CHO MÔ HÌNH: {model_name} ===")
    setup_visualization_style()
    FIGURES_DIR.mkdir(parents=True, exist_ok=True)
    TABLES_DIR.mkdir(parents=True, exist_ok=True)

    # 1. Load test set
    cache_path = RESULTS_DIR / "test_set_cache.joblib"
    if not cache_path.exists():
        raise FileNotFoundError(f"Không tìm thấy tập test tại {cache_path}. Hãy chạy train trước!")

    cached = joblib.load(cache_path)
    X_test: pd.DataFrame = cached["X_test"].copy()
    y_test: pd.Series = cached["y_test"].copy()

    # 2. Load model
    model_path = MODELS_DIR / model_name
    if not model_path.exists():
        # Fallback to exp03 if exp06 not yet trained
        model_path = MODELS_DIR / "exp03_pipea_decisiontree.joblib"
    logger.info(f"Đang phân tích mô hình: {model_path}")
    pipeline = joblib.load(model_path)

    # 3. Generate predictions
    y_pred = pipeline.predict(X_test)
    y_proba = None
    if hasattr(pipeline, "predict_proba"):
        try:
            y_proba = pipeline.predict_proba(X_test)[:, 1]
        except Exception:
            pass

    # 4. Construct comprehensive diagnostic dataframe
    diag_df = X_test.copy()
    diag_df["actual"] = y_test.values
    diag_df["predicted"] = y_pred
    if y_proba is not None:
        diag_df["pred_probability"] = y_proba

    # Error classification
    conditions = [
        (diag_df["actual"] == 0) & (diag_df["predicted"] == 0),
        (diag_df["actual"] == 0) & (diag_df["predicted"] == 1),
        (diag_df["actual"] == 1) & (diag_df["predicted"] == 0),
        (diag_df["actual"] == 1) & (diag_df["predicted"] == 1),
    ]
    choices = [
        "True Negative (TN)",
        "False Positive (FP - Báo động giả)",
        "False Negative (FN - Bỏ sót hủy)",
        "True Positive (TP)",
    ]
    diag_df["prediction_category"] = np.select(conditions, choices, default="Unknown")

    total_samples = len(diag_df)
    n_fp = int((diag_df["prediction_category"] == "False Positive (FP - Báo động giả)").sum())
    n_fn = int((diag_df["prediction_category"] == "False Negative (FN - Bỏ sót hủy)").sum())
    n_tp = int((diag_df["prediction_category"] == "True Positive (TP)").sum())
    n_tn = int((diag_df["prediction_category"] == "True Negative (TN)").sum())

    logger.info(
        f"Tổng số mẫu test: {total_samples:,} | "
        f"TN: {n_tn:,} | TP: {n_tp:,} | "
        f"FP: {n_fp:,} ({n_fp/total_samples:.2%}) | "
        f"FN: {n_fn:,} ({n_fn/total_samples:.2%})"
    )

    # --------------------------------------------------------------------------
    # 5. PHÂN TÍCH THEO PHÂN KHÚC NGHIỆP VỤ (SEGMENT ERROR BREAKDOWN)
    # --------------------------------------------------------------------------
    # 5.1. Error breakdown by Hotel Type
    hotel_err = pd.crosstab(
        diag_df["hotel"],
        diag_df["prediction_category"],
        normalize="index",
    ) * 100
    save_table_csv(hotel_err.round(2), "error_breakdown_by_hotel.csv")

    # 5.2. Error breakdown by Market Segment
    market_err = pd.crosstab(
        diag_df["market_segment"],
        diag_df["prediction_category"],
        normalize="index",
    ) * 100
    save_table_csv(market_err.round(2), "error_breakdown_by_market_segment.csv")

    # 5.3. Error breakdown by Deposit Type
    deposit_err = pd.crosstab(
        diag_df["deposit_type"],
        diag_df["prediction_category"],
        normalize="index",
    ) * 100
    save_table_csv(deposit_err.round(2), "error_breakdown_by_deposit_type.csv")

    # 5.4. Error breakdown by Customer Type
    cust_err = pd.crosstab(
        diag_df["customer_type"],
        diag_df["prediction_category"],
        normalize="index",
    ) * 100
    save_table_csv(cust_err.round(2), "error_breakdown_by_customer_type.csv")

    # --------------------------------------------------------------------------
    # 6. TRỰC QUAN HÓA PHÂN TÍCH LỖI
    # --------------------------------------------------------------------------
    fig, axes = plt.subplots(2, 2, figsize=(14, 10))

    # Plot 1: Error rate by hotel
    hotel_raw = pd.crosstab(diag_df["hotel"], diag_df["prediction_category"])
    hotel_raw[["False Positive (FP - Báo động giả)", "False Negative (FN - Bỏ sót hủy)"]].plot(
        kind="bar",
        color=["#f0ad4e", "#d9534f"],
        ax=axes[0, 0],
    )
    axes[0, 0].set_title("Số lượng lỗi FP và FN theo loại khách sạn", fontsize=11, fontweight="bold")
    axes[0, 0].set_ylabel("Số lượng mẫu lỗi")
    axes[0, 0].set_xlabel("Loại khách sạn")
    axes[0, 0].tick_params(axis="x", rotation=0)

    # Plot 2: Error rate by market segment
    market_raw = pd.crosstab(diag_df["market_segment"], diag_df["prediction_category"])
    top_segments = diag_df["market_segment"].value_counts().head(5).index
    market_raw.loc[top_segments, ["False Positive (FP - Báo động giả)", "False Negative (FN - Bỏ sót hủy)"]].plot(
        kind="bar",
        color=["#f0ad4e", "#d9534f"],
        ax=axes[0, 1],
    )
    axes[0, 1].set_title("Số lượng lỗi FP và FN theo phân khúc thị trường (Top 5)", fontsize=11, fontweight="bold")
    axes[0, 1].set_ylabel("Số lượng mẫu lỗi")
    axes[0, 1].tick_params(axis="x", rotation=25)

    # Plot 3: Distribution of Lead Time among Error Groups
    sns.boxplot(
        data=diag_df,
        x="prediction_category",
        y="lead_time",
        palette=["#337ab7", "#f0ad4e", "#d9534f", "#5cb85c"],
        ax=axes[1, 0],
    )
    axes[1, 0].set_title("Phân phối thời gian đặt trước (Lead Time) theo từng nhóm kết quả", fontsize=11, fontweight="bold")
    axes[1, 0].set_ylabel("Lead Time (Số ngày)")
    axes[1, 0].set_xlabel("")
    axes[1, 0].tick_params(axis="x", rotation=20)

    # Plot 4: Special requests vs Error Groups
    spec_err = pd.crosstab(
        diag_df["total_of_special_requests"],
        diag_df["prediction_category"],
        normalize="index",
    ) * 100
    spec_err[["False Positive (FP - Báo động giả)", "False Negative (FN - Bỏ sót hủy)"]].plot(
        kind="bar",
        color=["#f0ad4e", "#d9534f"],
        ax=axes[1, 1],
    )
    axes[1, 1].set_title("Tỷ lệ lỗi (%) theo số lượng yêu cầu đặc biệt", fontsize=11, fontweight="bold")
    axes[1, 1].set_ylabel("Tỷ lệ (%)")
    axes[1, 1].set_xlabel("Số lượng yêu cầu đặc biệt")
    axes[1, 1].tick_params(axis="x", rotation=0)

    plt.tight_layout()
    save_figure(fig, "error_analysis_breakdown.png")
    plt.close(fig)

    # --------------------------------------------------------------------------
    # 7. PHÂN TÍCH SÂU TẬP CON FALSE NEGATIVE (BỎ SÓT NGUY CƠ HỦY)
    # --------------------------------------------------------------------------
    fn_subset = diag_df[diag_df["prediction_category"] == "False Negative (FN - Bỏ sót hủy)"]
    tp_subset = diag_df[diag_df["prediction_category"] == "True Positive (TP)"]

    fn_summary = {
        "FN_total_count": len(fn_subset),
        "FN_mean_lead_time": float(round(fn_subset["lead_time"].mean(), 2)),
        "TP_mean_lead_time": float(round(tp_subset["lead_time"].mean(), 2)),
        "FN_zero_special_requests_pct": float(round((fn_subset["total_of_special_requests"] == 0).mean() * 100, 2)),
        "FN_city_hotel_pct": float(round((fn_subset["hotel"] == "City Hotel").mean() * 100, 2)),
    }

    logger.info(f"Đặc điểm cốt lõi của các ca False Negative: {fn_summary}")
    save_table_csv(pd.DataFrame([fn_summary]), "error_analysis_fn_profile.csv")

    logger.info("=== HOÀN THÀNH TOÀN DIỆN PHÂN TÍCH LỖI! ===")
    return {
        "n_samples": total_samples,
        "n_fp": n_fp,
        "n_fn": n_fn,
        "n_tp": n_tp,
        "n_tn": n_tn,
        "fn_summary": fn_summary,
    }


if __name__ == "__main__":
    run_error_analysis()
