import './assets/main.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'

// Fix: Khi Electron window bị unfocused rồi focused lại, Chromium đôi khi
// không restore focus chain đúng, khiến input/select không tương tác được.
// Giải pháp: khi window regains focus, ta blur rồi focus lại activeElement
// để khởi động lại input event pipeline của Chromium.
window.addEventListener('focus', () => {
  const el = document.activeElement
  if (el && el !== document.body) {
    el.blur()
    el.focus()
  }
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>
)
