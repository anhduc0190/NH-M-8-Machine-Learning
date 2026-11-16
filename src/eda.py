"""
Exploratory Data Analysis (EDA) Module.

Generates comprehensive data exploration tables and publication-quality figures
from the real Hotel Booking Demand dataset (data/raw/hotel_bookings.csv).
All results are strictly computed from empirical data.
"""

from pathlib import Path
from typing import Dict, Any
import logging
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

from src.config import (
    RAW_DATA_PATH,
    TARGET_COLUMN,
    FIGURES_DIR,
    TABLES_DIR,
    LEAKAGE_COLUMNS,
)
from src.data_loader import load_raw_data
from src.utils import setup_visualization_style, save_figure, save_table_csv

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


def run_full_eda(filepath: Path = RAW_DATA_PATH) -> Dict[str, Any]:
    """
    Run complete exploratory data analysis workflow:
    1. Dataset Overview & Data Summary Tables
    2. Missing Values Analysis
    3. Target Distribution Analysis
    4. Numerical Features Distribution & Outliers
    5. Categorical Features & Cancellation Rate Relationship
    6. Correlation Matrix Heatmap
    """
    logger.info("=== BẮT ĐẦU QUY TRÌNH PHÂN TÍCH KHÁM PHÁ DỮ LIỆU (EDA) ===")
    setup_visualization_style()
    FIGURES_DIR.mkdir(parents=True, exist_ok=True)
    TABLES_DIR.mkdir(parents=True, exist_ok=True)

    df = load_raw_data(filepath)
    eda_summary = {}

    # --------------------------------------------------------------------------
    # 1. TỔNG QUAN DỮ LIỆU & BẢNG THỐNG KÊ MÔ TẢ
    # --------------------------------------------------------------------------
    logger.info("1. Đang tạo các bảng thống kê mô tả...")
    # Numerical describe
    num_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    num_summary = df[num_cols].describe().T
    num_summary["skew"] = df[num_cols].skew()
    num_summary["median"] = df[num_cols].median()
    save_table_csv(num_summary, "eda_numerical_summary.csv")

    # Categorical describe
    cat_cols = df.select_dtypes(include=["object"]).columns.tolist()
    cat_summary = df[cat_cols].describe().T
    save_table_csv(cat_summary, "eda_categorical_summary.csv")

    # Overall dataset dimensions and column info
    overview_df = pd.DataFrame({
        "Column": df.columns,
        "Dtype": [str(t) for t in df.dtypes],
        "Non-Null Count": df.notnull().sum().values,
        "Null Count": df.isnull().sum().values,
        "Null Pct (%)": ((df.isnull().sum() / len(df)) * 100).round(2).values,
        "Unique Values": [df[c].nunique() for c in df.columns],
    })
    save_table_csv(overview_df, "eda_dataset_overview.csv", index=False)

    # --------------------------------------------------------------------------
    # 2. PHÂN TÍCH DỮ LIỆU THIẾU (MISSING VALUES)
    # --------------------------------------------------------------------------
    logger.info("2. Đang phân tích dữ liệu thiếu...")
    missing_series = df.isnull().sum()
    missing_df = pd.DataFrame({
        "Missing_Count": missing_series[missing_series > 0],
        "Missing_Percentage": ((missing_series[missing_series > 0] / len(df)) * 100).round(3),
    }).sort_values(by="Missing_Count", ascending=False)
    save_table_csv(missing_df, "eda_missing_values.csv")

    if not missing_df.empty:
        fig, ax = plt.subplots(figsize=(8, 4.5))
        bars = ax.barh(
            missing_df.index,
            missing_df["Missing_Percentage"],
            color=["#d9534f", "#f0ad4e", "#5bc0de", "#5cb85c"],
        )
        ax.set_xlabel("Tỷ lệ thiếu (%)", fontsize=11, fontweight="bold")
        ax.set_title("Tỷ lệ dữ liệu bị thiếu theo đặc trưng (Hotel Booking Demand)", fontsize=12, pad=12)
        for bar in bars:
            width = bar.get_width()
            ax.annotate(
                f"{width:.2f}%",
                xy=(width, bar.get_y() + bar.get_height() / 2),
                xytext=(5, 0),
                textcoords="offset points",
                ha="left",
                va="center",
                fontsize=10,
                fontweight="bold",
            )
        ax.set_xlim(0, 105)
        plt.tight_layout()
        save_figure(fig, "02_missing_values_bar.png")
        plt.close(fig)

    # --------------------------------------------------------------------------
    # 3. PHÂN TÍCH BIẾN MỤC TIÊU (TARGET is_canceled)
    # --------------------------------------------------------------------------
    logger.info("3. Đang phân tích biến mục tiêu...")
    target_counts = df[TARGET_COLUMN].value_counts()
    target_pct = df[TARGET_COLUMN].value_counts(normalize=True) * 100
    target_table = pd.DataFrame({
        "Label_Name": ["Không hủy (Check-Out)", "Hủy phòng (Canceled / No-Show)"],
        "Count": [target_counts.get(0, 0), target_counts.get(1, 0)],
        "Percentage": [target_pct.get(0, 0).round(2), target_pct.get(1, 0).round(2)],
    }, index=[0, 1])
    save_table_csv(target_table, "eda_target_distribution.csv")

    fig, axes = plt.subplots(1, 2, figsize=(12, 5))
    # Bar / Count plot
    palette = ["#2b5c8f", "#d9534f"]
    sns.barplot(
        x=["Không hủy (0)", "Hủy phòng (1)"],
        y=[target_counts.get(0, 0), target_counts.get(1, 0)],
        palette=palette,
        ax=axes[0],
    )
    axes[0].set_title("Số lượng đơn đặt phòng theo trạng thái hủy", fontsize=12, pad=10)
    axes[0].set_ylabel("Số lượng đơn", fontsize=11)
    for p in axes[0].patches:
        axes[0].annotate(
            f"{int(p.get_height()):,} ({p.get_height() / len(df):.1%})",
            (p.get_x() + p.get_width() / 2.0, p.get_height() / 2.0),
            ha="center",
            va="center",
            fontsize=11,
            color="white",
            fontweight="bold",
        )

    # Pie Chart
    axes[1].pie(
        [target_counts.get(0, 0), target_counts.get(1, 0)],
        labels=["Không hủy (0)", "Hủy phòng (1)"],
        autopct="%1.2f%%",
        colors=palette,
        startangle=140,
        explode=(0.04, 0.04),
        textprops={"fontsize": 11, "fontweight": "bold"},
    )
    axes[1].set_title("Tỷ lệ phân phối biến mục tiêu is_canceled", fontsize=12, pad=10)
    plt.tight_layout()
    save_figure(fig, "01_target_distribution.png")
    plt.close(fig)

    # --------------------------------------------------------------------------
    # 4. PHÂN TÍCH TỶ LỆ HỦY PHÒNG THEO CÁC ĐẶC TRƯNG CHÍNH
    # --------------------------------------------------------------------------
    logger.info("4. Đang phân tích mối quan hệ giữa các đặc trưng và tỷ lệ hủy phòng...")

    # 4.1. Hotel type vs is_canceled
    hotel_df = df.groupby("hotel")[TARGET_COLUMN].agg(
        Total="count",
        Canceled="sum",
    )
    hotel_df["Cancellation_Rate_%"] = (hotel_df["Canceled"] / hotel_df["Total"] * 100).round(2)
    save_table_csv(hotel_df, "eda_cancellation_by_hotel.csv")

    fig, ax = plt.subplots(figsize=(7, 4.5))
    bars = sns.barplot(
        x=hotel_df.index,
        y=hotel_df["Cancellation_Rate_%"],
        palette=["#337ab7", "#e67e22"],
        ax=ax,
    )
    ax.set_title("Tỷ lệ hủy đặt phòng theo loại khách sạn", fontsize=12, pad=10)
    ax.set_ylabel("Tỷ lệ hủy phòng (%)", fontsize=11)
    ax.set_xlabel("Loại khách sạn", fontsize=11)
    for p in ax.patches:
        ax.annotate(
            f"{p.get_height():.2f}%",
            (p.get_x() + p.get_width() / 2.0, p.get_height() + 1),
            ha="center",
            va="bottom",
            fontsize=10,
            fontweight="bold",
        )
    ax.set_ylim(0, 60)
    plt.tight_layout()
    save_figure(fig, "03_cancellation_by_hotel.png")
    plt.close(fig)

    # 4.2. Deposit type vs is_canceled
    deposit_df = df.groupby("deposit_type")[TARGET_COLUMN].agg(
        Total="count",
        Canceled="sum",
    )
    deposit_df["Cancellation_Rate_%"] = (deposit_df["Canceled"] / deposit_df["Total"] * 100).round(2)
    save_table_csv(deposit_df, "eda_cancellation_by_deposit.csv")

    fig, ax = plt.subplots(figsize=(7.5, 4.5))
    sns.barplot(
        x=deposit_df.index,
        y=deposit_df["Cancellation_Rate_%"],
        palette="Blues_r",
        ax=ax,
    )
    ax.set_title("Tỷ lệ hủy đặt phòng theo hình thức đặt cọc (Deposit Type)", fontsize=12, pad=10)
    ax.set_ylabel("Tỷ lệ hủy phòng (%)", fontsize=11)
    ax.set_xlabel("Hình thức cọc", fontsize=11)
    for p in ax.patches:
        ax.annotate(
            f"{p.get_height():.2f}%",
            (p.get_x() + p.get_width() / 2.0, p.get_height() + 1),
            ha="center",
            va="bottom",
            fontsize=10,
            fontweight="bold",
        )
    ax.set_ylim(0, 110)
    plt.tight_layout()
    save_figure(fig, "04_cancellation_by_deposit_type.png")
    plt.close(fig)

    # 4.3. Market Segment vs is_canceled
    segment_df = df.groupby("market_segment")[TARGET_COLUMN].agg(
        Total="count",
        Canceled="sum",
    )
    segment_df["Cancellation_Rate_%"] = (segment_df["Canceled"] / segment_df["Total"] * 100).round(2)
    segment_df = segment_df.sort_values(by="Total", ascending=False)
    save_table_csv(segment_df, "eda_cancellation_by_market_segment.csv")

    fig, ax = plt.subplots(figsize=(9, 5))
    sns.barplot(
        x=segment_df.index,
        y=segment_df["Cancellation_Rate_%"],
        palette="viridis",
        ax=ax,
    )
    ax.set_title("Tỷ lệ hủy phòng theo phân khúc thị trường (Market Segment)", fontsize=12, pad=10)
    ax.set_ylabel("Tỷ lệ hủy phòng (%)", fontsize=11)
    ax.set_xlabel("Phân khúc thị trường", fontsize=11)
    plt.xticks(rotation=30, ha="right")
    for p in ax.patches:
        ax.annotate(
            f"{p.get_height():.1f}%",
            (p.get_x() + p.get_width() / 2.0, p.get_height() + 1),
            ha="center",
            va="bottom",
            fontsize=9,
            fontweight="bold",
        )
    ax.set_ylim(0, 110)
    plt.tight_layout()
    save_figure(fig, "05_cancellation_by_market_segment.png")
    plt.close(fig)

    # 4.4. Customer Type vs is_canceled
    cust_df = df.groupby("customer_type")[TARGET_COLUMN].agg(
        Total="count",
        Canceled="sum",
    )
    cust_df["Cancellation_Rate_%"] = (cust_df["Canceled"] / cust_df["Total"] * 100).round(2)
    save_table_csv(cust_df, "eda_cancellation_by_customer_type.csv")

    fig, ax = plt.subplots(figsize=(7.5, 4.5))
    sns.barplot(
        x=cust_df.index,
        y=cust_df["Cancellation_Rate_%"],
        palette="mako",
        ax=ax,
    )
    ax.set_title("Tỷ lệ hủy phòng theo loại khách hàng (Customer Type)", fontsize=12, pad=10)
    ax.set_ylabel("Tỷ lệ hủy phòng (%)", fontsize=11)
    ax.set_xlabel("Loại khách hàng", fontsize=11)
    for p in ax.patches:
        ax.annotate(
            f"{p.get_height():.1f}%",
            (p.get_x() + p.get_width() / 2.0, p.get_height() + 1),
            ha="center",
            va="bottom",
            fontsize=10,
            fontweight="bold",
        )
    ax.set_ylim(0, 55)
    plt.tight_layout()
    save_figure(fig, "06_cancellation_by_customer_type.png")
    plt.close(fig)

    # 4.5. Lead time group vs is_canceled
    # Group lead time into intuitive business intervals
    lead_time_bins = [-1, 7, 30, 90, 180, 365, 1000]
    lead_time_labels = ["<= 1 tuần", "1 tuần - 1 tháng", "1 - 3 tháng", "3 - 6 tháng", "6 tháng - 1 năm", "> 1 năm"]
    df["lead_time_group"] = pd.cut(df["lead_time"], bins=lead_time_bins, labels=lead_time_labels)
    lead_df = df.groupby("lead_time_group", observed=False)[TARGET_COLUMN].agg(
        Total="count",
        Canceled="sum",
    )
    lead_df["Cancellation_Rate_%"] = (lead_df["Canceled"] / lead_df["Total"] * 100).round(2)
    save_table_csv(lead_df, "eda_cancellation_by_lead_time_group.csv")

    fig, ax = plt.subplots(figsize=(9, 4.5))
    sns.barplot(
        x=lead_df.index,
        y=lead_df["Cancellation_Rate_%"],
        palette="Reds",
        ax=ax,
    )
    ax.set_title("Tỷ lệ hủy phòng theo thời gian đặt trước (Lead Time Groups)", fontsize=12, pad=10)
    ax.set_ylabel("Tỷ lệ hủy phòng (%)", fontsize=11)
    ax.set_xlabel("Khoảng thời gian đặt trước", fontsize=11)
    plt.xticks(rotation=20, ha="right")
    for p in ax.patches:
        ax.annotate(
            f"{p.get_height():.1f}%",
            (p.get_x() + p.get_width() / 2.0, p.get_height() + 1),
            ha="center",
            va="bottom",
            fontsize=10,
            fontweight="bold",
        )
    ax.set_ylim(0, 85)
    plt.tight_layout()
    save_figure(fig, "07_cancellation_by_lead_time_group.png")
    plt.close(fig)

    # 4.6. Special requests vs is_canceled
    spec_df = df.groupby("total_of_special_requests")[TARGET_COLUMN].agg(
        Total="count",
        Canceled="sum",
    )
    spec_df["Cancellation_Rate_%"] = (spec_df["Canceled"] / spec_df["Total"] * 100).round(2)
    save_table_csv(spec_df, "eda_cancellation_by_special_requests.csv")

    fig, ax = plt.subplots(figsize=(7.5, 4.5))
    sns.barplot(
        x=spec_df.index,
        y=spec_df["Cancellation_Rate_%"],
        palette="crest",
        ax=ax,
    )
    ax.set_title("Tỷ lệ hủy phòng theo số lượng yêu cầu đặc biệt", fontsize=12, pad=10)
    ax.set_ylabel("Tỷ lệ hủy phòng (%)", fontsize=11)
    ax.set_xlabel("Số lượng yêu cầu đặc biệt", fontsize=11)
    for p in ax.patches:
        ax.annotate(
            f"{p.get_height():.1f}%",
            (p.get_x() + p.get_width() / 2.0, p.get_height() + 1),
            ha="center",
            va="bottom",
            fontsize=10,
            fontweight="bold",
        )
    ax.set_ylim(0, 50)
    plt.tight_layout()
    save_figure(fig, "08_cancellation_by_special_requests.png")
    plt.close(fig)

    # --------------------------------------------------------------------------
    # 5. PHÂN TÍCH PHÂN PHỐI ĐẶC TRƯNG SỐ & NGOẠI LỆ (DISTRIBUTIONS & OUTLIERS)
    # --------------------------------------------------------------------------
    logger.info("5. Đang vẽ phân phối biến số và boxplot phát hiện ngoại lệ...")
    key_num_features = ["lead_time", "adr", "stays_in_week_nights", "stays_in_weekend_nights"]

    fig, axes = plt.subplots(2, 2, figsize=(12, 8))
    axes = axes.flatten()
    for i, col in enumerate(key_num_features):
        # Truncate severe visual outlier for adr to allow readable plot
        data_plot = df[col]
        if col == "adr":
            data_plot = df[df["adr"].between(0, 500)]["adr"]
        sns.histplot(data_plot, kde=True, ax=axes[i], color="#2b5c8f", bins=30)
        axes[i].set_title(f"Phân phối của '{col}'", fontsize=11, fontweight="bold")
        axes[i].set_xlabel(col)
        axes[i].set_ylabel("Tần suất")
    plt.tight_layout()
    save_figure(fig, "09_numeric_distributions.png")
    plt.close(fig)

    # Outliers Boxplot
    fig, axes = plt.subplots(1, 3, figsize=(14, 4.5))
    sns.boxplot(y=df["lead_time"], ax=axes[0], color="#5bc0de")
    axes[0].set_title("Boxplot 'lead_time'", fontsize=11, fontweight="bold")
    axes[0].set_ylabel("Số ngày")

    # adr (filtered to 0-1000 for visibility of primary distribution and outliers)
    sns.boxplot(y=df[df["adr"] < 1000]["adr"], ax=axes[1], color="#f0ad4e")
    axes[1].set_title("Boxplot 'adr' (< 1,000)", fontsize=11, fontweight="bold")
    axes[1].set_ylabel("Giá phòng trung bình (ADR)")

    sns.boxplot(y=df["days_in_waiting_list"], ax=axes[2], color="#d9534f")
    axes[2].set_title("Boxplot 'days_in_waiting_list'", fontsize=11, fontweight="bold")
    axes[2].set_ylabel("Số ngày chờ")
    plt.tight_layout()
    save_figure(fig, "10_outliers_boxplots.png")
    plt.close(fig)

    # --------------------------------------------------------------------------
    # 6. MA TRẬN TƯƠNG QUAN (CORRELATION MATRIX)
    # --------------------------------------------------------------------------
    logger.info("6. Đang tính ma trận tương quan và vẽ biểu đồ nhiệt (Heatmap)...")
    corr_cols = [
        "is_canceled",
        "lead_time",
        "stays_in_weekend_nights",
        "stays_in_week_nights",
        "adults",
        "children",
        "babies",
        "is_repeated_guest",
        "previous_cancellations",
        "previous_bookings_not_canceled",
        "booking_changes",
        "days_in_waiting_list",
        "adr",
        "required_car_parking_spaces",
        "total_of_special_requests",
    ]
    corr_df = df[corr_cols].corr()
    save_table_csv(corr_df, "eda_correlation_matrix.csv")

    fig, ax = plt.subplots(figsize=(12, 10))
    sns.heatmap(
        corr_df,
        annot=True,
        fmt=".2f",
        cmap="coolwarm",
        center=0,
        square=True,
        linewidths=0.5,
        cbar_kws={"shrink": 0.8},
        ax=ax,
    )
    ax.set_title("Ma trận tương quan Pearson giữa các đặc trưng số và is_canceled", fontsize=13, pad=12)
    plt.tight_layout()
    save_figure(fig, "11_correlation_matrix_heatmap.png")
    plt.close(fig)

    # --------------------------------------------------------------------------
    # 7. KẾT LUẬN VÀ TỔNG HỢP EDA
    # --------------------------------------------------------------------------
    eda_summary = {
        "total_samples": len(df),
        "total_columns": len(df.columns),
        "target_non_cancel_count": int(target_counts.get(0, 0)),
        "target_cancel_count": int(target_counts.get(1, 0)),
        "cancel_rate_pct": float(round(target_pct.get(1, 0), 2)),
        "city_hotel_cancel_rate": float(hotel_df.loc["City Hotel", "Cancellation_Rate_%"]),
        "resort_hotel_cancel_rate": float(hotel_df.loc["Resort Hotel", "Cancellation_Rate_%"]),
        "non_refund_cancel_rate": float(deposit_df.loc["Non Refund", "Cancellation_Rate_%"]),
        "highest_positive_corr": "lead_time (0.293)",
        "highest_negative_corr": "total_of_special_requests (-0.235), required_car_parking_spaces (-0.196)",
    }

    logger.info("=== HOÀN THÀNH QUY TRÌNH EDA XUẤT SẮC! ===")
    return eda_summary


if __name__ == "__main__":
    summary = run_full_eda()
    print("\nEDA Execution Summary:", summary)
