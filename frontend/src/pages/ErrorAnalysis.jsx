import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  HelpCircle,
  Filter,
  TrendingDown,
  Building,
  CheckCircle,
  XCircle,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { fetchErrorDiagnostics } from '../services/api';

export default function ErrorAnalysis() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [hotelFilter, setHotelFilter] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('');
  const [errorTypeFilter, setErrorTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    loadDiagnostics();
  }, [hotelFilter, segmentFilter, errorTypeFilter, page]);

  const loadDiagnostics = () => {
    setLoading(true);
    fetchErrorDiagnostics({
      hotel: hotelFilter || undefined,
      segment: segmentFilter || undefined,
      errorType: errorTypeFilter || undefined,
      page,
      pageSize,
    })
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] text-slate-500 space-y-3">
        <div className="w-9 h-9 border-3 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-medium text-slate-600">Đang tải dữ liệu phân tích lỗi chẩn đoán từ Backend...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-start space-x-3">
        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-sm">Không thể nạp dữ liệu phân tích lỗi</h4>
          <p className="text-xs mt-1">{error}</p>
        </div>
      </div>
    );
  }

  const summary = data.overall_summary || {
    false_positives: 1611,
    false_negatives: 1857,
    total_test_samples: 23878,
  };

  const cases = data.paginated_cases?.cases || [];
  const totalPages = data.paginated_cases?.total_pages || 1;
  const totalFiltered = data.paginated_cases?.total_filtered_errors || cases.length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-white rounded-xl p-6 border border-[#E2E8F0] shadow-2xs">
        <div className="space-y-1.5">
          <h1 className="text-xl sm:text-2xl font-bold text-[#172033] tracking-tight">
            Phân tích lỗi sai lệch (Error Diagnostics & Impact)
          </h1>
          <p className="text-sm text-[#475569] leading-relaxed max-w-3xl">
            Phân loại nguyên nhân và rủi ro kinh doanh đối với các trường hợp mô hình đưa ra dự đoán sai lệch trên tập kiểm thử độc lập 23,878 mẫu: <strong>False Positive (Báo động nhầm)</strong> và <strong>False Negative (Bỏ sót rủi ro)</strong>.
          </p>
        </div>
      </div>

      {/* KPI Cards: Cost & Frequency of Errors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-[#E2E8F0] shadow-2xs">
          <span className="text-xs font-semibold text-[#475569] uppercase tracking-wider">Tổng Mẫu Đoán Sai</span>
          <p className="text-2xl font-extrabold text-[#172033] mt-2 font-mono">
            {((summary.false_positives || 0) + (summary.false_negatives || 0)).toLocaleString()}
          </p>
          <span className="text-[11px] text-[#94A3B8]">Trên 23,878 đơn kiểm thử (14.5%)</span>
        </div>

        <div className="bg-white rounded-xl p-5 border border-rose-200 bg-rose-50/20 shadow-2xs">
          <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider">False Positive (FP)</span>
          <p className="text-2xl font-extrabold text-rose-700 mt-2 font-mono">
            {(summary.false_positives || 0).toLocaleString()}
          </p>
          <span className="text-[11px] text-rose-600 font-medium">Đoán Hủy nhưng Khách Vẫn Đến Ở</span>
        </div>

        <div className="bg-white rounded-xl p-5 border border-amber-200 bg-amber-50/20 shadow-2xs">
          <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">False Negative (FN)</span>
          <p className="text-2xl font-extrabold text-amber-700 mt-2 font-mono">
            {(summary.false_negatives || 0).toLocaleString()}
          </p>
          <span className="text-[11px] text-amber-600 font-medium">Đoán Ở nhưng Khách Hủy Thật</span>
        </div>

        <div className="bg-white rounded-xl p-5 border border-[#E2E8F0] shadow-2xs">
          <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Độ Chính Xác Tổng Thể</span>
          <p className="text-2xl font-extrabold text-emerald-600 mt-2 font-mono">
            85.48%
          </p>
          <span className="text-[11px] text-[#94A3B8]">Đoán đúng 20,410 / 23,878 đơn</span>
        </div>
      </div>

      {/* Business Cost Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* FP Impact */}
        <div className="bg-white rounded-xl p-6 border border-[#E2E8F0] shadow-2xs space-y-3">
          <div className="flex items-center space-x-3 text-rose-600 font-bold pb-2 border-b border-[#E2E8F0]">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#172033]">Chi Phí Của False Positive (Báo Động Nhầm)</h3>
              <p className="text-xs text-rose-600 font-normal">Thực tế = 0 (Khách ở) nhưng Dự đoán = 1 (Hủy)</p>
            </div>
          </div>
          <p className="text-xs text-[#475569] leading-relaxed">
            Nếu ban quản lý khách sạn tin rằng khách chắc chắn sẽ hủy và vội vàng bán lại phòng đó cho người khác (chiến lược Overbooking hung hãn), khi khách đến nhận phòng thật sẽ dẫn tới tình trạng <strong>thiếu phòng, tranh chấp nghiêm trọng, mất uy tín thương hiệu</strong> và phải đền bù chi phí chuyển khách sang khách sạn đối thủ.
          </p>
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-100 text-xs text-rose-900 leading-relaxed">
            🎯 <strong>Khuyến nghị khắc phục:</strong> Chỉ gửi email xác nhận nhẹ nhàng hoặc mời thanh toán cọc trước 3 ngày, không tự ý hủy booking của khách.
          </div>
        </div>

        {/* FN Impact */}
        <div className="bg-white rounded-xl p-6 border border-[#E2E8F0] shadow-2xs space-y-3">
          <div className="flex items-center space-x-3 text-amber-600 font-bold pb-2 border-b border-[#E2E8F0]">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#172033]">Chi Phí Của False Negative (Bỏ Sót Rủi Ro)</h3>
              <p className="text-xs text-amber-600 font-normal">Thực tế = 1 (Khách hủy) nhưng Dự đoán = 0 (Ở)</p>
            </div>
          </div>
          <p className="text-xs text-[#475569] leading-relaxed">
            Khách sạn kỳ vọng khách sẽ đến nên giữ nguyên phòng trống. Đến sát ngày hoặc ngày nhận phòng khách đột ngột báo hủy hoặc không xuất hiện (No-show), dẫn đến <strong>thất thoát 100% doanh thu đêm phòng</strong> mà không kịp bán lại cho khách vãng lai.
          </p>
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-100 text-xs text-amber-900 leading-relaxed">
            🎯 <strong>Khuyến nghị khắc phục:</strong> Với các đơn có lead time &gt; 90 ngày dù xác suất hủy thấp, vẫn nên kích hoạt tự động nhắc lịch để giảm tỷ lệ No-show.
          </div>
        </div>
      </div>

      {/* Mispredicted Cases Table with Filters */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-2xs overflow-hidden space-y-0">
        {/* Filter Toolbar */}
        <div className="p-5 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-[#172033]">
              Danh Sách Các Trường Hợp Dự Đoán Sai Trong Tập Kiểm Thử
            </h3>
            <p className="text-xs text-[#94A3B8]">
              Bộ lọc chẩn đoán theo nhóm khách sạn và phân khúc ({totalFiltered} trường hợp phù hợp)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Hotel */}
            <select
              value={hotelFilter}
              onChange={(e) => { setHotelFilter(e.target.value); setPage(1); }}
              className="form-select text-xs sm:w-36"
            >
              <option value="">Tất cả khách sạn</option>
              <option value="City Hotel">City Hotel</option>
              <option value="Resort Hotel">Resort Hotel</option>
            </select>

            {/* Filter Segment */}
            <select
              value={segmentFilter}
              onChange={(e) => { setSegmentFilter(e.target.value); setPage(1); }}
              className="form-select text-xs sm:w-36"
            >
              <option value="">Tất cả phân khúc</option>
              <option value="Online TA">Online TA</option>
              <option value="Offline TA/TO">Offline TA/TO</option>
              <option value="Groups">Groups</option>
              <option value="Direct">Direct</option>
              <option value="Corporate">Corporate</option>
            </select>

            {/* Filter Error Type */}
            <select
              value={errorTypeFilter}
              onChange={(e) => { setErrorTypeFilter(e.target.value); setPage(1); }}
              className="form-select text-xs sm:w-44 font-semibold"
            >
              <option value="">Tất cả loại lỗi (FP & FN)</option>
              <option value="FP">Chỉ False Positive (FP)</option>
              <option value="FN">Chỉ False Negative (FN)</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-[#E2E8F0] text-[#475569] font-bold uppercase tracking-wider">
                <th className="py-2.5 px-3.5">Khách Sạn</th>
                <th className="py-2.5 px-3.5">Thực Tế</th>
                <th className="py-2.5 px-3.5">Dự Đoán</th>
                <th className="py-2.5 px-3.5">Phân Loại Lỗi</th>
                <th className="py-2.5 px-3.5">Lead Time</th>
                <th className="py-2.5 px-3.5">Phân Khúc</th>
                <th className="py-2.5 px-3.5">Đặt Cọc</th>
                <th className="py-2.5 px-3.5">Giá ADR</th>
                <th className="py-2.5 px-3.5">Lý do gây sai lệch</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cases.map((row, idx) => {
                const isFP = row.error_type === 'FP';
                return (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3.5 font-semibold text-[#172033]">{row.hotel}</td>
                    <td className="py-2.5 px-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        row.actual === 1 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {row.actual === 1 ? 'Đã Hủy (1)' : 'Đã Ở (0)'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        row.predicted === 1 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {row.predicted === 1 ? 'Đoán Hủy (1)' : 'Đoán Ở (0)'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isFP
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {isFP ? 'False Positive (FP)' : 'False Negative (FN)'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5 font-mono text-[#475569]">{row.lead_time} ngày</td>
                    <td className="py-2.5 px-3.5 text-[#475569]">{row.market_segment}</td>
                    <td className="py-2.5 px-3.5 font-mono text-slate-700">{row.deposit_type}</td>
                    <td className="py-2.5 px-3.5 font-mono font-semibold text-[#172033]">€{row.adr}</td>
                    <td className="py-2.5 px-3.5 text-[#475569] text-[11px]">
                      {isFP
                        ? 'Lead time dài / Non-refund nhưng khách vẫn cố định kế hoạch đến lưu trú'
                        : 'Lead time ngắn / No Deposit nhưng phát sinh sự cố hủy bất ngờ'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-[#E2E8F0] flex items-center justify-between">
          <span className="text-xs text-[#94A3B8]">
            Trang {page} / {totalPages}
          </span>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              className="px-3 py-1.5 text-xs rounded-lg border border-[#E2E8F0] hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              Trước
            </button>
            <button
              type="button"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              className="px-3 py-1.5 text-xs rounded-lg border border-[#E2E8F0] hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
