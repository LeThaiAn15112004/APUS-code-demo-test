import { ipcMain } from 'electron'
import EnrollmentRepository from '../repository/enrollmentRepository.js'

export default function registerEnrollmentIpc(db) {
  const repo = new EnrollmentRepository(db)

  ipcMain.handle('enrollment:getByStudentId', async (_, studentId) =>
    repo.getByStudentId(studentId)
  )
  ipcMain.handle('enrollment:create', async (_, enrollment) => repo.create(enrollment))
  ipcMain.handle('enrollment:updateScore', async (_, id, score) => repo.updateScore(id, score))
  ipcMain.handle('enrollment:delete', async (_, id) => repo.delete(id))
  ipcMain.handle('enrollment:registerCourses', async (_, studentId, courseIds, semester) =>
    repo.registerCourses(studentId, courseIds, semester)
  )
}
