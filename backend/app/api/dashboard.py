"""
Dashboard API Routes.
"""

from fastapi import APIRouter
from backend.app.services.data_service import get_dashboard_summary

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/stats")
def get_dashboard_statistics():
    """Retrieve full KPIs and comparative metrics for Dashboard."""
    return get_dashboard_summary()
