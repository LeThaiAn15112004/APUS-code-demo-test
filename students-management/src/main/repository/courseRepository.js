const ACTIVE_COURSE_STATUS = 'Đang đào tạo'
const DEACTIVATED_COURSE_STATUS = 'Ngừng đào tạo'

export default class CourseRepository {
  constructor(db) {
    this.db = db
  }

  getAll(filters = {}) {
    let sql = 'SELECT * FROM Course WHERE 1=1'
    const params = []

    if (!filters.includeInactive) {
      sql += ' AND (status IS NULL OR status = ?)'
      params.push(ACTIVE_COURSE_STATUS)
    }

    sql += ' ORDER BY course_code ASC'
    return this.db.prepare(sql).all(params)
  }

  getById(id) {
    return this.db.prepare('SELECT * FROM Course WHERE id = ?').get(id)
  }

  getByCode(code) {
    return this.db.prepare('SELECT * FROM Course WHERE course_code = ?').get(code)
  }

  create(course) {
    const stmt = this.db.prepare(`
      INSERT INTO Course (course_code, course_name, credits, status)
      VALUES (?, ?, ?, ?)
    `)
    const result = stmt.run(
      course.course_code,
      course.course_name,
      course.credits,
      course.status || ACTIVE_COURSE_STATUS
    )
    return result.lastInsertRowid
  }

  update(id, course) {
    const stmt = this.db.prepare(`
      UPDATE Course
      SET course_code = ?, course_name = ?, credits = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
    const result = stmt.run(
      course.course_code,
      course.course_name,
      course.credits,
      course.status || ACTIVE_COURSE_STATUS,
      id
    )
    return result.changes > 0
  }

  delete(id) {
    const result = this.db
      .prepare(
        `
        UPDATE Course
        SET status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `
      )
      .run(DEACTIVATED_COURSE_STATUS, id)
    return result.changes > 0
  }
}
