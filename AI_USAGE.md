# KHAI BÁO SỬ DỤNG TRỢ LÝ TRÍ TUỆ NHÂN TẠO (AI USAGE STATEMENT)

## 1. Thông Tin Chung
- **Tên học phần:** Nhập môn Học máy (Introduction to Machine Learning)
- **Năm học:** 2026–2027
- **Đề tài:** Đề tài 14 – Dự đoán khách hàng hủy đặt phòng khách sạn (*Hotel Booking Cancellation Prediction*)
- **Nhóm sinh viên thực hiện:** Nhóm 3 thành viên
- **Công cụ AI hỗ trợ:** Google Antigravity IDE (Gemini Models)

---

## 2. Mục Đích và Phạm Vi Sử Dụng AI

Nhóm sinh viên cam kết tuân thủ nghiêm ngặt nguyên tắc **Liêm chính học thuật (Academic Integrity)**. Việc sử dụng công cụ AI trong dự án này chỉ mang tính chất hỗ trợ kỹ thuật, không thay thế cho tư duy khoa học, quá trình phân tích dữ liệu thực tế và năng lực chuyên môn của các thành viên trong nhóm.

### 2.1. Các nội dung CÓ sự hỗ trợ của AI:
1. **Khởi tạo kiến trúc dự án (Project Scaffolding):**
   - Hỗ trợ xây dựng cấu trúc thư mục chuẩn hóa theo mô hình Machine Learning chuyên nghiệp (`data/`, `notebooks/`, `src/`, `models/`, `reports/`, `tests/`, `docs/`).
   - Thiết lập cấu hình môi trường: `.gitignore`, `requirements.txt`.
2. **Hỗ trợ định dạng và tài liệu hóa (Documentation & Templates):**
   - Gợi ý cấu trúc báo cáo học thuật bằng LaTeX theo chuẩn quy định của giảng viên.
   - Định dạng bảng biểu, cấu trúc docstrings theo chuẩn PEP 8.
3. **Gợi ý cú pháp và tái cấu trúc mã nguồn (Code Refactoring & Unit Testing):**
   - Gợi ý cấu trúc viết Scikit-Learn Pipeline và ColumnTransformer để phòng chống rò rỉ dữ liệu (Data Leakage).
   - Hỗ trợ xây dựng khung kiểm thử tự động (Unit Tests với `pytest`).

### 2.2. Các nội dung TUYỆT ĐỐI KHÔNG dùng AI để thay thế con người:
1. **Dữ liệu thực tế:** 100% dữ liệu sử dụng là bộ dữ liệu thực tế *Hotel Booking Demand* (Jesse Mostipak). Không sử dụng dữ liệu tự tạo (synthetic/fake data).
2. **Kết quả thực nghiệm:** Toàn bộ bảng số liệu, ma trận nhầm lẫn (Confusion Matrix), các chỉ số (Accuracy, Precision, Recall, F1-Score, ROC-AUC) và biểu đồ đều được sinh tự động từ quá trình chạy mã nguồn thực tế trên máy tính, không tự ý điền số liệu giả định.
3. **Phân tích và diễn giải khoa học:** Quá trình biện luận về hành vi hủy phòng của khách hàng, phân tích nguyên nhân lỗi (False Positive, False Negative), đánh giá nghiệp vụ khách sạn và rút ra bài học kinh nghiệm được nhóm sinh viên trực tiếp đối chiếu dữ liệu và đúc kết.

---

## 3. Nhật Ký Tương Tác với Trí Tuệ Nhân Tạo

| STT | Giai đoạn | Nội dung yêu cầu hỗ trợ | Kết quả AI cung cấp | Hành động kiểm tra & xác nhận của nhóm |
|:---:|:---|:---|:---|:---|
| 1 | Khởi tạo dự án | Thiết lập cấu trúc thư mục, .gitignore, requirements.txt, project overview | Khung thư mục và các file cấu hình chuẩn | Kiểm tra tương thích môi trường Python 3.14, đường dẫn tệp tin |
| 2 | Tiền xử lý & Pipeline | Gợi ý thiết kế ColumnTransformer phân tách Pipeline A và Pipeline B | Code mẫu Scikit-learn Pipeline | Tự rà soát kiểm tra chống Data Leakage, đảm bảo chỉ fit trên Train set |
| 3 | Huấn luyện & Đánh giá | Tạo script kiểm thử tự động `pytest` cho data loader và pipeline | Code kiểm thử mẫu | Chạy thực tế bộ test trên dữ liệu thật, kiểm tra log thực thi |
| 4 | Báo cáo & Tài liệu | Khung mẫu LaTeX 6 chương theo đề cương môn học | Bộ khung file .tex | Điền số liệu thực nghiệm, chèn biểu đồ kết quả chạy thật và hoàn thiện nội dung |

---

## 4. Cam Đoan

Nhóm xin cam đoan rằng toàn bộ mã nguồn, dữ liệu thực nghiệm và báo cáo đã được các thành viên trong nhóm trực tiếp kiểm thử, hiểu rõ bản chất toán học và thuật toán, sẵn sàng phản biện và bảo vệ trong các buổi vấn đáp trực tiếp với giảng viên hướng dẫn.
