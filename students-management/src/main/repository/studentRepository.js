export default class StudentRepository {
  constructor(db) {
    this.db = db
  }

  getAll(filters = {}) {
    let sql = 'SELECT * FROM Student WHERE 1=1'
    const params = []

    if (filters.search) {
      sql += ' AND (full_name LIKE ? OR student_code LIKE ? OR email LIKE ?)'
      const searchPattern = `%${filters.search}%`
      params.push(searchPattern, searchPattern, searchPattern)
    }

    if (filters.className) {
      sql += ' AND class_name = ?'
      params.push(filters.className)
    }

    if (filters.status) {
      sql += ' AND status = ?'
      params.push(filters.status)
    }

    sql += ' ORDER BY student_code ASC'
    const stmt = this.db.prepare(sql)
    return stmt.all(params)
  }

  getById(id) {
    const stmt = this.db.prepare('SELECT * FROM Student WHERE id = ?')
    return stmt.get(id)
  }

  getByCode(code) {
    const stmt = this.db.prepare('SELECT * FROM Student WHERE student_code = ?')
    return stmt.get(code)
  }

  create(student) {
    const stmt = this.db.prepare(`
      INSERT INTO Student (student_code,
       full_name,
        email,
         phone,
          date_of_birth,
           gender,
            address,
             major,
              class_name,
               status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    const result = stmt.run(
      student.student_code,
      student.full_name,
      student.email,
      student.phone,
      student.date_of_birth,
      student.gender,
      student.address,
      student.major,
      student.class_name,
      student.status || 'Đang học'
    )
    return result.lastInsertRowid
  }

  update(id, student) {
    const stmt = this.db.prepare(`
      UPDATE Student
      SET student_code = ?,
       full_name = ?,
        email = ?,
         phone = ?,
          date_of_birth = ?,
           gender = ?,
            address = ?,
             major = ?,
              class_name = ?,
               status = ?,
                updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
    const result = stmt.run(
      student.student_code,
      student.full_name,
      student.email,
      student.phone,
      student.date_of_birth,
      student.gender,
      student.address,
      student.major,
      student.class_name,
      student.status,
      id
    )
    return result.changes > 0
  }

  delete(id) {
    const result = this.db.prepare('DELETE FROM Student WHERE id = ?').run(id)
    return result.changes > 0
  }
}
