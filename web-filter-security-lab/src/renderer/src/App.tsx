import { useState } from 'react'
import Versions from './components/Versions'
import electronLogo from './assets/electron.svg'

function App(): React.JSX.Element {
  const [outputResult, setOutputResult] = useState<string>('')
  const [isError, setIsError] = useState<boolean>(false)

  const ipcHandle = (): void => {
    try {
      if (!window.electron) {
        throw new Error('window.electron là undefined! (Do BẬT Context Isolation)')
      }
      window.electron.ipcRenderer.send('ping')
    } catch (err: any) {
      setOutputResult(`Lỗi IPC: ${err.message}`)
      setIsError(true)
    }
  }

  const handleReadFile = (): void => {
    try {
      if (!window.api) {
        throw new Error('window.api là undefined! Không thể gọi hàm đọc file từ Renderer (Do BẬT Context Isolation và không dùng contextBridge).')
      }
      const path = 'C:/Users/ADMIN/Documents/GitHub/APUS-code-demo-test/web-filter-security-lab/package.json'
      const content = window.api.readFile(path)
      setOutputResult(content)
      setIsError(false)
    } catch (err: any) {
      setOutputResult(err.message || String(err))
      setIsError(true)
    }
  }

  return (
    <div style={{
      height: '100vh',
      width: '100%',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '45px 0',
      boxSizing: 'border-box'
    }}>
      <img alt="logo" className="logo" src={electronLogo} />
      <div className="creator">Powered by electron-vite</div>
      
      <div className="text">
        Build an Electron app with <span className="react">React</span>
        &nbsp;and <span className="ts">TypeScript</span>
      </div>
      <p className="tip">
        Please try pressing <code>F12</code> to open the devTool
      </p>
      
      <div className="actions">
        <div className="action">
          <a onClick={handleReadFile}>
            Read package.json
          </a>
        </div>
        <div className="action">
          <a target="_blank" rel="noreferrer" onClick={ipcHandle}>
            Send IPC
          </a>
        </div>
      </div>

      {outputResult && (
        <div style={{
          marginTop: '20px',
          textAlign: 'left',
          background: isError ? '#2c1f1f' : '#2f343f',
          border: `1px solid ${isError ? '#ff6b6b' : '#61dafb'}`,
          padding: '15px',
          borderRadius: '8px',
          maxWidth: '600px',
          width: '90%',
          margin: '20px auto',
          overflowX: 'auto'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: isError ? '#ff6b6b' : '#61dafb' }}>
            {isError ? 'LỖI XẢY RA:' : 'KẾT QUẢ ĐỌC FILE:'}
          </h3>
          <textarea
            readOnly
            value={outputResult}
            rows={10}
            style={{
              width: '100%',
              background: 'transparent',
              color: isError ? '#ff8b8b' : '#abb2bf',
              border: 'none',
              outline: 'none',
              resize: 'vertical',
              fontFamily: 'monospace',
              fontSize: '12px'
            }}
          />
        </div>
      )}

      <Versions></Versions>
    </div>
  )
}

export default App
