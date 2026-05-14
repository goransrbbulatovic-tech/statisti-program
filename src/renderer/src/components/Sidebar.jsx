import React, { useState } from 'react'
import { useApp } from '../App'
import { LayoutDashboard, Users, Film, Settings, ChevronRight, UserPlus, Calendar, DollarSign, BarChart2, Bell, Layers } from 'lucide-react'
import NotificationPanel from './NotificationPanel'

const NAV = [
  { id:'dashboard', label:'Dashboard', icon:LayoutDashboard },
  { id:'statisti',  label:'Statisti',  icon:Users },
  { id:'projekti',  label:'Projekti',  icon:Film },
  { id:'grupe',     label:'Grupe',     icon:Layers },
  { id:'rasporedi', label:'Rasporedi', icon:Calendar },
  { id:'finansije', label:'Finansije', icon:DollarSign },
  { id:'izvjestaji',label:'Izvještaji',icon:BarChart2 },
]

const STATISTA_PAGES = ['statisti','statista-profile','statista-new','statista-edit']

function FilmStripLogo() {
  return (
    <div className="flex flex-col items-center py-5 px-2 border-b border-[#1e1e30]">
      <div className="relative mb-3">
        <svg viewBox="0 0 56 44" className="w-14 h-11" fill="none">
          <rect x="0" y="8" width="56" height="28" rx="2" fill="#1a1a2e"/>
          <rect x="0" y="8" width="56" height="3" fill="rgb(var(--ac2))"/>
          <rect x="0" y="33" width="56" height="3" fill="rgb(var(--ac2))"/>
          {[12,20,28].map(y=>(
            <g key={y}>
              <rect x="3" y={y} width="5" height="4" rx="1" fill="#0a0a14"/>
              <rect x="48" y={y} width="5" height="4" rx="1" fill="#0a0a14"/>
            </g>
          ))}
          <line x1="11" y1="11" x2="11" y2="33" stroke="#0a0a14" strokeWidth="1" opacity="0.5"/>
          <line x1="45" y1="11" x2="45" y2="33" stroke="#0a0a14" strokeWidth="1" opacity="0.5"/>
          <text x="28" y="26" textAnchor="middle" fontFamily="Arial Black,sans-serif" fontWeight="900" fontSize="14" fill="rgb(var(--ac1))" dominantBaseline="middle">AC</text>
        </svg>
        <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full animate-pulse-slow" style={{background:'rgb(var(--ac2))'}}/>
      </div>
      <div className="text-center">
        <div className="text-base font-black tracking-widest text-white leading-none">AC<span style={{color:'rgb(var(--ac1))'}}>MIGO</span></div>
        <div className="text-[9px] text-gray-600 tracking-[0.2em] uppercase mt-0.5">Evidencija Statista</div>
      </div>
    </div>
  )
}

export default function Sidebar() {
  const { page, navigate, statistike } = useApp()
  const [showNotif, setShowNotif] = useState(false)
  const notifCount = statistike?.notifikacije?.length || 0

  return (
    <aside className="w-[200px] flex-shrink-0 bg-[#08080f] border-r border-[#1a1a28] flex flex-col overflow-hidden relative">
      <FilmStripLogo/>

      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto scrollbar-thin">
        <div className="px-2 mb-2"><span className="text-[10px] text-gray-700 uppercase tracking-widest font-semibold">Navigacija</span></div>

        {NAV.map(({ id, label, icon:Icon }) => {
          const isActive = page===id || (id==='statisti' && STATISTA_PAGES.includes(page))
          return (
            <button key={id} onClick={()=>navigate(id)} className={isActive?'sidebar-item-active w-full':'sidebar-item-inactive w-full'}>
              <Icon size={15} className="flex-shrink-0"/>
              <span>{label}</span>
              {isActive && <ChevronRight size={11} className="ml-auto opacity-60"/>}
            </button>
          )
        })}

        <div className="pt-3">
          <button onClick={()=>navigate('statista-new')} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all duration-200" style={{background:'rgb(var(--ac2)/0.10)',borderColor:'rgb(var(--ac2)/0.20)',color:'rgb(var(--ac1))'}}>
            <UserPlus size={13}/><span>Novi statista</span>
          </button>
        </div>
      </nav>

      {statistike && (
        <div className="px-3 py-3 border-t border-[#1a1a28] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-600 uppercase tracking-wider">Statisti</span>
            <span className="text-xs font-bold text-gray-400">{statistike.ukupno_statista}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-1.5 rounded-full transition-all duration-500" style={{width:`${Math.round((statistike.aktivnih/(statistike.ukupno_statista||1))*100)}%`,minWidth:'4px',background:'rgb(var(--ac2))'}}/>
            <span className="text-[9px] text-gray-700 ml-1">{statistike.aktivnih} aktivnih</span>
          </div>
          {statistike.neplaceno > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-orange-500/70">Čeka isplatu</span>
              <span className="text-xs font-bold text-orange-400">{statistike.neplaceno?.toFixed(0)} BAM</span>
            </div>
          )}
        </div>
      )}

      <div className="px-2 py-2 border-t border-[#1a1a28] space-y-0.5">
        <div className="relative">
          <button onClick={()=>setShowNotif(!showNotif)} className={page==='settings'?'sidebar-item-active w-full':'sidebar-item-inactive w-full'}>
            <Bell size={15}/>
            <span>Obavještenja</span>
            {notifCount>0 && <span className="ml-auto w-5 h-5 rounded-full text-[9px] font-bold flex items-center justify-center text-black" style={{background:'rgb(var(--ac2))'}}>{notifCount}</span>}
          </button>
          {showNotif && <NotificationPanel onClose={()=>setShowNotif(false)}/>}
        </div>
        <button onClick={()=>navigate('settings')} className={page==='settings'?'sidebar-item-active w-full':'sidebar-item-inactive w-full'}>
          <Settings size={15}/><span>Podešavanja</span>
          {page==='settings' && <ChevronRight size={11} className="ml-auto opacity-60"/>}
        </button>
      </div>
      <div className="px-3 py-2 text-[9px] text-gray-700 text-center">ACMigo v1.0.0</div>
    </aside>
  )
}
