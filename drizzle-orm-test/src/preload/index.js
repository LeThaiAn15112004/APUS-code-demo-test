import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  crud_todos: {
    getAll: (filters) => ipcRenderer.invoke('todo:getAll', filters),
    getById: (id) => ipcRenderer.invoke('todo:getById', id),
    create: (todo) => ipcRenderer.invoke('todo:create', todo),
    update: (id, todo) => ipcRenderer.invoke('todo:update', id, todo),
    delete: (id) => ipcRenderer.invoke('todo:delete', id)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
