"""
Prediction API Routes for Single Booking Inference.
"""

from fastapi import APIRouter, Query, HTTPException
from backend.app.schemas.booking import BookingInput, PredictionResponse
from backend.app.services.ml_service import predict_single_booking, get_available_models_list

router = APIRouter(prefix="/api/predict", tags=["Prediction"])


@router.get("/models")
def list_models():
    """List all available pre-trained models."""
    return get_available_models_list()


@router.post("/single", response_model=PredictionResponse)
def predict_single(
    booking: BookingInput,
    model_id: str = Query("exp06_pipeb_dt_optimized", description="Mã mô hình đã chọn"),
):
    """Run real-time inference on a single hotel booking."""
    try:
        return predict_single_booking(booking, model_id=model_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Lỗi dự đoán: {str(e)}")
