/* eslint-disable react-hooks/set-state-in-effect, react/prop-types */

import { useEffect, useState } from 'react'
import ConfirmModal from './ConfirmModal'

const emptyForm = {
  student_code: '',
  full_name: '',
  email: '',
  phone: '',
  date_of_birth: '',
  gender: '',
  address: '',
  major: '',
  class_name: '',
  status: 'Đang học'
}

function toFormValue(student) {
  if (!student) return emptyForm

  return {
    student_code: student.student_code || '',
    full_name: student.full_name || '',
    email: student.email || '',
    phone: student.phone || '',
    date_of_birth: student.date_of_birth || '',
    gender: student.gender || '',
    address: student.address || '',
    major: student.major || '',
    class_name: student.class_name || '',
    status: student.status || 'Đang học'
  }
}

function getFriendlyErrorMessage(error) {
  const message = String(error?.message || error || '').toLowerCase()

  if (message.includes('unique constraint failed')) {
    if (message.includes('student.student_code')) {
      return 'Mã sinh viên này đã tồn tại. Vui lòng nhập mã khác.'
    }

    if (message.includes('student.email')) {
      return 'Email này đã được sử dụng. Vui lòng nhập email khác.'
    }

    return 'Thông tin bạn nhập đã trùng với dữ liệu hiện có. Vui lòng kiểm tra lại.'
  }

  if (message.includes('not null constraint failed')) {
    return 'Một số thông tin bắt buộc đang bị thiếu. Vui lòng kiểm tra lại biểu mẫu.'
  }

  if (message.includes('foreign key constraint failed')) {
    return 'Thông tin liên kết không hợp lệ. Vui lòng chọn lại dữ liệu trong danh sách.'
  }

  return 'Không thể lưu sinh viên lúc này. Vui lòng kiểm tra thông tin và thử lại.'
}

function StudentFormModal({
  courses = [],
  enrollments = [],
  initialStudent = null,
  isOpen,
  onClose,
  onSubmit,
  onSyncCourses
}) {
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')
  const [selectedCourseIds, setSelectedCourseIds] = useState([])
  const [courseToRemove, setCourseToRemove] = useState(null)
  const [semester, setSemester] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = Boolean(initialStudent)
  const enrolledCourseIds = enrollments.map((item) => Number(item.course_id))

  useEffect(() => {
    if (isOpen) {
      setForm(toFormValue(initialStudent))
      setFormError('')
      setSelectedCourseIds(enrolledCourseIds)
      setCourseToRemove(null)
      setSemester('')
    }
  }, [enrollments, initialStudent, isOpen])

  if (!isOpen) return null

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  function validateForm() {
    const addedCourseIds = selectedCourseIds.filter(
      (courseId) => !enrolledCourseIds.includes(courseId)
    )

    if (!form.student_code.trim()) return 'Vui lòng nhập mã sinh viên.'
    if (!form.full_name.trim()) return 'Vui lòng nhập họ tên sinh viên.'
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      return 'Email không hợp lệ.'
    }
    if (addedCourseIds.length > 0 && !semester.trim()) {
      return 'Vui lòng nhập học kỳ cho khóa học đăng ký mới.'
    }

    return ''
  }

  function handleCourseToggle(courseId) {
    setSelectedCourseIds((current) =>
      current.includes(courseId)
        ? current.filter((selectedId) => selectedId !== courseId)
        : [...current, courseId]
    )
  }

  function handleConfirmRemoveCourse() {
    if (!courseToRemove) return

    setSelectedCourseIds((current) =>
      current.filter((selectedId) => selectedId !== Number(courseToRemove.course_id))
    )
    setCourseToRemove(null)
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
      await onSubmit(form)
      if (isEditing && onSyncCourses) {
        await onSyncCourses(selectedCourseIds, semester.trim())
      }
      setForm(emptyForm)
      setSelectedCourseIds([])
      setCourseToRemove(null)
      setSemester('')
      onClose()
    } catch (err) {
      setFormError(getFriendlyErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleClose() {
    setFormError('')
    setForm(emptyForm)
    setSelectedCourseIds([])
    setCourseToRemove(null)
    setSemester('')
    onClose()
  }

  return (
    <>
      <div className="modal-backdrop" role="presentation">
      <form className="modal form-modal" onSubmit={handleSubmit}>
        <h2>{isEditing ? 'Sửa sinh viên' : 'Thêm sinh viên'}</h2>
        {formError && <div className="alert compact">{formError}</div>}

        <div className="form-grid">
          <label>
            Mã sinh viên *
            <input
              name="student_code"
              placeholder="VD: SV051"
              value={form.student_code}
              onChange={handleChange}
            />
          </label>
          <label>
            Họ tên *
            <input
              name="full_name"
              placeholder="Nhập họ tên"
              value={form.full_name}
              onChange={handleChange}
            />
          </label>
          <label>
            Email
            <input
              name="email"
              placeholder="name@example.com"
              value={form.email}
              onChange={handleChange}
            />
          </label>
          <label>
            Số điện thoại
            <input
              name="phone"
              placeholder="Nhập số điện thoại"
              value={form.phone}
              onChange={handleChange}
            />
          </label>
          <label>
            Ngày sinh
            <input
              name="date_of_birth"
              type="date"
              value={form.date_of_birth}
              onChange={handleChange}
            />
          </label>
          <label>
            Giới tính
            <select name="gender" value={form.gender} onChange={handleChange}>
              <option value="">Chưa chọn</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác</option>
            </select>
          </label>
          <label>
            Ngành
            <select name="major" value={form.major} onChange={handleChange}>
              <option value="">Chọn khóa học</option>
              {courses.map((course) => (
                <option key={course.id} value={course.course_name}>
                  {course.course_code} - {course.course_name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Lớp
            <input
              name="class_name"
              placeholder="VD: CNTT-K20A"
              value={form.class_name}
              onChange={handleChange}
            />
          </label>
          <label>
            Trạng thái
            <select name="status" value={form.status} onChange={handleChange}>
              <option value="Đang học">Đang học</option>
              <option value="Bảo lưu">Bảo lưu</option>
              <option value="Tốt nghiệp">Tốt nghiệp</option>
              <option value="Thôi học">Thôi học</option>
            </select>
          </label>
          <label className="form-field-wide">
            Địa chỉ
            <input
              name="address"
              placeholder="Nhập địa chỉ"
              value={form.address}
              onChange={handleChange}
            />
          </label>
        </div>

        {isEditing && (
          <section className="course-register-section">
            <div>
              <h3>Khóa học đã đăng ký</h3>
              <p>Tick thêm khóa học mới hoặc bỏ tick khóa học không còn đăng ký.</p>
            </div>
            <label>
              Học kỳ cho khóa học mới
              <input
                placeholder="VD: Học kỳ 1 - 2026-2027"
                value={semester}
                onChange={(event) => setSemester(event.target.value)}
              />
            </label>
            <div className="enrolled-course-list">
              {enrollments
                .filter((item) => selectedCourseIds.includes(Number(item.course_id)))
                .map((item) => (
                  <div className="enrolled-course-item" key={item.id}>
                    <div>
                      <strong>{item.course_code}</strong>
                      <span>{item.course_name}</span>
                    </div>
                    <button
                      className="button small danger-outline"
                      type="button"
                      onClick={() => setCourseToRemove(item)}
                    >
                      Xóa
                    </button>
                  </div>
                ))}
              {enrollments.filter((item) => selectedCourseIds.includes(Number(item.course_id)))
                .length === 0 && (
                <div className="empty-state compact">
                  Sinh viên chưa có khóa học đang được chọn.
                </div>
              )}
            </div>
            <div className="course-choice-list">
              {courses.map((course) => {
                const courseId = Number(course.id)
                const isAlreadyEnrolled = enrolledCourseIds.includes(courseId)

                return (
                  <label className="course-choice" key={course.id}>
                    <input
                      type="checkbox"
                      checked={selectedCourseIds.includes(courseId)}
                      disabled={isAlreadyEnrolled}
                      onChange={() => handleCourseToggle(courseId)}
                    />
                    <span>
                      <strong>{course.course_code}</strong>
                      {course.course_name}
                      {isAlreadyEnrolled && <small>Đã đăng ký</small>}
                    </span>
                  </label>
                )
              })}
              {courses.length === 0 && (
                <div className="empty-state compact">Chưa có khóa học nào để đăng ký.</div>
              )}
            </div>
          </section>
        )}

        <div className="modal-actions">
          <button
            className="button ghost"
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Hủy
          </button>
          <button className="button primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Đang lưu...' : isEditing ? 'Lưu thay đổi' : 'Lưu sinh viên'}
          </button>
        </div>
      </form>
      </div>

      <ConfirmModal
        description={`Bạn có chắc muốn bỏ khóa học "${courseToRemove?.course_name || ''}" khỏi sinh viên này không?`}
        isOpen={Boolean(courseToRemove)}
        onCancel={() => setCourseToRemove(null)}
        onConfirm={handleConfirmRemoveCourse}
        title="Xóa khóa học đã đăng ký"
      />
    </>
  )
}

export default StudentFormModal
