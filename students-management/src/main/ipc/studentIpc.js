import { ipcMain } from 'electron'
import StudentRepository from '../repository/studentRepository.js'

export default function registerStudentIpc(db) {
  const repo = new StudentRepository(db)

  // Lưu ý: id truyền qua IPC/JSON có thể bị serialize thành float (vd: 1.0)
  // SQLite FTS5 trigger yêu cầu rowid là INTEGER, nên cần ép kiểu rõ ràng.
  const toInt = (id) => Number.parseInt(id, 10)

  ipcMain.handle('student:getAll', async (_, filters) => repo.getAll(filters))
  ipcMain.handle('student:getById', async (_, id) => repo.getById(toInt(id)))
  ipcMain.handle('student:getByCode', async (_, code) => repo.getByCode(code))
  ipcMain.handle('student:create', async (_, student) => repo.create(student))
  ipcMain.handle('student:update', async (_, id, student) => repo.update(toInt(id), student))
  ipcMain.handle('student:delete', async (_, id) => repo.delete(toInt(id)))
}
