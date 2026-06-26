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

---

## 5. Checklist bổ sung nghiệp vụ cấp Enterprise

Bản mô tả hiện tại đã bao phủ được các tính năng cốt lõi như CRUD cơ bản, nhưng dưới góc độ thiết kế hệ thống chuyên nghiệp vẫn còn một số lỗ hổng nghiệp vụ quan trọng cần bổ sung.

### 5.1. Thiếu tính toàn vẹn dữ liệu

**Vấn đề:** Hệ thống cho phép xóa sinh viên nhưng chưa mô tả rõ cách xử lý dữ liệu liên quan như điểm số và đăng ký môn học.

**Rủi ro:** Nếu xóa sinh viên theo kiểu hard delete, lịch sử điểm số và đăng ký học phần của sinh viên có thể bị xóa theo, làm mất dữ liệu đào tạo và ảnh hưởng thống kê/kiểm toán.

**Giải pháp:** Chuyển sang cơ chế xóa mềm bằng `is_active = false` hoặc `deleted_at`. Dữ liệu vẫn còn trong database để phục vụ báo cáo, thống kê và audit.

### 5.2. Thiếu quy trình học kỳ

**Vấn đề:** Môn học đang được quản lý rời rạc. Trong thực tế, môn học phải gắn với học kỳ/năm học, ví dụ: Học kỳ 1 năm 2026, Học kỳ 2 năm 2026.

**Rủi ro:** Không thể thống kê chính xác sinh viên học môn đó vào thời điểm nào, không quản lý tốt việc học lại hoặc cải thiện điểm.

**Giải pháp:** Bổ sung cấu trúc dữ liệu học kỳ. Đăng ký môn học nên được mô hình hóa theo quan hệ `Student + Course + Semester`.

### 5.3. Thiếu ràng buộc môn học tiên quyết

**Vấn đề:** Các môn học hiện tại là các thực thể độc lập, chưa có quan hệ tiên quyết.

**Rủi ro:** Hệ thống có thể cho phép sinh viên đăng ký môn nâng cao khi chưa hoàn thành môn cơ sở.

**Giải pháp:** Thêm tính năng môn học tiên quyết. Khi đăng ký môn học, hệ thống phải kiểm tra sinh viên đã hoàn thành các môn yêu cầu trước đó hay chưa.

### 5.4. Quy trình cập nhật điểm số chưa đủ chặt

**Vấn đề:** Cập nhật điểm là thao tác nhạy cảm nhưng hiện chưa có quy trình riêng, phân quyền riêng hoặc khả năng truy vết.

**Rủi ro:** Điểm số có thể bị chỉnh sửa tự do, thiếu minh bạch và không biết ai đã sửa, sửa khi nào, sửa từ giá trị nào sang giá trị nào.

**Giải pháp:** Bổ sung phân quyền cho giáo viên/giáo vụ, audit log cho thay đổi điểm số và trạng thái điểm: `draft` -> `published` -> `locked`.

### 5.5. Thiếu thống kê và báo cáo

**Vấn đề:** Hệ thống chủ yếu hỗ trợ xem/sửa/xóa dữ liệu, chưa có lớp báo cáo phục vụ quản lý.

**Rủi ro:** Người quản lý không có đủ dữ liệu tổng hợp để ra quyết định đào tạo.

**Giải pháp:** Bổ sung các chỉ số như GPA, tỷ lệ sinh viên nợ môn, danh sách lớp đông/vắng và các báo cáo theo học kỳ/năm học.

### Tóm tắt lỗi nghiệp vụ cần bổ sung

| Tính năng | Lỗi nghiệp vụ hiện tại | Cách khắc phục |
| --- | --- | --- |
| Xóa sinh viên | Xóa vĩnh viễn, mất lịch sử đào tạo | Chuyển sang xóa mềm bằng `is_active` hoặc `deleted_at` |
| Đăng ký môn học | Thiếu chiều thời gian | Gắn đăng ký với học kỳ/năm học |
| Môn học | Môn nào cũng đăng ký được | Thêm môn học tiên quyết |
| Điểm số | Chỉnh sửa tùy ý | Thêm phân quyền, audit log và quy trình chốt điểm |
| Báo cáo | Chưa hỗ trợ ra quyết định | Thêm GPA, nợ môn, thống kê lớp và báo cáo học kỳ |

### Ưu tiên triển khai

Nếu mục tiêu là học và cải thiện hệ thống từng bước, nên ưu tiên:

1. Xóa mềm sinh viên/môn học để bảo toàn dữ liệu lịch sử.
2. Bổ sung học kỳ để đăng ký và điểm số có ngữ cảnh thời gian.
3. Sau đó mới mở rộng sang môn tiên quyết, quy trình điểm số và báo cáo.
