import React, { useState, useEffect } from 'react';
import {
  Brain,
  Sparkles,
  RefreshCw,
  Hotel,
  Users,
  ShoppingBag,
  Settings,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ShieldCheck,
  RotateCcw,
  Sliders,
  ChevronDown,
  Info,
  Activity,
  Layers,
} from 'lucide-react';
import { fetchAvailableModels, predictSingleBooking, fetchHealth } from '../services/api';

const DEFAULT_FORM = {
  hotel: 'City Hotel',
  lead_time: 45,
  arrival_date_year: 2017,
  arrival_date_month: 'August',
  arrival_date_week_number: 33,
  arrival_date_day_of_month: 15,
  stays_in_weekend_nights: 1,
  stays_in_week_nights: 2,
  adults: 2,
  children: 0,
  babies: 0,
  meal: 'BB',
  country: 'PRT',
  market_segment: 'Online TA',
  distribution_channel: 'TA/TO',
  is_repeated_guest: 0,
  previous_cancellations: 0,
  previous_bookings_not_canceled: 0,
  reserved_room_type: 'A',
  assigned_room_type: 'A',
  booking_changes: 0,
  deposit_type: 'No Deposit',
  agent: 9,
  company: null,
  days_in_waiting_list: 0,
  customer_type: 'Transient',
  adr: 105.0,
  required_car_parking_spaces: 0,
  total_of_special_requests: 1,
};

const SCENARIOS = [
  {
    name: 'Booking có nguy cơ hủy cao',
    description: 'Lead time 240 ngày, cọc Non-Refund, đại lý đoàn thể, từng có tiền sử hủy',
    badge: 'High Risk',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    data: {
      ...DEFAULT_FORM,
      lead_time: 240,
      deposit_type: 'Non Refund',
      market_segment: 'Groups',
      distribution_channel: 'TA/TO',
      previous_cancellations: 2,
      total_of_special_requests: 0,
      required_car_parking_spaces: 0,
      adr: 85.0,
    },
  },
  {
    name: 'Booking có nguy cơ hủy thấp',
    description: 'Resort, Lead time 10 ngày, đặt trực tiếp, có yêu cầu chỗ đỗ xe',
    badge: 'Low Risk',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    data: {
      ...DEFAULT_FORM,
      hotel: 'Resort Hotel',
      lead_time: 10,
      deposit_type: 'No Deposit',
      market_segment: 'Direct',
      distribution_channel: 'Direct',
      is_repeated_guest: 1,
      previous_cancellations: 0,
      previous_bookings_not_canceled: 3,
      total_of_special_requests: 2,
      required_car_parking_spaces: 1,
      adr: 135.0,
    },
  },
  {
    name: 'Booking gia đình',
    description: 'Nghỉ dưỡng 7 đêm mùa hè, 2 người lớn + 2 trẻ em, gói ăn bán trú HB',
    badge: 'Family Stay',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    data: {
      ...DEFAULT_FORM,
      hotel: 'Resort Hotel',
      lead_time: 75,
      stays_in_weekend_nights: 2,
      stays_in_week_nights: 5,
      adults: 2,
      children: 2,
      meal: 'HB',
      market_segment: 'Online TA',
      deposit_type: 'No Deposit',
      reserved_room_type: 'E',
      assigned_room_type: 'E',
      total_of_special_requests: 1,
      adr: 175.0,
    },
  },
  {
    name: 'Booking khách quen',
    description: 'Khách hàng cũ từng ở 5 lần, không hủy bao giờ, đặt qua công ty',
    badge: 'Repeated Guest',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
    data: {
      ...DEFAULT_FORM,
      hotel: 'City Hotel',
      lead_time: 7,
      market_segment: 'Corporate',
      distribution_channel: 'Corporate',
      is_repeated_guest: 1,
      previous_cancellations: 0,
      previous_bookings_not_canceled: 5,
      deposit_type: 'No Deposit',
      total_of_special_requests: 1,
      adr: 95.0,
    },
  },
];

export default function Prediction() {
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('exp06_pipeb_dt_optimized');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [apiOnline, setApiOnline] = useState(true);

  useEffect(() => {
    fetchHealth().then((h) => setApiOnline(h.status === 'healthy')).catch(() => setApiOnline(false));

    fetchAvailableModels()
      .then((res) => {
        setModels(res);
        if (res.length > 0 && !selectedModel) {
          setSelectedModel(res[0].id);
        }
      })
      .catch((err) => console.error('Lỗi tải danh sách mô hình:', err));
  }, []);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let parsedValue = value;
    if (type === 'number') {
      parsedValue = value === '' ? 0 : Number(value);
    }
    setFormData((prev) => ({ ...prev, [name]: parsedValue }));
  };

  const handleReset = () => {
    setFormData(DEFAULT_FORM);
    setResult(null);
    setError(null);
  };

  const applyScenario = (sc) => {
    setFormData(sc.data);
    setResult(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await predictSingleBooking(formData, selectedModel);
      setResult(res);
    } catch (err) {
      setError(err.message || 'Lỗi khi gửi yêu cầu dự đoán.');
    } finally {
      setLoading(false);
    }
  };

  const activeModelObj = models.find((m) => m.id === selectedModel);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 5.1 Page Header */}
      <div className="bg-white rounded-xl p-6 border border-[#E2E8F0] shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <h1 className="text-xl sm:text-2xl font-bold text-[#172033] tracking-tight">
              Dự đoán khả năng hủy đặt phòng
            </h1>
            <p className="text-sm text-[#475569] leading-relaxed max-w-3xl">
              Phân tích thông tin đặt phòng và sử dụng mô hình Machine Learning để ước tính khả năng hủy đặt phòng của khách hàng.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-[#2563EB] border border-blue-200">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Real-time Prediction</span>
            </span>

            <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
              apiOnline
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}>
              <span className={`w-2 h-2 rounded-full ${apiOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              <span>{apiOnline ? 'Backend Online' : 'Backend Offline'}</span>
            </span>

            <span className="px-3 py-1 rounded-full text-xs font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200">
              Model v1.0
            </span>
          </div>
        </div>
      </div>

      {/* 5.2 Model Selection Card */}
      <div className="bg-white rounded-xl p-5 border border-[#E2E8F0] shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#172033]">
                Mô hình dự đoán (Model Selection)
              </h2>
              <p className="text-xs text-[#94A3B8]">
                Lựa chọn kiến trúc mô hình và pipeline tiền xử lý đã huấn luyện
              </p>
            </div>
          </div>

          <div className="sm:w-80">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="form-select font-medium text-xs text-[#172033]"
            >
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} — {m.pipeline}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Model Details Info Bar */}
        {activeModelObj && (
          <div className="pt-3 border-t border-[#E2E8F0] flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#475569]">
            <div>
              <span className="text-[#94A3B8]">Tên mô hình:</span>{' '}
              <strong className="text-[#172033] font-semibold">{activeModelObj.name}</strong>
            </div>
            <div>
              <span className="text-[#94A3B8]">Pipeline:</span>{' '}
              <span className="px-2 py-0.5 rounded bg-blue-50 text-[#2563EB] font-mono text-[11px] font-semibold">
                {activeModelObj.pipeline}
              </span>
            </div>
            <div>
              <span className="text-[#94A3B8]">F1-score thực nghiệm:</span>{' '}
              <strong className="text-emerald-700 font-mono font-bold">
                {activeModelObj.f1_score ? activeModelObj.f1_score.toFixed(3) : '0.801'}
              </strong>
            </div>
            <div>
              <span className="text-[#94A3B8]">Trạng thái:</span>{' '}
              <span className="inline-flex items-center space-x-1 text-emerald-600 font-semibold text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Đã nạp sẵn sàng (Ready)</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 5.3 Quick Scenarios */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#475569] uppercase tracking-wider">
            Kịch Bản Thử Nghiệm Nhanh (Quick Scenarios)
          </span>
          <span className="text-xs text-[#94A3B8]">
            Bấm chọn để nạp nhanh tham số mẫu
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {SCENARIOS.map((sc, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyScenario(sc)}
              className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] hover:border-[#2563EB] text-left transition-all hover:shadow-xs group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${sc.badgeClass}`}>
                  {sc.badge}
                </span>
                <span className="text-[11px] text-[#2563EB] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  Nạp mẫu →
                </span>
              </div>
              <h3 className="text-xs font-bold text-[#172033] mt-2 group-hover:text-[#2563EB] transition-colors">
                {sc.name}
              </h3>
              <p className="text-[11px] text-[#94A3B8] mt-1 line-clamp-2 leading-relaxed">
                {sc.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Two-Column Layout: Form (Left) & Prediction Result (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form Column */}
        <form onSubmit={handleSubmit} className="lg:col-span-8 space-y-5">
          {/* CARD 1 – Hotel & Stay Information */}
          <div className="bg-white rounded-xl p-5 sm:p-6 border border-[#E2E8F0] shadow-2xs space-y-4">
            <div className="flex items-center space-x-2.5 pb-3 border-b border-[#E2E8F0]">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center">
                <Hotel className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#172033]">
                  1. Thông tin Khách sạn & Thời gian Lưu trú
                </h3>
                <p className="text-xs text-[#94A3B8]">
                  Loại khách sạn, số ngày đặt trước, thời gian nhận phòng và giá phòng
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Loại khách sạn (Hotel Type)</label>
                <select
                  name="hotel"
                  value={formData.hotel}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="City Hotel">City Hotel (Khách sạn đô thị)</option>
                  <option value="Resort Hotel">Resort Hotel (Khu nghỉ dưỡng)</option>
                </select>
              </div>

              <div>
                <label className="form-label">Thời gian đặt trước (Lead Time - ngày)</label>
                <input
                  type="number"
                  name="lead_time"
                  min="0"
                  max="800"
                  placeholder="Ví dụ: 45"
                  value={formData.lead_time}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>

              <div>
                <label className="form-label">Tháng nhận phòng (Arrival Month)</label>
                <select
                  name="arrival_date_month"
                  value={formData.arrival_date_month}
                  onChange={handleChange}
                  className="form-select"
                >
                  {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Giá phòng trung bình / ngày (ADR - €)</label>
                <input
                  type="number"
                  step="0.5"
                  name="adr"
                  min="0"
                  placeholder="Ví dụ: 105.0"
                  value={formData.adr}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>

              <div>
                <label className="form-label">Số đêm cuối tuần (Weekend Nights)</label>
                <input
                  type="number"
                  name="stays_in_weekend_nights"
                  min="0"
                  max="20"
                  value={formData.stays_in_weekend_nights}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">Số đêm trong tuần (Week Nights)</label>
                <input
                  type="number"
                  name="stays_in_week_nights"
                  min="0"
                  max="50"
                  value={formData.stays_in_week_nights}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="form-label">Yêu cầu chỗ đỗ xe (Required Parking Spaces)</label>
                <select
                  name="required_car_parking_spaces"
                  value={formData.required_car_parking_spaces}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="0">0 chỗ (Không yêu cầu đỗ xe)</option>
                  <option value="1">1 chỗ đỗ xe</option>
                  <option value="2">2 chỗ đỗ xe</option>
                  <option value="3">3 chỗ trở lên</option>
                </select>
                <span className="text-[11px] text-[#94A3B8] mt-1 block">
                  *Thực nghiệm cho thấy khách có yêu cầu đỗ xe hầu như không bao giờ hủy phòng.
                </span>
              </div>
            </div>
          </div>

          {/* CARD 2 – Guest Information */}
          <div className="bg-white rounded-xl p-5 sm:p-6 border border-[#E2E8F0] shadow-2xs space-y-4">
            <div className="flex items-center space-x-2.5 pb-3 border-b border-[#E2E8F0]">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#172033]">
                  2. Thông tin Khách hàng & Lịch sử lưu trú
                </h3>
                <p className="text-xs text-[#94A3B8]">
                  Số lượng người, khách quen và lịch sử hủy phòng trong quá khứ
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="form-label">Người lớn (Adults)</label>
                <input
                  type="number"
                  name="adults"
                  min="1"
                  max="10"
                  value={formData.adults}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>

              <div>
                <label className="form-label">Trẻ em (Children)</label>
                <input
                  type="number"
                  name="children"
                  min="0"
                  max="10"
                  value={formData.children}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">Em bé (Babies)</label>
                <input
                  type="number"
                  name="babies"
                  min="0"
                  max="5"
                  value={formData.babies}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">Khách cũ? (Repeated Guest)</label>
                <select
                  name="is_repeated_guest"
                  value={formData.is_repeated_guest}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="0">Không (Khách mới lần đầu)</option>
                  <option value="1">Có (Đã từng lưu trú trước đây)</option>
                </select>
              </div>

              <div>
                <label className="form-label">Số lần từng hủy trước đây</label>
                <input
                  type="number"
                  name="previous_cancellations"
                  min="0"
                  max="50"
                  value={formData.previous_cancellations}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">Số lần đã ở thành công</label>
                <input
                  type="number"
                  name="previous_bookings_not_canceled"
                  min="0"
                  max="50"
                  value={formData.previous_bookings_not_canceled}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* CARD 3 – Booking Channel & Policy */}
          <div className="bg-white rounded-xl p-5 sm:p-6 border border-[#E2E8F0] shadow-2xs space-y-4">
            <div className="flex items-center space-x-2.5 pb-3 border-b border-[#E2E8F0]">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#172033]">
                  3. Kênh Đặt Phòng & Chính Sách Đặt Cọc
                </h3>
                <p className="text-xs text-[#94A3B8]">
                  Phân khúc thị trường, kênh phân phối, hình thức đặt cọc và loại phòng
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Phân khúc thị trường (Market Segment)</label>
                <select
                  name="market_segment"
                  value={formData.market_segment}
                  onChange={handleChange}
                  className="form-select font-medium"
                >
                  <option value="Online TA">Online TA (Đại lý trực tuyến OTA)</option>
                  <option value="Offline TA/TO">Offline TA/TO (Tour lữ hành)</option>
                  <option value="Direct">Direct (Đặt trực tiếp tại khách sạn)</option>
                  <option value="Groups">Groups (Khách đoàn thể)</option>
                  <option value="Corporate">Corporate (Doanh nghiệp đối tác)</option>
                  <option value="Aviation">Aviation (Phi hành đoàn hàng không)</option>
                </select>
              </div>

              <div>
                <label className="form-label">Hình thức đặt cọc (Deposit Type)</label>
                <select
                  name="deposit_type"
                  value={formData.deposit_type}
                  onChange={handleChange}
                  className="form-select font-semibold text-[#172033]"
                >
                  <option value="No Deposit">No Deposit (Không cần đặt cọc)</option>
                  <option value="Non Refund">Non Refund (Không hoàn tiền cọc)</option>
                  <option value="Refundable">Refundable (Có hoàn lại tiền cọc)</option>
                </select>
              </div>

              <div>
                <label className="form-label">Kênh phân phối (Distribution Channel)</label>
                <select
                  name="distribution_channel"
                  value={formData.distribution_channel}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="TA/TO">TA/TO (Travel Agency / Tour Operator)</option>
                  <option value="Direct">Direct (Trực tiếp)</option>
                  <option value="Corporate">Corporate (Doanh nghiệp)</option>
                  <option value="GDS">GDS (Hệ thống phân phối toàn cầu)</option>
                </select>
              </div>

              <div>
                <label className="form-label">Loại khách hàng (Customer Type)</label>
                <select
                  name="customer_type"
                  value={formData.customer_type}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="Transient">Transient (Khách lẻ vãng lai)</option>
                  <option value="Transient-Party">Transient-Party (Nhóm vãng lai)</option>
                  <option value="Contract">Contract (Hợp đồng dài hạn)</option>
                  <option value="Group">Group (Khách đoàn)</option>
                </select>
              </div>

              <div>
                <label className="form-label">Gói bữa ăn (Meal Plan)</label>
                <select
                  name="meal"
                  value={formData.meal}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="BB">BB (Bed & Breakfast - Ăn sáng)</option>
                  <option value="HB">HB (Half Board - Ăn 2 bữa)</option>
                  <option value="FB">FB (Full Board - Ăn trọn gói 3 bữa)</option>
                  <option value="SC">SC (Self Catering - Tự phục vụ)</option>
                </select>
              </div>

              <div>
                <label className="form-label">Quốc tịch khách hàng (Country)</label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="form-select font-mono text-xs"
                >
                  <option value="PRT">Bồ Đào Nha (PRT)</option>
                  <option value="GBR">Vương Quốc Anh (GBR)</option>
                  <option value="FRA">Pháp (FRA)</option>
                  <option value="ESP">Tây Ban Nha (ESP)</option>
                  <option value="DEU">Đức (DEU)</option>
                  <option value="ITA">Ý (ITA)</option>
                  <option value="USA">Hoa Kỳ (USA)</option>
                  <option value="BRA">Brazil (BRA)</option>
                  <option value="OTHER">Quốc gia khác</option>
                </select>
              </div>

              <div>
                <label className="form-label">Loại phòng đăng ký (Reserved Room)</label>
                <select
                  name="reserved_room_type"
                  value={formData.reserved_room_type}
                  onChange={handleChange}
                  className="form-select font-mono"
                >
                  {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((r) => (
                    <option key={r} value={r}>Phòng loại {r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Loại phòng được xếp (Assigned Room)</label>
                <select
                  name="assigned_room_type"
                  value={formData.assigned_room_type}
                  onChange={handleChange}
                  className="form-select font-mono"
                >
                  {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'K'].map((r) => (
                    <option key={r} value={r}>Phòng loại {r}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* CARD 4 – Additional Information */}
          <div className="bg-white rounded-xl p-5 sm:p-6 border border-[#E2E8F0] shadow-2xs space-y-4">
            <div className="flex items-center space-x-2.5 pb-3 border-b border-[#E2E8F0]">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center">
                <Settings className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#172033]">
                  4. Yêu Cầu Bổ Sung & Danh Sách Chờ
                </h3>
                <p className="text-xs text-[#94A3B8]">
                  Số lần thay đổi booking, ngày chờ và các yêu cầu đặc biệt của khách
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="form-label">Số yêu cầu đặc biệt (Special Requests)</label>
                <input
                  type="number"
                  name="total_of_special_requests"
                  min="0"
                  max="10"
                  value={formData.total_of_special_requests}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">Số lần đổi phòng/ngày (Booking Changes)</label>
                <input
                  type="number"
                  name="booking_changes"
                  min="0"
                  max="20"
                  value={formData.booking_changes}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">Số ngày trong danh sách chờ (Waiting List)</label>
                <input
                  type="number"
                  name="days_in_waiting_list"
                  min="0"
                  max="400"
                  value={formData.days_in_waiting_list}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* 5.5 Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="h-11 px-5 rounded-lg border border-[#E2E8F0] hover:bg-slate-50 text-slate-700 font-semibold text-xs inline-flex items-center space-x-2 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-slate-500" />
              <span>RESET FORM</span>
            </button>

            <button
              type="submit"
              disabled={loading}
              className="h-12 px-8 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-sm inline-flex items-center space-x-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>ĐANG TÍNH TOÁN DỰ ĐOÁN...</span>
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4" />
                  <span>PREDICT CANCELLATION</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* 5.6 Prediction Result Column */}
        <div className="lg:col-span-4 space-y-4">
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 space-y-1.5 text-xs">
              <div className="flex items-center space-x-2 font-bold">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Không thể thực hiện dự đoán</span>
              </div>
              <p className="text-rose-700 leading-relaxed">{error}</p>
            </div>
          )}

          {result ? (
            <div className={`rounded-xl p-6 border shadow-sm space-y-5 transition-all ${
              result.prediction === 1
                ? 'bg-white border-rose-200 ring-1 ring-rose-200'
                : 'bg-white border-emerald-200 ring-1 ring-emerald-200'
            }`}>
              {/* Header Badge */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Kết Quả Phân Loại
                </span>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                  result.prediction === 1
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  Mức độ: {result.risk_level}
                </span>
              </div>

              {/* Status Display */}
              <div className="flex items-start space-x-3.5">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                  result.prediction === 1
                    ? 'bg-rose-50 text-rose-600 border border-rose-200'
                    : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                }`}>
                  {result.prediction === 1 ? (
                    <AlertTriangle className="w-6 h-6" />
                  ) : (
                    <CheckCircle2 className="w-6 h-6" />
                  )}
                </div>

                <div>
                  <h3 className={`text-lg font-bold tracking-tight ${
                    result.prediction === 1 ? 'text-rose-900' : 'text-emerald-900'
                  }`}>
                    {result.prediction === 1 ? 'CÓ NGUY CƠ HỦY ĐẶT PHÒNG' : 'KHÔNG DỰ ĐOÁN HỦY'}
                  </h3>
                  <p className="text-xs text-[#475569] mt-0.5 leading-relaxed">
                    {result.prediction === 1
                      ? 'Đơn đặt phòng này có xác suất hủy rất cao theo mô hình học máy.'
                      : 'Đơn đặt phòng có độ an toàn cao, dự kiến khách sẽ đến lưu trú.'}
                  </p>
                </div>
              </div>

              {/* Probability Meter (if available) */}
              {result.probability !== null && (
                <div className="p-4 rounded-xl bg-slate-50 border border-[#E2E8F0] space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-[#172033]">
                    <span>Xác suất Hủy (Cancellation Probability)</span>
                    <span className="text-base font-extrabold font-mono text-[#2563EB]">
                      {(result.probability * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        result.probability > 0.6
                          ? 'bg-[#DC2626]'
                          : result.probability > 0.35
                          ? 'bg-[#F59E0B]'
                          : 'bg-[#16A34A]'
                      }`}
                      style={{ width: `${Math.min(Math.max(result.probability * 100, 5), 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-[#94A3B8]">
                    <span>0% (An toàn)</span>
                    <span>Ngưỡng 50%</span>
                    <span>100% (Rất cao)</span>
                  </div>
                </div>
              )}

              {/* Contributing Risk Factors */}
              {result.risk_factors && result.risk_factors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-[#475569] uppercase tracking-wider flex items-center space-x-1.5">
                    <Info className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>Yếu Tố Rủi Ro Được Nhận Diện</span>
                  </h4>
                  <div className="space-y-1.5">
                    {result.risk_factors.map((f, idx) => (
                      <div
                        key={idx}
                        className="text-xs p-2 rounded-lg bg-slate-50 border border-slate-100 text-slate-700 flex items-center space-x-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                        <span className="leading-snug">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Model Metadata */}
              <div className="pt-3 border-t border-slate-100 space-y-1 text-xs text-[#94A3B8]">
                <div className="flex justify-between">
                  <span>Mô hình sử dụng:</span>
                  <span className="font-semibold text-slate-800 font-mono">{result.model_id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pipeline áp dụng:</span>
                  <span className="font-semibold text-blue-600 font-mono">{result.pipeline_type}</span>
                </div>
              </div>

              {/* Academic Disclaimer */}
              <div className="p-3 rounded-lg bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-900 leading-relaxed">
                <strong>Khuyến cáo học thuật:</strong> {result.disclaimer}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-8 border border-[#E2E8F0] text-center space-y-4 shadow-2xs">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#2563EB] mx-auto flex items-center justify-center">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#172033]">Sẵn Sàng Dự Đoán</h4>
                <p className="text-xs text-[#475569] mt-1 max-w-xs mx-auto leading-relaxed">
                  Điền các thông tin của đơn đặt phòng hoặc chọn một trong các kịch bản mẫu ở trên, sau đó nhấn <strong>"PREDICT CANCELLATION"</strong>.
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg text-[11px] text-[#475569] text-left border border-slate-100 leading-relaxed">
                💡 <strong>Gợi ý:</strong> Thử kịch bản <em>Booking có nguy cơ hủy cao</em> để quan sát cách mô hình phản ứng khi gặp <code>Non Refund</code> kết hợp <code>Lead time &gt; 200</code>.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
