import React from 'react'
import { CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

const ICONS = {
  success: <CheckCircle size={15} className="text-green-400" />,
  error:   <AlertCircle size={15} className="text-red-400" />,
  info:    <Info size={15} className="text-blue-400" />,
  warning: <AlertTriangle size={15} className="text-amber-400" />,
}

const COLORS = {
  success: 'border-green-500/30 bg-green-500/10',
  error:   'border-red-500/30 bg-red-500/10',
  info:    'border-blue-500/30 bg-blue-500/10',
  warning: 'border-amber-500/30 bg-amber-500/10',
}

export default function Toast({ msg, type = 'success' }) {
  return (
    <div className={`
      pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl
      border shadow-xl backdrop-blur-md min-w-[280px] max-w-[400px]
      bg-[#12121e]/95 ${COLORS[type] || COLORS.info}
      animate-slide-up
    `}>
      {ICONS[type] || ICONS.info}
      <span className="text-sm text-gray-200">{msg}</span>
    </div>
  )
}
