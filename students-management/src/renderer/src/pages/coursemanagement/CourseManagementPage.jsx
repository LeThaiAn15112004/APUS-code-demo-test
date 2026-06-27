/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useState } from 'react'
import ConfirmModal from '../../components/ConfirmModal'
import { courseApi } from '../../index'

const emptyCourse = {
  course_code: '',
  course_name: '',
  credits: ''
}

function getFriendlyCourseError(error) {
  const message = String(error?.message || error || '').toLowerCase()

  if (message.includes('unique constraint failed')) {
    return 'Mã môn học này đã tồn tại. Vui lòng nhập mã khác.'
  }

  return 'Không thể lưu môn học lúc này. Vui lòng kiểm tra thông tin và thử lại.'
}

function CourseManagementPage() {
  const [courses, setCourses] = useState([])
  const [form, setForm] = useState(emptyCourse)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')
  const [courseToDeactivate, setCourseToDeactivate] = useState(null)

  const loadCourses = useCallback(async () => {
    try {
      setIsLoading(true)
      setError('')
      const rows = await courseApi.getAll({ includeInactive: true })
      setCourses(rows)
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách môn học.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCourses()
  }, [loadCourses])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  function validateForm() {
    if (!form.course_code.trim()) return 'Vui lòng nhập mã môn học.'
    if (!form.course_name.trim()) return 'Vui lòng nhập tên môn học.'
    if (!Number.isInteger(Number(form.credits)) || Number(form.credits) <= 0) {
      return 'Số tín chỉ phải là số nguyên lớn hơn 0.'
    }

    return ''
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const validationError = validateForm()

    if (validationError) {
      setFormError(validationError)
      return
    }

    try {
      setIsSubmitting(true)
      setFormError('')
      await courseApi.create({
        course_code: form.course_code.trim(),
        course_name: form.course_name.trim(),
        credits: Number(form.credits)
      })
      setForm(emptyCourse)
      await loadCourses()
    } catch (err) {
      setFormError(getFriendlyCourseError(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDeactivateCourse() {
    if (!courseToDeactivate) return

    try {
      await courseApi.delete(courseToDeactivate.id)
      setCourseToDeactivate(null)
      await loadCourses()
    } catch (err) {
      setError(err.message || 'Không thể ngừng đào tạo môn học.')
    }
  }

  return (
    <main className="app-shell">
      <section className="page-header">
        <div>
          <p className="eyebrow">Quản lý môn học</p>
          <h1>Danh sách môn học</h1>
          <p className="subtitle">Tao va theo doi danh muc khoa hoc dung cho dang ky sinh vien.</p>
        </div>
      </section>

      <section className="toolbar course-form-panel" aria-label="Thêm môn học">
        <form className="course-form" onSubmit={handleSubmit}>
          <label>
            Mã môn học
            <input
              name="course_code"
              placeholder="VD: CS109"
              value={form.course_code}
              onChange={handleChange}
            />
          </label>
          <label>
            Tên môn học
            <input
              name="course_name"
              placeholder="Nhập tên môn học"
              value={form.course_name}
              onChange={handleChange}
            />
          </label>
          <label>
            Số tín chỉ
            <input
              name="credits"
              min="1"
              placeholder="VD: 3"
              type="number"
              value={form.credits}
              onChange={handleChange}
            />
          </label>
          <button className="button primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Đang lưu...' : '+ Thêm môn học'}
          </button>
        </form>
        {formError && <div className="alert compact">{formError}</div>}
      </section>

      {error && <div className="alert">{error}</div>}

      <section className="table-panel">
        <div className="table-summary">
          <span>
            <strong>{courses.length}</strong> môn học
          </span>
          <span>Danh muc khoa hoc va trang thai dao tao</span>
        </div>
        {isLoading ? (
          <div className="empty-state">Đang tải dữ liệu...</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Mã môn</th>
                  <th>Tên môn học</th>
                  <th>Số tín chỉ</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id}>
                    <td>{course.course_code}</td>
                    <td>{course.course_name}</td>
                    <td>{course.credits}</td>
                    <td>
                      <span className="status-pill">{course.status || 'Đang đào tạo'}</span>
                    </td>
                    <td>{course.created_at || '-'}</td>
                    <td>
                      <button
                        className="button small danger-outline"
                        type="button"
                        disabled={course.status === 'Ngừng đào tạo'}
                        onClick={() => setCourseToDeactivate(course)}
                      >
                        Ngừng đào tạo
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {courses.length === 0 && <div className="empty-state">Chưa có môn học nào.</div>}
          </div>
        )}
      </section>

      <ConfirmModal
        isOpen={Boolean(courseToDeactivate)}
        title="Ngừng đào tạo môn học?"
        description={`Môn ${courseToDeactivate?.course_name || 'này'} sẽ không còn xuất hiện trong danh sách đăng ký mới. Dữ liệu đăng ký và điểm số cũ vẫn được giữ lại.`}
        onCancel={() => setCourseToDeactivate(null)}
        onConfirm={handleDeactivateCourse}
      />
    </main>
  )
}

export default CourseManagementPage
