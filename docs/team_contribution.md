# BẢNG PHÂN CÔNG NHIỆM VỤ VÀ ĐÓNG GÓP THÀNH VIÊN
## ĐỀ TÀI 14: DỰ ĐOÁN KHÁCH HÀNG HỦY ĐẶT PHÒNG KHÁCH SẠN

---

## 1. DANH SÁCH THÀNH VIÊN NHÓM

| STT | Họ và Tên | Mã sinh viên | Vai trò chính | Email liên hệ |
|:---:|:---|:---:|:---|:---|
| 1 | Nguyễn Anh Đức | 1871020148 | Data Analyst / EDA Specialist | *[Điền Email]* |
| 2 | Lưu Phương Thảo | *[Điền MSSV]* | Preprocessing & ML Engineer | *[Điền Email]* |
| 3 | Lê Hoàng Nam | 1871020417 | Evaluation, Error Analysis & Reporter | *[Điền Email]* |

---

## 2. MA TRẬN PHÂN CÔNG NHIỆM VỤ CHI TIẾT (RACI MATRIX)

*Ghi chú: R = Responsible (Người thực hiện chính), A = Accountable (Chịu trách nhiệm nghiệm thu), C = Consulted (Tham khảo ý kiến), I = Informed (Được thông báo).*

| Giai đoạn & Hạng mục công việc | Thành viên 1 | Thành viên 2 | Thành viên 3 | Sản phẩm đầu ra cụ thể |
|---|:---:|:---:|:---:|---|
| **1. Khởi tạo & Kiểm tra Dữ liệu** | **R/A** | C | I | Module `data_loader.py`, `data_validation.py` |
| **2. Phân tích khám phá dữ liệu (EDA)** | **R/A** | C | C | Notebook `01_data_exploration.ipynb`, bảng biểu trong `reports/tables/`, biểu đồ trong `reports/figures/` |
| **3. Phân tích ngoại lệ & Dữ liệu thiếu** | **R/A** | C | I | Báo cáo chi tiết về tỷ lệ missing và outlier trong `01_data_exploration.ipynb` |
| **4. Xây dựng Pipeline A (Baseline)** | C | **R/A** | I | Module `preprocessing.py`, notebook `02_data_preprocessing.ipynb` |
| **5. Xây dựng Pipeline B & Feature Engineering** | C | **R/A** | I | Module `feature_engineering.py`, notebook `03_feature_engineering.ipynb` |
| **6. Huấn luyện Mô hình (KNN, Decision Tree)** | I | **R/A** | C | Module `train.py`, notebook `04_model_training.ipynb`, models trong `models/` |
| **7. Đánh giá Mô hình & So sánh Metric** | I | C | **R/A** | Module `evaluate.py`, notebook `05_model_evaluation.ipynb`, bảng kết quả `reports/results/` |
| **8. Phân tích lỗi (Error Analysis - FP & FN)** | C | C | **R/A** | Module `src/error_analysis.py`, phân tích sâu các mẫu dự đoán sai |
| **9. Soạn thảo Báo cáo Khoa học (LaTeX)** | C (Chương 1) | C (Chương 2, 3) | **R/A** (Tổng hợp, Chương 4, 5, 6) | Tài liệu hoàn chỉnh trong `reports/report/` |
| **10. Tài liệu hóa dự án (README, Demo)** | I | C | **R/A** | File `README.md`, slide thuyết trình, ứng dụng Streamlit |

---

## 3. BẢNG THEO DÕI TIẾN ĐỘ VÀ ĐÓNG GÓP THỰC TẾ

| Tuần | Nội dung công việc | Thành viên phụ trách | Trạng thái | Minh chứng GitHub (Commit / PR) |
|:---:|:---|:---:|:---:|:---|
| Tuần 1 | Khởi tạo repo, cấu hình môi trường, nạp và kiểm tra dữ liệu thô | Cả nhóm | Hoàn thành | Initial commit, project scaffolding |
| Tuần 2 | Thực hiện toàn diện EDA, vẽ biểu đồ phân phối, tương quan, tỷ lệ hủy | Thành viên 1 | Chờ thực hiện | Notebook 01, EDA figures & tables |
| Tuần 3 | Thiết kế Pipeline A, Pipeline B, kiểm soát chống Data Leakage | Thành viên 2 | Chờ thực hiện | `src/preprocessing.py`, `feature_engineering.py` |
| Tuần 4 | Huấn luyện DummyClassifier, KNN, Decision Tree và tinh chỉnh tham số | Thành viên 2 | Chờ thực hiện | `src/train.py`, Notebook 04 |
| Tuần 5 | Đánh giá độc lập trên Test Set, phân tích lỗi (FP/FN), lập bảng metric | Thành viên 3 | Chờ thực hiện | `src/evaluate.py`, `error_analysis.py` |
| Tuần 6 | Soạn thảo báo cáo LaTeX 6 chương, hoàn thiện README, kiểm thử cuối cùng | Cả nhóm | Chờ thực hiện | Report LaTeX source, final tests |

---

## 4. CAM KẾT CHẤT LƯỢNG VÀ TRÁCH NHIỆM

1. Mỗi thành viên có trách nhiệm nắm vững toàn bộ mã nguồn của cả dự án để sẵn sàng trả lời các câu hỏi vấn đáp độc lập của giảng viên.
2. Mọi đoạn mã đóng góp phải được kiểm thử bằng `pytest` và tuân thủ định dạng PEP 8 trước khi đưa vào nhánh chính.
3. Tỷ lệ đóng góp công việc giữa 3 thành viên được đánh giá cân bằng (33.3% - 33.3% - 33.3%).
