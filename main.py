"""
Main Entry Point for Hotel Booking Cancellation Prediction Project.

Supports CLI commands to run project stages:
- validate: Run data validation and check integrity of hotel_bookings.csv
- eda: Generate exploratory data analysis tables and figures
- train: Train baseline, KNN, and Decision Tree on Pipelines A & B
- evaluate: Evaluate models on test set and output comparison metrics
- error-analysis: Run FP/FN in-depth error analysis
- all: Execute complete pipeline sequentially
"""

import argparse
import sys
import logging

from src.data_validation import validate_raw_dataset

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Hotel Booking Cancellation Prediction CLI Workflow"
    )
    parser.add_argument(
        "--mode",
        choices=["validate", "eda", "train", "evaluate", "error-analysis", "all"],
        default="validate",
        help="Pipeline stage to execute (default: validate)",
    )

    args = parser.parse_args()

    logger.info(f"Khởi chạy hệ thống Hotel Booking Prediction với chế độ: '{args.mode}'")

    if args.mode == "validate":
        validate_raw_dataset()
    elif args.mode == "eda":
        from src.eda import run_full_eda
        run_full_eda()
    elif args.mode == "train":
        from src.train import train_and_cross_validate_all
        train_and_cross_validate_all()
    elif args.mode == "evaluate":
        from src.evaluate import evaluate_all_models_on_test
        evaluate_all_models_on_test()
    elif args.mode == "error-analysis":
        from src.error_analysis import run_error_analysis
        run_error_analysis()
    elif args.mode == "all":
        logger.info("Chạy toàn bộ quy trình từ đầu đến cuối...")
        from src.data_validation import validate_raw_dataset
        from src.eda import run_full_eda
        from src.train import train_and_cross_validate_all
        from src.evaluate import evaluate_all_models_on_test
        from src.error_analysis import run_error_analysis

        validate_raw_dataset()
        run_full_eda()
        train_and_cross_validate_all()
        evaluate_all_models_on_test()
        run_error_analysis()


if __name__ == "__main__":
    main()
