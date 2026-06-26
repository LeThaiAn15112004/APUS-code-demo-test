export default class EnrollmentRepository {
  constructor(db) {
    this.db = db
  }

  getByStudentId(studentId) {
    return this.db
      .prepare(
        `
      SELECT
        e.*,
        COALESCE(cs.semester, e.semester) AS semester,
        COALESCE(e.total_score, e.score) AS score,
        c.course_code,
        c.course_name,
        c.credits,
        cs.section_code,
        cs.status AS section_status
      FROM Enrollment e
      LEFT JOIN CourseSection cs ON e.course_section_id = cs.id
      JOIN Course c ON COALESCE(cs.course_id, e.course_id) = c.id
      WHERE e.student_id = ?
      ORDER BY COALESCE(cs.semester, e.semester) DESC, c.course_code ASC
    `
      )
      .all(studentId)
  }

  create(enrollment) {
    const courseSectionId =
      enrollment.course_section_id ||
      this.getOrCreateCourseSection(enrollment.course_id, enrollment.semester)

    const stmt = this.db.prepare(`
      INSERT INTO Enrollment (
        student_id,
        course_id,
        course_section_id,
        score,
        total_score,
        semester
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `)
    const result = stmt.run(
      enrollment.student_id,
      enrollment.course_id,
      courseSectionId,
      enrollment.score,
      enrollment.score,
      enrollment.semester
    )
    return result.lastInsertRowid
  }

  updateScore(id, score, options = {}) {
    const current = this.db
      .prepare(
        `
        SELECT score, total_score, grade_status
        FROM Enrollment
        WHERE id = ?
      `
      )
      .get(id)

    if (!current) return false

    const nextStatus = options.grade_status || current.grade_status || 'draft'
    const updateTx = this.db.transaction(() => {
      const result = this.db
        .prepare(
          `
          UPDATE Enrollment
          SET score = ?,
            final_score = ?,
            total_score = ?,
            grade_status = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `
        )
        .run(score, score, score, nextStatus, id)

      this.db
        .prepare(
          `
          INSERT INTO GradeAuditLog (
            enrollment_id,
            old_score,
            new_score,
            old_grade_status,
            new_grade_status,
            changed_by,
            reason
          )
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `
        )
        .run(
          id,
          current.total_score ?? current.score,
          score,
          current.grade_status || 'draft',
          nextStatus,
          options.changed_by || 'system',
          options.reason || 'Cập nhật điểm'
        )

      return result
    })

    return updateTx().changes > 0
  }

  delete(id) {
    const result = this.db.prepare('DELETE FROM Enrollment WHERE id = ?').run(id)
    return result.changes > 0
  }

  // Đăng ký nhiều môn học cho một sinh viên trong một học kỳ.
  registerCourses(studentId, courseIds, semester) {
    try {
      if (courseIds.length === 0) {
        return {
          success: true,
          message: 'Không có môn học mới cần đăng ký'
        }
      }

      const inactiveCourses = this.db
        .prepare(
          `
          SELECT course_code
          FROM Course
          WHERE id IN (${courseIds.map(() => '?').join(', ')})
            AND status = 'Ngừng đào tạo'
        `
        )
        .all(courseIds)

      if (inactiveCourses.length > 0) {
        const courseCodes = inactiveCourses.map((course) => course.course_code).join(', ')
        throw new Error(`Không thể đăng ký môn học đã ngừng đào tạo: ${courseCodes}`)
      }

      const missingPrerequisites = this.getMissingPrerequisites(studentId, courseIds)
      if (missingPrerequisites.length > 0) {
        const courseMessages = missingPrerequisites.map(
          (item) => `${item.course_code} cần hoàn thành ${item.prerequisite_course_code}`
        )
        throw new Error(`Chưa đủ môn tiên quyết: ${courseMessages.join('; ')}`)
      }

      // Tạo Prepared Statement để tái sử dụng nhiều lần.
      // Chưa INSERT dữ liệu vào database.
      const insert = this.db.prepare(`
      INSERT INTO Enrollment (student_id, course_id, course_section_id, semester)
      VALUES (?, ?, ?, ?)
    `)

      // Tạo Transaction Function.
      // Lúc này CHƯA có BEGIN TRANSACTION.
      // CHƯA chạy callback bên trong.
      const registerTx = this.db.transaction((courses) => {
        // Callback này sẽ được chạy bên trong Transaction.
        // better-sqlite3 sẽ tự BEGIN trước khi vào đây.
        for (const courseId of courses) {
          const courseSectionId = this.getOrCreateCourseSection(courseId, semester)
          // Thực hiện INSERT từng môn học.
          // Ví dụ:
          // INSERT Enrollment(student_id, course_id, course_section_id, semester)
          insert.run(studentId, courseId, courseSectionId, semester)
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

  getOrCreateCourseSection(courseId, semester) {
    const normalizedSemester = semester.trim()
    const existing = this.db
      .prepare(
        `
        SELECT id
        FROM CourseSection
        WHERE course_id = ?
          AND semester = ?
          AND section_code = 'DEFAULT'
      `
      )
      .get(courseId, normalizedSemester)

    if (existing) return existing.id

    const result = this.db
      .prepare(
        `
        INSERT INTO CourseSection (course_id, semester, section_code, status)
        VALUES (?, ?, 'DEFAULT', 'Đang mở')
      `
      )
      .run(courseId, normalizedSemester)

    return result.lastInsertRowid
  }

  getMissingPrerequisites(studentId, courseIds) {
    if (courseIds.length === 0) return []

    return this.db
      .prepare(
        `
        SELECT
          c.course_code,
          pc.course_code AS prerequisite_course_code,
          cp.minimum_score
        FROM CoursePrerequisite cp
        JOIN Course c ON cp.course_id = c.id
        JOIN Course pc ON cp.prerequisite_course_id = pc.id
        WHERE cp.course_id IN (${courseIds.map(() => '?').join(', ')})
          AND NOT EXISTS (
            SELECT 1
            FROM Enrollment e
            WHERE e.student_id = ?
              AND e.course_id = cp.prerequisite_course_id
              AND COALESCE(e.total_score, e.score, 0) >= cp.minimum_score
          )
      `
      )
      .all(...courseIds, studentId)
  }
}
