/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ConfirmModal from '../components/ConfirmModal'
import StudentFormModal from '../components/StudentFormModal'
import { courseApi, enrollmentApi, studentApi } from '../index'

const PAGE_SIZE = 10

function normalize(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
}

function StudentListPage() {
  const [students, setStudents] = useState([])
  const [courses, setCourses] = useState([])
  const [courseMap, setCourseMap] = useState({})
  const [searchName, setSearchName] = useState('')
  const [searchCode, setSearchCode] = useState('')
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [page, setPage] = useState(1)
  const [studentToDelete, setStudentToDelete] = useState(null)
  const [studentToEdit, setStudentToEdit] = useState(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const loadStudentCourses = useCallback(async (studentRows) => {
    const pairs = await Promise.all(
      studentRows.map(async (student) => {
        const enrollments = await enrollmentApi.getByStudentId(student.id)
        return [student.id, enrollments]
      })
    )

    setCourseMap(Object.fromEntries(pairs))
  }, [])

  const loadStudents = useCallback(async (filters = {}) => {
    try {
      setIsLoading(true)
      setError('')
      const [studentRows, courseRows] = await Promise.all([
        studentApi.getAll(filters),
        courseApi.getAll()
      ])
      setStudents(studentRows)
      setCourses(courseRows)
      await loadStudentCourses(studentRows)
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách sinh viên.')
    } finally {
      setIsLoading(false)
    }
  }, [loadStudentCourses])

  useEffect(() => {
    loadStudents({ searchName, searchCode })
  }, [loadStudents, searchName, searchCode])

  const filteredStudents = useMemo(() => {
    const courseId = Number(selectedCourseId)

    return students.filter((student) => {
      const enrollments = courseMap[student.id] || []
      const matchedCourse =
        !selectedCourseId || enrollments.some((item) => Number(item.course_id) === courseId)

      return matchedCourse
    })
  }, [courseMap, selectedCourseId, students])

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pagedStudents = filteredStudents.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  function handleSearchNameChange(event) {
    setSearchName(event.target.value)
    setPage(1)
  }

  function handleSearchCodeChange(event) {
    setSearchCode(event.target.value)
    setPage(1)
  }

  function handleCourseChange(event) {
    setSelectedCourseId(event.target.value)
    setPage(1)
  }

  async function handleCreateStudent(student) {
    await studentApi.create(student)
    setPage(1)
    await loadStudents()
  }

  async function handleUpdateStudent(student) {
    if (!studentToEdit) return

    await studentApi.update(studentToEdit.id, student)
    await loadStudents()
  }

  async function handleSyncCourses(selectedCourseIds, semester) {
    if (!studentToEdit) return

    const currentEnrollments = courseMap[studentToEdit.id] || []
    const currentCourseIds = currentEnrollments.map((item) => Number(item.course_id))
    const addedCourseIds = selectedCourseIds.filter(
      (courseId) => !currentCourseIds.includes(courseId)
    )
    const removedEnrollments = currentEnrollments.filter(
      (item) => !selectedCourseIds.includes(Number(item.course_id))
    )

    if (addedCourseIds.length > 0) {
      const result = await enrollmentApi.registerCourses(studentToEdit.id, addedCourseIds, semester)
      if (result && result.success === false) {
        throw new Error(result.message)
      }
    }

    if (removedEnrollments.length > 0) {
      await Promise.all(removedEnrollments.map((item) => enrollmentApi.delete(item.id)))
    }

    await loadStudents()
  }

  async function handleDelete() {
    if (!studentToDelete) return

    try {
      await studentApi.delete(studentToDelete.id)
      setStudentToDelete(null)
      await loadStudents()
    } catch (err) {
      setError(err.message || 'Không thể xóa sinh viên.')
    }
  }

  return (
    <main className="app-shell">
      <section className="page-header">
        <div>
          <p className="eyebrow">Quản lý sinh viên</p>
          <h1>Danh sách sinh viên</h1>
          <p className="subtitle">Quan ly ho so, trang thai hoc tap va khoa hoc da dang ky.</p>
        </div>
        <button className="button primary" type="button" onClick={() => setIsCreateModalOpen(true)}>
          <span aria-hidden="true">+</span>
          Thêm sinh viên
        </button>
      </section>

      <section className="toolbar" aria-label="Bộ lọc sinh viên">
        <label>
          Tìm theo họ tên
          <input
            type="search"
            placeholder="Nhập tên sinh viên..."
            value={searchName}
            onChange={handleSearchNameChange}
          />
        </label>
        <label>
          Tìm theo mã sinh viên
          <input
            type="search"
            placeholder="Nhập mã sinh viên..."
            value={searchCode}
            onChange={handleSearchCodeChange}
          />
        </label>
        <label>
          Khóa học
          <select value={selectedCourseId} onChange={handleCourseChange}>
            <option value="">Tất cả khóa học</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.course_code} - {course.course_name}
              </option>
            ))}
          </select>
        </label>
      </section>

      {error && <div className="alert">{error}</div>}

      <section className="table-panel">
        <div className="table-summary">
          <span>
            <strong>{filteredStudents.length}</strong> sinh viên
          </span>
          <span>Chon Chi tiet de xem day du ho so sinh vien</span>
        </div>

        {isLoading ? (
          <div className="empty-state">Đang tải dữ liệu...</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Mã SV</th>
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>Lớp</th>
                  <th>Ngành</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {pagedStudents.map((student) => (
                  <tr key={student.id}>
                    <td>{student.student_code}</td>
                    <td>{student.full_name}</td>
                    <td>{student.email || '-'}</td>
                    <td>{student.class_name || '-'}</td>
                    <td>{student.major || '-'}</td>
                    <td>
                      <span className="status-pill">{student.status || 'Chưa cập nhật'}</span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <Link className="button small" to={`/students/${student.id}`}>
                          Chi tiết
                        </Link>
                        <button
                          className="button small"
                          type="button"
                          onClick={() => setStudentToEdit(student)}
                        >
                          Sửa
                        </button>
                        <button
                          className="button small danger-outline"
                          type="button"
                          onClick={() => setStudentToDelete(student)}
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {pagedStudents.length === 0 && (
              <div className="empty-state">Không có sinh viên phù hợp.</div>
            )}
          </div>
        )}

        <div className="pagination">
          <button
            className="button ghost"
            type="button"
            disabled={currentPage === 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
          >
            Trước
          </button>
          <span>
            Trang {currentPage} / {totalPages}
          </span>
          <button
            className="button ghost"
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
          >
            Sau
          </button>
        </div>
      </section>

      <StudentFormModal
        courses={courses}
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateStudent}
      />

      <StudentFormModal
        courses={courses}
        initialStudent={studentToEdit}
        enrollments={courseMap[studentToEdit?.id] || []}
        isOpen={Boolean(studentToEdit)}
        onClose={() => setStudentToEdit(null)}
        onSyncCourses={handleSyncCourses}
        onSubmit={handleUpdateStudent}
      />

      <ConfirmModal
        isOpen={Boolean(studentToDelete)}
        title="Xóa sinh viên?"
        description={`Bạn có chắc muốn xóa ${studentToDelete?.full_name || 'sinh viên này'} không?`}
        onCancel={() => setStudentToDelete(null)}
        onConfirm={handleDelete}
      />
    </main>
  )
}

export default StudentListPage
