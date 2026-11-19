"""
Error Analysis API Routes.
"""

from fastapi import APIRouter, Query
from typing import Optional
from backend.app.services.data_service import get_error_analysis_data

router = APIRouter(prefix="/api/errors", tags=["Error Analysis"])


@router.get("/diagnostics")
def get_errors(
    hotel: Optional[str] = Query(None, description="Lọc theo loại khách sạn (City Hotel / Resort Hotel)"),
    segment: Optional[str] = Query(None, description="Lọc theo phân khúc thị trường"),
    error_type: Optional[str] = Query(None, description="Lọc theo loại lỗi (FP, FN, hoặc ALL_ERRORS)"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=5, le=50),
):
    """Retrieve error diagnostic distributions and paginated mispredicted cases."""
    return get_error_analysis_data(
        hotel_filter=hotel,
        segment_filter=segment,
        error_type_filter=error_type,
        page=page,
        page_size=page_size,
    )
