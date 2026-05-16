import React, { useState, useEffect } from 'react'
import { useApp } from '../App'
import { BG_LABELS } from '../utils/bgEngine'
import {
  Settings as SettingsIcon, Database, FolderOpen, Upload,
  Download, Info, Package, Check, Palette, Sparkles,
  Film, Image, Trash2, X, Monitor, ToggleLeft, ToggleRight
} from 'lucide-react'

// ─── COLOUR THEMES ───────────────────────────────────────────────────────────
const THEMES = [
  { id:'cinema',    name:'Cinema Gold',    accent:'#f59e0b', bg:'#0a0a14', card:'#12121e', special:false },
  { id:'hollywood', name:'Hollywood',      accent:'#b91c1c', accent2:'#dbb43c', bg:'#080404', card:'#100808', special:true },
  { id:'sapphire',  name:'Sapphire Night', accent:'#60a5fa', bg:'#050814', card:'#0a0f20', special:false },
  { id:'emerald',   name:'Emerald Studio', accent:'#34d399', bg:'#040c0a', card:'#081410', special:false },
  { id:'violet',    name:'Violet Dusk',    accent:'#a78bfa', bg:'#080512', card:'#0e0a1c', special:false },
  { id:'steel',     name:'Steel Pro',      accent:'#94a3b8', bg:'#08090c', card:'#0e1114', special:false },
  { id:'neon',      name:'Neon Noir',      accent:'#ec4899', bg:'#05030c', card:'#0a0514', special:false },
]

// ─── BG PRESETS ──────────────────────────────────────────────────────────────
const BG_PRESETS = ['none','noir','cinema-red','cosmos','golden','neon-city','forest','ocean','custom']

const BG_PREVIEWS = {
  none:         { bg:'linear-gradient(135deg,#0a0a14,#12121e)', label:'Bez pozadine', icon:'⬛' },
  noir:         { bg:'linear-gradient(160deg,#0a0805,#0f0c08,#060408)', label:'Film Noir', icon:'🎞️' },
  'cinema-red': { bg:'radial-gradient(ellipse at 5% 5%,rgba(160,10,10,0.8) 0%,transparent 60%),linear-gradient(150deg,#0d0202,#1e0606,#0a0202)', label:'Crveni Zastor', icon:'🎭' },
  cosmos:       { bg:'radial-gradient(ellipse at 30% 40%,rgba(30,80,220,0.5) 0%,transparent 50%),radial-gradient(ellipse at 70% 70%,rgba(110,40,220,0.4) 0%,transparent 50%),linear-gradient(155deg,#010307,#020411,#010207)', label:'Svemirski Film', icon:'🌌', stars:true },
  golden:       { bg:'radial-gradient(ellipse at 0% 100%,rgba(200,90,10,0.7) 0%,transparent 50%),radial-gradient(ellipse at 100% 0%,rgba(220,140,5,0.6) 0%,transparent 50%),linear-gradient(155deg,#0d0901,#1c1102,#0a0700)', label:'Zlatni Sat', icon:'✨' },
  'neon-city':  { bg:'radial-gradient(ellipse at 8% 92%,rgba(236,72,153,0.6) 0%,transparent 40%),radial-gradient(ellipse at 92% 8%,rgba(34,211,238,0.5) 0%,transparent 40%),linear-gradient(155deg,#020107,#04020c,#010107)', label:'Neonski Grad', icon:'🌆' },
  forest:       { bg:'radial-gradient(ellipse at 15% 85%,rgba(10,100,22,0.7) 0%,transparent 50%),radial-gradient(ellipse at 85% 15%,rgba(6,75,16,0.6) 0%,transparent 50%),linear-gradient(155deg,#010a02,#051004,#010901)', label:'Noćna Šuma', icon:'🌲' },
  ocean:        { bg:'radial-gradient(ellipse at 50% 0%,rgba(10,140,165,0.5) 0%,transparent 58%),radial-gradient(ellipse at 18% 72%,rgba(1,120,175,0.4) 0%,transparent 50%),linear-gradient(175deg,#010812,#020d1c,#010810)', label:'Duboki Ocean', icon:'🌊' },
  custom:       { bg:'#1a1a2e', label:'Vlastita slika', icon:'🖼️', isCustom:true },
}

// ─── COLOUR THEME CARD ───────────────────────────────────────────────────────
function ThemeCard({ t, active, onSelect }) {
  return (
    <button onClick={() => onSelect(t.id)}
      className="relative text-left transition-all duration-200 focus:outline-none"
      style={{ transform: active ? 'scale(1.04)' : 'scale(1)' }}>
      <div className="rounded-xl overflow-hidden border-2 transition-all duration-200"
        style={{ borderColor: active ? t.accent : 'rgb(var(--bd1))', boxShadow: active ? `0 0 18px ${t.accent}50` : 'none' }}>
        {/* Mini preview */}
        <div className="h-16 relative" style={{ background: t.bg }}>
          {t.special && (
            <div className="absolute inset-x-0 top-0 h-2.5 flex gap-0.5 px-0.5 items-center" style={{ background:'rgba(0,0,0,0.8)' }}>
              {[...Array(12)].map((_,i)=><div key={i} className="flex-1 h-1.5 rounded-sm" style={{ background:'rgba(220,180,60,0.7)' }}/>)}
            </div>
          )}
          <div className="absolute left-0 top-0 bottom-0 w-8" style={{ background:`${t.bg}ee` }}>
            <div className="mt-3 mx-1 space-y-1">
              {[1,0.6,0.35].map((o,i)=><div key={i} className="h-1 rounded" style={{ background:t.accent, opacity:o }}/>)}
            </div>
          </div>
          <div className="absolute left-10 top-2 right-1 space-y-1">
            {[0.9,0.6,0.35].map((o,i)=>(
              <div key={i} className="h-2 rounded" style={{ background:t.card, border:`1px solid ${t.accent}30`, opacity:o }} />
            ))}
          </div>
          {active && (
            <div className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center" style={{ background:t.accent }}>
              <Check size={9} className="text-black"/>
            </div>
          )}
        </div>
        <div className="px-2 py-1.5" style={{ background:t.card }}>
          <div className="text-[11px] font-bold truncate" style={{ color: active ? t.accent : '#e2e8f0' }}>{t.name}</div>
        </div>
      </div>
    </button>
  )
}

// ─── BG PRESET CARD ──────────────────────────────────────────────────────────
function BgCard({ id, active, onSelect, customThumb }) {
  const p = BG_PREVIEWS[id] || {}
  return (
    <button onClick={() => onSelect(id)}
      className="relative text-left transition-all duration-200 focus:outline-none"
      style={{ transform: active ? 'scale(1.04)' : 'scale(1)' }}>
      <div className="rounded-xl overflow-hidden border-2 transition-all duration-200"
        style={{ borderColor: active ? '#f59e0b' : 'rgb(var(--bd1))', boxShadow: active ? '0 0 18px rgba(245,158,11,0.4)' : 'none' }}>
        {/* Preview */}
        <div className="h-20 relative overflow-hidden flex items-center justify-center"
          style={{ background: p.bg || '#0a0a14' }}>
          {/* Stars for cosmos */}
          {p.stars && [...Array(12)].map((_,i)=>(
            <div key={i} className="absolute rounded-full bg-white"
              style={{ width:i%4===0?2:1, height:i%4===0?2:1, left:`${(i*13+7)%100}%`, top:`${(i*17+11)%100}%`, opacity:0.5+(i%3)*0.2 }}/>
          ))}
          {/* Custom image thumb */}
          {id==='custom' && customThumb && (
            <img src={customThumb} className="absolute inset-0 w-full h-full object-cover" alt=""/>
          )}
          {/* Icon */}
          <span className="text-2xl relative z-10">{p.icon}</span>
          {active && (
            <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
              <Check size={10} className="text-black"/>
            </div>
          )}
        </div>
        <div className="px-2 py-1.5 bg-[#12121e]">
          <div className="text-[10px] font-bold truncate" style={{ color: active ? '#f59e0b' : '#e2e8f0' }}>{p.label}</div>
        </div>
      </div>
    </button>
  )
}

// ─── SECTION ─────────────────────────────────────────────────────────────────
function Section({ title, icon: Icon, children }) {
  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-3.5 border-b border-[#1e1e30] flex items-center gap-2">
        <Icon size={15} className="text-amber-400"/>
        <span className="font-semibold text-sm text-gray-200">{title}</span>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function ActionRow({ icon: Icon, label, description, action, actionLabel, danger }) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-[#1e1e30]/60 last:border-0">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${danger?'bg-red-500/15':'bg-amber-500/10'}`}>
        <Icon size={16} className={danger?'text-red-400':'text-amber-400'}/>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-200">{label}</div>
        {description && <div className="text-xs text-gray-600 mt-0.5">{description}</div>}
      </div>
      <button onClick={action} className={danger?'btn-danger text-xs py-1.5':'btn-secondary text-xs py-1.5'}>
        {actionLabel}
      </button>
    </div>
  )
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
export default function Settings() {
  const { toast, refresh, theme, applyTheme, bgTheme, bgCustomUrl: ctxBgUrl, setBgCustomUrl, applyBg } = useApp()

  const [version, setVersion]       = useState('—')
  const [dataPath, setDataPath]     = useState('—')
  const [loading, setLoading]       = useState(false)
  // Mode: 'color' or 'bg'
  const [mode, setMode]             = useState('color')
  const [customThumb, setCustomThumb] = useState(null)
  const [activeBg, setActiveBg]     = useState(bgTheme || 'none')

  useEffect(() => {
    window.api.getVersion().then(setVersion).catch(()=>{})
    window.api.getDataPath().then(setDataPath).catch(()=>{})
    // Load custom bg thumb if any
    window.api.getCustomBg?.().then(f => { if(f) setCustomThumb(`bg://${f}`) }).catch(()=>{})
    // If bg is active, start in bg mode
    if (bgTheme && bgTheme !== 'none') setMode('bg')
  }, [])

  // ── Mode toggle ──
  const handleModeToggle = (newMode) => {
    setMode(newMode)
    if (newMode === 'color') {
      // Turn off background
      applyBg('none')
      applyBg('none')
      setActiveBg('none')
      window.api?.setSetting?.('bg_theme', 'none')
    }
  }

  // ── Select colour theme ──
  const handleSelectTheme = (id) => {
    applyTheme(id)
    toast(`Tema: ${THEMES.find(t=>t.id===id)?.name}`, 'success')
  }

  // ── Select bg preset ──
  const handleSelectBg = async (id) => {
    if (id === 'custom') {
      const filename = await window.api.uploadBgImage?.()
      if (!filename) return
      const url = `bg://${filename}`
      setCustomThumb(url)
      applyBg('custom', url)
      applyBg('custom', url)
      setActiveBg('custom')
      window.api?.setSetting?.('bg_theme', 'custom')
      toast('Vlastita pozadina postavljena!', 'success')
    } else if (id === 'none') {
      applyBg('none')
      applyBg('none')
      setActiveBg('none')
      window.api?.setSetting?.('bg_theme', 'none')
      toast('Pozadina uklonjena')
    } else {
      applyBg(id)
      applyBg(id)
      setActiveBg(id)
      window.api?.setSetting?.('bg_theme', id)
      toast(`Pozadina: ${BG_PREVIEWS[id]?.label || id}`, 'success')
    }
  }

  const handleDeleteCustom = async () => {
    await window.api.deleteCustomBg?.()
    setCustomThumb(null)
    if (activeBg === 'custom') {
      applyBg('none'); applyBg('none'); setActiveBg('none')
      window.api?.setSetting?.('bg_theme', 'none')
    }
    toast('Vlastita slika obrisana')
  }

  const handleBackup = async () => {
    setLoading(true)
    try {
      const r = await window.api.backupDb()
      toast(r?.success ? 'Backup sačuvan!' : 'Otkazan', r?.success ? 'success' : 'info')
    } catch(e) { toast('Greška: '+e.message, 'error') }
    finally { setLoading(false) }
  }

  const handleRestore = async () => {
    if (!confirm('Zamijeniti trenutnu bazu backupom?')) return
    setLoading(true)
    try {
      const r = await window.api.restoreDb()
      if (r?.success) { toast('Baza vraćena! Restart.', 'success', 6000); refresh() }
      else toast(r?.error || 'Otkazano', r?.error ? 'error' : 'info')
    } catch(e) { toast('Greška: '+e.message, 'error') }
    finally { setLoading(false) }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <SettingsIcon size={22} className="text-amber-400"/>
        <div>
          <h1 className="text-2xl font-black text-white">Podešavanja</h1>
          <p className="text-xs text-gray-600">Izgled, pozadine, baza podataka</p>
        </div>
      </div>

      {/* ── IZGLED SEKCIJA ────────────────────────────────── */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#1e1e30] flex items-center gap-3">
          <Palette size={15} className="text-amber-400"/>
          <span className="font-semibold text-sm text-gray-200">Izgled programa</span>
        </div>

        {/* Mode toggle — two big buttons */}
        <div className="p-5">
          <p className="text-xs text-gray-600 mb-4">Odaberite vrstu vizuelne teme:</p>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {/* Colour mode */}
            <button
              onClick={() => handleModeToggle('color')}
              className="relative flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left"
              style={{
                borderColor: mode==='color' ? '#f59e0b' : 'rgb(var(--bd1))',
                background: mode==='color' ? 'rgba(245,158,11,0.08)' : 'rgb(var(--bg2))',
                boxShadow: mode==='color' ? '0 0 20px rgba(245,158,11,0.2)' : 'none'
              }}
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0 text-xl">
                🎨
              </div>
              <div>
                <div className="text-sm font-bold" style={{ color: mode==='color' ? '#f59e0b' : '#e2e8f0' }}>
                  Teme boja
                </div>
                <div className="text-[10px] text-gray-600 mt-0.5">7 akcentnih paleta</div>
              </div>
              {mode==='color' && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                  <Check size={10} className="text-black"/>
                </div>
              )}
            </button>

            {/* Background mode */}
            <button
              onClick={() => { setMode('bg'); if(activeBg && activeBg !== 'none') { applyBg(activeBg, activeBg==='custom'?customThumb:null) } }}
              className="relative flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left"
              style={{
                borderColor: mode==='bg' ? '#f59e0b' : 'rgb(var(--bd1))',
                background: mode==='bg' ? 'rgba(245,158,11,0.08)' : 'rgb(var(--bg2))',
                boxShadow: mode==='bg' ? '0 0 20px rgba(245,158,11,0.2)' : 'none'
              }}
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center flex-shrink-0 text-xl">
                🌌
              </div>
              <div>
                <div className="text-sm font-bold" style={{ color: mode==='bg' ? '#f59e0b' : '#e2e8f0' }}>
                  Slikovne pozadine
                </div>
                <div className="text-[10px] text-gray-600 mt-0.5">8 filmskih + vlastita slika</div>
              </div>
              {mode==='bg' && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                  <Check size={10} className="text-black"/>
                </div>
              )}
            </button>
          </div>

          {/* ── COLOUR THEMES ── */}
          {mode === 'color' && (
            <div className="animate-fade-in">
              <p className="text-[11px] text-gray-600 mb-3">Odaberite akcentnu paletu — primjenjuje se odmah:</p>
              <div className="grid grid-cols-4 lg:grid-cols-7 gap-2">
                {THEMES.map(t => (
                  <ThemeCard key={t.id} t={t} active={theme===t.id} onSelect={handleSelectTheme}/>
                ))}
              </div>
            </div>
          )}

          {/* ── BG PRESETS ── */}
          {mode === 'bg' && (
            <div className="animate-fade-in">
              <p className="text-[11px] text-gray-600 mb-3">Odaberite pozadinsku temu — primjenjuje se odmah:</p>
              <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2">
                {BG_PRESETS.map(id => (
                  <BgCard key={id} id={id} active={activeBg===id}
                    onSelect={handleSelectBg} customThumb={customThumb}/>
                ))}
              </div>

              {/* Custom image controls */}
              <div className="flex gap-2 mt-4 flex-wrap">
                <button onClick={() => handleSelectBg('custom')} className="btn-secondary text-xs py-1.5">
                  <Upload size={12}/>
                  {customThumb ? 'Promijeni vlastitu sliku' : 'Dodaj vlastitu sliku'}
                </button>
                {customThumb && (
                  <button onClick={handleDeleteCustom} className="btn-danger text-xs py-1.5">
                    <Trash2 size={12}/>Obriši vlastitu
                  </button>
                )}
              </div>

              {activeBg !== 'none' && (
                <div className="mt-3 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-center gap-2">
                  <span>✓</span>
                  <span>Aktivna pozadina: <strong>{BG_PREVIEWS[activeBg]?.label || activeBg}</strong> — kartice su providne s blur efektom</span>
                  <button onClick={() => handleSelectBg('none')} className="ml-auto text-gray-500 hover:text-gray-300">
                    <X size={12}/>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── DATABASE ─────────────────────────────────────── */}
      <Section title="Baza podataka" icon={Database}>
        <ActionRow icon={Download} label="Backup baze" description="Sačuvaj kopiju svih podataka"
          action={handleBackup} actionLabel={loading?'Čekajte...':'Backup'}/>
        <ActionRow icon={Upload} label="Restore backupa" description="Učitaj prethodni backup"
          action={handleRestore} actionLabel="Restore"/>
        <ActionRow icon={FolderOpen} label="Folder podataka" description="Otvori AppData folder"
          action={()=>window.api.openDataFolder()} actionLabel="Otvori"/>
        <ActionRow icon={Image} label="Folder fotografija"
          action={()=>window.api.openPhotosFolder()} actionLabel="Otvori"/>
      </Section>

      {/* ── O PROGRAMU ───────────────────────────────────── */}
      <Section title="O programu" icon={Info}>
        {[
          ['Verzija', `v${version}`, true],
          ['Mod izgleda', mode==='color'?`Tema boja: ${THEMES.find(t=>t.id===theme)?.name||theme}`:`Pozadina: ${BG_PREVIEWS[activeBg]?.label||activeBg}`],
          ['Platforma', navigator.platform],
        ].map(([l,v,mono])=>(
          <div key={l} className="flex justify-between py-2.5 border-b border-[#1e1e30]/60 last:border-0">
            <span className="text-xs text-gray-600">{l}</span>
            <span className={`text-xs text-gray-300 ${mono?'font-mono':'font-medium'}`}>{v}</span>
          </div>
        ))}
        <div className="py-2.5">
          <span className="text-xs text-gray-600 block mb-1">Putanja podataka</span>
          <span className="text-xs text-gray-500 font-mono break-all">{dataPath}</span>
        </div>
        <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
            <Package size={16} className="text-amber-400"/>
          </div>
          <div>
            <div className="text-sm font-bold text-amber-300">ACMigo v{version}</div>
            <div className="text-xs text-gray-500 mt-0.5">Profesionalna evidencija statista</div>
            <div className="text-[10px] text-gray-700 mt-1.5">React · Electron · 7 tema boja · 8 pozadinskih tema</div>
          </div>
        </div>
      </Section>
    </div>
  )
}
