export default class StudentRepository {
  constructor(db) {
    this.db = db
  }

  getAll(filters = {}) {
    let sql = 'SELECT * FROM Student WHERE 1=1'
    const params = []

    if (filters.searchName) {
      const clean = filters.searchName.trim()
      if (clean) {
        // Bao trong dấu ngoặc kép để tìm kiếm cụm từ/từ chính xác
        const safeQuery = `"${clean.replace(/"/g, '""')}"`
        sql += ` AND id IN (SELECT rowid FROM "Student_name_fts" WHERE "Student_name_fts" MATCH ?)`
        params.push(safeQuery)
      }
    }

    if (filters.searchCode) {
      const clean = filters.searchCode.trim()
      if (clean) {
        // Trực tiếp tìm kiếm trigram
        const safeQuery = `"${clean.replace(/"/g, '""')}"`
        sql += ` AND id IN (SELECT rowid FROM "Student_code_fts" WHERE "Student_code_fts" MATCH ?)`
        params.push(safeQuery)
      }
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
