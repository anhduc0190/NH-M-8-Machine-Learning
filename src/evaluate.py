"""
Model Evaluation Module for Hotel Booking Cancellation Prediction.

Evaluates all serialized pipelines independently on the held-out Test Set (20% Stratified).
Calculates full suite of classification metrics:
- Accuracy
- Precision (Positive class: 1 - Canceled)
- Recall (Positive class: 1 - Canceled)
- F1-Score (Harmonic mean)
- ROC-AUC
- Confusion Matrix (TN, FP, FN, TP)

Generates comparison tables, ROC curves, and Confusion Matrix figures.
"""

from pathlib import Path
from typing import Dict, Any, List
import logging
import joblib
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    roc_curve,
    confusion_matrix,
    classification_report,
)

from src.config import (
    MODELS_DIR,
    FIGURES_DIR,
    RESULTS_DIR,
    TABLES_DIR,
    RANDOM_STATE,
)
from src.data_loader import load_features_and_target, get_train_test_split
from src.train import get_experiment_definitions
from src.utils import setup_visualization_style, save_figure, save_table_csv

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


def evaluate_all_models_on_test() -> pd.DataFrame:
    """
    Evaluate all trained models on the test set.

    Returns:
        DataFrame summarizing performance metrics on the test set.
    """
    logger.info("=== BẮT ĐẦU ĐÁNH GIÁ MÔ HÌNH TRÊN TẬP KIỂM THỬ ĐỘC LẬP (TEST SET) ===")
    setup_visualization_style()
    FIGURES_DIR.mkdir(parents=True, exist_ok=True)
    RESULTS_DIR.mkdir(parents=True, exist_ok=True)

    # 1. Load test set
    cache_path = RESULTS_DIR / "test_set_cache.joblib"
    if cache_path.exists():
        logger.info(f"Đang nạp tập test từ cache: {cache_path}")
        cached_data = joblib.load(cache_path)
        X_test = cached_data["X_test"]
        y_test = cached_data["y_test"]
    else:
        logger.info("Tập test chưa được cache, thực hiện phân chia mới...")
        X, y = load_features_and_target(drop_leakage=True)
        _, X_test, _, y_test = get_train_test_split(X, y)

    logger.info(f"Số lượng mẫu kiểm thử (Test Samples): {len(X_test):,}")

    experiments = get_experiment_definitions()
    eval_records = []
    roc_data = {}

    for exp_id, exp_info in experiments.items():
        model_path = MODELS_DIR / f"{exp_id.lower()}.joblib"
        if not model_path.exists():
            logger.warning(f"Không tìm thấy file mô hình {model_path}. Bỏ qua thí nghiệm {exp_id}.")
            continue

        logger.info(f"Đang đánh giá mô hình: {exp_info['model_name']} ({exp_id})...")
        pipeline = joblib.load(model_path)

        # Predict labels
        y_pred = pipeline.predict(X_test)

        # Predict probabilities if supported
        y_proba = None
        if hasattr(pipeline, "predict_proba"):
            try:
                y_proba = pipeline.predict_proba(X_test)[:, 1]
            except Exception:
                y_proba = None

        # Compute metrics
        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred, pos_label=1, zero_division=0)
        rec = recall_score(y_test, y_pred, pos_label=1, zero_division=0)
        f1 = f1_score(y_test, y_pred, pos_label=1, zero_division=0)

        roc_auc = np.nan
        if y_proba is not None:
            roc_auc = roc_auc_score(y_test, y_proba)
            fpr, tpr, _ = roc_curve(y_test, y_proba)
            roc_data[exp_id] = (fpr, tpr, roc_auc, exp_info["model_name"])

        # Confusion Matrix
        cm = confusion_matrix(y_test, y_pred)
        tn, fp, fn, tp = cm.ravel()

        eval_record = {
            "Experiment_ID": exp_id,
            "Model_Name": exp_info["model_name"],
            "Pipeline": exp_info["pipeline_type"],
            "Accuracy": float(round(acc, 4)),
            "Precision": float(round(prec, 4)),
            "Recall": float(round(rec, 4)),
            "F1_Score": float(round(f1, 4)),
            "ROC_AUC": float(round(roc_auc, 4)) if not np.isnan(roc_auc) else "N/A",
            "True_Negative": int(tn),
            "False_Positive": int(fp),
            "False_Negative": int(fn),
            "True_Positive": int(tp),
        }
        eval_records.append(eval_record)

        # Plot individual Confusion Matrix
        _plot_confusion_matrix(cm, exp_id, exp_info["model_name"])

    eval_df = pd.DataFrame(eval_records)
    save_table_csv(eval_df, "model_test_comparison.csv", output_dir=RESULTS_DIR, index=False)
    save_table_csv(eval_df, "model_test_comparison.csv", output_dir=TABLES_DIR, index=False)

    # Plot consolidated comparative figures
    _plot_roc_curves_comparison(roc_data)
    _plot_metrics_comparison_bar(eval_df)

    logger.info("=== HOÀN THÀNH TOÀN DIỆN ĐÁNH GIÁ MÔ HÌNH! ===")
    return eval_df


def _plot_confusion_matrix(cm: np.ndarray, exp_id: str, model_name: str) -> None:
    """Plot and save individual confusion matrix."""
    fig, ax = plt.subplots(figsize=(6, 5))
    labels = ["Không hủy (0)", "Hủy phòng (1)"]
    sns.heatmap(
        cm,
        annot=True,
        fmt=",d",
        cmap="Blues",
        xticklabels=labels,
        yticklabels=labels,
        cbar=False,
        ax=ax,
    )
    ax.set_title(f"Ma trận nhầm lẫn - {model_name}\n({exp_id})", fontsize=11, pad=12)
    ax.set_xlabel("Dự đoán của mô hình (Predicted)", fontsize=10, fontweight="bold")
    ax.set_ylabel("Thực tế (Ground Truth)", fontsize=10, fontweight="bold")
    plt.tight_layout()
    save_figure(fig, f"confusion_matrix_{exp_id.lower()}.png")
    plt.close(fig)


def _plot_roc_curves_comparison(roc_data: Dict[str, Any]) -> None:
    """Plot consolidated ROC curves for all models with predict_proba support."""
    if not roc_data:
        return

    fig, ax = plt.subplots(figsize=(8.5, 6.5))
    colors = ["#2b5c8f", "#d9534f", "#5cb85c", "#f0ad4e", "#9b59b6", "#34495e"]

    for i, (exp_id, (fpr, tpr, auc_val, model_name)) in enumerate(roc_data.items()):
        color = colors[i % len(colors)]
        ax.plot(
            fpr,
            tpr,
            label=f"{model_name} (AUC = {auc_val:.3f})",
            linewidth=2,
            color=color,
        )

    # Reference diagonal
    ax.plot([0, 1], [0, 1], "k--", alpha=0.6, label="Random Guess (AUC = 0.500)")
    ax.set_title("Đường cong ROC (Receiver Operating Characteristic) trên Test Set", fontsize=12, pad=12)
    ax.set_xlabel("False Positive Rate (1 - Specificity)", fontsize=11)
    ax.set_ylabel("True Positive Rate (Sensitivity / Recall)", fontsize=11)
    ax.set_xlim(-0.01, 1.01)
    ax.set_ylim(-0.01, 1.01)
    ax.legend(loc="lower right", fontsize=10)
    plt.tight_layout()
    save_figure(fig, "roc_curves_comparison.png")
    plt.close(fig)


def _plot_metrics_comparison_bar(eval_df: pd.DataFrame) -> None:
    """Plot grouped bar chart comparing Accuracy, Precision, Recall, and F1 across models."""
    metrics = ["Accuracy", "Precision", "Recall", "F1_Score"]
    plot_df = eval_df.melt(
        id_vars=["Model_Name"],
        value_vars=metrics,
        var_name="Metric",
        value_name="Score",
    )

    fig, ax = plt.subplots(figsize=(12, 6))
    palette = ["#337ab7", "#5cb85c", "#f0ad4e", "#d9534f"]
    sns.barplot(
        data=plot_df,
        x="Model_Name",
        y="Score",
        hue="Metric",
        palette=palette,
        ax=ax,
    )
    ax.set_title("So sánh các chỉ số phân loại chính trên tập kiểm thử (Test Set)", fontsize=13, pad=12)
    ax.set_xlabel("Mô hình & Phương án tiền xử lý", fontsize=11)
    ax.set_ylabel("Điểm số", fontsize=11)
    ax.set_ylim(0, 1.05)
    plt.xticks(rotation=20, ha="right")
    ax.legend(title="Chỉ số đánh giá", loc="lower right")

    for p in ax.patches:
        height = p.get_height()
        if height > 0.05:
            ax.annotate(
                f"{height:.2f}",
                (p.get_x() + p.get_width() / 2.0, height + 0.015),
                ha="center",
                va="bottom",
                fontsize=8,
                rotation=90,
            )

    plt.tight_layout()
    save_figure(fig, "model_metrics_comparison.png")
    plt.close(fig)


if __name__ == "__main__":
    evaluate_all_models_on_test()
