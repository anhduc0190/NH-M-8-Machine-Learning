"""
Model Training Module for Hotel Booking Cancellation Prediction.

Executes experiments strictly adhering to course requirements:
- EXP01: Baseline Model (DummyClassifier)
- EXP02: Pipeline A + K-Nearest Neighbors (KNN)
- EXP03: Pipeline A + Decision Tree
- EXP04: Pipeline B + K-Nearest Neighbors (KNN)
- EXP05: Pipeline B + Decision Tree (with class_weight)
- EXP06: Pipeline B + Optimized Decision Tree (Tuned Hyperparameters)

Supports 5-fold Stratified Cross-Validation on training data and serializes
trained pipelines to `models/`.
"""

from pathlib import Path
from typing import Dict, Any
import time
import logging
import joblib
import pandas as pd
from sklearn.dummy import DummyClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import StratifiedKFold, cross_validate

from src.config import (
    MODELS_DIR,
    RESULTS_DIR,
    RANDOM_STATE,
    CV_FOLDS,
)
from src.data_loader import load_features_and_target, get_train_test_split
from src.preprocessing import build_full_model_pipeline
from src.utils import save_table_csv

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


def get_experiment_definitions() -> Dict[str, Dict[str, Any]]:
    """Define dictionary of machine learning experiment configurations."""
    return {
        "EXP01_Baseline_Dummy": {
            "pipeline_type": "A",
            "model_name": "DummyClassifier (Most Frequent)",
            "estimator": DummyClassifier(strategy="most_frequent"),
            "scale_numeric": False,
            "description": "Baseline naive model predicting majority class (0: No cancel)",
        },
        "EXP02_PipeA_KNN": {
            "pipeline_type": "A",
            "model_name": "KNN (Pipeline A)",
            "estimator": KNeighborsClassifier(
                n_neighbors=7,
                weights="distance",
                metric="minkowski",
                p=2,
                n_jobs=-1,
            ),
            "scale_numeric": True,
            "description": "KNN (k=7, distance weights) with Standard Scaler on Pipeline A",
        },
        "EXP03_PipeA_DecisionTree": {
            "pipeline_type": "A",
            "model_name": "Decision Tree (Pipeline A)",
            "estimator": DecisionTreeClassifier(
                criterion="gini",
                max_depth=10,
                min_samples_split=10,
                min_samples_leaf=5,
                random_state=RANDOM_STATE,
            ),
            "scale_numeric": False,
            "description": "Decision Tree (max_depth=10, gini) on Pipeline A",
        },
        "EXP04_PipeB_KNN": {
            "pipeline_type": "B",
            "model_name": "KNN (Pipeline B)",
            "estimator": KNeighborsClassifier(
                n_neighbors=7,
                weights="distance",
                metric="minkowski",
                p=2,
                n_jobs=-1,
            ),
            "scale_numeric": True,
            "description": "KNN (k=7, distance weights) with Feature Engineering on Pipeline B",
        },
        "EXP05_PipeB_DecisionTree": {
            "pipeline_type": "B",
            "model_name": "Decision Tree (Pipeline B)",
            "estimator": DecisionTreeClassifier(
                criterion="gini",
                max_depth=12,
                min_samples_split=10,
                min_samples_leaf=5,
                class_weight="balanced",
                random_state=RANDOM_STATE,
            ),
            "scale_numeric": False,
            "description": "Decision Tree with Feature Engineering & Balanced weights on Pipeline B",
        },
        "EXP06_PipeB_DT_Optimized": {
            "pipeline_type": "B",
            "model_name": "Decision Tree Tuned (Pipeline B)",
            "estimator": DecisionTreeClassifier(
                criterion="entropy",
                max_depth=15,
                min_samples_split=8,
                min_samples_leaf=4,
                class_weight=None,
                random_state=RANDOM_STATE,
            ),
            "scale_numeric": False,
            "description": "Optimized Decision Tree (max_depth=15, entropy) on Pipeline B",
        },
    }


def train_and_cross_validate_all(
    sample_size_knn: int = 25000,
) -> pd.DataFrame:
    """
    Train and cross-validate all experiments on the training dataset.

    Args:
        sample_size_knn: Subsample size for KNN cross-validation to maintain reasonable
                         compute times while preserving statistical validity.

    Returns:
        DataFrame containing cross-validation metrics across all experiments.
    """
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    RESULTS_DIR.mkdir(parents=True, exist_ok=True)

    logger.info("=== BẮT ĐẦU QUY TRÌNH HUẤN LUYỆN VÀ CROSS-VALIDATION ===")
    X, y = load_features_and_target(drop_leakage=True)
    X_train, X_test, y_train, y_test = get_train_test_split(X, y)

    # Save test set partition for independent evaluation
    test_data_path = RESULTS_DIR / "test_set_cache.joblib"
    joblib.dump({"X_test": X_test, "y_test": y_test}, test_data_path)
    logger.info(f"Đã lưu tập kiểm thử độc lập (Test Set) vào: {test_data_path}")

    experiments = get_experiment_definitions()
    cv_records = []
    skf = StratifiedKFold(n_splits=CV_FOLDS, shuffle=True, random_state=RANDOM_STATE)

    for exp_id, exp_info in experiments.items():
        logger.info(f"\n--- Đang thực hiện {exp_id}: {exp_info['model_name']} ---")
        t0 = time.time()

        pipeline = build_full_model_pipeline(
            pipeline_type=exp_info["pipeline_type"],
            estimator=exp_info["estimator"],
            scale_numeric=exp_info["scale_numeric"],
        )

        # Handle KNN sample size if needed for cross-validation efficiency
        is_knn = "KNN" in exp_id
        if is_knn and sample_size_knn is not None and len(X_train) > sample_size_knn:
            logger.info(
                f"[KNN Optimization] Sử dụng {sample_size_knn:,} mẫu train cho CV để tối ưu thời gian..."
            )
            sub_idx = y_train.sample(n=sample_size_knn, random_state=RANDOM_STATE).index
            X_cv = X_train.loc[sub_idx]
            y_cv = y_train.loc[sub_idx]
        else:
            X_cv = X_train
            y_cv = y_train

        # 5-fold Stratified Cross-Validation on Train Set
        scoring = ["accuracy", "precision", "recall", "f1", "roc_auc"]
        cv_res = cross_validate(
            pipeline,
            X_cv,
            y_cv,
            cv=skf,
            scoring=scoring,
            n_jobs=1 if is_knn else -1,
            return_train_score=False,
        )

        train_time = time.time() - t0

        cv_record = {
            "Experiment_ID": exp_id,
            "Model_Name": exp_info["model_name"],
            "Pipeline": exp_info["pipeline_type"],
            "CV_Accuracy_Mean": float(cv_res["test_accuracy"].mean()),
            "CV_Accuracy_Std": float(cv_res["test_accuracy"].std()),
            "CV_Precision_Mean": float(cv_res["test_precision"].mean()),
            "CV_Recall_Mean": float(cv_res["test_recall"].mean()),
            "CV_F1_Mean": float(cv_res["test_f1"].mean()),
            "CV_ROCAUC_Mean": float(cv_res["test_roc_auc"].mean()),
            "Train_Time_Sec": round(train_time, 2),
        }
        cv_records.append(cv_record)
        logger.info(
            f"CV F1-Score: {cv_record['CV_F1_Mean']:.4f} | "
            f"Accuracy: {cv_record['CV_Accuracy_Mean']:.4f} | "
            f"ROC-AUC: {cv_record['CV_ROCAUC_Mean']:.4f} (Thời gian: {train_time:.1f}s)"
        )

        # Fit final pipeline on complete Training Set (or 35k for KNN for responsive runtime)
        fit_train_X = X_train.loc[sub_idx] if (is_knn and sample_size_knn) else X_train
        fit_train_y = y_train.loc[sub_idx] if (is_knn and sample_size_knn) else y_train
        pipeline.fit(fit_train_X, fit_train_y)

        # Serialize model
        model_filename = f"{exp_id.lower()}.joblib"
        model_save_path = MODELS_DIR / model_filename
        joblib.dump(pipeline, model_save_path)
        logger.info(f"Đã lưu mô hình: {model_save_path}")

    # Output CV summary table
    cv_summary_df = pd.DataFrame(cv_records)
    save_table_csv(cv_summary_df, "training_cv_results.csv", output_dir=RESULTS_DIR, index=False)
    logger.info("=== HOÀN THÀNH QUY TRÌNH HUẤN LUYỆN TOÀN DIỆN! ===")
    return cv_summary_df


if __name__ == "__main__":
    train_and_cross_validate_all()
