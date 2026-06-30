import { ElectronAPI } from '@electron-toolkit/preload'

export interface IMyAPI {
  readFile: (path: string) => string
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: IMyAPI
    badAPI: {
      send: (channel: string, payload?: unknown) => void
    }
    safeAPI: {
      ping: () => void
    }
    isolationDemo: {
      status: string
      isIsolated: boolean
    }
  }
}
