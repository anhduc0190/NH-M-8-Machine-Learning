import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Award,
  Zap,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Cpu,
  Layers,
  Sparkles,
  Info,
  Clock,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { fetchModelComparison } from '../services/api';

export default function ModelComparison() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedModelId, setSelectedModelId] = useState('EXP06_PipeB_DT_Optimized');

  useEffect(() => {
    fetchModelComparison()
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Lỗi khi tải dữ liệu so sánh mô hình');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] text-slate-500 space-y-3">
        <div className="w-9 h-9 border-3 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-medium text-slate-600">Đang nạp dữ liệu đánh giá thực nghiệm từ Backend...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-sm">Không thể nạp dữ liệu so sánh mô hình</h4>
          <p className="text-xs mt-1">{error}</p>
        </div>
      </div>
    );
  }

  // Robust parsing of models list from API response
  const rawList = data.models_test_metrics || data.models || [];
  const models = rawList.map((m) => {
    const expId = m.experiment_id || m.id || '';
    const name = m.model_name || m.name || expId;
    const f1 = m.f1_score !== undefined ? m.f1_score : (m.f1 || 0);
    const cm = m.confusion_matrix || { tn: 0, fp: 0, fn: 0, tp: 0 };
    return {
      id: expId,
      name,
      pipeline: m.pipeline || (expId.includes('PipeB') ? 'B' : 'A'),
      accuracy: m.accuracy || 0,
      precision: m.precision || 0,
      recall: m.recall || 0,
      f1_score: f1,
      roc_auc: m.roc_auc,
      confusion_matrix: cm,
      notes: expId.includes('DT_Optimized')
        ? 'Cắt tỉa độ sâu 15, tiêu chuẩn Entropy (Tối ưu nhất)'
        : expId.includes('EXP05')
        ? 'Class weight balanced (Recall cao nhất 82.4%)'
        : expId.includes('EXP01')
        ? 'Mô hình cơ sở ngây thơ (Baseline)'
        : 'Thực nghiệm tiêu chuẩn',
    };
  });

  const chartData = models.map((m) => ({
    name: m.name.replace(' (Pipeline A)', ' (A)').replace(' (Pipeline B)', ' (B)').replace(' (Most Frequent)', ''),
    Accuracy: Number((m.accuracy * 100).toFixed(1)),
    Precision: Number((m.precision * 100).toFixed(1)),
    Recall: Number((m.recall * 100).toFixed(1)),
    F1: Number((m.f1_score * 100).toFixed(1)),
    ROCAUC: Number(((m.roc_auc || 0) * 100).toFixed(1)),
  }));

  const selectedModel = models.find((m) => m.id === selectedModelId) || models[models.length - 1] || models[0];
  const cm = selectedModel?.confusion_matrix || { tn: 0, fp: 0, fn: 0, tp: 0 };
  const total = (cm.tn + cm.fp + cm.fn + cm.tp) || 1;

  const cvMetrics = data.cross_validation_metrics || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner Card */}
      <div className="bg-white rounded-xl p-6 border border-[#E2E8F0] shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <h1 className="text-xl sm:text-2xl font-bold text-[#172033] tracking-tight">
              So sánh toàn diện hiệu năng mô hình (Model Benchmark)
            </h1>
            <p className="text-sm text-[#475569] leading-relaxed max-w-3xl">
              Đánh giá khách quan 6 mô hình trên tập kiểm thử độc lập (Test Set: 23,878 mẫu, 20% dữ liệu đã stratify) và 5-Fold Cross Validation.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-left shrink-0">
            <div className="flex items-center space-x-1.5 text-[#2563EB] font-bold text-xs uppercase tracking-wider">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Mô Hình Tối Ưu Nhất</span>
            </div>
            <h4 className="text-sm font-extrabold text-[#172033] mt-1">
              Decision Tree Tuned (Pipeline B)
            </h4>
            <p className="text-[11px] text-[#475569] mt-0.5 font-mono">
              Accuracy: 85.48% • F1: 0.8012 • ROC-AUC: 0.9289
            </p>
          </div>
        </div>
      </div>

      {/* Benchmark Metric Comparison Chart */}
      <div className="bg-white rounded-xl p-6 border border-[#E2E8F0] shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0]">
          <div>
            <h3 className="text-sm font-bold text-[#172033]">
              Biểu Đồ So Sánh Các Chỉ Số Giữa 6 Thí Nghiệm
            </h3>
            <p className="text-xs text-[#94A3B8]">
              Đo lường bằng đơn vị phần trăm (%) trên tập kiểm thử độc lập (Test Set)
            </p>
          </div>
          <div className="flex items-center space-x-3 text-xs font-medium text-[#475569]">
            <span className="inline-flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#2563EB]" />
              <span>F1-Score</span>
            </span>
            <span className="inline-flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#16A34A]" />
              <span>Recall</span>
            </span>
            <span className="inline-flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#F59E0B]" />
              <span>ROC-AUC</span>
            </span>
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 15, right: 20, left: -10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} interval={0} angle={-10} textAnchor="end" />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94A3B8' }} unit="%" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111827',
                  borderRadius: '8px',
                  border: 'none',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Legend verticalAlign="top" height={32} iconType="circle" />
              <Bar dataKey="Accuracy" fill="#64748B" radius={[4, 4, 0, 0]} name="Accuracy (%)" />
              <Bar dataKey="F1" fill="#2563EB" radius={[4, 4, 0, 0]} name="F1-Score (%)" />
              <Bar dataKey="Recall" fill="#16A34A" radius={[4, 4, 0, 0]} name="Recall (%)" />
              <Bar dataKey="ROCAUC" fill="#F59E0B" radius={[4, 4, 0, 0]} name="ROC-AUC (%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Comprehensive Benchmark Table (Test Set) */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-[#E2E8F0]">
          <h3 className="text-sm font-bold text-[#172033]">
            Bảng Tổng Hợp Chi Tiết Benchmark Thực Nghiệm (Tập Kiểm Thử - 23,878 Mẫu)
          </h3>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Đầy đủ các chỉ số đánh giá phân loại và nhận định kỹ thuật
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-[#E2E8F0] text-[#475569] font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Mô Hình</th>
                <th className="py-3 px-4">Pipeline</th>
                <th className="py-3 px-4 text-center">Accuracy</th>
                <th className="py-3 px-4 text-center">Precision</th>
                <th className="py-3 px-4 text-center">Recall</th>
                <th className="py-3 px-4 text-center">F1-Score</th>
                <th className="py-3 px-4 text-center">ROC-AUC</th>
                <th className="py-3 px-4">Đánh giá kỹ thuật</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {models.map((m) => {
                const isBest = m.id.includes('DT_Optimized');
                return (
                  <tr
                    key={m.id}
                    className={`transition-colors ${
                      isBest ? 'bg-blue-50/40 font-semibold' : 'hover:bg-slate-50/70'
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2">
                        {isBest && <Award className="w-4 h-4 text-amber-500 shrink-0" />}
                        <span className="text-[#172033] font-bold">{m.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                      Pipeline {m.pipeline}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono">
                      {(m.accuracy * 100).toFixed(2)}%
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono">
                      {(m.precision * 100).toFixed(2)}%
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold">
                      {(m.recall * 100).toFixed(2)}%
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-extrabold text-[#2563EB]">
                      {m.f1_score.toFixed(4)}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono">
                      {m.roc_auc ? m.roc_auc.toFixed(4) : '0.5000'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 text-[11px]">
                      {m.notes}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Confusion Matrix Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 bg-white rounded-xl p-5 sm:p-6 border border-[#E2E8F0] shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0]">
            <div>
              <h3 className="text-sm font-bold text-[#172033]">
                Ma Trận Nhầm Lẫn (Confusion Matrix)
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Xem phân bố TP, FP, TN, FN của từng mô hình trên tập kiểm thử 23,878 đơn
              </p>
            </div>
            <select
              value={selectedModelId}
              onChange={(e) => setSelectedModelId(e.target.value)}
              className="form-select sm:w-64 text-xs font-medium"
            >
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* 2x2 Matrix */}
          <div className="grid grid-cols-2 gap-3 max-w-md mx-auto pt-2">
            {/* True Negative */}
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                True Negative (TN)
              </span>
              <p className="text-2xl font-extrabold text-emerald-900 font-mono">
                {cm.tn.toLocaleString()}
              </p>
              <p className="text-[11px] text-emerald-700">
                Đúng: Khách Ở ({((cm.tn / total) * 100).toFixed(1)}%)
              </p>
            </div>

            {/* False Positive */}
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-center space-y-1">
              <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider">
                False Positive (FP - Loại I)
              </span>
              <p className="text-2xl font-extrabold text-rose-900 font-mono">
                {cm.fp.toLocaleString()}
              </p>
              <p className="text-[11px] text-rose-700">
                Nhầm: Khách ở nhưng đoán hủy ({((cm.fp / total) * 100).toFixed(1)}%)
              </p>
            </div>

            {/* False Negative */}
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center space-y-1">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                False Negative (FN - Loại II)
              </span>
              <p className="text-2xl font-extrabold text-amber-900 font-mono">
                {cm.fn.toLocaleString()}
              </p>
              <p className="text-[11px] text-amber-700">
                Bỏ sót: Khách hủy nhưng đoán ở ({((cm.fn / total) * 100).toFixed(1)}%)
              </p>
            </div>

            {/* True Positive */}
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-center space-y-1">
              <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">
                True Positive (TP)
              </span>
              <p className="text-2xl font-extrabold text-blue-900 font-mono">
                {cm.tp.toLocaleString()}
              </p>
              <p className="text-[11px] text-blue-700">
                Đúng: Khách Hủy ({((cm.tp / total) * 100).toFixed(1)}%)
              </p>
            </div>
          </div>
        </div>

        {/* Technical Key Findings */}
        <div className="lg:col-span-5 bg-white rounded-xl p-5 sm:p-6 border border-[#E2E8F0] shadow-2xs space-y-3">
          <div className="pb-3 border-b border-[#E2E8F0]">
            <h3 className="text-sm font-bold text-[#172033] flex items-center space-x-2">
              <Layers className="w-4 h-4 text-[#2563EB]" />
              <span>Kết Luận Khoa Học & Đánh Giá</span>
            </h3>
            <p className="text-xs text-[#94A3B8]">
              Nhận định từ quá trình thực nghiệm độc lập
            </p>
          </div>

          <div className="space-y-3 text-xs text-[#475569] leading-relaxed">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
              <h4 className="font-bold text-[#172033]">
                1. Hiệu quả của Feature Engineering (Pipeline B)
              </h4>
              <p>
                Pipeline B với các đặc trưng tương tác (<code>total_stay_nights</code>, <code>total_guests</code>, <code>room_changed</code> và chuẩn hóa log cho lead_time) giúp nâng F1-Score của Decision Tree từ <strong>0.7788 lên 0.8012</strong>.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
              <h4 className="font-bold text-[#172033]">
                2. So sánh KNN vs Decision Tree
              </h4>
              <p>
                KNN gặp trở ngại vì số chiều lớn sau One-Hot Encoding và tốc độ inference chậm (~20ms). <strong>Decision Tree</strong> cho tốc độ tức thì (&lt; 1ms), khả năng giải thích cao và không bị ảnh hưởng bởi thang đo.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-100 text-[#1E3A8A] space-y-1">
              <h4 className="font-bold text-[#1E3A8A]">
                3. Đề xuất lựa chọn mô hình
              </h4>
              <p>
                Mô hình <strong>EXP06 (Decision Tree Tuned - Pipeline B)</strong> là lựa chọn tối ưu nhất để triển khai trong thực tế do đạt F1 cao nhất và cân bằng hoàn hảo giữa Precision (81.27%) và Recall (79.01%).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 5-Fold Cross Validation Table */}
      {cvMetrics.length > 0 && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#172033]">
                Kết Quả Đánh Giá Chéo 5-Fold Cross-Validation (Tập Huấn Luyện)
              </h3>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Kiểm chứng tính tổng quát hóa và độ ổn định của các mô hình trên 5 folds độc lập
              </p>
            </div>
            <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              k = 5 folds
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-[#E2E8F0] text-[#475569] font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-4">Mô Hình</th>
                  <th className="py-2.5 px-4">Pipeline</th>
                  <th className="py-2.5 px-4 text-center">CV Accuracy (Mean)</th>
                  <th className="py-2.5 px-4 text-center">CV F1-Score (Mean)</th>
                  <th className="py-2.5 px-4 text-center">CV ROC-AUC (Mean)</th>
                  <th className="py-2.5 px-4 text-center">Thời Gian Train</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cvMetrics.map((cv) => (
                  <tr key={cv.experiment_id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-4 font-bold text-[#172033]">{cv.model_name}</td>
                    <td className="py-2.5 px-4 font-mono text-slate-600">Pipeline {cv.pipeline}</td>
                    <td className="py-2.5 px-4 text-center font-mono">
                      {(cv.cv_accuracy_mean * 100).toFixed(2)}%
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono font-bold text-[#2563EB]">
                      {cv.cv_f1_mean.toFixed(4)}
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono">
                      {cv.cv_roc_auc_mean.toFixed(4)}
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono text-slate-600">
                      {cv.train_time_sec}s
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
