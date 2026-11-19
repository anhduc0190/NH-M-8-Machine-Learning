import React from 'react';
import {
  LayoutDashboard,
  Brain,
  FileSpreadsheet,
  BarChart3,
  Database,
  AlertTriangle,
  Hotel,
  ShieldCheck,
  ChevronRight,
  Info,
  Users,
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, onOpenProjectInfo }) {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      subtitle: 'Tổng quan và thống kê',
      icon: LayoutDashboard,
    },
    {
      id: 'predict',
      label: 'Single Prediction',
      subtitle: 'Dự đoán đơn lẻ thời gian thực',
      icon: Brain,
    },
    {
      id: 'batch',
      label: 'Batch Prediction',
      subtitle: 'Tải CSV và dự đoán hàng loạt',
      icon: FileSpreadsheet,
    },
    {
      id: 'models',
      label: 'Model Comparison',
      subtitle: 'So sánh mô hình & Benchmark',
      icon: BarChart3,
    },
    {
      id: 'explorer',
      label: 'Data Explorer',
      subtitle: 'Khám phá dữ liệu & Schema',
      icon: Database,
    },
    {
      id: 'errors',
      label: 'Error Analysis',
      subtitle: 'Phân tích lỗi FP và FN',
      icon: AlertTriangle,
    },
  ];

  return (
    <aside className="w-[260px] bg-[#111827] text-slate-200 flex flex-col shrink-0 border-r border-[#1F2937] min-h-screen select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#1F2937] flex items-center space-x-3.5">
        <div className="w-10 h-10 rounded-xl bg-[#2563EB] flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
          <Hotel className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <h1 className="font-bold text-sm tracking-tight leading-tight text-white uppercase">
            Hotel Analytics
          </h1>
          <p className="text-[11px] text-[#94A3B8] font-medium tracking-wide">
            CANCELLATION PREDICTION
          </p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 pt-2 pb-1.5 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Mục Điều Hướng
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-left transition-all duration-150 border-none cursor-pointer group ${
                isActive
                  ? 'bg-[#2563EB] text-white font-medium shadow-xs'
                  : 'text-slate-300 hover:bg-[#1F2937] hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <div className="truncate">
                  <div className="text-xs font-semibold leading-snug">
                    {item.label}
                  </div>
                  <div
                    className={`text-[11px] truncate leading-tight ${
                      isActive ? 'text-blue-100' : 'text-slate-400'
                    }`}
                  >
                    {item.subtitle}
                  </div>
                </div>
              </div>
              {isActive && (
                <ChevronRight className="w-3.5 h-3.5 text-white/90 shrink-0 ml-1" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info & Team */}
      <div className="p-4 border-t border-[#1F2937] bg-[#0B0F17] text-xs text-slate-400 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
            Nhóm 8 • Đề tài 14
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1F2937] text-slate-300">
            v1.0.0
          </span>
        </div>

        <p className="text-[11px] text-slate-400 leading-relaxed">
          Bài tập lớn Nhập môn Học máy. Dự đoán hủy đặt phòng khách sạn.
        </p>

        <button
          type="button"
          onClick={onOpenProjectInfo}
          className="w-full mt-1 px-3 py-1.5 rounded-lg bg-[#1F2937] hover:bg-[#283548] text-slate-200 hover:text-white text-xs font-medium inline-flex items-center justify-center space-x-1.5 transition-colors border border-slate-700/60"
        >
          <Info className="w-3.5 h-3.5 text-blue-400" />
          <span>Thông tin nhóm & Đề tài</span>
        </button>
      </div>
    </aside>
  );
}
