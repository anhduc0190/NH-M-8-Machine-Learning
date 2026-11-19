"""
Batch Prediction API Routes.
"""

from fastapi import APIRouter, UploadFile, File, Query, HTTPException
import pandas as pd
import io

from backend.app.services.ml_service import predict_batch_bookings

router = APIRouter(prefix="/api/batch", tags=["Batch Prediction"])


@router.post("/predict")
async def batch_predict(
    file: UploadFile = File(...),
    model_id: str = Query("exp06_pipeb_dt_optimized", description="Mã mô hình đã chọn"),
):
    """
    Upload CSV file of hotel bookings, validate schema, and predict cancellations.
    Prevents leakage by stripping 'is_canceled' from input features.
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Chỉ chấp nhận tệp định dạng .csv!")

    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Không thể đọc tệp CSV: {str(e)}")

    if df.empty:
        raise HTTPException(status_code=400, detail="Tệp CSV trống rỗng!")

    try:
        results = predict_batch_bookings(df, model_id=model_id)
        return results
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Lỗi xử lý dự đoán batch: {str(e)}")
