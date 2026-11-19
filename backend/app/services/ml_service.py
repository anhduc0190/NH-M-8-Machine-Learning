"""
Machine Learning Service for Loading Models and Serving Predictions.
"""

from pathlib import Path
from typing import Dict, Any, Optional, List
import logging
import joblib
import pandas as pd
import numpy as np

from src.config import MODELS_DIR, RANDOM_STATE
from backend.app.schemas.booking import BookingInput, PredictionResponse

logger = logging.getLogger(__name__)

# Registered models available in models/ directory
AVAILABLE_MODELS = {
    "exp06_pipeb_dt_optimized": {
        "name": "Decision Tree Tuned (Pipeline B)",
        "file": "exp06_pipeb_dt_optimized.joblib",
        "pipeline": "B",
        "is_default": True,
        "description": "Mô hình tối ưu nhất: Cây quyết định cắt tỉa độ sâu 15, tiêu chuẩn Entropy trên Pipeline B (F1: 80.12%, ROC-AUC: 0.9289).",
    },
    "exp05_pipeb_decisiontree": {
        "name": "Decision Tree Balanced (Pipeline B)",
        "file": "exp05_pipeb_decisiontree.joblib",
        "pipeline": "B",
        "is_default": False,
        "description": "Cây quyết định cân bằng trọng số lớp (Recall đạt 82.44% - giảm tối đa đơn hủy bị bỏ sót).",
    },
    "exp03_pipea_decisiontree": {
        "name": "Decision Tree Standard (Pipeline A)",
        "file": "exp03_pipea_decisiontree.joblib",
        "pipeline": "A",
        "is_default": False,
        "description": "Cây quyết định độ sâu 10 trên Pipeline A chuẩn tắc (Precision đạt 82.16%).",
    },
    "exp04_pipeb_knn": {
        "name": "K-Nearest Neighbors (Pipeline B)",
        "file": "exp04_pipeb_knn.joblib",
        "pipeline": "B",
        "is_default": False,
        "description": "KNN (k=7) kết hợp kỹ thuật đặc trưng và RobustScaler trên Pipeline B.",
    },
    "exp02_pipea_knn": {
        "name": "K-Nearest Neighbors (Pipeline A)",
        "file": "exp02_pipea_knn.joblib",
        "pipeline": "A",
        "is_default": False,
        "description": "KNN (k=7) chuẩn hóa tiêu chuẩn StandardScaler trên Pipeline A.",
    },
    "exp01_baseline_dummy": {
        "name": "DummyClassifier (Baseline)",
        "file": "exp01_baseline_dummy.joblib",
        "pipeline": "Baseline",
        "is_default": False,
        "description": "Mô hình cơ sở ngây thơ luôn dự đoán lớp đa số (Lớp 0: Không hủy).",
    },
}

_MODEL_CACHE: Dict[str, Any] = {}


def get_available_models_list() -> List[Dict[str, Any]]:
    """Return catalog of available models."""
    return [
        {
            "id": model_id,
            "name": info["name"],
            "pipeline": info["pipeline"],
            "is_default": info["is_default"],
            "description": info["description"],
        }
        for model_id, info in AVAILABLE_MODELS.items()
    ]


def load_model(model_id: str):
    """Load model pipeline from cache or disk."""
    if model_id not in AVAILABLE_MODELS:
        model_id = "exp06_pipeb_dt_optimized"

    if model_id in _MODEL_CACHE:
        return _MODEL_CACHE[model_id]

    model_file = AVAILABLE_MODELS[model_id]["file"]
    model_path = MODELS_DIR / model_file

    if not model_path.exists():
        raise FileNotFoundError(f"Tệp mô hình không tồn tại tại: {model_path}")

    logger.info(f"Đang nạp mô hình '{model_id}' từ: {model_path}")
    pipeline = joblib.load(model_path)
    _MODEL_CACHE[model_id] = pipeline
    return pipeline


def predict_single_booking(booking: BookingInput, model_id: str = "exp06_pipeb_dt_optimized") -> PredictionResponse:
    """Execute single booking cancellation prediction."""
    pipeline = load_model(model_id)
    model_meta = AVAILABLE_MODELS.get(model_id, AVAILABLE_MODELS["exp06_pipeb_dt_optimized"])

    # Prepare DataFrame exactly matching model schema
    input_dict = booking.model_dump()
    df = pd.DataFrame([input_dict])

    # Predict
    pred = int(pipeline.predict(df)[0])

    # Probability
    proba = None
    if hasattr(pipeline, "predict_proba"):
        try:
            proba_arr = pipeline.predict_proba(df)[0]
            proba = float(round(proba_arr[1], 4))
        except Exception:
            proba = None

    # Derive Risk Factors for explainability
    risk_factors = []
    if booking.lead_time > 90:
        risk_factors.append(f"Thời gian đặt trước dài ({booking.lead_time} ngày): Trong dữ liệu thực tế, đơn đặt trên 3 tháng có tỷ lệ hủy trên 45%.")
    elif booking.lead_time <= 7:
        risk_factors.append("Thời gian đặt trước rất ngắn (<= 7 ngày): Nhóm này có độ chắc chắn cao, tỷ lệ hủy lịch sử chỉ 13.5%.")

    if booking.deposit_type == "Non Refund":
        risk_factors.append("Hình thức cọc 'Non Refund': Tỷ lệ hủy lịch sử lên đến 99.36% (đơn đoàn bị hủy mà không hoàn tiền).")

    if booking.total_of_special_requests == 0:
        risk_factors.append("Không có yêu cầu đặc biệt nào (Special Requests = 0): Khách không có yêu cầu có tỷ lệ hủy cao gấp 2 lần nhóm có yêu cầu.")
    elif booking.total_of_special_requests >= 2:
        risk_factors.append(f"Có {booking.total_of_special_requests} yêu cầu đặc biệt: Khách hàng có độ cam kết nhận phòng cao.")

    if booking.hotel == "City Hotel":
        risk_factors.append("Loại khách sạn City Hotel: Khách sạn thành phố có tỷ lệ hủy trung bình (41.7%) cao hơn đáng kể so với Resort (27.8%).")

    if booking.previous_cancellations > 0:
        risk_factors.append(f"Lịch sử từng hủy phòng {booking.previous_cancellations} lần: Yếu tố rủi ro lịch sử lặp lại hành vi.")

    if booking.reserved_room_type != booking.assigned_room_type:
        risk_factors.append("Loại phòng được nâng cấp hoặc thay đổi: Tỷ lệ hủy thực tế của nhóm đổi phòng giảm sâu chỉ còn 5.45%.")

    if not risk_factors:
        risk_factors.append("Các thông số đặt phòng thể hiện hành vi ổn định, nằm trong biên độ rủi ro trung bình.")

    # Risk level classification
    if proba is not None:
        if proba >= 0.70:
            risk_level = "Cao (High Risk)"
        elif proba >= 0.40:
            risk_level = "Trung bình (Medium Risk)"
        else:
            risk_level = "Thấp (Low Risk)"
    else:
        risk_level = "Cao" if pred == 1 else "Thấp"

    return PredictionResponse(
        prediction=pred,
        prediction_label="Có nguy cơ hủy (Canceled)" if pred == 1 else "Không dự đoán hủy (Check-Out)",
        probability=proba,
        model_id=model_id,
        model_name=model_meta["name"],
        pipeline_type=model_meta["pipeline"],
        risk_level=risk_level,
        risk_factors=risk_factors,
        disclaimer=(
            "Lưu ý học thuật: Kết quả trên là dự đoán từ mô hình Machine Learning dựa trên xác suất thống kê lịch sử. "
            "Đây không phải là kết luận chắc chắn 100% về hành vi cá nhân của khách hàng."
        ),
    )


def predict_batch_bookings(df: pd.DataFrame, model_id: str = "exp06_pipeb_dt_optimized") -> Dict[str, Any]:
    """Execute batch prediction for an uploaded CSV DataFrame."""
    pipeline = load_model(model_id)
    model_meta = AVAILABLE_MODELS.get(model_id, AVAILABLE_MODELS["exp06_pipeb_dt_optimized"])

    # Strictly strip target and leakage columns to prevent Data Leakage
    cleaned_df = df.copy()
    forbidden_cols = ["is_canceled", "reservation_status", "reservation_status_date"]
    dropped = [c for c in forbidden_cols if c in cleaned_df.columns]
    if dropped:
        logger.info(f"Loại bỏ các cột bảo vệ khỏi tập batch: {dropped}")
        cleaned_df = cleaned_df.drop(columns=dropped)

    # Validate essential columns
    required_cols = [
        "hotel", "lead_time", "arrival_date_year", "arrival_date_month",
        "market_segment", "deposit_type", "adr"
    ]
    missing_required = [c for c in required_cols if c not in cleaned_df.columns]
    if missing_required:
        raise ValueError(f"Tệp tải lên thiếu các cột bắt buộc tối thiểu: {missing_required}")

    total_records = len(cleaned_df)
    preds = pipeline.predict(cleaned_df)

    probas = None
    if hasattr(pipeline, "predict_proba"):
        try:
            probas = pipeline.predict_proba(cleaned_df)[:, 1]
        except Exception:
            pass

    # Build response records (limit preview to 500 for responsive UI)
    results = []
    cancel_count = int((preds == 1).sum())
    non_cancel_count = int((preds == 0).sum())

    for idx, row in cleaned_df.iloc[:200].iterrows():
        prob_val = float(round(probas[idx], 4)) if probas is not None else None
        results.append({
            "index": int(idx) + 1,
            "hotel": str(row.get("hotel", "Unknown")),
            "lead_time": int(row.get("lead_time", 0)),
            "market_segment": str(row.get("market_segment", "Unknown")),
            "deposit_type": str(row.get("deposit_type", "Unknown")),
            "adr": float(row.get("adr", 0.0)),
            "prediction": int(preds[idx]),
            "prediction_label": "Hủy phòng" if preds[idx] == 1 else "Không hủy",
            "probability": prob_val,
        })

    return {
        "total_records": total_records,
        "canceled_predicted": cancel_count,
        "canceled_percentage": float(round((cancel_count / total_records) * 100, 2)) if total_records > 0 else 0,
        "non_canceled_predicted": non_cancel_count,
        "model_used": model_meta["name"],
        "pipeline_used": model_meta["pipeline"],
        "records_preview": results,
    }
