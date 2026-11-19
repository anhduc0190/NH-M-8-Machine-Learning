import React, { useEffect, useState } from 'react';
import { RefreshCw, Info, ExternalLink } from 'lucide-react';
import { fetchHealth } from '../services/api';

export default function Header({ activeTab, onOpenProjectInfo }) {
  const [isOnline, setIsOnline] = useState(false);
  const [checking, setChecking] = useState(false);

  const checkStatus = async () => {
    setChecking(true);
    const res = await fetchHealth();
    setIsOnline(res.status === 'healthy');
    setChecking(false);
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const meta = {
    dashboard: {
      breadcrumb: 'Dashboard',
      title: 'Tổng quan và Thống kê',
      desc: 'Phân tích hiệu suất đặt phòng và xu hướng hủy phòng từ 119,390 bản ghi',
    },
    predict: {
      breadcrumb: 'Single Prediction',
      title: 'Dự đoán khả năng hủy đặt phòng',
      desc: 'Phân tích thông tin đặt phòng và sử dụng mô hình Machine Learning để ước tính khả năng hủy',
    },
    batch: {
      breadcrumb: 'Batch Prediction',
      title: 'Dự đoán hàng loạt (CSV)',
      desc: 'Tải tệp CSV danh sách đơn phòng, tự động kiểm tra schema và phân loại',
    },
    models: {
      breadcrumb: 'Model Comparison',
      title: 'So sánh mô hình & Benchmark',
      desc: 'Đánh giá khách quan 6 mô hình trên tập kiểm thử độc lập 23,878 mẫu',
    },
    explorer: {
      breadcrumb: 'Data Explorer',
      title: 'Khám phá dữ liệu gốc',
      desc: 'Cấu trúc schema, phân tích dữ liệu khuyết thiếu và trích xuất mẫu dữ liệu',
    },
    errors: {
      breadcrumb: 'Error Analysis',
      title: 'Phân tích lỗi sai lệch (FP & FN)',
      desc: 'Chẩn đoán các ca đoán sai dưới góc độ nghiệp vụ quản trị khách sạn',
    },
  };

  const current = meta[activeTab] || meta.dashboard;

  return (
    <header className="h-[72px] bg-white border-b border-[#E2E8F0] sticky top-0 z-20 px-8 flex items-center justify-between">
      {/* Left: Breadcrumbs & Page Title */}
      <div>
        <div className="flex items-center space-x-2 text-xs text-[#94A3B8] font-medium">
          <span>Hotel Analytics</span>
          <span>/</span>
          <span className="text-[#2563EB] font-semibold">{current.breadcrumb}</span>
        </div>
        <h2 className="text-lg font-bold text-[#172033] tracking-tight leading-none mt-1">
          {current.title}
        </h2>
      </div>

      {/* Right: Status & Actions */}
      <div className="flex items-center space-x-3.5">
        {/* Backend Status Badge */}
        <div
          className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
            isOnline
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
            }`}
          />
          <span>{isOnline ? 'API Online' : 'API Offline'}</span>
          <button
            type="button"
            onClick={checkStatus}
            disabled={checking}
            title="Kiểm tra lại trạng thái Backend API"
            className="p-0.5 hover:opacity-75 transition-opacity border-none bg-transparent cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 text-slate-500 ${checking ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Project Info Button */}
        <button
          type="button"
          onClick={onOpenProjectInfo}
          className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] hover:bg-slate-50 text-slate-700 text-xs font-medium inline-flex items-center space-x-1.5 transition-colors cursor-pointer"
        >
          <Info className="w-3.5 h-3.5 text-blue-600" />
          <span className="hidden sm:inline">Thông tin đề tài</span>
        </button>

        {/* Swagger Docs Link */}
        <a
          href="http://localhost:8000/docs"
          target="_blank"
          rel="noreferrer"
          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium inline-flex items-center space-x-1.5 transition-colors shadow-2xs"
          title="Mở tài liệu API FastAPI Swagger"
        >
          <span>FastAPI Docs</span>
          <ExternalLink className="w-3 h-3 text-slate-300" />
        </a>
      </div>
    </header>
  );
}
