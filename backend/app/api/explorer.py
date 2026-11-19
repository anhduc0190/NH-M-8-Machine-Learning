"""
Data Explorer API Routes.
"""

from fastapi import APIRouter, Query
from backend.app.services.data_service import get_data_explorer_overview

router = APIRouter(prefix="/api/explorer", tags=["Data Explorer"])


@router.get("/overview")
def get_explorer_data(
    page: int = Query(1, ge=1, description="Trang xem mẫu"),
    page_size: int = Query(10, ge=5, le=100, description="Số dòng mỗi trang"),
):
    """Retrieve column schema, missing values breakdown, and raw dataset sample."""
    return get_data_explorer_overview(page=page, page_size=page_size)
