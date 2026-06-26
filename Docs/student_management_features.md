# Tổng quan và Chức năng Hệ thống Quản lý Sinh viên

Hệ thống **Quản lý Sinh viên (Student Management)** là một ứng dụng phần mềm giúp các nhà quản lý giáo dục, giáo vụ hoặc giáo viên dễ dàng theo dõi thông tin cá nhân, quá trình đăng ký môn học và kết quả học tập của sinh viên. 

Dưới đây là mô tả chi tiết các tính năng của hệ thống dưới góc nhìn của người sử dụng (End-User):

---

## 1. Quản lý Hồ sơ Sinh viên

Hệ thống cung cấp một trung tâm quản lý toàn bộ danh sách và thông tin chi tiết của từng sinh viên:

*   **Xem danh sách sinh viên:** Hiển thị danh sách toàn bộ sinh viên với các thông tin cơ bản như Mã sinh viên, Họ và tên, Email, Lớp, Chuyên ngành và Trạng thái học tập hiện tại.
*   **Tìm kiếm và Lọc thông tin nhanh chóng:**
    *   Tìm kiếm sinh viên theo **Họ tên**.
    *   Tìm kiếm chính xác sinh viên theo **Mã sinh viên**.
    *   Lọc danh sách sinh viên đang theo học một **Môn học cụ thể**.
    *   Phân trang danh sách để dễ quản lý khi số lượng sinh viên lớn.
*   **Thêm mới sinh viên:** Cho phép đăng ký một sinh viên mới vào hệ thống thông qua biểu mẫu nhập liệu bao gồm các thông tin cá nhân cơ bản.
*   **Chỉnh sửa hồ sơ:** Cập nhật các thông tin của sinh viên khi có thay đổi (chẳng hạn như lớp học, số điện thoại, địa chỉ, ngành học hoặc trạng thái học tập).
*   **Xóa sinh viên:** Loại bỏ sinh viên ra khỏi danh sách hệ thống kèm theo hộp thoại xác nhận để tránh xóa nhầm dữ liệu.

---

## 2. Quản lý Danh mục Môn học (Học phần)

Hệ thống cho phép xây dựng và theo dõi danh mục các môn học được giảng dạy:

*   **Xem danh mục môn học:** Hiển thị danh sách các môn học hiện có trong trường/khoa kèm theo Mã môn học, Tên môn học, Số tín chỉ của môn học đó và ngày tạo môn học trên hệ thống.
*   **Thêm mới môn học:** Khai báo môn học mới để đưa vào chương trình đào tạo bằng cách nhập Mã môn học (ví dụ: `CS109`), Tên môn học và Số tín chỉ tương ứng. Hệ thống tự động kiểm tra để đảm bảo không trùng lặp mã môn học đã có.

---

## 3. Đăng ký Môn học và Quản lý Điểm số

Tính năng này giúp theo dõi và cập nhật quá trình học tập thực tế của từng sinh viên:

*   **Xem chi tiết học tập của sinh viên:** Khi chọn xem chi tiết một sinh viên, người dùng sẽ thấy toàn bộ thông tin liên lạc và danh sách các môn học sinh viên đó đã đăng ký, học kỳ đăng ký và điểm số đạt được của từng môn.
*   **Đăng ký/Hủy đăng ký môn học:**
    *   Người dùng có thể dễ dàng chọn thêm các môn học từ danh mục cho một sinh viên trong một học kỳ cụ thể.
    *   Hủy đăng ký (rút bớt) các môn học đã đăng ký nếu sinh viên thay đổi kế hoạch học tập.
*   **Cập nhật kết quả học tập:** Theo dõi và hiển thị điểm số cụ thể của sinh viên đối với từng môn học để đánh giá kết quả học tập.
