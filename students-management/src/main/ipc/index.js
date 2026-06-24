import registerStudentIpc from './studentIpc.js'
import registerCourseIpc from './courseIpc.js'
import registerEnrollmentIpc from './enrollmentIpc.js'

export default function registerIpcHandlers(db) {
  registerStudentIpc(db)
  registerCourseIpc(db)
  registerEnrollmentIpc(db)
}
