import { electronAPI } from '@electron-toolkit/preload'
import { IMyAPI } from './index.d'
// Custom APIs cho renderer
const api: IMyAPI = {
  readFile: (path) => require('fs').readFileSync(path, 'utf-8')
}

// CHỈ gán trực tiếp vào đối tượng window (KHÔNG DÙNG contextBridge)
// Để kiểm tra sự khác biệt của contextIsolation:
// - Nếu contextIsolation = false: Renderer và Preload dùng chung window, Renderer SẼ dùng được window.api
// - Nếu contextIsolation = true: Renderer và Preload có window riêng biệt, Renderer SẼ KHÔNG dùng được window.api (báo undefined)

// @ts-ignore
window.electron = electronAPI
// @ts-ignore
window.api = api
