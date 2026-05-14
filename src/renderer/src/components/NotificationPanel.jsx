import React, { useEffect, useRef } from 'react'
import { Bell, X, AlertTriangle, Info, CheckCircle } from 'lucide-react'
import { useApp } from '../App'

const ICONS = {
  warning: <AlertTriangle size={14} className="text-amber-400" />,
  info:    <Info size={14} className="text-blue-400" />,
  success: <CheckCircle size={14} className="text-green-400" />,
  error:   <AlertTriangle size={14} className="text-red-400" />,
}
const BG = {
  warning: 'bg-amber-500/10 border-amber-500/20',
  info:    'bg-blue-500/10 border-blue-500/20',
  success: 'bg-green-500/10 border-green-500/20',
  error:   'bg-red-500/10 border-red-500/20',
}

export default function NotificationPanel({ onClose }) {
  const { statistike, navigate } = useApp()
  const panelRef = useRef(null)
  const notes = statistike?.notifikacije || []

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose()
      }
    }
    // Delay so the button click that opened it doesn't immediately close it
    const t = setTimeout(() => document.addEventListener('mousedown', handler), 100)
    return () => { clearTimeout(t); document.removeEventListener('mousedown', handler) }
  }, [onClose])

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Panel — fixed position, bottom-left of sidebar, always visible */}
      <div
        ref={panelRef}
        className="fixed z-50 animate-slide-up"
        style={{
          left: '208px',         // just outside sidebar
          bottom: '60px',        // above settings button
          width: '320px',
          maxHeight: '420px',
        }}
      >
        <div className="bg-[#12121e] border border-[#2a2a40] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          style={{ maxHeight: '420px' }}>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e1e30] flex-shrink-0">
            <span className="font-semibold text-sm text-gray-200 flex items-center gap-2">
              <Bell size={13} className="text-amber-400" />
              Obavještenja
              {notes.length > 0 && (
                <span className="w-5 h-5 rounded-full text-[9px] font-bold flex items-center justify-center text-black"
                  style={{ background: 'rgb(var(--ac2))' }}>
                  {notes.length}
                </span>
              )}
            </span>
            <button onClick={onClose} className="btn-ghost p-1"><X size={13} /></button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto flex-1">
            {notes.length === 0 ? (
              <div className="py-10 text-center text-xs text-gray-600">
                <CheckCircle size={28} className="mx-auto mb-2 text-green-500/40" />
                Sve je u redu, nema obavještenja.
              </div>
            ) : notes.map(n => (
              <button
                key={n.id}
                onClick={() => { if (n.link) { navigate(n.link); onClose() } }}
                className="w-full text-left p-3 border-b border-[#1e1e30]/60 last:border-0 flex items-start gap-3 hover:bg-[#1a1a28] transition-colors"
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 border ${BG[n.tip] || BG.info}`}>
                  {ICONS[n.tip] || ICONS.info}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-gray-200 leading-snug">{n.naslov}</div>
                  {n.opis && <div className="text-[10px] text-gray-600 mt-0.5">{n.opis}</div>}
                  {n.link && <div className="text-[10px] text-amber-500/60 mt-1">Klikni za detalje →</div>}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
