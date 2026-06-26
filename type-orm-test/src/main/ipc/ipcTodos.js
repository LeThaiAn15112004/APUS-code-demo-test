import { ipcMain } from 'electron'
import TodoRepository from '../repository/TodoRepository.js'

export default function registerTodoIpc(dataSource) {
  const repo = new TodoRepository(dataSource)

  ipcMain.handle('todo:getAll', async (_, filters) => {
    return repo.getAll(filters)
  })

  ipcMain.handle('todo:getById', async (_, id) => {
    return repo.getById(id)
  })

  ipcMain.handle('todo:create', async (_, todoData) => {
    return repo.create(todoData)
  })

  ipcMain.handle('todo:update', async (_, id, todoData) => {
    return repo.update(id, todoData)
  })

  ipcMain.handle('todo:delete', async (_, id) => {
    return repo.delete(id)
  })
}
