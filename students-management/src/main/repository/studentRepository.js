const SOFT_DELETED_STATUSES = ['Đã rút hồ sơ', 'Buộc thôi học']
const DEFAULT_SOFT_DELETE_STATUS = 'Đã rút hồ sơ'
const VALID_STUDENT_STATUSES = [
  'Đang học',
  'Bảo lưu',
  'Chờ tốt nghiệp',
  'Tốt nghiệp',
  'Buộc thôi học',
  'Đã rút hồ sơ'
]

function normalizeStudentStatus(status) {
  if (VALID_STUDENT_STATUSES.includes(status)) {
    return status
  }

  return 'Đang học'
}

export default class StudentRepository {
  constructor(db) {
    this.db = db
  }

  getAll(filters = {}) {
    let sql = 'SELECT * FROM Student WHERE 1=1'
    const params = []

    if (filters.status) {
      sql += ' AND status = ?'
      params.push(filters.status)
    } else if (!filters.includeInactive) {
      sql += ` AND (status IS NULL OR status NOT IN (${SOFT_DELETED_STATUSES.map(() => '?').join(', ')}))`
      params.push(...SOFT_DELETED_STATUSES)
    }

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
      normalizeStudentStatus(student.status)
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
      normalizeStudentStatus(student.status),
      id
    )
    return result.changes > 0
  }

  delete(id) {
    const result = this.db
      .prepare(
        `
        UPDATE Student
        SET status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `
      )
      .run(DEFAULT_SOFT_DELETE_STATUS, id)
    return result.changes > 0
  }
}
