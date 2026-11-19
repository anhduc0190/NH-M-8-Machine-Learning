"""
Model Comparison API Routes.
"""

from fastapi import APIRouter
from backend.app.services.data_service import get_model_comparison_metrics

router = APIRouter(prefix="/api/models", tags=["Model Comparison"])


@router.get("/comparison")
def get_comparison():
    """Retrieve test set metrics, confusion matrices, and cross-validation comparisons."""
    return get_model_comparison_metrics()
