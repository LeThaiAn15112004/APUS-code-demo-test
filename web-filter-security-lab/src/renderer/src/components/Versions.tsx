import { useState } from 'react'

function Versions(): React.JSX.Element {
  const [versions] = useState(() => {
    return (
      window.electron?.process?.versions || {
        electron: 'Không có quyền',
        chrome: 'Không có quyền',
        node: 'Không có quyền'
      }
    )
  })

  return (
    <ul className="versions">
      <li className="electron-version">Electron v{versions.electron}</li>
      <li className="chrome-version">Chromium v{versions.chrome}</li>
      <li className="node-version">Node v{versions.node}</li>
    </ul>
  )
}

export default Versions
