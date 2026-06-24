export default class EnrollmentRepository {
  constructor(db) {
    this.db = db
  }

  getByStudentId(studentId) {
    return this.db
      .prepare(
        `
      SELECT e.*, c.course_code, c.course_name, c.credits
      FROM Enrollment e
      JOIN Course c ON e.course_id = c.id
      WHERE e.student_id = ?
      ORDER BY e.semester DESC, c.course_code ASC
    `
      )
      .all(studentId)
  }

  create(enrollment) {
    const stmt = this.db.prepare(`
      INSERT INTO Enrollment (student_id, course_id, score, semester)
      VALUES (?, ?, ?, ?)
    `)
    const result = stmt.run(
      enrollment.student_id,
      enrollment.course_id,
      enrollment.score,
      enrollment.semester
    )
    return result.lastInsertRowid
  }

  updateScore(id, score) {
    const stmt = this.db.prepare(`
      UPDATE Enrollment
      SET score = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
    const result = stmt.run(score, id)
    return result.changes > 0
  }

  delete(id) {
    const result = this.db.prepare('DELETE FROM Enrollment WHERE id = ?').run(id)
    return result.changes > 0
  }

  // Đăng ký nhiều môn học cho một sinh viên trong một học kỳ.
  registerCourses(studentId, courseIds, semester) {
    try {
      // Tạo Prepared Statement để tái sử dụng nhiều lần.
      // Chưa INSERT dữ liệu vào database.
      const insert = this.db.prepare(`
      INSERT INTO Enrollment (student_id, course_id, semester)
      VALUES (?, ?, ?)
    `)

      // Tạo Transaction Function.
      // Lúc này CHƯA có BEGIN TRANSACTION.
      // CHƯA chạy callback bên trong.
      const registerTx = this.db.transaction((courses) => {
        // Callback này sẽ được chạy bên trong Transaction.
        // better-sqlite3 sẽ tự BEGIN trước khi vào đây.
        for (const courseId of courses) {
          // Thực hiện INSERT từng môn học.
          // Ví dụ:
          // INSERT INTO Enrollment VALUES (1, 101, '2026A')
          // INSERT INTO Enrollment VALUES (1, 102, '2026A')
          // INSERT INTO Enrollment VALUES (1, 103, '2026A')
          insert.run(studentId, courseId, semester)
        }

        // Nếu chạy hết vòng lặp mà không có lỗi:
        // better-sqlite3 sẽ tự COMMIT.
      })

      // Gọi Transaction Function.
      //
      // better-sqlite3 ngầm thực hiện:
      //
      // BEGIN DEFERRED;
      //   callback(courses)
      // COMMIT;
      //
      // Nếu có exception:
      //
      // BEGIN DEFERRED;
      //   callback(courses)
      // ROLLBACK;
      //
      registerTx(courseIds)

      // Chỉ chạy tới đây khi Transaction COMMIT thành công.
      return {
        success: true,
        message: 'Đăng ký môn học thành công'
      }
    } catch (error) {
      // Nếu một insert.run() bị lỗi:
      //
      // UNIQUE constraint failed
      // FOREIGN KEY constraint failed
      // NOT NULL constraint failed
      // ...
      //
      // better-sqlite3 tự động ROLLBACK trước.
      // Sau đó exception được ném ra đây.
      console.error('Register courses failed:', error)

      return {
        success: false,
        message: error.message
      }
    }
  }
}
