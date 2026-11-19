import React, { useState, useEffect } from 'react';
import {
  UploadCloud,
  FileText,
  AlertCircle,
  CheckCircle2,
  Download,
  Filter,
  Search,
  RefreshCw,
  Building,
  Sparkles,
  FileSpreadsheet,
} from 'lucide-react';
import { fetchAvailableModels, predictBatchBookings } from '../services/api';

export default function BatchPrediction() {
  const [file, setFile] = useState(null);
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('exp06_pipeb_dt_optimized');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // ALL, CANCELED, NOT_CANCELED
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    fetchAvailableModels()
      .then((res) => {
        setModels(res);
        if (res.length > 0 && !selectedModel) {
          setSelectedModel(res[0].id);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.name.endsWith('.csv')) {
      setFile(selected);
      setError(null);
    } else {
      setError('Vui lòng chọn một tệp có định dạng .csv');
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Vui lòng chọn tệp CSV trước khi bấm dự đoán!');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await predictBatchBookings(file, selectedModel);
      setResult(data);
      setCurrentPage(1);
    } catch (err) {
      setError(err.message || 'Lỗi xử lý dự đoán batch.');
    } finally {
      setLoading(false);
    }
  };

  // Download sample CSV template
  const downloadSampleCsv = () => {
    const headers = [
      'hotel',
      'lead_time',
      'arrival_date_year',
      'arrival_date_month',
      'arrival_date_week_number',
      'arrival_date_day_of_month',
      'stays_in_weekend_nights',
      'stays_in_week_nights',
      'adults',
      'children',
      'babies',
      'meal',
      'country',
      'market_segment',
      'distribution_channel',
      'is_repeated_guest',
      'previous_cancellations',
      'previous_bookings_not_canceled',
      'reserved_room_type',
      'assigned_room_type',
      'booking_changes',
      'deposit_type',
      'agent',
      'company',
      'days_in_waiting_list',
      'customer_type',
      'adr',
      'required_car_parking_spaces',
      'total_of_special_requests',
    ].join(',');

    const sampleRow1 = 'City Hotel,45,2017,August,33,15,1,2,2,0,0,BB,PRT,Online TA,TA/TO,0,0,0,A,A,0,No Deposit,9,,0,Transient,120.0,0,1';
    const sampleRow2 = 'Resort Hotel,210,2017,July,28,10,2,5,2,1,0,HB,GBR,Groups,TA/TO,0,1,0,E,E,0,Non Refund,240,,0,Transient-Party,95.5,0,0';
    const sampleRow3 = 'Resort Hotel,14,2017,September,36,2,0,1,1,0,0,BB,ESP,Direct,Direct,1,0,2,A,A,0,No Deposit,,,0,Transient,150.0,1,2';
    const sampleRow4 = 'City Hotel,120,2017,June,24,18,0,3,2,0,0,BB,FRA,Offline TA/TO,TA/TO,0,0,0,A,A,1,No Deposit,14,,0,Transient,90.0,0,0';
    const sampleRow5 = 'City Hotel,310,2017,May,19,12,1,2,2,0,0,BB,PRT,Groups,TA/TO,0,3,0,A,A,0,Non Refund,1,,0,Transient,70.0,0,0';

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, sampleRow1, sampleRow2, sampleRow3, sampleRow4, sampleRow5].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'sample_hotel_bookings_batch.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export predicted results as CSV
  const exportPredictionsCsv = () => {
    if (!result || !result.predictions) return;
    const items = result.predictions;
    const keys = Object.keys(items[0]);
    const headerRow = keys.join(',');
    const rows = items.map((row) =>
      keys.map((k) => `"${(row[k] !== null && row[k] !== undefined ? row[k] : '').toString().replace(/"/g, '""')}"`).join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headerRow, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `hotel_predictions_${result.model_id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter & Search
  const filteredPredictions = (result?.predictions || []).filter((item) => {
    const matchesSearch =
      searchTerm === '' ||
      item.hotel?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.market_segment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.country?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterType === 'ALL' ||
      (filterType === 'CANCELED' && item.predicted_canceled === 1) ||
      (filterType === 'NOT_CANCELED' && item.predicted_canceled === 0);

    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredPredictions.length / pageSize) || 1;
  const paginatedItems = filteredPredictions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-white rounded-xl p-6 border border-[#E2E8F0] shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <h1 className="text-xl sm:text-2xl font-bold text-[#172033] tracking-tight">
              Dự đoán đặt phòng hàng loạt (Batch Prediction)
            </h1>
            <p className="text-sm text-[#475569] leading-relaxed max-w-3xl">
              Tải lên tệp CSV chứa danh sách nhiều đơn đặt phòng. Hệ thống tự động kiểm tra schema, loại trừ cột <code>is_canceled</code> (nếu có) để triệt tiêu Data Leakage và xuất kết quả phân loại.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={downloadSampleCsv}
              className="px-3.5 py-2 rounded-lg border border-[#E2E8F0] hover:bg-slate-50 text-slate-700 text-xs font-semibold inline-flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Tải Tệp CSV Mẫu</span>
            </button>
          </div>
        </div>
      </div>

      {/* Upload Dropzone & Model Select */}
      <div className="bg-white rounded-xl p-6 border border-[#E2E8F0] shadow-2xs space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          {/* File Dropzone */}
          <div className="lg:col-span-8">
            <label
              htmlFor="csv-upload"
              className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                file
                  ? 'border-[#2563EB] bg-blue-50/40 text-blue-900'
                  : 'border-[#E2E8F0] hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              <input
                id="csv-upload"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <UploadCloud
                className={`w-9 h-9 mb-2 ${
                  file ? 'text-[#2563EB]' : 'text-slate-400'
                }`}
              />
              {file ? (
                <div>
                  <p className="font-bold text-sm text-[#172033]">{file.name}</p>
                  <p className="text-xs text-[#94A3B8] mt-0.5">
                    {(file.size / 1024).toFixed(1)} KB • Nhấn để chọn tệp khác
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-semibold text-slate-700">
                    Kéo thả hoặc nhấp để chọn tệp CSV đặt phòng
                  </p>
                  <p className="text-[11px] text-[#94A3B8] mt-0.5">
                    Định dạng .csv chuẩn theo cấu trúc Hotel Booking Demand
                  </p>
                </div>
              )}
            </label>
          </div>

          {/* Model Selection & Action */}
          <div className="lg:col-span-4 space-y-3">
            <div>
              <label className="form-label text-xs">Mô hình thực hiện suy luận</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="form-select text-xs font-medium"
              >
                {models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.pipeline})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleUpload}
              disabled={loading || !file}
              className="w-full h-11 px-4 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs shadow-2xs transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang xử lý dự đoán batch...</span>
                </>
              ) : (
                <>
                  <FileText className="w-3.5 h-3.5" />
                  <span>Thực Hiện Dự Đoán Hàng Loạt</span>
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Results View */}
      {result && (
        <div className="space-y-5">
          {/* Summary KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-5 border border-[#E2E8F0] shadow-2xs">
              <span className="text-xs font-semibold text-[#475569] uppercase">Tổng số bản ghi</span>
              <p className="text-2xl font-extrabold text-[#172033] mt-2 font-mono">
                {result.total_records.toLocaleString()}
              </p>
              <span className="text-[11px] text-[#94A3B8]">Đơn đặt phòng hợp lệ</span>
            </div>

            <div className="bg-white rounded-xl p-5 border border-rose-200 bg-rose-50/20 shadow-2xs">
              <span className="text-xs font-semibold text-rose-700 uppercase">Dự đoán Hủy</span>
              <p className="text-2xl font-extrabold text-rose-700 mt-2 font-mono">
                {result.predicted_canceled_count.toLocaleString()}
              </p>
              <span className="text-[11px] text-rose-600 font-medium">
                Tỷ lệ hủy: {result.predicted_cancellation_rate}%
              </span>
            </div>

            <div className="bg-white rounded-xl p-5 border border-emerald-200 bg-emerald-50/20 shadow-2xs">
              <span className="text-xs font-semibold text-emerald-700 uppercase">Dự đoán Không Hủy</span>
              <p className="text-2xl font-extrabold text-emerald-700 mt-2 font-mono">
                {result.predicted_not_canceled_count.toLocaleString()}
              </p>
              <span className="text-[11px] text-emerald-600 font-medium">
                {(100 - result.predicted_cancellation_rate).toFixed(1)}% giữ phòng
              </span>
            </div>

            <div className="bg-white rounded-xl p-5 border border-[#E2E8F0] shadow-2xs flex flex-col justify-between">
              <span className="text-xs font-semibold text-[#475569] uppercase">Xuất Tệp Báo Cáo</span>
              <button
                type="button"
                onClick={exportPredictionsCsv}
                className="mt-2 w-full h-9 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs inline-flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải CSV Kết Quả</span>
              </button>
            </div>
          </div>

          {/* Results Table */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-2xs overflow-hidden">
            {/* Table Filter Toolbar */}
            <div className="p-4 border-b border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center space-x-2.5 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Tìm theo KS, Phân khúc, Quốc gia..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    className="form-input text-xs pl-8.5 h-9"
                  />
                </div>

                <select
                  value={filterType}
                  onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}
                  className="form-select text-xs h-9 sm:w-40"
                >
                  <option value="ALL">Tất cả nhãn</option>
                  <option value="CANCELED">Chỉ Hủy (Risk)</option>
                  <option value="NOT_CANCELED">Chỉ Không Hủy (Safe)</option>
                </select>
              </div>

              <div className="text-xs text-[#94A3B8]">
                Tìm thấy <strong>{filteredPredictions.length}</strong> kết quả
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-[#E2E8F0] text-[#475569] font-bold uppercase tracking-wider">
                    <th className="py-2.5 px-3.5">#</th>
                    <th className="py-2.5 px-3.5">Khách Sạn</th>
                    <th className="py-2.5 px-3.5">Lead Time</th>
                    <th className="py-2.5 px-3.5">Phân Khúc</th>
                    <th className="py-2.5 px-3.5">Đặt Cọc</th>
                    <th className="py-2.5 px-3.5">Giá ADR</th>
                    <th className="py-2.5 px-3.5">Kết Quả Phân Loại</th>
                    <th className="py-2.5 px-3.5">Xác Suất Hủy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedItems.map((row, idx) => {
                    const isCanceled = row.predicted_canceled === 1;
                    return (
                      <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2.5 px-3.5 font-mono text-slate-400">
                          {(currentPage - 1) * pageSize + idx + 1}
                        </td>
                        <td className="py-2.5 px-3.5 font-semibold text-[#172033]">
                          {row.hotel || 'N/A'}
                        </td>
                        <td className="py-2.5 px-3.5 text-[#475569] font-mono">
                          {row.lead_time} ngày
                        </td>
                        <td className="py-2.5 px-3.5 text-[#475569]">
                          {row.market_segment || 'N/A'}
                        </td>
                        <td className="py-2.5 px-3.5 text-[#475569]">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            row.deposit_type === 'Non Refund'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {row.deposit_type || 'No Deposit'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3.5 font-mono text-[#172033] font-semibold">
                          €{row.adr}
                        </td>
                        <td className="py-2.5 px-3.5">
                          <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isCanceled
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {isCanceled ? (
                              <AlertCircle className="w-3 h-3" />
                            ) : (
                              <CheckCircle2 className="w-3 h-3" />
                            )}
                            <span>{isCanceled ? 'Nguy cơ hủy' : 'Không hủy'}</span>
                          </span>
                        </td>
                        <td className="py-2.5 px-3.5 font-mono font-semibold">
                          {row.predicted_probability !== null && row.predicted_probability !== undefined ? (
                            <span className={isCanceled ? 'text-rose-600' : 'text-emerald-600'}>
                              {(row.predicted_probability * 100).toFixed(1)}%
                            </span>
                          ) : (
                            <span className="text-slate-400">N/A</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-[#E2E8F0] flex items-center justify-between">
                <span className="text-xs text-[#94A3B8]">
                  Trang {currentPage} / {totalPages}
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    className="px-3 py-1.5 text-xs rounded-lg border border-[#E2E8F0] hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                  >
                    Trước
                  </button>
                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    className="px-3 py-1.5 text-xs rounded-lg border border-[#E2E8F0] hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
