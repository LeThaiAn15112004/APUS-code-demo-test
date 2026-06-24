# Kế Hoạch Học SQLite Qua Mini Project Quản Lý Sinh Viên

## Mục tiêu

Xây dựng một desktop app quản lý sinh viên có đầy đủ CRUD, đồng thời học chắc chuỗi kiến thức:

- SQLite
- CRUD
- Transaction
- Index
- WAL
- FTS5
- ORM: ưu tiên học sau khi đã nắm SQL cơ bản, có thể chọn Drizzle ORM hoặc TypeORM

Project này nên được làm theo hướng "học tới đâu, ứng dụng tới đó". Mỗi tính năng phải trả lời được 2 câu hỏi:

- App đang giải quyết bài toán gì?
- SQLite đang được dùng như thế nào ở phía sau?

## Phạm vi mini project

App quản lý sinh viên gồm các chức năng chính:

- Thêm sinh viên
- Xem danh sách sinh viên
- Xem chi tiết sinh viên
- Cập nhật thông tin sinh viên
- Xóa sinh viên
- Tìm kiếm sinh viên
- Lọc theo lớp, ngành, trạng thái
- Quản lý điểm hoặc môn học ở mức cơ bản
- Thống kê nhỏ: tổng sinh viên, sinh viên đang học, điểm trung bình, số sinh viên theo lớp

## Mô hình dữ liệu đề xuất

### Bảng students

Thông tin sinh viên cơ bản:

- id
- student_code
- full_name
- email
- phone
- date_of_birth
- gender
- address
- major
- class_name
- status
- created_at
- updated_at

Ràng buộc nên có:

- `student_code` unique
- `email` unique nếu có nhập email
- `full_name` required
- `status` chỉ nhận các giá trị như `active`, `paused`, `graduated`, `dropped`

### Bảng courses

Thông tin môn học:

- id
- course_code
- course_name
- credits
- created_at
- updated_at

### Bảng enrollments

Quan hệ sinh viên - môn học:

- id
- student_id
- course_id
- score
- semester
- created_at
- updated_at

Ràng buộc nên có:

- `student_id` tham chiếu `students.id`
- `course_id` tham chiếu `courses.id`
- Một sinh viên không nên đăng ký trùng cùng một môn trong cùng học kỳ

## Lộ trình thực hiện

## Phase 1: Nắm SQLite cơ bản và tạo database

Mục tiêu:

- Hiểu SQLite là database local, chạy trong file `.db`
- Biết tạo bảng, insert, select, update, delete
- Biết dùng primary key, unique, not null, foreign key

Việc cần làm:

- Tạo file database local cho app
- Tạo schema cho `students`, `courses`, `enrollments`
- Bật foreign key bằng `PRAGMA foreign_keys = ON`
- Viết các câu SQL đầu tiên bằng tay

Cần hiểu:

- SQLite khác gì với MySQL/PostgreSQL
- Database file nên nằm ở đâu trong desktop app
- Khác nhau giữa `INTEGER PRIMARY KEY`, `TEXT`, `REAL`, `DATETIME`

Kết quả mong muốn:

- App có thể tạo database khi chạy lần đầu
- Có thể insert và select sinh viên bằng SQL

## Phase 2: CRUD sinh viên

Mục tiêu:

- Làm trọn vòng CRUD cho entity `student`
- Tách rõ UI, service, repository/database layer

Việc cần làm:

- Create: form thêm sinh viên
- Read: bảng danh sách sinh viên
- Read detail: màn hình hoặc modal chi tiết sinh viên
- Update: form sửa sinh viên
- Delete: xóa sinh viên có xác nhận
- Validate dữ liệu trước khi ghi database

Cần hiểu:

- Khi nào validate ở UI
- Khi nào database constraint sẽ bảo vệ dữ liệu
- Cách xử lý lỗi unique email/student code
- Prepared statement là gì và vì sao tránh SQL injection

Kết quả mong muốn:

- Quản lý sinh viên đầy đủ CRUD
- Không bị crash khi nhập sai hoặc trùng mã sinh viên

## Phase 3: Transaction

Mục tiêu:

- Hiểu transaction giúp gom nhiều thao tác database thành một đơn vị an toàn

Tình huống nên làm:

- Tạo sinh viên và đăng ký môn học mặc định trong cùng một transaction
- Xóa sinh viên và các enrollment liên quan một cách có kiểm soát
- Import nhiều sinh viên từ danh sách mẫu

Cần hiểu:

- `BEGIN`
- `COMMIT`
- `ROLLBACK`
- Nếu một bước lỗi thì database có bị nửa cũ nửa mới không?

Kết quả mong muốn:

- Có ít nhất một use case dùng transaction thật sự
- Có thể giải thích tại sao cần transaction trong use case đó

## Phase 4: Index

Mục tiêu:

- Hiểu index giúp tăng tốc truy vấn đọc, đổi lại tốn thêm dung lượng và chi phí ghi

Index nên tạo:

- `students(student_code)`
- `students(email)`
- `students(class_name)`
- `students(major)`
- `students(status)`
- `enrollments(student_id)`
- `enrollments(course_id)`

Việc cần làm:

- Thêm index cho các cột hay tìm/lọc
- Dùng `EXPLAIN QUERY PLAN` để xem SQLite có dùng index không
- So sánh truy vấn có index và không index bằng data mẫu lớn hơn

Cần hiểu:

- Không phải cột nào cũng nên index
- Index tốt cho search/filter/sort
- Unique constraint thường tạo index ngầm

Kết quả mong muốn:

- Danh sách sinh viên lọc theo lớp/ngành/trạng thái nhanh và có chủ đích
- Biết đọc query plan cơ bản

## Phase 5: WAL

Mục tiêu:

- Hiểu WAL giúp SQLite phù hợp hơn với app desktop có đọc/ghi thường xuyên

Việc cần làm:

- Bật WAL mode bằng `PRAGMA journal_mode = WAL`
- Thiết lập thêm một số pragma cần thiết nếu phù hợp:
  - `PRAGMA foreign_keys = ON`
  - `PRAGMA busy_timeout = 5000`
  - `PRAGMA synchronous = NORMAL`

Cần hiểu:

- WAL là Write-Ahead Logging
- Vì sao WAL có lợi cho việc đọc trong khi đang ghi
- Khi nào file `.db-wal` và `.db-shm` xuất hiện

Kết quả mong muốn:

- App khởi tạo database với WAL mode
- Biết các file phụ của SQLite có ý nghĩa gì

## Phase 6: FTS5

Mục tiêu:

- Làm tìm kiếm full-text tốt hơn cho tên sinh viên, mã sinh viên, email, số điện thoại

Việc cần làm:

- Tạo virtual table FTS5 cho students
- Đồng bộ FTS table khi thêm/sửa/xóa sinh viên
- Làm ô tìm kiếm nhanh trong UI

Cần hiểu:

- FTS5 khác gì với `LIKE '%keyword%'`
- Tokenizer là gì
- Khi nào nên dùng FTS, khi nào filter bình thường là đủ

Kết quả mong muốn:

- Tìm sinh viên nhanh theo tên, mã, email
- Có thể giải thích vì sao FTS5 phù hợp với search box

## Phase 7: ORM

Mục tiêu:

- Sau khi đã nắm SQL cơ bản, dùng ORM để code gọn hơn nhưng vẫn hiểu SQL phía sau

Hướng đề xuất:

- Nếu app dùng TypeScript và muốn schema rõ ràng, nhẹ, gần SQL: ưu tiên Drizzle ORM
- Nếu muốn học một ORM phổ biến, nhiều pattern enterprise: có thể học TypeORM

Việc cần làm:

- Chọn Drizzle ORM hoặc TypeORM
- Map schema `students`, `courses`, `enrollments`
- Viết lại CRUD bằng ORM
- So sánh code SQL thủ công và code ORM

Cần hiểu:

- ORM không thay thế việc hiểu database
- Migration là gì
- Query builder khác repository pattern như thế nào

Kết quả mong muốn:

- Biết khi nào dùng raw SQL
- Biết khi nào dùng ORM cho dễ bảo trì

## Checklist chức năng

- [ ] Khởi tạo SQLite database local
- [ ] Tạo schema ban đầu
- [ ] Bật foreign key
- [ ] Bật WAL mode
- [ ] CRUD sinh viên
- [ ] Validate form sinh viên
- [ ] Xử lý lỗi trùng mã sinh viên/email
- [ ] CRUD môn học cơ bản
- [ ] Đăng ký sinh viên vào môn học
- [ ] Dùng transaction cho một workflow thật
- [ ] Tạo index cho các truy vấn chính
- [ ] Kiểm tra query plan
- [ ] Thêm tìm kiếm FTS5
- [ ] Thêm thống kê cơ bản
- [ ] Viết seed data mẫu
- [ ] Cân nhắc ORM sau khi raw SQL đã ổn

## Gợi ý thứ tự code

1. Tạo database connection và hàm khởi tạo schema.
2. Tạo repository cho `students`.
3. Làm UI danh sách sinh viên.
4. Làm form thêm/sửa sinh viên.
5. Thêm xóa sinh viên có confirm.
6. Thêm search/filter đơn giản bằng SQL.
7. Thêm courses và enrollments.
8. Thêm transaction cho workflow đăng ký môn học.
9. Thêm index và kiểm tra query plan.
10. Bật WAL và ghi chú lại hành vi file database.
11. Thêm FTS5 cho search box.
12. Sau cùng mới đưa ORM vào để so sánh và refactor.

## Nguyên tắc học

- Mỗi lần thêm một tính năng, viết SQL rõ ràng trước.
- Chạy thử với data mẫu đủ lớn để thấy vấn đề thật.
- Ghi lại lỗi gặp phải và cách sửa vào README hoặc notes riêng.
- Dùng ORM sau khi đã hiểu raw SQL, không dùng ORM để né việc học SQL.
- Mỗi bảng nên trả lời được: bảng này lưu gì, khóa chính là gì, ràng buộc nào bảo vệ dữ liệu?

## Definition of Done

Mini project được xem là đạt mục tiêu khi:

- Có app desktop chạy được local.
- Có database SQLite local.
- Sinh viên được quản lý đầy đủ CRUD.
- Có ít nhất một transaction có ý nghĩa.
- Có index cho các truy vấn hay dùng.
- WAL được bật khi khởi tạo database.
- Có search full-text bằng FTS5 hoặc có ghi chú rõ nếu chưa làm.
- Bản thân người làm có thể mở database và đọc/giải thích các bảng chính.
