"""
Streamlit Web Application Demo for Hotel Booking Cancellation Prediction.

Provides interactive GUI allowing hotel managers to input booking parameters
and obtain real-time cancellation predictions with decision tree explanations.
"""

from pathlib import Path
import streamlit as st
import pandas as pd
import numpy as np
import joblib

# Page configuration
st.set_page_config(
    page_title="Hotel Booking Cancellation Prediction",
    page_icon="🏨",
    layout="wide",
)

MODEL_PATH = Path("models/exp06_pipeb_dt_optimized.joblib")


@st.cache_resource
def load_trained_model():
    """Load the best performing serialized model pipeline."""
    if not MODEL_PATH.exists():
        st.error(f"Không tìm thấy mô hình tại '{MODEL_PATH}'. Vui lòng chạy huấn luyện trước!")
        return None
    return joblib.load(MODEL_PATH)


pipeline = load_trained_model()

st.title("🏨 Dự Đoán Khách Hàng Hủy Đặt Phòng Khách Sạn")
st.markdown(
    """
    **Học phần:** Nhập môn Học máy (2026–2027) | **Đề tài 14**  
    Ứng dụng học máy phân loại nhị phân hỗ trợ dự báo sớm nguy cơ hủy phòng dựa trên thông tin đặt phòng ban đầu.
    """
)

st.write("---")

col1, col2, col3 = st.columns(3)

with col1:
    st.subheader("1. Thông tin cơ sở & Khách sạn")
    hotel = st.selectbox("Loại khách sạn:", ["City Hotel", "Resort Hotel"])
    lead_time = st.slider("Thời gian đặt trước (Lead Time - ngày):", min_value=0, max_value=500, value=60)
    arrival_month = st.selectbox(
        "Tháng nhận phòng:",
        [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ],
        index=6,
    )
    arrival_year = st.selectbox("Năm nhận phòng:", [2016, 2017, 2018], index=1)
    arrival_week = st.slider("Tuần trong năm (Week Number):", 1, 53, 27)
    arrival_day = st.slider("Ngày trong tháng (Day):", 1, 31, 15)

with col2:
    st.subheader("2. Chi tiết lưu trú & Đoàn khách")
    weekend_nights = st.number_input("Số đêm cuối tuần (Weekend Nights):", min_value=0, max_value=15, value=1)
    week_nights = st.number_input("Số đêm trong tuần (Week Nights):", min_value=0, max_value=30, value=3)
    adults = st.number_input("Người lớn (Adults):", min_value=1, max_value=10, value=2)
    children = st.number_input("Trẻ em (Children):", min_value=0, max_value=10, value=0)
    babies = st.number_input("Em bé (Babies):", min_value=0, max_value=5, value=0)
    meal = st.selectbox("Gói bữa ăn (Meal):", ["BB", "HB", "FB", "SC", "Undefined"])
    country = st.selectbox("Quốc tịch khách hàng:", ["PRT", "GBR", "FRA", "ESP", "DEU", "ITA", "IRL", "USA", "BRA", "Unknown"])

with col3:
    st.subheader("3. Kênh bán & Chính sách cọc")
    market_segment = st.selectbox(
        "Phân khúc thị trường:",
        ["Online TA", "Offline TA/TO", "Direct", "Corporate", "Groups", "Aviation", "Complementary"]
    )
    distribution_channel = st.selectbox("Kênh phân phối:", ["TA/TO", "Direct", "Corporate", "GDS"])
    deposit_type = st.selectbox("Hình thức đặt cọc:", ["No Deposit", "Non Refund", "Refundable"])
    customer_type = st.selectbox("Loại khách hàng:", ["Transient", "Transient-Party", "Contract", "Group"])
    reserved_room = st.selectbox("Loại phòng đặt trước:", ["A", "B", "C", "D", "E", "F", "G", "H"])
    assigned_room = st.selectbox("Loại phòng thực tế được giao:", ["A", "B", "C", "D", "E", "F", "G", "H"])
    adr = st.number_input("Giá phòng trung bình/đêm (ADR - EUR):", min_value=0.0, max_value=1000.0, value=105.0)

col4, col5 = st.columns(2)
with col4:
    st.subheader("4. Lịch sử đặt phòng")
    prev_cancels = st.number_input("Số lần từng hủy phòng trước đây:", min_value=0, max_value=20, value=0)
    prev_not_cancels = st.number_input("Số lần từng lưu trú không hủy trước đây:", min_value=0, max_value=50, value=0)
    is_repeated = st.selectbox("Khách hàng quay lại (Repeated Guest):", [0, 1], format_func=lambda x: "Có" if x == 1 else "Không")
    booking_changes = st.number_input("Số lần thay đổi đặt phòng:", min_value=0, max_value=10, value=0)

with col5:
    st.subheader("5. Yêu cầu dịch vụ đặc biệt")
    special_requests = st.slider("Số lượng yêu cầu đặc biệt (Special Requests):", 0, 5, value=1)
    parking = st.selectbox("Yêu cầu chỗ đỗ xe hơi:", [0, 1], format_func=lambda x: "Có" if x == 1 else "Không")
    days_waiting = st.number_input("Số ngày trong danh sách chờ:", min_value=0, max_value=300, value=0)
    agent = 9.0
    company = np.nan

st.write("---")

if st.button("🚀 DỰ ĐOÁN NGUY CƠ HỦY PHÒNG", type="primary", use_container_width=True):
    input_data = pd.DataFrame([{
        "hotel": hotel,
        "lead_time": lead_time,
        "arrival_date_year": arrival_year,
        "arrival_date_month": arrival_month,
        "arrival_date_week_number": arrival_week,
        "arrival_date_day_of_month": arrival_day,
        "stays_in_weekend_nights": weekend_nights,
        "stays_in_week_nights": week_nights,
        "adults": adults,
        "children": float(children),
        "babies": babies,
        "meal": meal,
        "country": country,
        "market_segment": market_segment,
        "distribution_channel": distribution_channel,
        "is_repeated_guest": is_repeated,
        "previous_cancellations": prev_cancels,
        "previous_bookings_not_canceled": prev_not_cancels,
        "reserved_room_type": reserved_room,
        "assigned_room_type": assigned_room,
        "booking_changes": booking_changes,
        "deposit_type": deposit_type,
        "agent": agent,
        "company": company,
        "days_in_waiting_list": days_waiting,
        "customer_type": customer_type,
        "adr": adr,
        "required_car_parking_spaces": parking,
        "total_of_special_requests": special_requests,
    }])

    if pipeline is not None:
        prediction = pipeline.predict(input_data)[0]
        proba = None
        if hasattr(pipeline, "predict_proba"):
            proba = pipeline.predict_proba(input_data)[0][1]

        st.subheader("📊 KẾT QUẢ DỰ BÁO CỦA HỆ THỐNG:")

        if prediction == 1:
            st.error(
                "⚠️ **CẢNH BÁO: ĐƠN ĐẶT PHÒNG CÓ NGUY CƠ HỦY CAO (is_canceled = 1)**\n\n"
                "Khách hàng có khả năng cao sẽ hủy phòng hoặc không đến nhận phòng (No-Show). "
                "Khuyến nghị khách sạn chủ động kích hoạt quy trình xác nhận qua email/điện thoại hoặc cân nhắc mở bán Overbooking có kiểm soát."
            )
        else:
            st.success(
                "✅ **ĐƠN ĐẶT PHÒNG CÓ ĐỘ TIN CẬY CAO (is_canceled = 0)**\n\n"
                "Khách hàng có khả năng cao sẽ đến nhận phòng đúng lịch trình (Check-Out thành công)."
            )

        if proba is not None:
            st.info(
                f"📈 **Xác suất ước lượng tại node lá của Decision Tree:** `{proba:.1%}`\n\n"
                "*Lưu ý khoa học: Đây là tỷ lệ mẫu lớp 1 tại node lá của Decision Tree, chưa qua hiệu chuẩn xác suất (Probability Calibration).*"
            )

        # Contextual insights
        st.write("### 🔍 Phân tích các yếu tố rủi ro chính trong đơn này:")
        risks = []
        if lead_time > 90:
            risks.append(f"- **Thời gian đặt trước dài ({lead_time} ngày):** Theo phân tích EDA, đơn đặt trên 3 tháng có tỷ lệ hủy trên 45%.")
        if deposit_type == "Non Refund":
            risks.append("- **Hình thức đặt cọc Non Refund:** Nhóm hợp đồng đoàn này có tỷ lệ hủy lịch sử lên đến 99%.")
        if special_requests == 0:
            risks.append("- **Không có yêu cầu đặc biệt nào:** Khách hàng không có yêu cầu đặc biệt thường có tỷ lệ hủy cao gấp đôi nhóm có từ 2 yêu cầu trở lên.")
        if hotel == "City Hotel":
            risks.append("- **Loại hình City Hotel:** Khách sạn nội đô có tỷ lệ hủy trung bình (41.7%) cao hơn đáng kể so với Resort Hotel (27.8%).")

        if risks:
            for r in risks:
                st.markdown(r)
        else:
            st.markdown("- Các chỉ số đặt phòng cho thấy hành vi ổn định, ít yếu tố rủi ro đột biến.")
