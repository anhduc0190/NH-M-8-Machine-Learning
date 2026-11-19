import React from 'react';
import { X, ShieldCheck, Users, BookOpen, GitBranch, Cpu, Award } from 'lucide-react';

export default function ProjectModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Thông Tin Đề Tài & Nhóm Nghiên Cứu
              </h3>
              <p className="text-xs text-slate-500">
                Học phần: Nhập môn Học máy (2026–2027) • Đề tài 14
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-sm text-slate-600 max-h-[75vh] overflow-y-auto">
          {/* Project Details */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              1. Tên Đề Tài & Bộ Dữ Liệu
            </h4>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <p className="font-semibold text-slate-900">
                Đề tài 14: Dự đoán khách hàng hủy đặt phòng khách sạn (Hotel Booking Cancellation Prediction)
              </p>
              <p className="text-xs text-slate-500">
                Bộ dữ liệu: <strong>Hotel Booking Demand</strong> (Jesse Mostipak / Antonio et al., 2019) gồm 119,390 bản ghi thực tế từ City Hotel và Resort Hotel tại Bồ Đào Nha.
              </p>
            </div>
          </div>

          {/* Team Members */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              2. Thành Viên Nhóm Nghiên Cứu (Nhóm 8)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl border border-slate-200 bg-white shadow-2xs">
                <span className="text-[11px] font-semibold text-blue-600 uppercase">Trưởng nhóm</span>
                <p className="font-bold text-slate-800 mt-0.5">Nguyễn Anh Đức</p>
                <p className="text-xs text-slate-400 font-mono">1871020148</p>
                <p className="text-[11px] text-slate-500 mt-1">EDA & Frontend</p>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-white shadow-2xs">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Thành viên</span>
                <p className="font-bold text-slate-800 mt-0.5">Lưu Phương Thảo</p>
                <p className="text-xs text-slate-400 font-mono">1871020xxx</p>
                <p className="text-[11px] text-slate-500 mt-1">Preprocessing & Pipelines</p>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-white shadow-2xs">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Thành viên</span>
                <p className="font-bold text-slate-800 mt-0.5">Lê Hoàng Nam</p>
                <p className="text-xs text-slate-400 font-mono">1871020417</p>
                <p className="text-[11px] text-slate-500 mt-1">Evaluation & Errors</p>
              </div>
            </div>
          </div>

          {/* Academic Architecture */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              3. Kiến Trúc Kỹ Thuật & Tính Khoa Học
            </h4>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1.5 leading-relaxed text-slate-600">
              <div className="flex items-center space-x-2 text-slate-800 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Không rò rỉ dữ liệu (No Data Leakage)</span>
              </div>
              <p>
                Dữ liệu được phân chia ngẫu nhiên phân tầng (Stratified 80/20: Train 95,512 / Test 23,878). Toàn bộ bước chuẩn hóa và impute đều chỉ học trên tập Train.
              </p>
              <div className="flex items-center space-x-2 text-slate-800 font-semibold pt-1">
                <Cpu className="w-4 h-4 text-blue-600" />
                <span>Mô hình & Pipeline thật</span>
              </div>
              <p>
                Website kết nối trực tiếp đến Scikit-learn Pipeline đã lưu dạng Joblib thông qua FastAPI, không mô phỏng hay sinh số liệu giả.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
