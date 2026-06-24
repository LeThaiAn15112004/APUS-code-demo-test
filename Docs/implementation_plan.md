# Kế hoạch triển khai Repository Pattern, IPC Bridge và CRUD Sinh viên

Kế hoạch này đề xuất thiết lập tầng Repository để quản lý các thao tác cơ sở dữ liệu (SQLite), cấu hình IPC Bridge (Preload script) kết nối giữa Main process và Renderer process, sau đó xây dựng giao diện UI hoàn chỉnh để thực hiện CRUD Sinh viên.

## User Review Required

> [!IMPORTANT]
> Cần thống nhất cấu trúc thư mục của tầng Repository và cách tổ chức các kênh IPC (IPC Channels) để giao tiếp giữa Renderer và Main.

## Proposed Changes

### [Backend] Database Repository Layer
Thiết lập các lớp Repository để trừu tượng hóa các câu lệnh SQL truy vấn cơ sở dữ liệu.

#### [NEW] [studentRepository.js](file:///c:/Users/ADMIN/Documents/GitHub/APUS-student-management-test/students-management/src/main/repository/studentRepository.js)
* Chứa các phương thức CRUD sinh viên:
  * `getAllStudents(filters)` (tìm kiếm theo tên/mã, lọc theo lớp/trạng thái).
  * `getStudentById(id)`.
  * `createStudent(studentData)` (bao gồm kiểm tra trùng mã `student_code`).
  * `updateStudent(id, studentData)`.
  * `deleteStudent(id)`.

#### [NEW] [courseRepository.js](file:///c:/Users/ADMIN/Documents/GitHub/APUS-student-management-test/students-management/src/main/repository/courseRepository.js)
* Quản lý thông tin môn học.

#### [NEW] [enrollmentRepository.js](file:///c:/Users/ADMIN/Documents/GitHub/APUS-student-management-test/students-management/src/main/repository/enrollmentRepository.js)
* Quản lý việc đăng ký môn học và điểm số của sinh viên.

---

### [IPC Bridge] Electron Preload & Main Handler
Cấu hình giao tiếp IPC an toàn giữa Renderer (giao diện) và Main (CSDL).

#### [MODIFY] [preload/index.js](file:///c:/Users/ADMIN/Documents/GitHub/APUS-student-management-test/students-management/src/preload/index.js)
* Phơi bày API an toàn qua `contextBridge.exposeInMainWorld('api', { ... })` để Renderer gọi các phương thức CRUD sinh viên từ Repository.

#### [MODIFY] [main/index.js](file:///c:/Users/ADMIN/Documents/GitHub/APUS-student-management-test/students-management/src/main/index.js)
* Đăng ký các handler `ipcMain.handle` tương ứng để gọi các phương thức từ Repository khi nhận được yêu cầu từ Renderer.

---

### [Frontend] UI Components & Views
Xây dựng giao diện UI (CSS + HTML/JS) cho việc quản lý sinh viên.

#### [MODIFY] [renderer/index.html](file:///c:/Users/ADMIN/Documents/GitHub/APUS-student-management-test/students-management/src/renderer/index.html)
* Thiết kế cấu trúc HTML cho:
  * Màn hình danh sách sinh viên (Bảng hiển thị sinh viên, thanh tìm kiếm FTS, bộ lọc theo trạng thái/lớp).
  * Modal/Form thêm mới và chỉnh sửa thông tin sinh viên.
  * Màn hình xem chi tiết thông tin sinh viên (bao gồm danh sách môn học đã đăng ký và điểm số).

#### [MODIFY] [renderer/src/main.js](file:///c:/Users/ADMIN/Documents/GitHub/APUS-student-management-test/students-management/src/renderer/src/main.js)
* Viết logic xử lý sự kiện giao diện (gọi các API từ `window.api`, hiển thị dữ liệu lên bảng, validate dữ liệu đầu vào của form trước khi gửi).

---

### [Database] Bước 5: Index & Tối ưu hóa truy vấn
Tối ưu các truy vấn thường dùng trong màn hình danh sách sinh viên, quản lý khóa học và đăng ký khóa học bằng index có chủ đích. Không tạo index tràn lan; chỉ tạo trên các cột hay dùng để tìm kiếm, lọc, join hoặc kiểm tra trùng.

#### [MODIFY] [schema.js](file:///c:/Users/ADMIN/Documents/GitHub/APUS-student-management-test/students-management/src/main/local_database/schema.js)
* Tạo index cho bảng `Student`:
  * `student_code`: phục vụ tìm kiếm theo mã sinh viên và kiểm tra trùng.
  * `full_name`: phục vụ tìm kiếm theo tên sinh viên.
  * `email`: phục vụ kiểm tra trùng email.
  * `class_name`: phục vụ lọc theo lớp.
  * `major`: phục vụ lọc theo ngành/khóa học.
  * `status`: phục vụ lọc theo trạng thái.
* Tạo index cho bảng `Course`:
  * `course_code`: phục vụ tìm kiếm và kiểm tra trùng mã khóa học.
  * `course_name`: phục vụ hiển thị/tìm kiếm khóa học.
* Tạo index cho bảng `Enrollment`:
  * `student_id`: phục vụ lấy danh sách khóa học đã đăng ký của một sinh viên.
  * `course_id`: phục vụ lọc sinh viên theo khóa học.
  * `(student_id, course_id)`: phục vụ kiểm tra sinh viên đã đăng ký khóa học hay chưa và tối ưu join hai chiều.

#### [MODIFY] Repository queries
* Rà soát các truy vấn trong `studentRepository.js`, `courseRepository.js`, `enrollmentRepository.js` để đảm bảo điều kiện `WHERE`, `JOIN`, `ORDER BY` sử dụng đúng cột đã index.
* Với tìm kiếm theo tên/mã sinh viên hiện tại, ưu tiên pattern có thể tận dụng index khi phù hợp. Nếu dùng `%keyword%`, ghi nhận rằng SQLite khó dùng B-tree index tối ưu và phần này sẽ phù hợp hơn với Bước 6 FTS5.
* Tránh thêm index cho các cột ít lọc hoặc dữ liệu quá ít phân biệt nếu chưa có nhu cầu thực tế.

#### Query Plan Checklist
* Dùng `EXPLAIN QUERY PLAN` cho các truy vấn chính:
  * Danh sách sinh viên có tìm theo `student_code`.
  * Danh sách sinh viên lọc theo `class_name`, `major`, `status`.
  * Lấy chi tiết sinh viên kèm danh sách khóa học đã đăng ký.
  * Lọc sinh viên theo khóa học thông qua `Enrollment.course_id`.
  * Kiểm tra trùng mã sinh viên, email, mã khóa học.
* Kỳ vọng khi đọc query plan:
  * Các truy vấn lọc/join chính nên có `SEARCH ... USING INDEX` hoặc `USING COVERING INDEX`.
  * Hạn chế `SCAN Student`, `SCAN Course`, `SCAN Enrollment` ở các màn hình thường dùng.
  * Nếu vẫn scan vì tìm kiếm dạng `%keyword%`, ghi chú để chuyển sang FTS5 ở bước tiếp theo.
* Lưu lại câu SQL mẫu và kết quả query plan vào tài liệu hoặc comment kỹ thuật ngắn để tiện đối chiếu khi tối ưu tiếp.

## Verification Plan

### Manual Verification
1. Chạy ứng dụng bằng `npm run dev`.
2. Kiểm tra giao diện danh sách sinh viên hiển thị đầy đủ 50 học sinh đã được seed.
3. Thử tìm kiếm sinh viên, lọc sinh viên theo lớp/trạng thái.
4. Thử thêm mới sinh viên (thành công / lỗi trùng mã).
5. Chỉnh sửa thông tin sinh viên, kiểm tra cơ sở dữ liệu cập nhật chính xác.
6. Xóa sinh viên và kiểm tra tính toàn vẹn (các bản ghi `Enrollment` liên quan tự động bị xóa theo khóa ngoại).
