import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { session } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

function setupContentSecurityPolicy(): void {
  const scriptSrc = is.dev
    ? "script-src 'self' 'unsafe-inline' http://localhost:* https://trusted.cdn.com"
    : "script-src 'self' https://trusted.cdn.com"
  const connectSrc = is.dev
    ? "connect-src 'self' http://localhost:* ws://localhost:*"
    : "connect-src 'self'"

  const csp = [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    connectSrc,
    "font-src 'self'",
    "frame-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ')

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [csp]
      }
    })
  })
}

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')
  setupContentSecurityPolicy()

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () =>
    console.log('chỉ xứ lý ping, không có channel nguy hiểm nào được expose cho Renderer')
  )

  // Sensitive internal channel demo.
  // Main chi log canh bao, KHONG xoa gi that.
  // Neu preload expose generic send(channel, payload), Renderer co the goi channel nay
  // du app khong he co button/chuc nang hop le cho viec do.
  ipcMain.on('danger:delete-all-data', (_event, payload) => {
    console.warn('[DANGER DEMO] Renderer da goi duoc channel nhay cam:', payload)
  })

  ipcMain.on('auth:set-role', (_event, payload) => {
    console.warn('[DANGER DEMO] Renderer da yeu cau doi role nguoi dung:', payload)
  })

  ipcMain.on('webfilter:disable', (_event, payload) => {
    console.warn('[DANGER DEMO] Renderer da yeu cau tat web filter:', payload)
  })

  ipcMain.on('settings:write', (_event, payload) => {
    console.warn('[DANGER DEMO] Renderer da yeu cau ghi settings noi bo:', payload)
  })

  ipcMain.on('debug:run-command', (_event, payload) => {
    console.warn('[DANGER DEMO] Renderer da yeu cau chay debug command:', payload)
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
