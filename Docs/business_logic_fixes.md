# Phân Tích Lỗi Nghiệp Vụ & Phương Án Cải Tiến (APUS Student Management)

Tài liệu này lưu trữ các phân tích về lỗ hổng nghiệp vụ trong thiết kế hiện tại và đề xuất phương án cải tiến để chuẩn bị lên kế hoạch (Implementation Plan) nâng cấp hệ thống.

---

## 1. Nghiệp vụ Xóa Sinh viên & Lịch sử Đào tạo

### Lỗi nghiệp vụ hiện tại:
* Cho phép xóa sinh viên và thực hiện xóa bắc cầu (Cascade Delete) các liên kết đăng ký môn học đi kèm để tránh lỗi ràng buộc khóa ngoại.

### Hệ quả:
* **Mất mát dữ liệu lịch sử:** Nếu sinh viên bị buộc thôi học hoặc tự ý nghỉ học sau vài năm học, việc xóa hồ sơ sẽ làm biến mất toàn bộ lịch sử điểm số, thông tin lớp học, và học phí của các kỳ trước. 
* **Sai lệch báo cáo:** Gây sai lệch nghiêm trọng đối với các báo cáo tài chính và thống kê đào tạo của nhà trường qua các năm.

### Phương án sửa đổi:
* **Không Hard Delete:** Không bao giờ xóa cứng (Hard Delete) tài khoản sinh viên đã phát sinh dữ liệu đăng ký/điểm số trong hệ thống.
* **Soft Delete bằng Trạng thái:** Chuyển trạng thái học tập của sinh viên sang các trạng thái dừng học tương ứng (xem mục 4).

---

## 2. Nghiệp vụ Xóa Môn học & Tính Toàn Vẹn Bảng Điểm

### Lỗi nghiệp vụ hiện tại:
* Chỉ chặn xóa môn học khi môn học đó đang có sinh viên đăng ký học ở học kỳ hiện tại.

### Hệ quả:
* **Bảng điểm mồ côi (Orphaned Rows):** Nếu một môn học đã được dạy ở các khóa trước nhưng kỳ này không có lớp, hệ thống cho phép xóa môn học đó. Khi xóa, toàn bộ điểm số của sinh viên khóa cũ liên kết với môn học này sẽ bị lỗi ràng buộc khóa ngoại (Foreign Key) hoặc trỏ vào khoảng trống, làm sập bảng điểm quá khứ.

### Phương án sửa đổi:
* **Chặn xóa tuyệt đối:** Chỉ cho phép xóa môn học khi môn học đó chưa từng phát sinh bất kỳ lượt đăng ký nào trong lịch sử hệ thống.
* **Trạng thái Ngừng đào tạo:** Nếu môn học đã có dữ liệu lịch sử, chỉ cho phép chuyển trạng thái môn học sang **Ngừng đào tạo** (Deactivated) để khóa không cho đăng ký mới ở các kỳ tiếp theo.

---

## 3. Thiết kế Bảng Điểm & Quản lý Đăng ký Học phần

### Lỗi nghiệp vụ hiện tại:
* Đăng ký học phần liên kết trực tiếp giữa Sinh viên và Môn học. Điểm số chỉ có duy nhất một đầu điểm hệ 10 nhập thẳng vào CSDL.

### Hệ quả:
* **Không lưu vết học lại/học cải thiện:** Nếu sinh viên học lại một môn ở kỳ sau, bản ghi mới sẽ ghi đè lên điểm cũ, làm mất lịch sử học tập và điểm số cũ của sinh viên.
* **Thiếu chiều sâu dữ liệu:** Thực tế giảng dạy yêu cầu các điểm thành phần (Chuyên cần, Giữa kỳ, Cuối kỳ) để tính điểm tổng kết, không thể chỉ nhập một đầu điểm duy nhất.

### Phương án sửa đổi:
* **Thay đổi liên kết:** Lượt đăng ký học phần phải liên kết giữa **Sinh viên** + **Lớp học phần** (chứa thông tin Học kỳ, Năm học cụ thể) thay vì liên kết trực tiếp với Môn học.
* **Cấu trúc lại điểm số:** Bổ sung các cột điểm thành phần và tự động tính toán Điểm tổng kết hệ 10 theo công thức trọng số cấu hình trước.

---

## 4. Mở rộng Trạng thái Học tập của Sinh viên

### Lỗi nghiệp vụ hiện tại:
* Chỉ thiết kế 3 trạng thái cơ bản: *Đang học*, *Bảo lưu*, *Tốt nghiệp*.

### Hệ quả:
* Không thể phân loại chính xác các trường hợp thực tế phức tạp trong quản lý đào tạo như: sinh viên bị kỷ luật đình chỉ, sinh viên bị buộc thôi học (nợ môn/học phí), tự rút hồ sơ, hoặc sinh viên đã hoàn thành chương trình nhưng chưa đủ chuẩn đầu ra (chờ tốt nghiệp).

### Phương án sửa đổi:
* Bổ sung và cập nhật đầy đủ các trạng thái nghiệp vụ:
  * **Đang học**
  * **Bảo lưu**
  * **Chờ tốt nghiệp** (Đã học xong nhưng chưa xét tốt nghiệp)
  * **Tốt nghiệp**
  * **Buộc thôi học** (Do kỷ luật hoặc học lực)
  * **Đã rút hồ sơ** (Tự nguyện xin nghỉ)
