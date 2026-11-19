import React, { useState, useEffect } from 'react';
import {
  Database,
  Search,
  Filter,
  BarChart2,
  PieChart as PieIcon,
  AlertCircle,
  FileSpreadsheet,
  CheckCircle2,
  Sparkles,
  Columns,
  Table as TableIcon,
  ShieldCheck,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { fetchExplorerData } from '../services/api';

const COLORS = ['#16A34A', '#DC2626'];

export default function DataExplorer() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [activeSubTab, setActiveSubTab] = useState('data'); // 'data' or 'schema'
  const pageSize = 10;

  useEffect(() => {
    loadData(page);
  }, [page]);

  const loadData = (p) => {
    setLoading(true);
    fetchExplorerData(p, pageSize)
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
        <p className="text-xs font-medium text-slate-600">Đang khám phá bộ dữ liệu Hotel Booking Demand...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-sm">Không thể nạp dữ liệu Data Explorer</h4>
          <p className="text-xs mt-1">{error}</p>
        </div>
      </div>
    );
  }

  const targetDist = [
    { name: 'Không Hủy (0)', value: 75166, percent: 63.0 },
    { name: 'Hủy Phòng (1)', value: 44224, percent: 37.0 },
  ];

  const missingList = data.missing_summary || [
    { column: 'company', count: 112593, pct: 94.3 },
    { column: 'agent', count: 16340, pct: 13.7 },
    { column: 'country', count: 488, pct: 0.4 },
    { column: 'children', count: 4, pct: 0.003 },
  ];

  const rows = data.paginated_sample?.rows || [];
  const totalPages = data.paginated_sample?.total_pages || 10;
  const columnsInfo = data.columns_info || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-white rounded-xl p-6 border border-[#E2E8F0] shadow-2xs">
        <div className="space-y-1.5">
          <h1 className="text-xl sm:text-2xl font-bold text-[#172033] tracking-tight">
            Khám phá dữ liệu gốc (Data Explorer)
          </h1>
          <p className="text-sm text-[#475569] leading-relaxed max-w-3xl">
            Xem xét chi tiết đặc tính thống kê của bộ dữ liệu thực tế Hotel Booking Demand: phân phối biến mục tiêu, phân tích các cột khuyết thiếu (Missing values) và trích xuất mẫu dữ liệu thực tế.
          </p>
        </div>
      </div>

      {/* Dataset Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-[#E2E8F0] shadow-2xs">
          <span className="text-xs font-semibold text-[#475569] uppercase tracking-wider">Tổng Quy Mô Dữ Liệu</span>
          <p className="text-2xl font-extrabold text-[#172033] mt-2 font-mono">
            {(data.dataset_shape?.rows || 119390).toLocaleString()}
          </p>
          <span className="text-[11px] text-[#94A3B8]">119,390 dòng đặt phòng thực tế</span>
        </div>

        <div className="bg-white rounded-xl p-5 border border-[#E2E8F0] shadow-2xs">
          <span className="text-xs font-semibold text-[#2563EB] uppercase tracking-wider">Số Thuộc Tính (Features)</span>
          <p className="text-2xl font-extrabold text-[#2563EB] mt-2 font-mono">
            {data.dataset_shape?.columns || 32} cột
          </p>
          <span className="text-[11px] text-[#94A3B8]">31 đặc trưng và 1 biến nhãn mục tiêu</span>
        </div>

        <div className="bg-white rounded-xl p-5 border border-[#E2E8F0] shadow-2xs">
          <span className="text-xs font-semibold text-[#DC2626] uppercase tracking-wider">Tỷ Lệ Nhãn Mục Tiêu</span>
          <p className="text-2xl font-extrabold text-[#DC2626] mt-2 font-mono">
            37.0% : 63.0%
          </p>
          <span className="text-[11px] text-[#94A3B8]">Mất cân bằng nhẹ (Moderate Imbalance)</span>
        </div>

        <div className="bg-white rounded-xl p-5 border border-[#E2E8F0] shadow-2xs">
          <span className="text-xs font-semibold text-[#16A34A] uppercase tracking-wider">Thời Gian Thu Thập</span>
          <p className="text-2xl font-extrabold text-[#16A34A] mt-2 font-mono">
            2015 – 2017
          </p>
          <span className="text-[11px] text-[#94A3B8]">2 khách sạn tại Bồ Đào Nha</span>
        </div>
      </div>

      {/* Target Distribution & Missing Values */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Target Distribution Pie */}
        <div className="lg:col-span-5 bg-white rounded-xl p-5 sm:p-6 border border-[#E2E8F0] shadow-2xs space-y-4">
          <div className="pb-3 border-b border-[#E2E8F0]">
            <h3 className="text-sm font-bold text-[#172033]">
              Phân Phối Biến Mục Tiêu (is_canceled)
            </h3>
            <p className="text-xs text-[#94A3B8]">
              So sánh tỷ lệ khách giữ phòng (0) vs khách hủy đặt phòng (1)
            </p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={targetDist}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {targetDist.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => Number(val).toLocaleString() + ' bookings'}
                  contentStyle={{ backgroundColor: '#111827', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-around text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A]" />
              <span className="text-[#475569] font-medium">Không Hủy: 75,166 (63.0%)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]" />
              <span className="text-[#475569] font-medium">Hủy Phòng: 44,224 (37.0%)</span>
            </div>
          </div>
        </div>

        {/* Missing Values Breakdown */}
        <div className="lg:col-span-7 bg-white rounded-xl p-5 sm:p-6 border border-[#E2E8F0] shadow-2xs space-y-4">
          <div className="pb-3 border-b border-[#E2E8F0]">
            <h3 className="text-sm font-bold text-[#172033]">
              Phân Tích Dữ Liệu Khuyết Thiếu (Missing Values)
            </h3>
            <p className="text-xs text-[#94A3B8]">
              Chiến lược tiền xử lý khoa học cho các thuộc tính có giá trị khuyết
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-[#E2E8F0] text-[#475569] font-bold uppercase">
                  <th className="py-2.5 px-3">Tên Cột</th>
                  <th className="py-2.5 px-3">Số Dòng Khuyết</th>
                  <th className="py-2.5 px-3">Tỷ Lệ (%)</th>
                  <th className="py-2.5 px-3">Phương Án Tiền Xử Lý Đã Áp Dụng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {missingList.map((m, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 font-mono font-bold text-[#172033]">
                      {m.column}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-rose-600 font-semibold">
                      {m.count.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        m.pct > 50
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : m.pct > 10
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {m.pct}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[#475569]">
                      {m.column === 'company'
                        ? 'Loại bỏ cột do khuyết > 94% (hoặc impute 0)'
                        : m.column === 'agent'
                        ? 'Điền giá trị 0 (đại diện cho không qua đại lý)'
                        : m.column === 'country'
                        ? 'Điền mode "PRT" hoặc "Unknown"'
                        : 'Điền median = 0'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-100 text-xs text-blue-900 leading-relaxed flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              <strong>Chống rò rỉ dữ liệu (No Leakage):</strong> Toàn bộ median và mode đều chỉ tính trên tập Train rồi mới chuyển đổi sang tập Test.
            </span>
          </div>
        </div>
      </div>

      {/* Dataset Sample & Schema View */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setActiveSubTab('data')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all inline-flex items-center space-x-1.5 cursor-pointer ${
                activeSubTab === 'data'
                  ? 'bg-[#2563EB] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Dữ Liệu Mẫu (Sample Rows)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('schema')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all inline-flex items-center space-x-1.5 cursor-pointer ${
                activeSubTab === 'schema'
                  ? 'bg-[#2563EB] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Cấu Trúc Thuộc Tính ({columnsInfo.length} Cột)</span>
            </button>
          </div>

          {activeSubTab === 'data' && (
            <div className="text-xs text-[#94A3B8]">
              Trang {page} / {totalPages} (10 dòng/trang)
            </div>
          )}
        </div>

        {activeSubTab === 'data' ? (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-[#E2E8F0] text-[#475569] font-bold uppercase tracking-wider">
                    <th className="py-2.5 px-3">Hotel</th>
                    <th className="py-2.5 px-3">Canceled?</th>
                    <th className="py-2.5 px-3">Lead Time</th>
                    <th className="py-2.5 px-3">Arrival</th>
                    <th className="py-2.5 px-3">Nights</th>
                    <th className="py-2.5 px-3">Guests</th>
                    <th className="py-2.5 px-3">Segment</th>
                    <th className="py-2.5 px-3">Deposit</th>
                    <th className="py-2.5 px-3">ADR</th>
                    <th className="py-2.5 px-3">Special Req</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-[#172033]">{row.hotel}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          row.is_canceled === 1 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {row.is_canceled === 1 ? 'Hủy (1)' : 'Ở (0)'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono">{row.lead_time} ngày</td>
                      <td className="py-2.5 px-3 text-[#475569]">{row.arrival_date_month} {row.arrival_date_year}</td>
                      <td className="py-2.5 px-3 font-mono text-[#475569]">
                        {(row.stays_in_weekend_nights || 0) + (row.stays_in_week_nights || 0)} đêm
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[#475569]">
                        {(row.adults || 0) + (row.children || 0) + (row.babies || 0)} khách
                      </td>
                      <td className="py-2.5 px-3 text-[#475569]">{row.market_segment}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          row.deposit_type === 'Non Refund' ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {row.deposit_type}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-[#172033]">€{row.adr}</td>
                      <td className="py-2.5 px-3 font-mono text-center">{row.total_of_special_requests}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-4 border-t border-[#E2E8F0] flex items-center justify-between">
              <span className="text-xs text-[#94A3B8]">Trang {page} / {totalPages}</span>
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
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-[#E2E8F0] text-[#475569] font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Tên Thuộc Tính (Column)</th>
                  <th className="py-3 px-4">Kiểu Dữ Liệu (Dtype)</th>
                  <th className="py-3 px-4">Số Lượng Null</th>
                  <th className="py-3 px-4">Tỷ Lệ Null (%)</th>
                  <th className="py-3 px-4">Số Giá Trị Độc Nhất (Unique)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {columnsInfo.map((col, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-4 font-mono font-bold text-[#172033]">{col.column}</td>
                    <td className="py-2.5 px-4 font-mono text-slate-600">{col.dtype}</td>
                    <td className="py-2.5 px-4 font-mono text-slate-600">{col.null_count}</td>
                    <td className="py-2.5 px-4 font-mono text-slate-600">{col.null_pct}%</td>
                    <td className="py-2.5 px-4 font-mono text-[#172033] font-semibold">{col.unique_values}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
