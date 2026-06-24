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
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS "Enrollment" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "student_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "score" REAL,
    "semester" TEXT NOT NULL,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("student_id") REFERENCES "Student" ("id") ON DELETE CASCADE,
    FOREIGN KEY ("course_id") REFERENCES "Course" ("id") ON DELETE CASCADE
  );
`)

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
      INSERT INTO Course (course_code, course_name, credits)
      VALUES (?, ?, ?)
    `)

    const insertManyCourses = db.transaction((courses) => {
      for (const course of courses) {
        insertCourse.run(course.code, course.name, course.credits)
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
}
