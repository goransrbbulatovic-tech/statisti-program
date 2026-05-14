import React, { useState, useEffect } from 'react'
import { Minus, Square, X, Maximize2 } from 'lucide-react'

export default function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false)
  const isMac = navigator.platform.toLowerCase().includes('mac')

  useEffect(() => {
    window.api?.isMaximized?.().then(setIsMaximized)
    window.api?.onMaximized?.((val) => setIsMaximized(val))
  }, [])

  if (isMac) {
    return (
      <div
        className="h-8 bg-[#08080f] flex items-center justify-center flex-shrink-0"
        style={{ WebkitAppRegion: 'drag' }}
      >
        <span className="text-xs text-gray-600 font-medium tracking-widest select-none">ACMIGO</span>
      </div>
    )
  }

  return (
    <div
      className="h-9 bg-[#08080f] flex items-center justify-between flex-shrink-0 border-b border-[#12121e]"
      style={{ WebkitAppRegion: 'drag' }}
    >
      <div className="flex items-center gap-2 px-3">
        {/* Film strip logo mini */}
        <div className="flex gap-0.5">
          {[0,1,2].map(i => (
            <div key={i} className="w-1.5 h-3 bg-amber-500/60 rounded-sm" />
          ))}
        </div>
        <span className="text-xs font-bold text-gray-500 tracking-widest select-none">ACMIGO</span>
      </div>

      <div className="flex items-center" style={{ WebkitAppRegion: 'no-drag' }}>
        <button
          onClick={() => window.api?.minimize()}
          className="w-11 h-9 flex items-center justify-center hover:bg-[#1e1e30] text-gray-500 hover:text-gray-300 transition-colors"
          title="Minimizuj"
        >
          <Minus size={13} />
        </button>
        <button
          onClick={() => window.api?.maximize()}
          className="w-11 h-9 flex items-center justify-center hover:bg-[#1e1e30] text-gray-500 hover:text-gray-300 transition-colors"
          title={isMaximized ? 'Vrati' : 'Maksimiziraj'}
        >
          {isMaximized ? <Maximize2 size={12} /> : <Square size={12} />}
        </button>
        <button
          onClick={() => window.api?.close()}
          className="w-11 h-9 flex items-center justify-center hover:bg-red-600 text-gray-500 hover:text-white transition-colors"
          title="Zatvori"
        >
          <X size={13} />
        </button>
      </div>
    </div>
  )
}
