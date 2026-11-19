"""
Hotel Analytics & Cancellation Prediction - Application Launcher.
Starts the Demo Application:
- If React frontend dependencies are installed, launches FastAPI + React Vite (localhost:5173).
- Otherwise, seamlessly falls back to Streamlit web app (localhost:8501) + FastAPI Swagger docs (localhost:8000/docs).
"""

import subprocess
import sys
import time
import webbrowser
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = ROOT_DIR / "frontend"
NODE_MODULES_DIR = FRONTEND_DIR / "node_modules"


def main():
    print("=" * 70)
    print("🏨 KHỞI CHẠY HỆ THỐNG DEMO: HOTEL ANALYTICS & CANCELLATION PREDICTION")
    print("=" * 70)

    # 1. Start FastAPI Backend on Port 8000
    print("\n[1/2] Đang khởi động Backend FastAPI (Port 8000)...")
    backend_cmd = [
        sys.executable,
        "-m",
        "uvicorn",
        "backend.app.main:app",
        "--host",
        "127.0.0.1",
        "--port",
        "8000",
    ]
    backend_proc = subprocess.Popen(backend_cmd, cwd=str(ROOT_DIR))

    time.sleep(2)

    ui_proc = None
    # 2. Check if React Frontend can run (node_modules exists)
    if NODE_MODULES_DIR.exists():
        print("\n[2/2] Phát hiện node_modules -> Khởi động Frontend React + Vite (Port 5173)...")
        npm_cmd = "npm.cmd" if sys.platform == "win32" else "npm"
        frontend_cmd = [npm_cmd, "run", "dev"]
        ui_proc = subprocess.Popen(frontend_cmd, cwd=str(FRONTEND_DIR))
        app_url = "http://localhost:5173"
    else:
        print("\n[2/2] Khởi động Giao diện Web Trực quan Streamlit (Port 8501)...")
        streamlit_cmd = [
            sys.executable,
            "-m",
            "streamlit",
            "run",
            "app.py",
            "--server.port=8501",
            "--server.headless=true",
        ]
        ui_proc = subprocess.Popen(streamlit_cmd, cwd=str(ROOT_DIR))
        app_url = "http://localhost:8501"

    time.sleep(3)

    api_docs_url = "http://localhost:8000/docs"
    print("\n" + "=" * 70)
    print("🚀 HỆ THỐNG ĐÃ SẴN SÀNG TRÊN LOCALHOST:")
    print(f"👉 Giao diện Người dùng (Web UI):  {app_url}")
    print(f"👉 Tài liệu API (Swagger UI):     {api_docs_url}")
    print("=" * 70)
    print("\nNhấn Ctrl + C trong cửa sổ này để dừng hệ thống.\n")

    try:
        webbrowser.open(app_url)
    except Exception:
        pass

    try:
        backend_proc.wait()
    except KeyboardInterrupt:
        print("\nĐang tắt hệ thống...")
        backend_proc.terminate()
        if ui_proc:
            ui_proc.terminate()
        print("Đã dừng toàn bộ dịch vụ.")


if __name__ == "__main__":
    main()
