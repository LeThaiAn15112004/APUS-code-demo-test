import registerStudentIpc from './studentIpc.js'
import registerCourseIpc from './courseIpc.js'
import registerEnrollmentIpc from './enrollmentIpc.js'
import registerReportIpc from './reportIpc.js'

export default function registerIpcHandlers(db) {
  registerStudentIpc(db)
  registerCourseIpc(db)
  registerEnrollmentIpc(db)
  registerReportIpc(db)
}
