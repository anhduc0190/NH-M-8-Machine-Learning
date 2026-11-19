/**
 * API Service for interacting with Python FastAPI backend.
 */

const API_BASE_URL = 'http://localhost:8000/api';

export async function fetchHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    return await res.json();
  } catch (err) {
    return { status: 'offline', error: err.message };
  }
}

export async function fetchDashboardStats() {
  const res = await fetch(`${API_BASE_URL}/dashboard/stats`);
  if (!res.ok) throw new Error('Không thể nạp dữ liệu Dashboard');
  return await res.json();
}

export async function fetchAvailableModels() {
  const res = await fetch(`${API_BASE_URL}/predict/models`);
  if (!res.ok) throw new Error('Không thể nạp danh sách mô hình');
  return await res.json();
}

export async function predictSingleBooking(bookingData, modelId = 'exp06_pipeb_dt_optimized') {
  const res = await fetch(`${API_BASE_URL}/predict/single?model_id=${encodeURIComponent(modelId)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bookingData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Lỗi không xác định' }));
    throw new Error(err.detail || 'Lỗi khi thực hiện dự đoán');
  }
  return await res.json();
}

export async function predictBatchBookings(file, modelId = 'exp06_pipeb_dt_optimized') {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE_URL}/batch/predict?model_id=${encodeURIComponent(modelId)}`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Lỗi không xác định' }));
    throw new Error(err.detail || 'Lỗi khi dự đoán batch');
  }
  return await res.json();
}

export async function fetchModelComparison() {
  const res = await fetch(`${API_BASE_URL}/models/comparison`);
  if (!res.ok) throw new Error('Không thể nạp dữ liệu so sánh mô hình');
  return await res.json();
}

export async function fetchExplorerData(page = 1, pageSize = 10) {
  const res = await fetch(`${API_BASE_URL}/explorer/overview?page=${page}&page_size=${pageSize}`);
  if (!res.ok) throw new Error('Không thể nạp dữ liệu Data Explorer');
  return await res.json();
}

export async function fetchErrorDiagnostics(params = {}) {
  const query = new URLSearchParams();
  if (params.hotel) query.append('hotel', params.hotel);
  if (params.segment) query.append('segment', params.segment);
  if (params.errorType) query.append('error_type', params.errorType);
  if (params.page) query.append('page', params.page);
  if (params.pageSize) query.append('page_size', params.pageSize);

  const res = await fetch(`${API_BASE_URL}/errors/diagnostics?${query.toString()}`);
  if (!res.ok) throw new Error('Không thể nạp dữ liệu phân tích lỗi');
  return await res.json();
}
