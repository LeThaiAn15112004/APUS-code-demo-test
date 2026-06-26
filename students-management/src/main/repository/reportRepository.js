export default class ReportRepository {
  constructor(db) {
    this.db = db
  }

  getOverview() {
    const summary = this.db
      .prepare(
        `
        SELECT
          COUNT(DISTINCT s.id) AS total_students,
          ROUND(AVG(COALESCE(e.total_score, e.score)), 2) AS average_score,
          SUM(CASE WHEN COALESCE(e.total_score, e.score, 0) < 5 THEN 1 ELSE 0 END) AS failed_enrollments
        FROM Student s
        LEFT JOIN Enrollment e ON e.student_id = s.id
        WHERE s.status NOT IN ('Đã rút hồ sơ', 'Buộc thôi học')
      `
      )
      .get()

    const courseLoads = this.db
      .prepare(
        `
        SELECT
          c.course_code,
          c.course_name,
          COALESCE(cs.semester, e.semester) AS semester,
          COUNT(e.id) AS enrollment_count
        FROM Enrollment e
        LEFT JOIN CourseSection cs ON e.course_section_id = cs.id
        JOIN Course c ON COALESCE(cs.course_id, e.course_id) = c.id
        GROUP BY c.id, COALESCE(cs.semester, e.semester)
        ORDER BY enrollment_count DESC, c.course_code ASC
        LIMIT 10
      `
      )
      .all()

    const gpaByStudent = this.db
      .prepare(
        `
        SELECT
          s.id,
          s.student_code,
          s.full_name,
          ROUND(AVG(COALESCE(e.total_score, e.score)), 2) AS gpa,
          SUM(CASE WHEN COALESCE(e.total_score, e.score, 0) < 5 THEN 1 ELSE 0 END) AS failed_courses
        FROM Student s
        JOIN Enrollment e ON e.student_id = s.id
        WHERE s.status NOT IN ('Đã rút hồ sơ', 'Buộc thôi học')
        GROUP BY s.id
        ORDER BY gpa DESC, s.student_code ASC
        LIMIT 10
      `
      )
      .all()

    return {
      summary,
      courseLoads,
      gpaByStudent
    }
  }
}
