import { ElectronAPI } from '@electron-toolkit/preload'

export interface IMyAPI {
  readFile: (path: string) => string
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: IMyAPI
    isolationDemo: {
      status: string
      isIsolated: boolean
    }
  }
}
