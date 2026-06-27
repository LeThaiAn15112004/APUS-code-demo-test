/* eslint-disable react-hooks/set-state-in-effect, react/prop-types */

import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ConfirmModal from '../../components/ConfirmModal'
import StudentFormModal from '../../components/StudentFormModal'
import { courseApi, enrollmentApi, studentApi } from '../../index'

function StudentDetailPage() {
  const { id } = useParams()
  const [student, setStudent] = useState(null)
  const [courses, setCourses] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [enrollmentToDelete, setEnrollmentToDelete] = useState(null)
  const [scoreEditingId, setScoreEditingId] = useState(null)
  const [scoreValue, setScoreValue] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const loadDetail = useCallback(async () => {
    try {
      setIsLoading(true)
      setError('')
      const [studentRow, enrollmentRows, courseRows] = await Promise.all([
        studentApi.getById(Number(id)),
        enrollmentApi.getByStudentId(Number(id)),
        courseApi.getAll()
      ])
      setStudent(studentRow)
      setEnrollments(enrollmentRows)
      setCourses(courseRows)
    } catch (err) {
      setError(err.message || 'Không thể tải thông tin sinh viên.')
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadDetail()
  }, [loadDetail])

  async function handleUpdateStudent(updatedStudent) {
    await studentApi.update(Number(id), updatedStudent)
    await loadDetail()
  }

  async function handleSyncCourses(selectedCourseIds, semester, removedEnrollmentIds = []) {
    const removedEnrollments = enrollments.filter((item) =>
      removedEnrollmentIds.includes(Number(item.id))
    )

    if (selectedCourseIds.length > 0) {
      const result = await enrollmentApi.registerCourses(Number(id), selectedCourseIds, semester)
      if (result && result.success === false) {
        throw new Error(result.message)
      }
    }

    if (removedEnrollments.length > 0) {
      await Promise.all(removedEnrollments.map((item) => enrollmentApi.delete(item.id)))
    }

    await loadDetail()
  }

  async function handleDeleteEnrollment() {
    if (!enrollmentToDelete) return

    await enrollmentApi.delete(enrollmentToDelete.id)
    setEnrollmentToDelete(null)
    await loadDetail()
  }

  function handleStartEditScore(enrollment) {
    setError('')
    setScoreEditingId(enrollment.id)
    setScoreValue(enrollment.score ?? '')
  }

  function handleCancelEditScore() {
    setScoreEditingId(null)
    setScoreValue('')
  }

  async function handleSaveScore(enrollmentId) {
    const score = Number(scoreValue)

    if (!Number.isFinite(score) || score < 0 || score > 10) {
      setError('Điểm phải là số từ 0 đến 10.')
      return
    }

    await enrollmentApi.updateScore(enrollmentId, score)
    setScoreEditingId(null)
    setScoreValue('')
    await loadDetail()
  }

  if (isLoading) {
    return <main className="app-shell empty-state">Đang tải thông tin sinh viên...</main>
  }

  if (error || !student) {
    return (
      <main className="app-shell">
        <Link className="button ghost" to="/">
          Quay lại
        </Link>
        <div className="alert">{error || 'Không tìm thấy sinh viên.'}</div>
      </main>
    )
  }

  return (
    <main className="app-shell">
      <section className="page-header">
        <div>
          <p className="eyebrow">Chi tiết sinh viên</p>
          <h1>{student.full_name}</h1>
          <p className="subtitle">
            {student.student_code} · {student.status || 'Chua cap nhat'}
          </p>
        </div>
        <div className="page-actions">
          <button className="button primary" type="button" onClick={() => setIsEditModalOpen(true)}>
            <span aria-hidden="true">+</span>
            Sửa sinh viên
          </button>
          <Link className="button ghost" to="/">
            Quay lại danh sách
          </Link>
        </div>
      </section>

      <section className="detail-grid">
        <InfoItem label="Email" value={student.email} />
        <InfoItem label="Điện thoại" value={student.phone} />
        <InfoItem label="Ngày sinh" value={student.date_of_birth} />
        <InfoItem label="Giới tính" value={student.gender} />
        <InfoItem label="Địa chỉ" value={student.address} />
        <InfoItem label="Ngành" value={student.major} />
        <InfoItem label="Lớp" value={student.class_name} />
        <InfoItem label="Trạng thái" value={student.status} />
      </section>

      <section className="table-panel">
        <div className="table-summary">
          <span>
            <strong>{enrollments.length}</strong> môn học đã đăng ký
          </span>
          <span>Theo doi hoc ky, tin chi va diem so hien tai</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Mã môn</th>
                <th>Tên môn học</th>
                <th>Số tín chỉ</th>
                <th>Học kỳ</th>
                <th>Điểm</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((item) => (
                <tr key={item.id}>
                  <td>{item.course_code}</td>
                  <td>{item.course_name}</td>
                  <td>{item.credits}</td>
                  <td>{item.semester}</td>
                  <td>
                    {scoreEditingId === item.id ? (
                      <input
                        className="score-input"
                        max="10"
                        min="0"
                        step="0.1"
                        type="number"
                        value={scoreValue}
                        onChange={(event) => setScoreValue(event.target.value)}
                      />
                    ) : (
                      (item.score ?? '-')
                    )}
                  </td>
                  <td>
                    <div className="row-actions">
                      {scoreEditingId === item.id ? (
                        <>
                          <button
                            className="button small"
                            type="button"
                            onClick={() => handleSaveScore(item.id)}
                          >
                            Lưu điểm
                          </button>
                          <button
                            className="button small ghost"
                            type="button"
                            onClick={handleCancelEditScore}
                          >
                            Hủy
                          </button>
                        </>
                      ) : (
                        <button
                          className="button small"
                          type="button"
                          onClick={() => handleStartEditScore(item)}
                        >
                          Sửa điểm
                        </button>
                      )}
                      <button
                        className="button small danger-outline"
                        type="button"
                        onClick={() => setEnrollmentToDelete(item)}
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {enrollments.length === 0 && (
            <div className="empty-state">Sinh viên chưa đăng ký môn học.</div>
          )}
        </div>
      </section>

      <StudentFormModal
        courses={courses}
        enrollments={enrollments}
        initialStudent={student}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSyncCourses={handleSyncCourses}
        onSubmit={handleUpdateStudent}
      />

      <ConfirmModal
        description={`Bạn có chắc muốn bỏ khóa học "${enrollmentToDelete?.course_name || ''}" khỏi sinh viên này không?`}
        isOpen={Boolean(enrollmentToDelete)}
        onCancel={() => setEnrollmentToDelete(null)}
        onConfirm={handleDeleteEnrollment}
        title="Xóa khóa học đã đăng ký"
      />
    </main>
  )
}

function InfoItem({ label, value }) {
  return (
    <div className="info-item">
      <span>{label}</span>
      <strong>{value || '-'}</strong>
    </div>
  )
}

export default StudentDetailPage
