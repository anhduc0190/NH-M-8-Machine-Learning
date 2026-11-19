"""
Pydantic Schemas for Booking Input Data and Prediction Output.
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class BookingInput(BaseModel):
    hotel: str = Field(default="City Hotel", description="Loại khách sạn: City Hotel hoặc Resort Hotel")
    lead_time: int = Field(default=45, ge=0, le=1000, description="Thời gian đặt trước (ngày)")
    arrival_date_year: int = Field(default=2017, description="Năm nhận phòng")
    arrival_date_month: str = Field(default="August", description="Tháng nhận phòng")
    arrival_date_week_number: int = Field(default=33, ge=1, le=53, description="Tuần trong năm")
    arrival_date_day_of_month: int = Field(default=15, ge=1, le=31, description="Ngày trong tháng")
    stays_in_weekend_nights: int = Field(default=1, ge=0, description="Số đêm cuối tuần")
    stays_in_week_nights: int = Field(default=2, ge=0, description="Số đêm trong tuần")
    adults: int = Field(default=2, ge=0, le=10, description="Số lượng người lớn")
    children: float = Field(default=0.0, ge=0.0, le=10.0, description="Số lượng trẻ em")
    babies: int = Field(default=0, ge=0, le=10, description="Số lượng em bé")
    meal: str = Field(default="BB", description="Gói bữa ăn: BB, HB, FB, SC, Undefined")
    country: str = Field(default="PRT", description="Mã quốc gia ISO (PRT, GBR, FRA...)")
    market_segment: str = Field(default="Online TA", description="Phân khúc thị trường")
    distribution_channel: str = Field(default="TA/TO", description="Kênh phân phối")
    is_repeated_guest: int = Field(default=0, ge=0, le=1, description="Khách hàng cũ: 0 hoặc 1")
    previous_cancellations: int = Field(default=0, ge=0, description="Số lần từng hủy phòng trong quá khứ")
    previous_bookings_not_canceled: int = Field(default=0, ge=0, description="Số lần từng ở thành công trong quá khứ")
    reserved_room_type: str = Field(default="A", description="Loại phòng đăng ký đặt")
    assigned_room_type: str = Field(default="A", description="Loại phòng được giao")
    booking_changes: int = Field(default=0, ge=0, description="Số lần thay đổi thông tin đặt phòng")
    deposit_type: str = Field(default="No Deposit", description="Hình thức đặt cọc: No Deposit, Non Refund, Refundable")
    agent: Optional[float] = Field(default=9.0, description="ID của đại lý du lịch")
    company: Optional[float] = Field(default=None, description="ID của công ty đặt phòng")
    days_in_waiting_list: int = Field(default=0, ge=0, description="Số ngày nằm trong danh sách chờ")
    customer_type: str = Field(default="Transient", description="Loại khách hàng: Transient, Transient-Party, Contract, Group")
    adr: float = Field(default=105.0, ge=0.0, description="Giá phòng trung bình mỗi ngày (Average Daily Rate)")
    required_car_parking_spaces: int = Field(default=0, ge=0, le=5, description="Số chỗ đỗ xe yêu cầu")
    total_of_special_requests: int = Field(default=1, ge=0, le=10, description="Số lượng yêu cầu đặc biệt")

    model_config = {
        "json_schema_extra": {
            "example": {
                "hotel": "City Hotel",
                "lead_time": 60,
                "arrival_date_year": 2017,
                "arrival_date_month": "August",
                "arrival_date_week_number": 33,
                "arrival_date_day_of_month": 15,
                "stays_in_weekend_nights": 1,
                "stays_in_week_nights": 2,
                "adults": 2,
                "children": 0.0,
                "babies": 0,
                "meal": "BB",
                "country": "PRT",
                "market_segment": "Online TA",
                "distribution_channel": "TA/TO",
                "is_repeated_guest": 0,
                "previous_cancellations": 0,
                "previous_bookings_not_canceled": 0,
                "reserved_room_type": "A",
                "assigned_room_type": "A",
                "booking_changes": 0,
                "deposit_type": "No Deposit",
                "agent": 9.0,
                "company": None,
                "days_in_waiting_list": 0,
                "customer_type": "Transient",
                "adr": 105.0,
                "required_car_parking_spaces": 0,
                "total_of_special_requests": 1,
            }
        }
    }


class PredictionResponse(BaseModel):
    prediction: int = Field(..., description="0: Không hủy, 1: Có nguy cơ hủy")
    prediction_label: str = Field(..., description="Nhãn hiển thị tiếng Việt")
    probability: Optional[float] = Field(None, description="Xác suất ước lượng của lớp 1 (nếu có)")
    model_id: str
    model_name: str
    pipeline_type: str
    risk_level: str
    risk_factors: List[str]
    disclaimer: str
