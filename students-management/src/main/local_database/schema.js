import { sampleStudents } from './data.js'

export default function initSchema(db) {
  // Bật hỗ trợ khóa ngoại (Foreign Keys) và chế độ WAL cho SQLite
  db.exec('PRAGMA foreign_keys = ON;')
  db.exec('PRAGMA journal_mode = WAL;')

  // Tạo các bảng nếu chưa tồn tại
  db.exec(`
  CREATE TABLE IF NOT EXISTS "Student" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "student_code" TEXT UNIQUE NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT UNIQUE,
    "phone" TEXT,
    "date_of_birth" TEXT,
    "gender" TEXT,
    "address" TEXT,
    "major" TEXT,
    "class_name" TEXT,
    "status" TEXT,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS "Course" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "course_code" TEXT UNIQUE NOT NULL,
    "course_name" TEXT NOT NULL,
    "credits" INTEGER NOT NULL,
    "status" TEXT DEFAULT 'Đang đào tạo',
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS "CourseSection" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "course_id" INTEGER NOT NULL,
    "semester" TEXT NOT NULL,
    "section_code" TEXT NOT NULL DEFAULT 'DEFAULT',
    "status" TEXT DEFAULT 'Đang mở',
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("course_id") REFERENCES "Course" ("id"),
    UNIQUE ("course_id", "semester", "section_code")
  );

  CREATE TABLE IF NOT EXISTS "CoursePrerequisite" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "course_id" INTEGER NOT NULL,
    "prerequisite_course_id" INTEGER NOT NULL,
    "minimum_score" REAL DEFAULT 5.0,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("course_id") REFERENCES "Course" ("id"),
    FOREIGN KEY ("prerequisite_course_id") REFERENCES "Course" ("id"),
    UNIQUE ("course_id", "prerequisite_course_id")
  );

  CREATE TABLE IF NOT EXISTS "Enrollment" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "student_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "course_section_id" INTEGER,
    "score" REAL,
    "attendance_score" REAL,
    "midterm_score" REAL,
    "final_score" REAL,
    "total_score" REAL,
    "grade_status" TEXT DEFAULT 'draft',
    "semester" TEXT NOT NULL,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("student_id") REFERENCES "Student" ("id") ON DELETE CASCADE,
    FOREIGN KEY ("course_id") REFERENCES "Course" ("id") ON DELETE CASCADE,
    FOREIGN KEY ("course_section_id") REFERENCES "CourseSection" ("id")
  );

  CREATE TABLE IF NOT EXISTS "GradeAuditLog" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "enrollment_id" INTEGER NOT NULL,
    "old_score" REAL,
    "new_score" REAL,
    "old_grade_status" TEXT,
    "new_grade_status" TEXT,
    "changed_by" TEXT DEFAULT 'system',
    "reason" TEXT,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("enrollment_id") REFERENCES "Enrollment" ("id")
  );

  CREATE INDEX IF NOT EXISTS "idx_student_code" ON "Student" ("student_code");
  CREATE INDEX IF NOT EXISTS "idx_student_name" ON "Student" ("full_name");
  CREATE INDEX IF NOT EXISTS "idx_student_email" ON "Student" ("email");
  CREATE INDEX IF NOT EXISTS "idx_student_class_name" ON "Student" ("class_name");
  CREATE INDEX IF NOT EXISTS "idx_student_major" ON "Student" ("major");
  CREATE INDEX IF NOT EXISTS "idx_student_status" ON "Student" ("status");

  CREATE INDEX IF NOT EXISTS "idx_course_code" ON "Course" ("course_code");
  CREATE INDEX IF NOT EXISTS "idx_course_name" ON "Course" ("course_name");

  CREATE INDEX IF NOT EXISTS "idx_course_section_course_id" ON "CourseSection" ("course_id");
  CREATE INDEX IF NOT EXISTS "idx_course_section_semester" ON "CourseSection" ("semester");
  CREATE INDEX IF NOT EXISTS "idx_course_section_course_semester" ON "CourseSection" ("course_id", "semester");

  CREATE INDEX IF NOT EXISTS "idx_course_prerequisite_course_id" ON "CoursePrerequisite" ("course_id");
  CREATE INDEX IF NOT EXISTS "idx_course_prerequisite_required_id" ON "CoursePrerequisite" ("prerequisite_course_id");

  CREATE INDEX IF NOT EXISTS "idx_enrollment_student_id" ON "Enrollment" ("student_id");
  CREATE INDEX IF NOT EXISTS "idx_enrollment_course_id" ON "Enrollment" ("course_id");
  CREATE INDEX IF NOT EXISTS "idx_enrollment_student_course" ON "Enrollment" ("student_id", "course_id");

  CREATE INDEX IF NOT EXISTS "idx_grade_audit_enrollment_id" ON "GradeAuditLog" ("enrollment_id");

  -- Bảng ảo FTS5 lưu họ tên (unicode61 mặc định)
  CREATE VIRTUAL TABLE IF NOT EXISTS "Student_name_fts" USING fts5(
    "full_name",
    content="Student",
    content_rowid="id"
  );

  -- Bảng ảo FTS5 lưu mã sinh viên (trigram)
  CREATE VIRTUAL TABLE IF NOT EXISTS "Student_code_fts" USING fts5(
    "student_code",
    tokenize="trigram",
    content="Student",
    content_rowid="id"
  );

  -- Triggers đồng bộ cho Student_name_fts
  CREATE TRIGGER IF NOT EXISTS "student_ai_name" AFTER INSERT ON "Student" BEGIN
    INSERT INTO "Student_name_fts"("rowid", "full_name") VALUES (new."id", new."full_name");
  END;
  CREATE TRIGGER IF NOT EXISTS "student_ad_name" AFTER DELETE ON "Student" BEGIN
    INSERT INTO "Student_name_fts"("Student_name_fts", "rowid", "full_name") VALUES('delete', old."id", old."full_name");
  END;
  CREATE TRIGGER IF NOT EXISTS "student_au_name" AFTER UPDATE OF "full_name" ON "Student" BEGIN
    INSERT INTO "Student_name_fts"("Student_name_fts", "rowid", "full_name") VALUES('delete', old."id", old."full_name");
    INSERT INTO "Student_name_fts"("rowid", "full_name") VALUES (new."id", new."full_name");
  END;

  -- Triggers đồng bộ cho Student_code_fts
  CREATE TRIGGER IF NOT EXISTS "student_ai_code" AFTER INSERT ON "Student" BEGIN
    INSERT INTO "Student_code_fts"("rowid", "student_code") VALUES (new."id", new."student_code");
  END;
  CREATE TRIGGER IF NOT EXISTS "student_ad_code" AFTER DELETE ON "Student" BEGIN
    INSERT INTO "Student_code_fts"("Student_code_fts", "rowid", "student_code") VALUES('delete', old."id", old."student_code");
  END;
  CREATE TRIGGER IF NOT EXISTS "student_au_code" AFTER UPDATE OF "student_code" ON "Student" BEGIN
    INSERT INTO "Student_code_fts"("Student_code_fts", "rowid", "student_code") VALUES('delete', old."id", old."student_code");
    INSERT INTO "Student_code_fts"("rowid", "student_code") VALUES (new."id", new."student_code");
  END;
`)

  const courseColumns = db.prepare('PRAGMA table_info("Course")').all()
  const hasCourseStatus = courseColumns.some((column) => column.name === 'status')
  if (!hasCourseStatus) {
    db.exec(`ALTER TABLE "Course" ADD COLUMN "status" TEXT DEFAULT 'Đang đào tạo';`)
  }

  db.exec(`
    UPDATE "Student"
    SET "status" = 'Đã rút hồ sơ'
    WHERE "status" = 'Thôi học';

    UPDATE "Student"
    SET "status" = 'Đang học'
    WHERE "status" IS NULL OR "status" = '';
  `)

  const enrollmentColumns = db.prepare('PRAGMA table_info("Enrollment")').all()
  const addEnrollmentColumn = (columnName, definition) => {
    const hasColumn = enrollmentColumns.some((column) => column.name === columnName)
    if (!hasColumn) {
      db.exec(`ALTER TABLE "Enrollment" ADD COLUMN ${definition};`)
    }
  }

  addEnrollmentColumn('course_section_id', '"course_section_id" INTEGER')
  addEnrollmentColumn('attendance_score', '"attendance_score" REAL')
  addEnrollmentColumn('midterm_score', '"midterm_score" REAL')
  addEnrollmentColumn('final_score', '"final_score" REAL')
  addEnrollmentColumn('total_score', '"total_score" REAL')
  addEnrollmentColumn('grade_status', `"grade_status" TEXT DEFAULT 'draft'`)

  db.exec(`
    CREATE INDEX IF NOT EXISTS "idx_course_status" ON "Course" ("status");
    CREATE INDEX IF NOT EXISTS "idx_enrollment_course_section_id" ON "Enrollment" ("course_section_id");
  `)

  // Đồng bộ dữ liệu cũ từ bảng Student sang FTS5 nếu bảng FTS5 mới được tạo và chưa có dữ liệu
  const nameFtsCount = db.prepare('SELECT COUNT(*) as count FROM "Student_name_fts"').get()
  if (nameFtsCount.count === 0) {
    db.exec(
      'INSERT INTO "Student_name_fts"("rowid", "full_name") SELECT "id", "full_name" FROM "Student";'
    )
  }
  const codeFtsCount = db.prepare('SELECT COUNT(*) as count FROM "Student_code_fts"').get()
  if (codeFtsCount.count === 0) {
    db.exec(
      'INSERT INTO "Student_code_fts"("rowid", "student_code") SELECT "id", "student_code" FROM "Student";'
    )
  }

  // 1. Seed dữ liệu cho bảng Student nếu rỗng
  const studentCount = db.prepare('SELECT COUNT(*) as count FROM Student').get()
  if (studentCount.count === 0) {
    console.log('Seeding students from data.js...')
    const insertStudent = db.prepare(`
      INSERT INTO Student (student_code, full_name, email, phone, date_of_birth, gender, address, major, class_name, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    const insertManyStudents = db.transaction((students) => {
      for (const student of students) {
        insertStudent.run(
          student.code,
          student.name,
          student.email,
          student.phone,
          student.dob,
          student.gender,
          student.address,
          student.major,
          student.className,
          student.status
        )
      }
    })

    insertManyStudents(sampleStudents)
    console.log(`Seeded ${sampleStudents.length} students successfully.`)
  }

  // 2. Seed dữ liệu cho bảng Course nếu rỗng
  const courseCount = db.prepare('SELECT COUNT(*) as count FROM Course').get()
  if (courseCount.count === 0) {
    console.log('Seeding courses...')
    const sampleCourses = [
      { code: 'CS101', name: 'Nhập môn lập trình', credits: 4 },
      { code: 'CS102', name: 'Cấu trúc dữ liệu và giải thuật', credits: 4 },
      { code: 'CS103', name: 'Cơ sở dữ liệu', credits: 3 },
      { code: 'CS104', name: 'Mạng máy tính', credits: 3 },
      { code: 'CS105', name: 'Phát triển ứng dụng Web', credits: 3 },
      { code: 'CS106', name: 'Kỹ nghệ phần mềm', credits: 3 },
      { code: 'CS107', name: 'Trí tuệ nhân tạo', credits: 3 },
      { code: 'CS108', name: 'An toàn thông tin', credits: 3 }
    ]

    const insertCourse = db.prepare(`
      INSERT INTO Course (course_code, course_name, credits, status)
      VALUES (?, ?, ?, ?)
    `)

    const insertManyCourses = db.transaction((courses) => {
      for (const course of courses) {
        insertCourse.run(course.code, course.name, course.credits, 'Đang đào tạo')
      }
    })

    insertManyCourses(sampleCourses)
    console.log(`Seeded ${sampleCourses.length} courses successfully.`)
  }

  // 3. Seed dữ liệu cho bảng Enrollment nếu rỗng
  const enrollmentCount = db.prepare('SELECT COUNT(*) as count FROM Enrollment').get()
  if (enrollmentCount.count === 0) {
    console.log('Seeding enrollments...')
    const studentRows = db.prepare('SELECT id FROM Student').all()
    const courseRows = db.prepare('SELECT id FROM Course').all()
    const semesters = ['Học kỳ 1 - 2024-2025', 'Học kỳ 2 - 2024-2025', 'Học kỳ 1 - 2025-2026']

    const insertEnrollment = db.prepare(`
      INSERT INTO Enrollment (student_id, course_id, score, semester)
      VALUES (?, ?, ?, ?)
    `)

    const insertManyEnrollments = db.transaction(() => {
      let totalSeeded = 0
      for (const student of studentRows) {
        // Mỗi học sinh đăng ký ngẫu nhiên từ 3 đến 5 môn học
        const numCourses = Math.floor(Math.random() * 3) + 3
        const shuffledCourses = [...courseRows].sort(() => 0.5 - Math.random())
        const selectedCourses = shuffledCourses.slice(0, numCourses)

        for (const course of selectedCourses) {
          const score = Math.round((Math.random() * 6 + 4) * 10) / 10 // Điểm số ngẫu nhiên từ 4.0 -> 10.0
          const semester = semesters[Math.floor(Math.random() * semesters.length)]
          insertEnrollment.run(student.id, course.id, score, semester)
          totalSeeded++
        }
      }
      return totalSeeded
    })

    const totalSeeded = insertManyEnrollments()
    console.log(`Seeded ${totalSeeded} enrollment records successfully.`)
  }

  db.exec(`
    INSERT OR IGNORE INTO "CourseSection" ("course_id", "semester", "section_code", "status")
    SELECT DISTINCT "course_id", "semester", 'DEFAULT', 'Đang mở'
    FROM "Enrollment";

    UPDATE "Enrollment"
    SET
      "course_section_id" = (
        SELECT "CourseSection"."id"
        FROM "CourseSection"
        WHERE "CourseSection"."course_id" = "Enrollment"."course_id"
          AND "CourseSection"."semester" = "Enrollment"."semester"
          AND "CourseSection"."section_code" = 'DEFAULT'
      ),
      "total_score" = COALESCE("total_score", "score")
    WHERE "course_section_id" IS NULL;
  `)
}
