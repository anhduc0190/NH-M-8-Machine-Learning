import React, { useEffect, useState } from 'react';
import {
  Users,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Building2,
  CreditCard,
  Clock,
  Briefcase,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import KpiCard from '../components/KpiCard';
import { fetchDashboardStats } from '../services/api';

const PIE_COLORS = ['#16A34A', '#DC2626'];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardStats()
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] text-slate-500 space-y-3">
        <div className="w-9 h-9 border-3 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-medium text-slate-600">Đang tải số liệu từ Backend FastAPI...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
        <div>
          <h4 className="font-bold text-sm">Không thể nạp dữ liệu thống kê</h4>
          <p className="text-xs mt-1 text-rose-600">
            {error || 'Vui lòng kiểm tra xem Backend FastAPI đã được khởi chạy ở cổng 8000 hay chưa.'}
          </p>
        </div>
      </div>
    );
  }

  const {
    kpis,
    target_distribution,
    hotel_comparison,
    deposit_comparison,
    market_segment_comparison,
    lead_time_comparison,
  } = data;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Tổng Số Đơn Đặt Phòng"
          value={kpis.total_bookings.toLocaleString()}
          subvalue="Tập dữ liệu gốc Hotel Booking Demand (Jesse Mostipak)"
          icon={Users}
          accentColor="#2563EB"
          badge="100% Thực tế"
          badgeType="primary"
        />
        <KpiCard
          title="Tỷ Lệ Hủy Phòng Tổng Thể"
          value={`${kpis.cancellation_rate}%`}
          subvalue="44,224 đơn bị hủy trên 119,390 tổng số đơn"
          icon={TrendingUp}
          accentColor="#DC2626"
          badge="Mất cân bằng nhẹ"
          badgeType="danger"
        />
        <KpiCard
          title="Đơn Nhận Phòng (Check-Out)"
          value={kpis.total_non_canceled.toLocaleString()}
          subvalue="Khách hàng hoàn tất lưu trú (Biến mục tiêu = 0)"
          icon={CheckCircle2}
          accentColor="#16A34A"
          badge="62.96%"
          badgeType="success"
        />
        <KpiCard
          title="Đơn Bị Hủy / No-Show"
          value={kpis.total_canceled.toLocaleString()}
          subvalue="Đơn bị hủy cần dự đoán (Biến mục tiêu = 1)"
          icon={XCircle}
          accentColor="#F59E0B"
          badge="37.04%"
          badgeType="warning"
        />
      </div>

      {/* Row 1: Target Distribution & Hotel Type Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Target Pie Chart */}
        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col">
          <div className="pb-3 border-b border-[#E2E8F0]">
            <h3 className="font-bold text-sm text-[#172033]">
              Phân Phối Biến Mục Tiêu (is_canceled)
            </h3>
            <p className="text-xs text-[#94A3B8]">Tỷ lệ hai lớp: Không hủy vs Hủy phòng</p>
          </div>

          <div className="flex-1 min-h-[250px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={target_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={92}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {target_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name, item) => [
                    `${value.toLocaleString()} đơn (${item.payload.percentage}%)`,
                    item.payload.name,
                  ]}
                  contentStyle={{
                    backgroundColor: '#111827',
                    borderRadius: '8px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#E2E8F0]">
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-100 text-center">
              <span className="text-[11px] font-semibold text-emerald-700 block">Lớp 0 (Nhận phòng)</span>
              <span className="text-xs font-bold text-emerald-900 font-mono">75,166 (62.96%)</span>
            </div>
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-100 text-center">
              <span className="text-[11px] font-semibold text-rose-700 block">Lớp 1 (Hủy phòng)</span>
              <span className="text-xs font-bold text-rose-900 font-mono">44,224 (37.04%)</span>
            </div>
          </div>
        </div>

        {/* Hotel Comparison Bar Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col">
          <div className="pb-3 border-b border-[#E2E8F0] flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-[#172033] flex items-center space-x-1.5">
                <Building2 className="w-4 h-4 text-[#2563EB]" />
                <span>So Sánh Tỷ Lệ Hủy: City Hotel vs Resort Hotel</span>
              </h3>
              <p className="text-xs text-[#94A3B8]">Số lượng đơn nhận phòng và đơn hủy theo từng loại khách sạn</p>
            </div>
          </div>

          <div className="flex-1 min-h-[260px] pt-4">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={hotel_comparison} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="hotel" tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }} />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} />
                <Tooltip
                  formatter={(val, name) => [val.toLocaleString() + ' đơn', name]}
                  contentStyle={{
                    backgroundColor: '#111827',
                    borderRadius: '8px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend verticalAlign="top" height={32} iconType="circle" />
                <Bar dataKey="non_canceled" name="Không hủy (0)" fill="#16A34A" radius={[4, 4, 0, 0]} />
                <Bar dataKey="canceled" name="Hủy phòng (1)" fill="#DC2626" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-xs text-[#475569] bg-slate-50 p-2.5 rounded-lg border border-[#E2E8F0] flex flex-wrap items-center justify-between gap-2 mt-2">
            <span>City Hotel có tỷ lệ hủy <strong className="text-rose-600 font-bold">41.73%</strong> (33,102 đơn)</span>
            <span>Resort Hotel có tỷ lệ hủy <strong className="text-emerald-600 font-bold">27.76%</strong> (11,122 đơn)</span>
          </div>
        </div>
      </div>

      {/* Row 2: Market Segment & Lead Time */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Market Segment Cancellation Rate */}
        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col">
          <div className="pb-3 border-b border-[#E2E8F0]">
            <h3 className="font-bold text-sm text-[#172033] flex items-center space-x-1.5">
              <Briefcase className="w-4 h-4 text-[#2563EB]" />
              <span>Tỷ Lệ Hủy Theo Phân Khúc Thị Trường (Market Segment)</span>
            </h3>
            <p className="text-xs text-[#94A3B8]">Tỷ lệ hủy phòng (%) xếp theo từng kênh và phân khúc</p>
          </div>

          <div className="flex-1 min-h-[260px] pt-4">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={market_segment_comparison} layout="vertical" margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fill: '#94A3B8', fontSize: 11 }} />
                <YAxis dataKey="market_segment" type="category" tick={{ fill: '#334155', fontSize: 11, fontWeight: 500 }} width={85} />
                <Tooltip
                  formatter={(val) => [`${val}%`, 'Tỷ lệ hủy']}
                  contentStyle={{ backgroundColor: '#111827', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="cancellation_rate" name="Tỷ lệ hủy (%)" fill="#2563EB" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p className="text-xs text-[#475569] mt-2 leading-relaxed">
            * Nhóm <strong>Groups (Đoàn thể)</strong> có tỷ lệ hủy cao nhất (<strong>61.06%</strong>), trong khi khách đặt trực tiếp (<strong>Direct</strong>) có tỷ lệ hủy thấp nhất (<strong>15.37%</strong>).
          </p>
        </div>

        {/* Lead Time Group Cancellation Rate */}
        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col">
          <div className="pb-3 border-b border-[#E2E8F0]">
            <h3 className="font-bold text-sm text-[#172033] flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Tỷ Lệ Hủy Tăng Dần Theo Thời Gian Đặt Trước (Lead Time)</span>
            </h3>
            <p className="text-xs text-[#94A3B8]">Khách đặt trước càng xa ngày đến, nguy cơ hủy phòng càng cao</p>
          </div>

          <div className="flex-1 min-h-[260px] pt-4">
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={lead_time_comparison} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                <defs>
                  <linearGradient id="leadColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="lead_time_group" tick={{ fill: '#64748b', fontSize: 11, angle: -15, textAnchor: 'end' }} />
                <YAxis unit="%" tick={{ fill: '#94A3B8', fontSize: 11 }} domain={[0, 80]} />
                <Tooltip
                  formatter={(val) => [`${val}%`, 'Tỷ lệ hủy']}
                  contentStyle={{ backgroundColor: '#111827', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="cancellation_rate" name="Tỷ lệ hủy (%)" stroke="#D97706" strokeWidth={2.5} fillOpacity={1} fill="url(#leadColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <p className="text-xs text-[#475569] mt-2 leading-relaxed">
            * Đơn đặt trong vòng 1 tuần chỉ có tỷ lệ hủy <strong>13.5%</strong>, trong khi đơn đặt trên 1 năm có tỷ lệ hủy lên đến <strong>72.8%</strong>.
          </p>
        </div>
      </div>

      {/* Row 3: Deposit Type & Important Notice */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-2xs">
          <div className="pb-3 border-b border-[#E2E8F0]">
            <h3 className="font-bold text-sm text-[#172033] flex items-center space-x-1.5">
              <CreditCard className="w-4 h-4 text-[#2563EB]" />
              <span>Tác Động Của Hình Thức Đặt Cọc (Deposit Type)</span>
            </h3>
            <p className="text-xs text-[#94A3B8]">Hiện tượng Non Refund có tỷ lệ hủy 99.36% trong dữ liệu lịch sử</p>
          </div>

          <div className="min-h-[210px] pt-4">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={deposit_comparison} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="deposit_type" tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }} />
                <YAxis unit="%" tick={{ fill: '#94A3B8', fontSize: 11 }} domain={[0, 100]} />
                <Tooltip
                  formatter={(val) => [`${val}%`, 'Tỷ lệ hủy']}
                  contentStyle={{ backgroundColor: '#111827', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="cancellation_rate" name="Tỷ lệ hủy (%)" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#111827] p-6 rounded-xl text-white shadow-2xs flex flex-col justify-between border border-[#1F2937]">
          <div>
            <div className="inline-flex items-center space-x-1.5 bg-blue-500/20 text-blue-300 text-xs font-semibold px-2.5 py-1 rounded-full mb-3 border border-blue-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Đặc trưng then chốt</span>
            </div>
            <h4 className="text-base font-bold text-white tracking-tight">
              Phát Hiện Nghiệp Vụ Cốt Lõi
            </h4>
            <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
              Trong dữ liệu khách sạn tại Lisbon & Algarve, các hợp đồng lữ hành theo đoàn thường chọn chính sách <strong>Non Refund</strong>. Khi đoàn hủy chuyến, hệ thống khách sạn vẫn ghi nhận là Canceled dù không hoàn lại tiền cọc.
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800 text-[11px] text-slate-400">
            Nguồn trích dẫn: Antonio et al., Data in Brief (2019).
          </div>
        </div>
      </div>
    </div>
  );
}
