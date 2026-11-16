# DỰ ĐOÁN KHÁCH HÀNG HỦY ĐẶT PHÒNG KHÁCH SẠN
## (Hotel Booking Cancellation Prediction)

[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![Scikit-Learn](https://img.shields.io/badge/scikit--learn-1.3%2B-orange.svg)](https://scikit-learn.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 1. TÊN DỰ ÁN
**Bài tập lớn môn Nhập môn Học máy (2026–2027)**  
**Đề tài 14:** Dự đoán khách hàng hủy đặt phòng khách sạn (*Hotel Booking Cancellation Prediction*).

---

## 2. GIỚI THIỆU ĐỀ TÀI
Trong ngành du lịch và lưu trú, việc khách hàng hủy đặt phòng đột xuất gây thất thoát lớn về doanh thu và xáo trộn hoạt động vận hành của khách sạn. Dự án xây dựng một giải pháp học máy có khả năng phân tích hành vi khách hàng, nhận diện các yếu tố rủi ro và dự đoán xác suất hủy đặt phòng ngay từ thời điểm đặt phòng nhằm hỗ trợ ban quản lý tối ưu hóa chính sách overbooking, định giá động và nâng cao trải nghiệm khách hàng.

---

## 3. MỤC TIÊU NGHIÊN CỨU
- Phân tích khám phá dữ liệu (EDA) đa chiều để tìm ra các xu hướng, phân phối bất thường và các yếu tố ảnh hưởng mạnh đến quyết định hủy phòng.
- Xây dựng 2 phương án tiền xử lý (Pipeline A cơ bản và Pipeline B cải tiến) đảm bảo triệt để **không rò rỉ dữ liệu (No Data Leakage)**.
- Triển khai và so sánh các thuật toán học máy trong chương trình học: **DummyClassifier (Baseline), K-Nearest Neighbors (KNN), Decision Tree (Cây quyết định)** và mở rộng **Naive Bayes**.
- Đánh giá mô hình toàn diện qua nhiều chỉ số: **Accuracy, Precision, Recall, F1-score, ROC-AUC** kết hợp phân tích ma trận nhầm lẫn (Confusion Matrix).
- Thực hiện **Phân tích lỗi (Error Analysis)** chuyên sâu để tìm ra nguyên nhân của các ca False Positive và False Negative nhằm đề xuất khuyến nghị thực tế.

---

## 4. NGUỒN DỮ LIỆU (DATASET)
- **Tên bộ dữ liệu:** Hotel Booking Demand
- **Tác giả:** Jesse Mostipak (dựa trên nghiên cứu của Nuno Antonio, Ana de Almeida, Luis Nunes - 2019)
- **Nguồn Kaggle:** [https://www.kaggle.com/datasets/jessemostipak/hotel-booking-demand](https://www.kaggle.com/datasets/jessemostipak/hotel-booking-demand)
- **Đặc điểm:** Dữ liệu bảng chứa thông tin đặt phòng thực tế của hai khách sạn: Resort Hotel (H1) và City Hotel (H2).
- **Biến mục tiêu:** `is_canceled` (0: Không hủy / 1: Có hủy đặt phòng).
- **Lưu ý chống rò rỉ:** Tuyệt đối loại bỏ các cột trạng thái kết quả cuối cùng như `reservation_status` và `reservation_status_date`.

---

## 5. CÔNG NGHỆ VÀ THƯ VIỆN SỬ DỤNG
- **Ngôn ngữ:** Python 3.10+ (Được kiểm thử trên Python 3.14)
- **Thư viện tính toán & dữ liệu:** `pandas`, `numpy`
- **Học máy (Machine Learning):** `scikit-learn`, `joblib`
- **Trực quan hóa dữ liệu:** `matplotlib`, `seaborn`
- **Môi trường & Công cụ:** Visual Studio Code, Antigravity IDE, Jupyter Notebook, `pytest`, `streamlit`

---

## 6. CẤU TRÚC THƯ MỤC DỰ ÁN

```text
Hotel-Booking-Prediction/
├── data/
│   ├── raw/                      # Chứa dữ liệu gốc (hotel_bookings.csv)
│   └── processed/                # Dữ liệu trung gian sau khi tiền xử lý
├── notebooks/                    # 5 Jupyter Notebooks theo đúng tiến trình nghiên cứu
│   ├── 01_data_exploration.ipynb
│   ├── 02_data_preprocessing.ipynb
│   ├── 03_feature_engineering.ipynb
│   ├── 04_model_training.ipynb
│   └── 05_model_evaluation.ipynb
├── src/                          # Mã nguồn module hóa chuẩn PEP 8
│   ├── __init__.py
│   ├── config.py                 # Thiết lập hằng số, đường dẫn, hyperparams
│   ├── data_loader.py            # Nạp và kiểm tra dữ liệu
│   ├── data_validation.py        # Kiểm tra tính toàn vẹn của dữ liệu
│   ├── preprocessing.py          # Xây dựng Scikit-Learn Pipelines A & B
│   ├── feature_engineering.py    # Kỹ thuật tạo đặc trưng phái sinh
│   ├── train.py                  # Huấn luyện mô hình và cross-validation
│   ├── evaluate.py               # Đánh giá và xuất bảng metric
│   ├── error_analysis.py         # Phân tích sâu các ca dự đoán sai
│   └── utils.py                  # Các hàm tiện ích bổ trợ
├── models/                       # Lưu trữ mô hình đã huấn luyện (.joblib)
├── reports/                      # Báo cáo và sản phẩm đầu ra
│   ├── figures/                  # Biểu đồ EDA, ROC Curve, Confusion Matrix
│   ├── tables/                   # Bảng thống kê mô tả, tỷ lệ missing
│   ├── results/                  # File kết quả so sánh metric (CSV, JSON)
│   └── report/                   # Mã nguồn LaTeX báo cáo 6 chương
├── tests/                        # Kiểm thử tự động (Unit Tests)
│   ├── test_data_loader.py
│   ├── test_preprocessing.py
│   └── test_pipeline.py
├── docs/                         # Tài liệu thuyết minh dự án
│   ├── project_overview.md
│   ├── methodology.md
│   └── team_contribution.md
├── requirements.txt              # Danh sách thư viện phụ thuộc
├── README.md                     # Hướng dẫn tổng thể dự án
├── AI_USAGE.md                   # Báo cáo minh bạch sử dụng AI
├── .gitignore                    # Loại trừ các file rác và dữ liệu lớn
└── main.py                       # Điểm khởi chạy toàn bộ luồng chương trình
```

---

## 7. CÁCH CÀI ĐẶT MÔI TRƯỜNG PYTHON

Yêu cầu máy tính đã cài đặt Python 3.10 trở lên. Kiểm tra phiên bản bằng lệnh:
```bash
python --version
```

---

## 8. CÁCH TẠO MÔI TRƯỜNG ẢO (VIRTUAL ENVIRONMENT)

Khuyến nghị sử dụng môi trường ảo độc lập để tránh xung đột thư viện:

Trên Windows (PowerShell):
```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

Trên Linux / macOS:
```bash
python3 -m venv .venv
source .venv/bin/activate
```

---

## 9. CÁCH CÀI ĐẶT THƯ VIỆN (REQUIREMENTS)

Nâng cấp `pip` và cài đặt toàn bộ phụ thuộc:
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

---

## 10. CÁCH TẢI VÀ ĐẶT DỮ LIỆU

1. Truy cập liên kết Kaggle: [Hotel Booking Demand Dataset](https://www.kaggle.com/datasets/jessemostipak/hotel-booking-demand).
2. Tải file `hotel_bookings.csv`.
3. Đặt file vào đúng đường dẫn sau trong thư mục dự án:
   ```text
   data/raw/hotel_bookings.csv
   ```
4. Chạy lệnh kiểm tra tính toàn vẹn của dữ liệu:
   ```bash
   python -m src.data_validation
   ```

---

## 11. CÁCH CHẠY PHÂN TÍCH KHÁM PHÁ DỮ LIỆU (EDA)

Bạn có thể chạy phân tích theo hai cách:

**Cách 1: Chạy Jupyter Notebook**
```bash
jupyter notebook notebooks/01_data_exploration.ipynb
```

**Cách 2: Chạy trực tiếp qua dòng lệnh (CLI)**
```bash
python main.py --mode eda
```
Biểu đồ sẽ tự động được lưu vào thư mục `reports/figures/` và các bảng thống kê được lưu vào `reports/tables/`.

---

## 12. CÁCH HUẤN LUYỆN MÔ HÌNH (TRAINING)

Huấn luyện các mô hình Baseline, KNN và Decision Tree với cả hai Pipeline:
```bash
python main.py --mode train
```
Các mô hình được lưu tự động trong thư mục `models/`.

---

## 13. CÁCH ĐÁNH GIÁ MÔ HÌNH (EVALUATION)

Chạy quy trình đánh giá độc lập trên tập kiểm thử (Test Set 20%):
```bash
python main.py --mode evaluate
```
Chạy phân tích lỗi (False Positive / False Negative):
```bash
python main.py --mode error-analysis
```

---

## 14. KẾT QUẢ THỰC NGHIỆM TỔNG HỢP

Bảng số liệu thực nghiệm thu được từ quá trình đánh giá khách quan độc lập trên tập kiểm thử (**Test Set gồm 23,878 mẫu** - tương đương 20% dữ liệu gốc đã được stratify):

| Mã Thí Nghiệm | Tên Mô Hình | Tiền Xử Lý | Accuracy | Precision (Lớp 1) | Recall (Lớp 1) | F1-Score (Lớp 1) | ROC-AUC | TN | FP | FN | TP |
|:---:|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **EXP01** | DummyClassifier (Most Frequent) | Baseline | 62.96% | 0.00% | 0.00% | 0.00% | 0.5000 | 15,033 | 0 | 8,845 | 0 |
| **EXP02** | K-Nearest Neighbors (KNN, k=7) | Pipeline A | 82.63% | 77.88% | 74.18% | 75.98% | 0.8949 | 13,169 | 1,864 | 2,284 | 6,561 |
| **EXP03** | Decision Tree (max_depth=10) | Pipeline A | 84.42% | 82.16% | 74.02% | 77.88% | 0.9230 | 13,611 | 1,422 | 2,298 | 6,547 |
| **EXP04** | K-Nearest Neighbors (KNN, k=7) | Pipeline B | 82.93% | 77.77% | 75.48% | 76.61% | 0.8965 | 13,125 | 1,908 | 2,169 | 6,676 |
| **EXP05** | Decision Tree (Balanced) | Pipeline B | 84.31% | 76.87% | **82.44%** | 79.56% | 0.9266 | 12,839 | 2,194 | **1,553** | **7,292** |
| **EXP06** | Decision Tree Tuned (Optimized) | Pipeline B | **85.48%** | **81.27%** | 79.01% | **80.12%** | **0.9289** | **13,422** | 1,611 | 1,857 | 6,988 |

### Điểm nổi bật từ thực nghiệm:
1. **Hiệu quả của Kỹ thuật đặc trưng (Pipeline B vs Pipeline A):**
   - KNN trên Pipeline B tăng Accuracy từ 82.63% lên 82.93% và Recall tăng từ 74.18% lên 75.48%.
   - Decision Tree trên Pipeline B khi áp dụng `class_weight='balanced'` đạt **Recall cao nhất (82.44%)**, giảm số đơn hủy bị bỏ sót (False Negative) từ 2,298 xuống chỉ còn 1,553 đơn (giảm hơn 32% rủi ro cho khách sạn).
2. **Mô hình tối ưu tổng thể:**
   - EXP06 (Decision Tree Tuned với Pruning độ sâu 15 và tiêu chuẩn Entropy) đạt điểm cân bằng tốt nhất: **Accuracy 85.48%, F1-Score 0.8012 và ROC-AUC 0.9289**.

---

## 15. THÀNH VIÊN NHÓM VÀ LIÊN HỆ
- **Thành viên 1:** Nguyễn Anh Đức - 1871020148 - Phụ trách Khám phá & Trực quan hóa Dữ liệu (EDA)
- **Thành viên 2:** Lưu Phương Thảo - *[MSSV]* - Phụ trách Tiền xử lý, Kỹ thuật đặc trưng & Huấn luyện mô hình
- **Thành viên 3:** Lê Hoàng Nam - 1871020417 - Phụ trách Đánh giá mô hình, Phân tích lỗi & Báo cáo khoa học

---

## 16. PHÂN CÔNG NHIỆM VỤ
Chi tiết bảng phân bổ ma trận trách nhiệm RACI và tiến độ được ghi nhận tại:
[docs/team_contribution.md](file:///d:/NH-M-8-Machine-Learning/docs/team_contribution.md)

---

## 17. TÀI LIỆU THAM KHẢO
1. Antonio, N., de Almeida, A., & Nunes, L. (2019). *Hotel booking demand datasets*. Data in Brief, 22, 41-49.
2. Jesse Mostipak. *Hotel Booking Demand Dataset*. Kaggle.
3. Pedregosa et al. *Scikit-learn: Machine Learning in Python*. JMLR 12, pp. 2825-2830, 2011.
4. Géron, A. (2022). *Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow (3rd ed.)*. O'Reilly Media.

---

## 18. KHAI BÁO SỬ DỤNG AI (ACADEMIC INTEGRITY)
Dự án có sử dụng Google Antigravity IDE (Gemini Models) để hỗ trợ khởi tạo cấu trúc khung dự án, refactoring mã nguồn và định dạng mẫu báo cáo LaTeX. 100% dữ liệu, kết quả thực nghiệm và nhận định khoa học được thực hiện trên dữ liệu thật. Chi tiết xem tại:
[AI_USAGE.md](file:///d:/NH-M-8-Machine-Learning/AI_USAGE.md)
