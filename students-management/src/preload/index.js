import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer, grouped by repository domains
const api = {
  student: {
    getAll: (filters) => ipcRenderer.invoke('student:getAll', filters),
    getById: (id) => ipcRenderer.invoke('student:getById', id),
    getByCode: (code) => ipcRenderer.invoke('student:getByCode', code),
    create: (student) => ipcRenderer.invoke('student:create', student),
    update: (id, student) => ipcRenderer.invoke('student:update', id, student),
    delete: (id) => ipcRenderer.invoke('student:delete', id)
  },
  course: {
    getAll: () => ipcRenderer.invoke('course:getAll'),
    getById: (id) => ipcRenderer.invoke('course:getById', id),
    getByCode: (code) => ipcRenderer.invoke('course:getByCode', code),
    create: (course) => ipcRenderer.invoke('course:create', course),
    update: (id, course) => ipcRenderer.invoke('course:update', id, course),
    delete: (id) => ipcRenderer.invoke('course:delete', id)
  },
  enrollment: {
    getByStudentId: (studentId) => ipcRenderer.invoke('enrollment:getByStudentId', studentId),
    create: (enrollment) => ipcRenderer.invoke('enrollment:create', enrollment),
    updateScore: (id, score) => ipcRenderer.invoke('enrollment:updateScore', id, score),
    delete: (id) => ipcRenderer.invoke('enrollment:delete', id),
    registerCourses: (studentId, courseIds, semester) =>
      ipcRenderer.invoke('enrollment:registerCourses', studentId, courseIds, semester)
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

