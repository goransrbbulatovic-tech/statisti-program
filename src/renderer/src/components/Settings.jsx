import React, { useState, useEffect } from 'react'
import { applyBg as applyBgDirect, BG_MAP } from '../utils/bgEngine'
import { useApp } from '../App'
import {
  Settings as SettingsIcon, Database, FolderOpen, Upload, Download,
  Info, Shield, Package, Check, Palette, Sparkles, Film,
  Image, Trash2, X, Monitor
} from 'lucide-react'

// ─── COLOUR THEMES ───────────────────────────────────────────────────────────

const THEMES = [
  { id:'cinema',    name:'Cinema Gold',     desc:'Zlatna klasika', accent:'#f59e0b', accent2:'#fbbf24', bg:'#0a0a14', card:'#12121e', preview:['#0a0a14','#f59e0b','#6366f1','#12121e'] },
  { id:'hollywood', name:'Hollywood',       desc:'🎬 Filmska crvena & zlato', accent:'#dc1414', accent2:'#dbb43c', bg:'#080404', card:'#100808', preview:['#080404','#b91c1c','#dbb43c','#1c0808'], special:true, specialLabel:'FILMSKI' },
  { id:'sapphire',  name:'Sapphire Night',  desc:'Duboko plava',  accent:'#60a5fa', accent2:'#93c5fd', bg:'#050814', card:'#0a0f20', preview:['#050814','#60a5fa','#a78bfa','#0a0f20'] },
  { id:'emerald',   name:'Emerald Studio',  desc:'Smaragdno zelena', accent:'#34d399', accent2:'#6ee7b7', bg:'#040c0a', card:'#081410', preview:['#040c0a','#34d399','#5eead4','#081410'] },
  { id:'violet',    name:'Violet Dusk',     desc:'Ljubičasti sumrak', accent:'#a78bfa', accent2:'#c4b5fd', bg:'#080512', card:'#0e0a1c', preview:['#080512','#a78bfa','#f472b6','#0e0a1c'] },
  { id:'steel',     name:'Steel Pro',       desc:'Čelično siva',  accent:'#94a3b8', accent2:'#cbd5e1', bg:'#08090c', card:'#0e1114', preview:['#08090c','#94a3b8','#7dd3fc','#0e1114'] },
  { id:'neon',      name:'Neon Noir',       desc:'Kiberpunk sjaj', accent:'#ec4899', accent2:'#f9a8d4', bg:'#05030c', card:'#0a0514', preview:['#05030c','#ec4899','#22d3ee','#0a0514'] },
]

// ─── BACKGROUND PRESETS ───────────────────────────────────────────────────────

const BG_PRESETS = [
  {
    id: 'none',
    name: 'Bez pozadine',
    desc: 'Čista tamna pozadina',
    preview: 'linear-gradient(135deg, #0a0a14 0%, #12121e 100%)',
  },
  {
    id: 'noir',
    name: 'Film Noir',
    desc: 'Klasični crno-bijeli noir ugođaj',
    preview: 'linear-gradient(160deg, #0a0805 0%, #0f0c08 50%, #060408 100%)',
    grain: true,
  },
  {
    id: 'cinema-red',
    name: 'Crveni Zastor',
    desc: 'Dramska crvena filmska pozornica',
    preview: 'linear-gradient(135deg, #0d0404 0%, #120808 40%, #200808 70%, #0d0404 100%)',
    glow: '#7f1d1d',
  },
  {
    id: 'cosmos',
    name: 'Svemirski Film',
    desc: 'Zvjezdano nebo i nebula',
    preview: 'linear-gradient(160deg, #020408 0%, #030510 40%, #050315 70%, #020208 100%)',
    stars: true,
  },
  {
    id: 'golden',
    name: 'Zlatni Sat',
    desc: 'Topla zlatna filmska atmosfera',
    preview: 'linear-gradient(160deg, #0c0802 0%, #1a1004 40%, #120c02 70%, #080600 100%)',
    glow: '#92400e',
  },
  {
    id: 'neon-city',
    name: 'Neonski Grad',
    desc: 'Kiberpunk noćni grad',
    preview: 'linear-gradient(160deg, #030208 0%, #05030c 40%, #030208 100%)',
    glow: '#7c3aed',
  },
  {
    id: 'forest',
    name: 'Noćna Šuma',
    desc: 'Tamna mistična šuma',
    preview: 'linear-gradient(160deg, #020a04 0%, #040d06 40%, #010802 100%)',
    glow: '#14532d',
  },
  {
    id: 'ocean',
    name: 'Duboki Ocean',
    desc: 'Tamno plavo morsko dno',
    preview: 'linear-gradient(180deg, #020810 0%, #030c14 40%, #01080e 100%)',
    glow: '#164e63',
  },
  {
    id: 'custom',
    name: 'Vlastita slika',
    desc: 'Uploaduj svoju pozadinu',
    preview: null,
    isCustom: true,
  },
]

// ─── BG PREVIEW CARD ─────────────────────────────────────────────────────────

function BgCard({ preset, active, onSelect, customUrl, onUpload, onDelete }) {
  return (
    <button
      onClick={() => preset.isCustom ? onUpload() : onSelect(preset.id)}
      className="relative group text-left transition-all duration-300 focus:outline-none"
    >
      <div
        className="rounded-2xl overflow-hidden border-2 transition-all duration-300"
        style={{
          borderColor: active ? '#f59e0b' : 'rgb(var(--bd1))',
          boxShadow: active ? '0 0 20px rgba(245,158,11,0.25)' : 'none',
          transform: active ? 'scale(1.03)' : 'scale(1)',
        }}
      >
        {/* Preview box */}
        <div className="relative h-24 overflow-hidden" style={{ background: preset.preview || '#0a0a14' }}>

          {/* Glow effect */}
          {preset.glow && (
            <div className="absolute inset-0 opacity-60" style={{
              background: `radial-gradient(ellipse at center, ${preset.glow}55 0%, transparent 70%)`
            }} />
          )}

          {/* Stars for cosmos */}
          {preset.stars && (
            <div className="absolute inset-0">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="absolute rounded-full bg-white"
                  style={{
                    width: i % 5 === 0 ? 2 : 1, height: i % 5 === 0 ? 2 : 1,
                    left: `${(i * 13 + 7) % 100}%`, top: `${(i * 17 + 11) % 100}%`,
                    opacity: 0.4 + (i % 3) * 0.2
                  }} />
              ))}
            </div>
          )}

          {/* Film grain overlay for noir */}
          {preset.grain && (
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'1\'/%3E%3C/svg%3E")',
            }} />
          )}

          {/* Custom image preview */}
          {preset.isCustom && customUrl && (
            <img src={customUrl} className="w-full h-full object-cover" alt="" />
          )}

          {/* Custom upload placeholder */}
          {preset.isCustom && !customUrl && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
              <Image size={20} className="text-gray-600" />
              <span className="text-[10px] text-gray-700">Klikni za upload</span>
            </div>
          )}

          {/* Mock UI overlay */}
          {!preset.isCustom && (
            <div className="absolute inset-0 flex items-end p-2">
              <div className="flex gap-1 w-full">
                <div className="w-8 rounded" style={{ height: 28, background: 'rgba(0,0,0,0.6)' }} />
                <div className="flex-1 space-y-1">
                  <div className="h-2 rounded" style={{ background: 'rgba(255,255,255,0.12)', width: '60%' }} />
                  <div className="h-2 rounded" style={{ background: 'rgba(255,255,255,0.08)', width: '80%' }} />
                </div>
              </div>
            </div>
          )}

          {/* Active check */}
          {active && (
            <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center">
              <Check size={12} className="text-black" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="px-3 py-2" style={{ background: 'rgb(var(--bg2))', borderTop: '1px solid rgb(var(--bd1))' }}>
          <div className="text-xs font-bold" style={{ color: active ? '#f59e0b' : '#e2e8f0' }}>{preset.name}</div>
          <div className="text-[10px] mt-0.5" style={{ color: '#64748b' }}>{preset.desc}</div>
        </div>
      </div>

      {/* Custom upload/delete buttons */}
      {preset.isCustom && (
        <div className="absolute inset-x-0 bottom-0 flex gap-1 p-2 opacity-0 group-hover:opacity-100 transition-opacity" style={{ top: 'auto' }}>
        </div>
      )}
    </button>
  )
}

// ─── THEME CARD ───────────────────────────────────────────────────────────────

function ThemeCard({ theme, active, onSelect }) {
  return (
    <button onClick={() => onSelect(theme.id)} className="relative group text-left transition-all duration-300 focus:outline-none">
      <div className="rounded-2xl overflow-hidden border-2 transition-all duration-300"
        style={{
          borderColor: active ? theme.accent : 'rgb(var(--bd1))',
          boxShadow: active ? `0 0 24px ${theme.accent}40` : 'none',
          transform: active ? 'scale(1.02)' : 'scale(1)',
        }}>
        <div className="relative h-24 overflow-hidden" style={{ background: theme.bg }}>
          {theme.id === 'hollywood' && (
            <>
              <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at left, rgba(120,10,10,0.4) 0%, transparent 60%)' }} />
              <div className="absolute top-0 left-0 right-0 h-3 flex items-center gap-0.5 px-1" style={{ background: 'rgba(0,0,0,0.8)' }}>
                {[...Array(14)].map((_,i)=><div key={i} className="rounded-sm flex-shrink-0" style={{ width:8, height:6, background:'rgba(220,180,60,0.7)' }}/>)}
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-3 flex items-center gap-0.5 px-1" style={{ background: 'rgba(0,0,0,0.8)' }}>
                {[...Array(14)].map((_,i)=><div key={i} className="rounded-sm flex-shrink-0" style={{ width:8, height:6, background:'rgba(220,180,60,0.7)' }}/>)}
              </div>
            </>
          )}
          <div className="absolute left-0 top-0 bottom-0 w-10" style={{ background: `${theme.bg}dd` }}>
            <div className="mt-4 mx-1.5 space-y-1">
              {[1,0.6,0.4].map((op,i)=><div key={i} className="h-1.5 rounded" style={{ background:theme.accent, opacity:op }}/>)}
            </div>
          </div>
          <div className="absolute left-12 top-3 right-2 space-y-1.5">
            <div className="flex gap-1">
              {[theme.accent, theme.accent2, '#6366f1'].map((c,i)=>(
                <div key={i} className="flex-1 h-7 rounded-lg" style={{ background:theme.card, border:`1px solid ${c}30` }}>
                  <div className="w-3 h-1 rounded mt-1.5 mx-1" style={{ background:c, opacity:0.8 }}/>
                </div>
              ))}
            </div>
          </div>
          {active && (
            <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center" style={{ background:theme.accent }}>
              <Check size={10} className="text-black" />
            </div>
          )}
          {theme.special && (
            <div className="absolute top-2 left-11 flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-black" style={{ background:'rgba(220,180,60,0.9)', color:'#1a0000' }}>
              <Film size={7}/>{theme.specialLabel}
            </div>
          )}
        </div>
        <div className="px-3 py-2" style={{ background:theme.card, borderTop:`1px solid ${theme.accent}20` }}>
          <div className="text-xs font-bold" style={{ color:active?theme.accent:'#e2e8f0' }}>{theme.name}</div>
          <div className="text-[10px] mt-0.5" style={{ color:'#64748b' }}>{theme.desc}</div>
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
        <Icon size={15} className="text-amber-400" />
        <span className="font-semibold text-sm text-gray-200">{title}</span>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function ActionRow({ icon: Icon, label, description, action, actionLabel, danger }) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-[#1e1e30]/60 last:border-0">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${danger ? 'bg-red-500/15' : 'bg-amber-500/10'}`}>
        <Icon size={16} className={danger ? 'text-red-400' : 'text-amber-400'} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-200">{label}</div>
        {description && <div className="text-xs text-gray-600 mt-0.5">{description}</div>}
      </div>
      <button onClick={action} className={danger ? 'btn-danger text-xs py-1.5' : 'btn-secondary text-xs py-1.5'}>
        {actionLabel}
      </button>
    </div>
  )
}

// ─── MAIN SETTINGS ───────────────────────────────────────────────────────────

export default function Settings() {
  const { toast, refresh, theme, applyTheme, bgTheme, bgCustomUrl: ctxCustomUrl, setBgCustomUrl, applyBg } = useApp()
  const [version, setVersion]     = useState('—')
  const [dataPath, setDataPath]   = useState('—')
  const [loading, setLoading]     = useState(false)
  const [customBgUrl, setCustomBgUrl] = useState(ctxCustomUrl || null)

  useEffect(() => {
    window.api.getVersion().then(setVersion).catch(() => {})
    window.api.getDataPath().then(setDataPath).catch(() => {})
    // Load custom bg preview
    window.api.getCustomBg?.().then(f => {
      if (f) setCustomBgUrl(`bg://${f}`)
    }).catch(() => {})
  }, [])

  const handleBackup = async () => {
    setLoading(true)
    try {
      const result = await window.api.backupDb()
      if (result?.success) toast('Backup uspješno sačuvan!', 'success')
      else toast('Backup otkazan', 'info')
    } catch (e) { toast('Greška: ' + e.message, 'error') }
    finally { setLoading(false) }
  }

  const handleRestore = async () => {
    if (!confirm('Vraćanje backupa će zamijeniti trenutnu bazu.\nNastaviti?')) return
    setLoading(true)
    try {
      const result = await window.api.restoreDb()
      if (result?.success) { toast('Baza vraćena! Restartujte aplikaciju.', 'success', 6000); refresh() }
      else toast(result?.error || 'Restore otkazan', result?.error ? 'error' : 'info')
    } catch (e) { toast('Greška: ' + e.message, 'error') }
    finally { setLoading(false) }
  }

  const handleUploadCustomBg = async () => {
    const filename = await window.api.uploadBgImage?.()
    if (filename) {
      const url = `bg://${filename}`
      setCustomBgUrl(url)
      setBgCustomUrl?.(url)
      applyBgDirect('custom', url)   // DIRECT DOM
      applyBg('custom', url)         // context for persistence
      toast('Pozadinska slika postavljena!', 'success')
    }
  }

  const handleDeleteCustomBg = async () => {
    await window.api.deleteCustomBg?.()
    setCustomBgUrl(null)
    applyBg('none')
    toast('Vlastita pozadina obrisana')
  }

  const handleSelectBg = (id) => {
    if (id === 'custom') {
      if (customBgUrl) {
        applyBgDirect('custom', customBgUrl)
        applyBg('custom', customBgUrl)  // also update context for persistence
        toast('Vlastita pozadina aktivirana!', 'success')
      } else {
        handleUploadCustomBg()
      }
    } else {
      applyBgDirect(id)      // DIRECT DOM — instant, no context needed
      applyBg(id)            // update context for persistence
      toast(`Pozadina: ${BG_PRESETS.find(b => b.id === id)?.name || id}`, 'success')
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <SettingsIcon size={22} className="text-amber-400" />
        <div>
          <h1 className="text-2xl font-black text-white">Podešavanja</h1>
          <p className="text-xs text-gray-600">Izgled, pozadine, baza podataka i informacije</p>
        </div>
      </div>

      {/* ── COLOUR THEMES ────────────────────────────────── */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#1e1e30] flex items-center gap-2">
          <Palette size={15} className="text-amber-400" />
          <span className="font-semibold text-sm text-gray-200">Tema boja</span>
          <span className="ml-auto badge badge-amber text-[10px]">
            {THEMES.find(t => t.id === theme)?.name || 'Cinema Gold'}
          </span>
        </div>
        <div className="p-5">
          <p className="text-xs text-gray-600 mb-4">Odaberite akcentnu paletu boja. Primjenjuje se odmah.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {THEMES.map(t => (
              <ThemeCard key={t.id} theme={t} active={theme === t.id}
                onSelect={(id) => { applyTheme(id); toast(`Tema: ${THEMES.find(x=>x.id===id)?.name}`, 'success') }} />
            ))}
          </div>
          {theme === 'hollywood' && (
            <div className="mt-4 p-4 rounded-xl flex items-start gap-3 animate-fade-in"
              style={{ background:'rgba(185,28,28,0.10)', border:'1px solid rgba(185,28,28,0.25)' }}>
              <Film size={16} className="flex-shrink-0 mt-0.5" style={{ color:'#dc1414' }}/>
              <div>
                <div className="text-sm font-bold" style={{ color:'#dbb43c' }}>Hollywood tema</div>
                <div className="text-xs text-gray-500 mt-1">Inspirisana zlatnim dobom Hollywooda — tamna pozornica sa grimizom i zlatom.</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── BACKGROUND THEMES ───────────────────────────── */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#1e1e30] flex items-center gap-2">
          <Monitor size={15} className="text-amber-400" />
          <span className="font-semibold text-sm text-gray-200">Pozadinska slika</span>
          <span className="ml-auto badge badge-blue text-[10px]">
            {BG_PRESETS.find(b => b.id === bgTheme)?.name || 'Bez pozadine'}
          </span>
        </div>
        <div className="p-5">
          <p className="text-xs text-gray-600 mb-4">
            Odaberite filmsku pozadinu ili uploadujte vlastitu sliku. Kartice postaju providne da pozadina bude vidljiva.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
            {BG_PRESETS.map(preset => (
              <BgCard
                key={preset.id}
                preset={preset}
                active={bgTheme === preset.id}
                onSelect={handleSelectBg}
                customUrl={customBgUrl}
                onUpload={handleUploadCustomBg}
                onDelete={handleDeleteCustomBg}
              />
            ))}
          </div>

          {/* Custom image controls */}
          <div className="flex gap-2 flex-wrap">
            <button onClick={handleUploadCustomBg} className="btn-secondary text-xs py-2">
              <Upload size={12} />
              {customBgUrl ? 'Promijeni vlastitu sliku' : 'Uploaduj vlastitu sliku'}
            </button>
            {customBgUrl && (
              <button onClick={handleDeleteCustomBg} className="btn-danger text-xs py-2">
                <Trash2 size={12} />
                Obriši vlastitu sliku
              </button>
            )}
            {bgTheme !== 'none' && (
              <button onClick={() => { applyBgDirect('none'); applyBg('none'); toast('Pozadina uklonjena') }} className="btn-ghost text-xs py-2">
                <X size={12} />
                Ukloni pozadinu
              </button>
            )}
          </div>

          {bgTheme !== 'none' && (
            <div className="mt-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-400 flex items-start gap-2">
              <Info size={13} className="flex-shrink-0 mt-0.5" />
              Pozadina je aktivna. Kartice su providne da se pozadina vidi. Kombinujte sa akcentnom temom za jedinstveni izgled.
            </div>
          )}
        </div>
      </div>

      {/* ── DATABASE ─────────────────────────────────────── */}
      <Section title="Baza podataka" icon={Database}>
        <ActionRow icon={Download} label="Backup baze" description="Sačuvajte kopiju svih podataka na disk"
          action={handleBackup} actionLabel={loading ? 'Čekajte...' : 'Napravi backup'} />
        <ActionRow icon={Upload} label="Restore backupa" description="Učitajte prethodno sačuvani backup fajl"
          action={handleRestore} actionLabel="Učitaj backup" />
        <ActionRow icon={FolderOpen} label="Otvori folder podataka" description="Prikaži folder sa podacima aplikacije"
          action={() => window.api.openDataFolder()} actionLabel="Otvori" />
        <ActionRow icon={Image} label="Folder fotografija" description="Otvori folder sa svim fotografijama"
          action={() => window.api.openPhotosFolder()} actionLabel="Otvori" />
      </Section>

      {/* ── APP INFO ─────────────────────────────────────── */}
      <Section title="O programu" icon={Info}>
        <div className="space-y-0">
          {[
            ['Verzija', `v${version}`, true],
            ['Program', 'ACMigo — Evidencija Statista'],
            ['Tema boja', THEMES.find(t => t.id === theme)?.name || 'Cinema Gold'],
            ['Pozadina', BG_PRESETS.find(b => b.id === bgTheme)?.name || 'Bez pozadine'],
            ['Platforma', navigator.platform],
          ].map(([label, val, mono]) => (
            <div key={label} className="flex justify-between py-2.5 border-b border-[#1e1e30]/60 last:border-0">
              <span className="text-xs text-gray-600">{label}</span>
              <span className={`text-xs text-gray-300 ${mono ? 'font-mono' : 'font-medium'}`}>{val}</span>
            </div>
          ))}
          <div className="py-2.5">
            <span className="text-xs text-gray-600 block mb-1">Putanja podataka</span>
            <span className="text-xs text-gray-500 font-mono break-all">{dataPath}</span>
          </div>
        </div>
        <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
            <Package size={18} className="text-amber-400" />
          </div>
          <div>
            <div className="text-sm font-bold text-amber-300">ACMigo v{version}</div>
            <div className="text-xs text-gray-500 mt-0.5">Profesionalni program za evidenciju statista</div>
            <div className="text-[10px] text-gray-700 mt-2">JSON baza · React + Electron · Tailwind CSS · 7 tema · 8 pozadina</div>
          </div>
        </div>
      </Section>

      {/* Tips */}
      <div className="p-4 rounded-xl text-xs space-y-2" style={{ background:'rgb(var(--bg2))', border:'1px solid rgb(30 58 138 / 0.3)' }}>
        <div className="font-semibold text-blue-400 flex items-center gap-2">
          <Sparkles size={12} /> Savjeti
        </div>
        <ul className="text-gray-500 space-y-1.5 ml-4 list-disc">
          <li>Kombinirajte <span className="text-gray-400">temu boja</span> sa <span className="text-gray-400">pozadinskom slikom</span> za jedinstven look</li>
          <li>Tema i pozadina se automatski pamte pri sljedećem pokretanju</li>
          <li>Redovno pravite <span className="text-gray-400">backup baze</span> kako ne biste izgubili podatke</li>
          <li>Matični broj automatski popunjava datum rođenja</li>
        </ul>
      </div>
    </div>
  )
}
