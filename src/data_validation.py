"""
Data Validation Module for Hotel Booking Demand Dataset.

Performs rigorous initial validation:
1. File existence and integrity checks.
2. Shape, column schemas, and data types.
3. Target column verification and class balance.
4. Identification of missing values and anomaly scans (e.g. negative ADR).
5. Data leakage risk identification.
"""

from pathlib import Path
from typing import Dict, Any
import json
import logging
import pandas as pd
import numpy as np

from src.config import (
    RAW_DATA_PATH,
    TARGET_COLUMN,
    LEAKAGE_COLUMNS,
    TABLES_DIR,
)
from src.data_loader import load_raw_data

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


def validate_raw_dataset(filepath: Path = RAW_DATA_PATH) -> Dict[str, Any]:
    """
    Execute comprehensive data validation on the raw CSV file.

    Args:
        filepath: Path to raw CSV file.

    Returns:
        Dict containing validation metrics and summary findings.
    """
    logger.info("=== BẮT ĐẦU KIỂM TRA TÍNH TOÀN VẸN CỦA DỮ LIỆU THÔ ===")

    # 1. Check file existence and size
    if not filepath.exists():
        raise FileNotFoundError(f"Tệp không tồn tại tại: {filepath}")

    file_size_bytes = filepath.stat().st_size
    file_size_mb = file_size_bytes / (1024 * 1024)

    # 2. Read dataset
    df = load_raw_data(filepath)
    n_rows, n_cols = df.shape

    # 3. Check target column
    target_exists = TARGET_COLUMN in df.columns
    target_summary = {}
    if target_exists:
        counts = df[TARGET_COLUMN].value_counts().to_dict()
        proportions = df[TARGET_COLUMN].value_counts(normalize=True).to_dict()
        target_summary = {
            "counts": {str(k): int(v) for k, v in counts.items()},
            "proportions": {str(k): float(round(v, 4)) for k, v in proportions.items()},
        }

    # 4. Check data leakage columns
    leakage_detected = [col for col in LEAKAGE_COLUMNS if col in df.columns]

    # 5. Missing values scan
    missing_counts = df.isnull().sum()
    missing_cols = missing_counts[missing_counts > 0].to_dict()
    missing_pct = {
        col: float(round((cnt / n_rows) * 100, 2)) for col, cnt in missing_cols.items()
    }

    # 6. Duplicates scan
    n_duplicates = int(df.duplicated().sum())
    duplicate_pct = float(round((n_duplicates / n_rows) * 100, 2))

    # 7. Check anomalous business values
    anomalies = {}
    # ADR (Average Daily Rate) negative or extreme
    if "adr" in df.columns:
        neg_adr = int((df["adr"] < 0).sum())
        zero_adr = int((df["adr"] == 0).sum())
        max_adr = float(df["adr"].max())
        anomalies["adr_negative"] = neg_adr
        anomalies["adr_zero"] = zero_adr
        anomalies["adr_max"] = max_adr

    # Zero total guests (adults + children + babies == 0)
    guest_cols = [c for c in ["adults", "children", "babies"] if c in df.columns]
    if len(guest_cols) == 3:
        zero_guests = int((df[guest_cols].fillna(0).sum(axis=1) == 0).sum())
        anomalies["zero_total_guests"] = zero_guests

    report: Dict[str, Any] = {
        "file_path": str(filepath.resolve()),
        "file_size_bytes": file_size_bytes,
        "file_size_mb": round(file_size_mb, 2),
        "total_rows": n_rows,
        "total_columns": n_cols,
        "column_names": list(df.columns),
        "column_dtypes": {col: str(dtype) for col, dtype in df.dtypes.items()},
        "target_column": TARGET_COLUMN,
        "target_exists": target_exists,
        "target_distribution": target_summary,
        "leakage_columns_present": leakage_detected,
        "missing_columns_count": missing_cols,
        "missing_columns_percentage": missing_pct,
        "duplicate_rows": n_duplicates,
        "duplicate_percentage": duplicate_pct,
        "domain_anomalies": anomalies,
    }

    # Save summary report to reports/tables
    TABLES_DIR.mkdir(parents=True, exist_ok=True)
    report_path = TABLES_DIR / "data_validation_report.json"
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2, ensure_ascii=False)

    logger.info(f"Báo cáo kiểm tra đã được lưu tại: {report_path}")
    _print_validation_summary(report)

    return report


def _print_validation_summary(report: Dict[str, Any]) -> None:
    """Print a clean human-readable summary to console."""
    print("\n" + "=" * 70)
    print("           KẾT QUẢ KIỂM TRA BỘ DỮ LIỆU HOTEL BOOKINGS")
    print("=" * 70)
    print(f"File: {report['file_path']}")
    print(f"Kích thước file : {report['file_size_mb']} MB ({report['file_size_bytes']:,} bytes)")
    print(f"Số lượng dòng   : {report['total_rows']:,}")
    print(f"Số lượng cột    : {report['total_columns']}")
    print(f"Biến mục tiêu   : '{report['target_column']}' (Tồn tại: {report['target_exists']})")
    if report["target_exists"]:
        dist = report["target_distribution"]["proportions"]
        counts = report["target_distribution"]["counts"]
        print(f"  - Lớp 0 (Không hủy) : {counts.get('0', 0):,} ({dist.get('0', 0):.2%})")
        print(f"  - Lớp 1 (Hủy phòng) : {counts.get('1', 0):,} ({dist.get('1', 0):.2%})")

    print(f"\nCột gây rò rỉ dữ liệu (Data Leakage Risk): {report['leakage_columns_present']}")
    print(f"Số dòng trùng lặp : {report['duplicate_rows']:,} ({report['duplicate_percentage']}%)")

    print("\nCác cột bị thiếu dữ liệu (Missing Values):")
    if not report["missing_columns_count"]:
        print("  Không có cột nào thiếu dữ liệu!")
    else:
        for col, count in report["missing_columns_count"].items():
            pct = report["missing_columns_percentage"][col]
            print(f"  - {col:<25}: {count:>6,} mẫu ({pct:>5.2f}%)")

    print("\nCác quan sát bất thường về nghiệp vụ (Domain Anomalies):")
    for k, v in report["domain_anomalies"].items():
        print(f"  - {k:<25}: {v}")
    print("=" * 70 + "\n")


if __name__ == "__main__":
    validate_raw_dataset()
