"""
Main FastAPI Application Entrypoint.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sys
from pathlib import Path

# Add project root to sys.path so backend can cleanly import src modules
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.app.api import dashboard, predict, batch, models, explorer, errors

app = FastAPI(
    title="Hotel Analytics & Cancellation Prediction API",
    description="REST API phục vụ hệ thống Demo Machine Learning Dự đoán khách hàng hủy đặt phòng khách sạn (Đề tài 14)",
    version="1.0.0",
)

# CORS Middleware for React + Vite Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(dashboard.router)
app.include_router(predict.router)
app.include_router(batch.router)
app.include_router(models.router)
app.include_router(explorer.router)
app.include_router(errors.router)


@app.get("/")
def root():
    return {
        "project": "Hotel Analytics & Cancellation Prediction",
        "status": "online",
        "academic_course": "Introduction to Machine Learning (2026-2027)",
        "docs_url": "/docs",
    }


@app.get("/api/health")
def health():
    return {"status": "healthy"}
