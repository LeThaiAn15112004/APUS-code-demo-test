# Tài Liệu Nghiệp Vụ - Hệ Thống Quản Lý Đào Tạo APUS

Tài liệu này mô tả các chức năng nghiệp vụ, quy trình xử lý và các ràng buộc dữ liệu của hệ thống quản lý sinh viên và môn học tại APUS.

---

## 1. Nghiệp Vụ Quản Lý Sinh Viên (Student Profile Management)

Hệ thống quản lý thông tin toàn bộ vòng đời học tập của sinh viên tại trường, bao gồm các thông tin nhân thân, hành chính và trạng thái học tập.

### 1.1. Ràng buộc thông tin (Data Constraints):
* **Mã sinh viên (Student Code):** Là định danh duy nhất (Unique), bắt buộc phải nhập và không được phép trùng lặp giữa các sinh viên.
* **Thông tin liên lạc:**
  * **Email:** Phải đúng định dạng và là duy nhất trong hệ thống để tránh nhầm lẫn thông báo gửi đến sinh viên.
  * **Số điện thoại & Ngày sinh:** Định dạng chuẩn để phục vụ công tác liên lạc và lưu trữ hồ sơ.
* **Trạng thái học tập:** Sinh viên luôn thuộc một trong ba trạng thái nghiệp vụ chính:
  * **Đang học:** Sinh viên hoạt động bình thường, được phép đăng ký môn học.
  * **Bảo lưu:** Tạm dừng học tập, thông tin đăng ký môn học được bảo lưu.
  * **Tốt nghiệp:** Hoàn thành chương trình học, đóng hồ sơ học tập.

### 1.2. Quy trình xử lý (Workflows):
* **Thêm mới:** Kiểm tra trùng lặp mã sinh viên và email trước khi lưu vào hệ thống.
* **Cập nhật:** Cho phép sửa các thông tin cá nhân nhưng vẫn giữ tính độc nhất của mã sinh viên.
* **Xóa:** Chỉ cho phép xóa khi sinh viên chưa đăng ký học bất kỳ môn nào (hoặc xử lý xóa liên kết đăng ký đi kèm để tránh mâu thuẫn dữ liệu).

---

## 2. Nghiệp Vụ Quản Lý Học Phần & Môn Học (Course Catalogue Management)

Xây dựng danh mục các môn học thuộc chương trình đào tạo của nhà trường.

### 2.1. Ràng buộc thông tin:
* **Mã môn học (Course Code):** Định danh duy nhất cho từng học phần (Ví dụ: `CS101`, `CS102`).
* **Tín chỉ (Credits):** Số lượng tín chỉ định mức cho mỗi môn học (từ 1 đến 10 tín chỉ), dùng làm căn cứ tính học phí và điểm trung bình tích lũy.

### 2.2. Quy trình xử lý:
* **Tạo học phần mới:** Cấp phát mã môn học và định biên số tín chỉ.
* **Cập nhật/Xóa:** Không được phép xóa môn học nếu môn học đó đang có sinh viên đăng ký học trong học kỳ hiện tại.

---

## 3. Nghiệp Vụ Đăng Ký Học Phần (Course Enrollment)

Đây là nghiệp vụ liên kết giữa **Sinh viên** và **Môn học** trong từng học kỳ.

### 3.1. Quy trình Đăng ký & Hủy môn:
* **Đăng ký môn học:** Sinh viên lựa chọn danh sách các môn muốn học trong kỳ. Hệ thống sẽ ghi nhận mối liên kết này và tạo bảng điểm trống cho sinh viên đối với học phần đó.
* **Hủy đăng ký (Hủy môn):** Cho phép sinh viên rút bớt môn học đã đăng ký nếu được yêu cầu trước khi thời hạn đăng ký đóng lại.

### 3.2. Quản lý Điểm số (Grade Assessment):
* Mỗi lượt đăng ký môn học thành công sẽ đi kèm với một trường Điểm số.
* Điểm số ban đầu hiển thị dưới dạng chưa hoàn thành (`-`). Sau khi có kết quả đánh giá, điểm sẽ được cập nhật hệ số 10 (Ví dụ: `8.5`, `7.0`) để làm cơ sở xét tốt nghiệp hoặc học bổng.
