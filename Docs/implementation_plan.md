# Kế Hoạch Triển Khai Tích Hợp FTS5 Cho Tìm Kiếm Sinh Viên

Kế hoạch này đề xuất tích hợp SQLite FTS5 (Full-Text Search 5) để tối ưu hóa tìm kiếm nhanh sinh viên theo Họ tên và Mã sinh viên với độ chính xác cao.

## User Review Required

> [!IMPORTANT]
> - **Tìm kiếm Họ tên (`Student_name_fts`):** Sử dụng bộ tokenizer mặc định (`unicode61`) để hỗ trợ tìm kiếm khớp từ (Word-based match), đảm bảo tìm "Anh" chỉ khớp chính xác người tên "Anh" chứ không bị lẫn sang "Thanh" hay "Oanh".
> - **Tìm kiếm Mã sinh viên (`Student_code_fts`):** Sử dụng bộ tokenizer `trigram` để chia nhỏ ký tự, cho phép tìm kiếm chuỗi con (substring) cực kỳ linh hoạt (gõ "001" vẫn ra "SV001", "HE001", v.v.).

## Proposed Changes

### [Database] SQLite Schema & Triggers

#### [MODIFY] [schema.js](file:///c:/Users/ADMIN/Documents/GitHub/APUS-student-management-test/students-management/src/main/local_database/schema.js)
* Tạo các bảng ảo FTS5 (External Content) để đồng bộ dữ liệu từ bảng `Student`:
  * `Student_name_fts`: Chứa cột `full_name` để tìm kiếm tên.
  * `Student_code_fts`: Chứa cột `student_code` kèm cấu hình `tokenize="trigram"`.
* Viết các Trigger tự động cập nhật FTS5 khi có thao tác Insert, Update, Delete trên bảng `Student`:
  * `student_ai_name`, `student_au_name`, `student_ad_name` cho tên.
  * `student_ai_code`, `student_au_code`, `student_ad_code` cho mã sinh viên.
* Viết lệnh khởi tạo dữ liệu ban đầu cho 2 bảng FTS5 nếu chúng mới được tạo nhưng bảng `Student` đã có dữ liệu.

---

### [Backend] Repository Layer

#### [MODIFY] [studentRepository.js](file:///c:/Users/ADMIN/Documents/GitHub/APUS-student-management-test/students-management/src/main/repository/studentRepository.js)
* Cấu trúc lại phương thức `getAll(filters)`:
  * Khi có tham số `filters.search`, thay vì dùng `LIKE '%...%'` chậm và không chính xác, ta sẽ chuyển sang dùng câu lệnh `MATCH` trên 2 bảng ảo FTS5 bằng toán tử `UNION`:
    ```sql
    SELECT * FROM Student 
    WHERE 1=1
      AND (
        id IN (SELECT rowid FROM Student_name_fts WHERE Student_name_fts MATCH ?)
        OR id IN (SELECT rowid FROM Student_code_fts WHERE Student_code_fts MATCH ?)
        OR email LIKE ?
      )
    ```
  * Xử lý chuỗi tìm kiếm trước khi truyền vào câu lệnh `MATCH` để tránh lỗi cú pháp FTS5 (escaping các ký tự đặc biệt).

## Verification Plan

### Automated Tests
* Chạy trực tiếp truy vấn SQL kiểm tra bằng `better-sqlite3` trong file test hoặc chạy log trực tiếp.

### Manual Verification
1. Khởi động app bằng `npm run dev`.
2. Truy cập màn hình quản lý sinh viên.
3. Nhập từ khóa `"Anh"` vào ô tìm kiếm:
   - Kỳ vọng: Chỉ hiển thị sinh viên tên "Anh" (ví dụ: *Nguyễn Văn An*, *Nguyễn Thị Anh* nếu có). Không hiển thị những người tên *Thanh*, *Oanh*.
4. Nhập từ khóa mã số dạng chuỗi con như `"01"`, `"001"`:
   - Kỳ vọng: Hiển thị các sinh viên có mã số chứa chuỗi đó (ví dụ: *SV001*, *SV011*, *HE001*).
