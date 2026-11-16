# TỔNG QUAN DỰ ÁN BÀI TẬP LỚN MACHINE LEARNING

## 1. THÔNG TIN CHUNG
- **Học phần:** Nhập môn Học máy (Introduction to Machine Learning)
- **Năm học:** 2026–2027
- **Đề tài:** Đề tài 14 – Dự đoán khách hàng hủy đặt phòng khách sạn
- **Tên tiếng Anh:** Hotel Booking Cancellation Prediction
- **Quy mô nhóm:** 3 thành viên
- **Môi trường phát triển:** Visual Studio Code / Antigravity IDE, Python 3.14

---

## 2. BỐI CẢNH VÀ Ý NGHĨA NGHIỆP VỤ

Trong ngành quản trị khách sạn và du lịch (Hospitality Management), việc hủy đặt phòng đột ngột gây ra tổn thất lớn về doanh thu và chi phí vận hành. Khi một phòng bị hủy sát ngày nhận phòng:
- Khách sạn khó có thể bán lại phòng cho khách khác trong thời gian ngắn (Perishable Inventory).
- Ảnh hưởng đến việc sắp xếp nhân sự phục vụ, mua sắm thực phẩm và lập kế hoạch vận hành.
- Khách sạn thường áp dụng chiến lược đặt phòng vượt mức (Overbooking) để bù đắp, nhưng nếu không có mô hình định lượng chính xác, việc overbooking quá đà sẽ dẫn đến tình trạng thiếu phòng, tổn hại uy tín thương hiệu và chịu chi phí bồi thường khách hàng.

**Mục tiêu bài toán:**
Xây dựng mô hình học máy phân loại nhị phân (Binary Classification) có khả năng dự đoán chính xác xác suất khách hàng sẽ hủy đặt phòng (`is_canceled = 1`) hay nhận phòng (`is_canceled = 0`) dựa trên các thông tin thu thập được tại thời điểm đặt phòng.

---

## 3. BỘ DỮ LIỆU (DATASET SPECIFICATION)

- **Tên bộ dữ liệu:** Hotel Booking Demand Dataset
- **Tác giả:** Jesse Mostipak (nguồn gốc từ bài báo nghiên cứu của Antonio, de Almeida và Nunes, 2019, *Data in Brief*)
- **Nguồn dữ liệu:** [Kaggle - Hotel Booking Demand](https://www.kaggle.com/datasets/jessemostipak/hotel-booking-demand)
- **Định dạng:** Dữ liệu bảng (Tabular Data, CSV)
- **Vị trí lưu trữ:** `data/raw/hotel_bookings.csv`
- **Biến mục tiêu (Target Variable):** `is_canceled`
  - `0`: Khách hàng không hủy đặt phòng (Check-Out thành công).
  - `1`: Khách hàng hủy đặt phòng (Canceled hoặc No-Show).

### Nguyên tắc phòng chống Rò rỉ Dữ liệu (Data Leakage Prevention):
1. **Loại bỏ cột `reservation_status`:** Cột này ghi nhận trạng thái cuối cùng của đặt phòng (`Check-Out`, `Canceled`, `No-Show`). Biến này tương đương với biến mục tiêu và chỉ xuất hiện sau khi giao dịch kết thúc. Nếu đưa vào mô hình sẽ gây rò rỉ 100% (target leakage).
2. **Loại bỏ cột `reservation_status_date`:** Cột này lưu ngày trạng thái cuối cùng được cập nhật (ví dụ: ngày khách gọi điện hủy phòng). Thông tin này thuộc về tương lai so với thời điểm đặt phòng.
3. **Quy trình đóng gói Pipeline:** Mọi thao tác tính toán tham số (mean, median, standard deviation, categories cho One-Hot Encoding) CHỈ được học (`fit`) trên tập huấn luyện (Training Set), tuyệt đối không áp dụng trước khi chia tập dữ liệu.

---

## 4. CÁC THUẬT TOÁN HỌC MÁY ĐƯỢC LỰA CHỌN

Dự án tập trung vào các thuật toán cốt lõi trong chương trình học Nhập môn Học máy:

1. **Baseline Model - DummyClassifier:**
   - Chiến lược: `most_frequent` hoặc `stratified`.
   - Mục đích: Thiết lập ngưỡng chuẩn tối thiểu để chứng minh mô hình học máy thực sự học được tri thức từ dữ liệu thay vì chỉ đoán theo tần suất.
2. **K-Nearest Neighbors (KNN):**
   - Thuật toán học theo khoảng cách (Distance-based instance learning).
   - Thử nghiệm các giá trị $k \in \{3, 5, 7, 9, 11\}$ và các hàm khoảng cách (Euclidean, Manhattan).
   - Đòi hỏi chuẩn hóa đặc trưng số (StandardScaler) trước khi tính toán.
3. **Decision Tree (Cây quyết định):**
   - Thuật toán phân chia không gian đặc trưng dựa trên độ đo thuần nhất (Gini Impurity, Entropy / Information Gain).
   - Thử nghiệm tỉa cây (Pruning) qua `max_depth`, `min_samples_split`, `min_samples_leaf` để chống hiện tượng quá khớp (Overfitting).
   - Có khả năng trực quan hóa và giải thích cao về mặt nghiệp vụ.
4. **Naive Bayes (Mở rộng nếu phù hợp):**
   - Mô hình xác suất dựa trên định lý Bayes với giả định độc lập có điều kiện.

---

## 5. THIẾT KẾ THỰC NGHIỆM: HAI PIPELINE TIỀN XỬ LÝ

| Đặc điểm | Pipeline A (Cơ bản / Baseline Preprocessing) | Pipeline B (Cải tiến / Feature Engineering) |
|---|---|---|
| **Mục đích** | Thiết lập quy trình chuẩn tắc, đơn giản | Nâng cao hiệu năng mô hình qua kỹ thuật đặc trưng và xử lý bất thường |
| **Xử lý thiếu (Numeric)** | `SimpleImputer(strategy='median')` | Phân tích nghiệp vụ (VD: `children` thiếu gán 0) |
| **Xử lý thiếu (Categoric)** | `SimpleImputer(strategy='most_frequent')` | Điền giá trị không xác định hoặc nhãn `Unknown` |
| **Mã hóa (Categoric)** | `OneHotEncoder(handle_unknown='ignore')` | `OneHotEncoder` có gộp nhóm hiếm (rare categories) |
| **Chuẩn hóa (KNN)** | `StandardScaler` | `StandardScaler` / `RobustScaler` với các biến bị lệch |
| **Đặc trưng phái sinh** | Không có (sử dụng đặc trưng gốc) | Tạo: `total_nights`, `total_guests`, `is_family`, `lead_time_group`, `is_repeated_guest_history` |

---

## 6. MA TRẬN THÍ NGHIỆM VÀ HỆ CHỈ SỐ ĐÁNH GIÁ

### 6.1. Ma trận thí nghiệm
- **EXP01:** Baseline (DummyClassifier)
- **EXP02:** Pipeline A + KNN
- **EXP03:** Pipeline A + Decision Tree
- **EXP04:** Pipeline B + KNN
- **EXP05:** Pipeline B + Decision Tree
- **EXP06:** Thử nghiệm nâng cao (Hyperparameter Tuning trên Pipeline tốt nhất)

### 6.2. Hệ chỉ số đánh giá đa chiều
Đánh giá độc lập trên Test Set (20% Stratified Split):
1. **Accuracy:** Tỷ lệ phân loại chính xác tổng thể.
2. **Precision (Lớp 1 - Hủy):** Độ chính xác khi mô hình cảnh báo hủy phòng (tránh báo động giả - False Positive).
3. **Recall (Lớp 1 - Hủy):** Tỷ lệ phát hiện khách hủy phòng thực tế (tránh bỏ sót rủi ro - False Negative).
4. **F1-Score:** Trung bình điều hòa giữa Precision và Recall.
5. **ROC-AUC & Confusion Matrix:** Đánh giá khả năng phân tách ngưỡng và trực quan hóa phân bố lỗi.

---

## 7. CẤU TRÚC THƯ MỤC DỰ ÁN

```text
Hotel-Booking-Prediction/
├── data/
│   ├── raw/
│   │   ├── .gitkeep
│   │   └── hotel_bookings.csv
│   └── processed/
│       └── .gitkeep
├── notebooks/
│   ├── 01_data_exploration.ipynb
│   ├── 02_data_preprocessing.ipynb
│   ├── 03_feature_engineering.ipynb
│   ├── 04_model_training.ipynb
│   └── 05_model_evaluation.ipynb
├── src/
│   ├── __init__.py
│   ├── config.py
│   ├── data_loader.py
│   ├── data_validation.py
│   ├── preprocessing.py
│   ├── feature_engineering.py
│   ├── train.py
│   ├── evaluate.py
│   ├── error_analysis.py
│   └── utils.py
├── models/
│   └── .gitkeep
├── reports/
│   ├── figures/
│   ├── tables/
│   ├── results/
│   └── report/
├── tests/
│   ├── test_data_loader.py
│   ├── test_preprocessing.py
│   └── test_pipeline.py
├── docs/
│   ├── project_overview.md
│   ├── methodology.md
│   └── team_contribution.md
├── requirements.txt
├── README.md
├── AI_USAGE.md
├── .gitignore
└── main.py
```
