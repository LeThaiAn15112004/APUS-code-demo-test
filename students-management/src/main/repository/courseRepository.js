export default class CourseRepository {
  constructor(db) {
    this.db = db
  }

  getAll() {
    return this.db.prepare('SELECT * FROM Course ORDER BY course_code ASC').all()
  }

  getById(id) {
    return this.db.prepare('SELECT * FROM Course WHERE id = ?').get(id)
  }

  getByCode(code) {
    return this.db.prepare('SELECT * FROM Course WHERE course_code = ?').get(code)
  }

  create(course) {
    const stmt = this.db.prepare(`
      INSERT INTO Course (course_code, course_name, credits)
      VALUES (?, ?, ?)
    `)
    const result = stmt.run(course.course_code, course.course_name, course.credits)
    return result.lastInsertRowid
  }

  update(id, course) {
    const stmt = this.db.prepare(`
      UPDATE Course
      SET course_code = ?, course_name = ?, credits = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
    const result = stmt.run(course.course_code, course.course_name, course.credits, id)
    return result.changes > 0
  }

  delete(id) {
    const result = this.db.prepare('DELETE FROM Course WHERE id = ?').run(id)
    return result.changes > 0
  }
}
