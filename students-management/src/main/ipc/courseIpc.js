import { ipcMain } from 'electron'
import CourseRepository from '../repository/courseRepository.js'

export default function registerCourseIpc(db) {
  const repo = new CourseRepository(db)

  ipcMain.handle('course:getAll', async (_, filters) => repo.getAll(filters))
  ipcMain.handle('course:getById', async (_, id) => repo.getById(id))
  ipcMain.handle('course:getByCode', async (_, code) => repo.getByCode(code))
  ipcMain.handle('course:create', async (_, course) => repo.create(course))
  ipcMain.handle('course:update', async (_, id, course) => repo.update(id, course))
  ipcMain.handle('course:delete', async (_, id) => repo.delete(id))
}
