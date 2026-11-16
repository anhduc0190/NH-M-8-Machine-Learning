"""
Data Loader Module for Hotel Booking Cancellation Prediction.

Responsible for safely loading the raw dataset, validating file presence,
preventing target/temporal leakage by removing forbidden columns,
and performing stratified train-test splits with fixed seeds.
"""

from pathlib import Path
from typing import Optional, Tuple
import logging
import pandas as pd
from sklearn.model_selection import train_test_split

from src.config import (
    RAW_DATA_PATH,
    TARGET_COLUMN,
    LEAKAGE_COLUMNS,
    RANDOM_STATE,
    TEST_SIZE,
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


def load_raw_data(filepath: Optional[Path] = None) -> pd.DataFrame:
    """
    Load raw hotel bookings dataset from CSV.

    Args:
        filepath: Path to hotel_bookings.csv. If None, defaults to RAW_DATA_PATH.

    Returns:
        pd.DataFrame containing the raw dataset.

    Raises:
        FileNotFoundError: If the CSV file does not exist at the specified path.
    """
    target_path = Path(filepath) if filepath else RAW_DATA_PATH

    if not target_path.exists():
        error_msg = (
            f"\n[DATA ERROR] Không tìm thấy tệp dữ liệu tại: '{target_path.resolve()}'\n"
            "Vui lòng tải bộ dữ liệu 'Hotel Booking Demand' từ Kaggle:\n"
            "  URL: https://www.kaggle.com/datasets/jessemostipak/hotel-booking-demand\n"
            f"Và đặt file 'hotel_bookings.csv' vào đúng thư mục: '{target_path.parent.resolve()}'\n"
        )
        logger.error(error_msg)
        raise FileNotFoundError(error_msg)

    logger.info(f"Đang đọc dữ liệu từ: {target_path}")
    df = pd.read_csv(target_path)
    logger.info(
        f"Đọc dữ liệu thành công! Kích thước: {df.shape[0]:,} dòng x {df.shape[1]} cột. "
        f"Bộ nhớ ước tính: {df.memory_usage().sum() / (1024 * 1024):.2f} MB"
    )
    return df


def load_features_and_target(
    filepath: Optional[Path] = None, drop_leakage: bool = True
) -> Tuple[pd.DataFrame, pd.Series]:
    """
    Load dataset and separate features X and target y.
    Strictly removes target and temporal leakage columns.

    Args:
        filepath: Path to CSV file.
        drop_leakage: Whether to drop reservation_status and reservation_status_date.

    Returns:
        Tuple of (X, y):
            - X (pd.DataFrame): Input features.
            - y (pd.Series): Binary target 'is_canceled'.
    """
    df = load_raw_data(filepath=filepath)

    if TARGET_COLUMN not in df.columns:
        raise KeyError(
            f"Cột mục tiêu '{TARGET_COLUMN}' không tồn tại trong bộ dữ liệu! "
            f"Các cột hiện có: {list(df.columns)}"
        )

    # Separate target
    y = df[TARGET_COLUMN].copy()
    X = df.drop(columns=[TARGET_COLUMN]).copy()

    # Data Leakage Prevention
    if drop_leakage:
        cols_to_drop = [col for col in LEAKAGE_COLUMNS if col in X.columns]
        if cols_to_drop:
            logger.info(
                f"[CHỐNG DATA LEAKAGE] Loại bỏ các cột gây rò rỉ thông tin tương lai: {cols_to_drop}"
            )
            X = X.drop(columns=cols_to_drop)

    return X, y


def get_train_test_split(
    X: pd.DataFrame,
    y: pd.Series,
    test_size: float = TEST_SIZE,
    random_state: int = RANDOM_STATE,
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.Series, pd.Series]:
    """
    Perform stratified train-test split to preserve target class distribution.

    Args:
        X: Feature matrix.
        y: Target series.
        test_size: Proportion of test data (default 0.20 = 20%).
        random_state: Fixed random seed for exact reproducibility.

    Returns:
        X_train, X_test, y_train, y_test
    """
    logger.info(
        f"Phân chia Train/Test: {1 - test_size:.0%} Train, {test_size:.0%} Test "
        f"(stratify=y, seed={random_state})"
    )
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=test_size,
        random_state=random_state,
        stratify=y,
    )
    logger.info(
        f"Kích thước tập huấn luyện (Train): {X_train.shape[0]:,} mẫu | "
        f"Tập kiểm thử (Test): {X_test.shape[0]:,} mẫu"
    )
    return X_train, X_test, y_train, y_test
