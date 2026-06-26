const missingApiMessage = 'Renderer API is not available. Please check preload contextBridge setup.'

function getApi() {
  if (!window.api) {
    throw new Error(missingApiMessage)
  }

  return window.api
}

export const studentApi = {
  getAll: (filters = {}) => getApi().student.getAll(filters),
  getById: (id) => getApi().student.getById(id),
  create: (student) => getApi().student.create(student),
  update: (id, student) => getApi().student.update(id, student),
  delete: (id) => getApi().student.delete(id)
}

export const courseApi = {
  getAll: (filters = {}) => getApi().course.getAll(filters),
  create: (course) => getApi().course.create(course),
  update: (id, course) => getApi().course.update(id, course),
  delete: (id) => getApi().course.delete(id)
}

export const enrollmentApi = {
  getByStudentId: (studentId) => getApi().enrollment.getByStudentId(studentId),
  delete: (id) => getApi().enrollment.delete(id),
  registerCourses: (studentId, courseIds, semester) =>
    getApi().enrollment.registerCourses(studentId, courseIds, semester)
}

export const reportApi = {
  getOverview: () => getApi().report.getOverview()
}
