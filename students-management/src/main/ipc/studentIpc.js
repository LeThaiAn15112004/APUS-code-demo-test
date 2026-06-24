import { ipcMain } from 'electron'
import StudentRepository from '../repository/studentRepository.js'

export default function registerStudentIpc(db) {
  const repo = new StudentRepository(db)

  ipcMain.handle('student:getAll', async (_, filters) => repo.getAll(filters))
  ipcMain.handle('student:getById', async (_, id) => repo.getById(id))
  ipcMain.handle('student:getByCode', async (_, code) => repo.getByCode(code))
  ipcMain.handle('student:create', async (_, student) => repo.create(student))
  ipcMain.handle('student:update', async (_, id, student) => repo.update(id, student))
  ipcMain.handle('student:delete', async (_, id) => repo.delete(id))
}
