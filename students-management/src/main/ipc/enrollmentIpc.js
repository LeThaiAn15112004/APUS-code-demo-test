import { ipcMain } from 'electron'
import EnrollmentRepository from '../repository/enrollmentRepository.js'

export default function registerEnrollmentIpc(db) {
  const repo = new EnrollmentRepository(db)

  const toInt = (id) => Number.parseInt(id, 10)
  const toIntArray = (arr) => (Array.isArray(arr) ? arr.map(toInt) : arr)

  ipcMain.handle('enrollment:getByStudentId', async (_, studentId) =>
    repo.getByStudentId(toInt(studentId))
  )
  ipcMain.handle('enrollment:create', async (_, enrollment) => repo.create(enrollment))
  ipcMain.handle('enrollment:updateScore', async (_, id, score) =>
    repo.updateScore(toInt(id), score)
  )
  ipcMain.handle('enrollment:delete', async (_, id) => repo.delete(toInt(id)))
  ipcMain.handle('enrollment:registerCourses', async (_, studentId, courseIds, semester) =>
    repo.registerCourses(toInt(studentId), toIntArray(courseIds), semester)
  )
}
