import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// ── Fix: Electron frameless window focus issue on Windows ─────────────────
// When frame:false, the first click on an input "consumes" the window focus
// event instead of focusing the input. This re-focuses the element after
// the event cycle completes, making inputs work on first click.
document.addEventListener('mousedown', (e) => {
  const tag = e.target.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
    const el = e.target
    // Re-focus after Electron processes the window focus event
    requestAnimationFrame(() => {
      if (document.activeElement !== el) {
        el.focus()
        // For text inputs, also restore cursor position to end
        if (el.type !== 'checkbox' && el.type !== 'radio' &&
            el.type !== 'date' && el.type !== 'time') {
          const len = el.value?.length || 0
          try { el.setSelectionRange(len, len) } catch {}
        }
      }
    })
  }
}, true) // capture phase — runs before React handlers

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
