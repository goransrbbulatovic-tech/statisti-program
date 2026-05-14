import React, { useState, useEffect } from 'react'
import { useApp } from '../App'
import { Calendar, Plus, Edit, Trash2, Users, Clock, MapPin, ChevronLeft, ChevronRight, X, Save, Loader2, Check, CheckCircle, XCircle, HelpCircle, UserPlus } from 'lucide-react'

const MONTHS = ['Januar','Februar','Mart','April','Maj','Juni','Juli','August','Septembar','Oktobar','Novembar','Decembar']
const STATUS_COLORS = { planirano:'badge-blue', 'u toku':'badge-amber', zavrseno:'badge-green', otkazano:'badge-red' }
const RS_STATUS = { pozvan:'🔔 Pozvan', potvrdjen:'✅ Potvrdjen', odbio:'❌ Odbio', nedostupan:'⛔ Nedostupan' }

function RasporedForm({ initial, projekti, onSave, onCancel, saving }) {
  const [f, setF] = useState({ naziv:'', projekat_id:'', datum:'', vrijeme_pocetka:'', vrijeme_zavrsetka:'', lokacija:'', opis:'', napomena:'', status:'planirano', ...initial })
  const set = (k,v) => setF(p=>({...p,[k]:v}))
  return (
    <div className="p-5 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 form-group"><label className="label">Naziv snimanja *</label><input className="input-field" value={f.naziv} onChange={e=>set('naziv',e.target.value)} placeholder="Npr. Snimanje scene 12 - exterior" autoFocus /></div>
        <div className="form-group"><label className="label">Projekat</label>
          <select className="input-field" value={f.projekat_id||''} onChange={e=>set('projekat_id',e.target.value?parseInt(e.target.value):null)}>
            <option value="">— bez projekta —</option>
            {projekti.map(p=><option key={p.id} value={p.id}>{p.naziv}</option>)}
          </select>
        </div>
        <div className="form-group"><label className="label">Status</label>
          <select className="input-field" value={f.status} onChange={e=>set('status',e.target.value)}>
            {['planirano','u toku','zavrseno','otkazano'].map(s=><option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
          </select>
        </div>
        <div className="form-group"><label className="label">Datum *</label><input type="date" className="input-field" value={f.datum} onChange={e=>set('datum',e.target.value)} /></div>
        <div className="form-group"><label className="label">Lokacija</label><input className="input-field" value={f.lokacija||''} onChange={e=>set('lokacija',e.target.value)} placeholder="Adresa ili naziv lokacije" /></div>
        <div className="form-group"><label className="label">Početak</label><input type="time" className="input-field" value={f.vrijeme_pocetka||''} onChange={e=>set('vrijeme_pocetka',e.target.value)} /></div>
        <div className="form-group"><label className="label">Kraj</label><input type="time" className="input-field" value={f.vrijeme_zavrsetka||''} onChange={e=>set('vrijeme_zavrsetka',e.target.value)} /></div>
        <div className="col-span-2 form-group"><label className="label">Opis / Napomena</label><textarea className="input-field resize-none" rows={2} value={f.napomena||''} onChange={e=>set('napomena',e.target.value)} placeholder="Detalji, upute, posebni zahtjevi..." /></div>
      </div>
      <div className="flex gap-2"><button onClick={onCancel} className="btn-secondary flex-1">Otkaži</button><button onClick={()=>onSave(f)} disabled={!f.naziv||!f.datum||saving} className="btn-primary flex-1">{saving?<Loader2 size={14} className="animate-spin"/>:<Save size={14}/>}Sačuvaj</button></div>
    </div>
  )
}

function RasporedDetail({ id, onClose, toast }) {
  const [raspored, setRaspored] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [search, setSearch] = useState('')
  const [allStatisti, setAllStatisti] = useState([])

  useEffect(() => { load() }, [id])

  const load = async () => {
    const r = await window.api.getRaspored(id)
    setRaspored(r)
  }

  const loadStatisti = async () => {
    const s = await window.api.getStatisti('', { status:'aktivan' })
    setAllStatisti(s || [])
    setShowAdd(true)
  }

  const handleAddStatista = async (sId) => {
    await window.api.addStatistaToRaspored(sId, id, 'pozvan')
    toast('Statista dodan na raspored')
    load()
  }

  const handleStatusChange = async (sId, status) => {
    await window.api.updateRasporedStatus(sId, id, status)
    load()
  }

  const handleRemove = async (sId) => {
    await window.api.removeStatistaFromRaspored(sId, id)
    load()
  }

  const handleExport = async () => {
    if (!raspored) return
    const { default: jsPDF } = await import('jspdf')
    const doc = new jsPDF({ orientation:'portrait', unit:'mm', format:'a4' })
    const PW = 210, M = 15
    doc.setFillColor(10,10,20); doc.rect(0,0,PW,297,'F')
    doc.setFillColor(245,158,11); doc.rect(0,0,PW,18,'F')
    doc.setTextColor(0,0,0); doc.setFontSize(12); doc.setFont('helvetica','bold')
    doc.text(`Dnevni raspored: ${raspored.naziv}`, M, 11)
    doc.setFontSize(8); doc.setFont('helvetica','normal')
    doc.text(`${raspored.datum}  ${raspored.vrijeme_pocetka||''}${raspored.vrijeme_zavrsetka?' - '+raspored.vrijeme_zavrsetka:''}  ${raspored.lokacija||''}`, PW-M, 11, {align:'right'})
    let y = 28
    doc.setTextColor(200,200,200); doc.setFontSize(9); doc.setFont('helvetica','bold')
    doc.text(`Statisti (${raspored.statisti?.length||0}):`, M, y); y+=8
    doc.setFont('helvetica','normal'); doc.setFontSize(8)
    for (const s of (raspored.statisti||[])) {
      if (y > 280) { doc.addPage(); doc.setFillColor(10,10,20); doc.rect(0,0,PW,297,'F'); y=20 }
      doc.setFillColor(22,22,36); doc.roundedRect(M, y-4, PW-2*M, 10, 2,2,'F')
      doc.setTextColor(220,220,220); doc.text(`${s.prezime} ${s.ime}`, M+3, y+2)
      doc.setTextColor(148,163,184)
      if (s.telefon) doc.text(s.telefon, 100, y+2)
      doc.text(RS_STATUS[s.status]||s.status, PW-M-3, y+2, {align:'right'})
      y+=12
    }
    const b64 = doc.output('arraybuffer')
    const bytes=new Uint8Array(b64); let bin=''; for(let i=0;i<bytes.byteLength;i++) bin+=String.fromCharCode(bytes[i])
    await window.api.saveDnevniRaspored(btoa(bin), raspored.naziv)
  }

  if (!raspored) return <div className="p-8 text-center text-gray-600">Učitavam...</div>

  const assigned = new Set((raspored.statisti||[]).map(s=>s.statista_id||s.id))
  const filtered = allStatisti.filter(s => !assigned.has(s.id) && (`${s.ime} ${s.prezime}`).toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-3xl" onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-[#2a2a40]">
          <div>
            <h2 className="font-bold text-white">{raspored.naziv}</h2>
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
              <span className="flex items-center gap-1"><Calendar size={11}/>{raspored.datum}</span>
              {raspored.vrijeme_pocetka && <span className="flex items-center gap-1"><Clock size={11}/>{raspored.vrijeme_pocetka}{raspored.vrijeme_zavrsetka&&` - ${raspored.vrijeme_zavrsetka}`}</span>}
              {raspored.lokacija && <span className="flex items-center gap-1"><MapPin size={11}/>{raspored.lokacija}</span>}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleExport} className="btn-secondary text-xs py-1.5">📄 PDF raspored</button>
            <button onClick={loadStatisti} className="btn-primary text-xs py-1.5"><UserPlus size={12}/>Dodaj statiste</button>
            <button onClick={onClose} className="btn-ghost p-1.5"><X size={14}/></button>
          </div>
        </div>

        {showAdd && (
          <div className="p-4 border-b border-[#1e1e30] bg-[#0e0e1a]">
            <input className="input-field mb-3" placeholder="Pretraži statiste..." value={search} onChange={e=>setSearch(e.target.value)} autoFocus />
            <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto">
              {filtered.slice(0,20).map(s=>(
                <button key={s.id} onClick={()=>handleAddStatista(s.id)} className="flex items-center gap-2 p-2 rounded-xl bg-[#12121e] hover:bg-[#1a1a28] transition-colors text-left">
                  <div className="w-7 h-7 rounded-full bg-amber-500/10 flex items-center justify-center text-xs font-bold text-amber-400 flex-shrink-0">
                    {(s.prezime||'?')[0]}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-gray-300 truncate">{s.prezime} {s.ime}</div>
                    <div className="text-[10px] text-gray-600">{s.telefon||'bez tel.'}</div>
                  </div>
                  <Plus size={12} className="text-amber-400 ml-auto flex-shrink-0"/>
                </button>
              ))}
              {filtered.length===0 && <div className="col-span-2 text-center py-4 text-xs text-gray-600">Nema rezultata</div>}
            </div>
            <button onClick={()=>setShowAdd(false)} className="btn-ghost text-xs mt-2">Zatvori</button>
          </div>
        )}

        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-300 flex items-center gap-2"><Users size={14} className="text-amber-400"/>Statisti ({raspored.statisti?.length||0})</span>
            <div className="flex gap-3 text-[10px] text-gray-600">
              {['potvrdjen','pozvan','odbio','nedostupan'].map(st=>(
                <span key={st}>{RS_STATUS[st]}: {(raspored.statisti||[]).filter(s=>s.status===st).length}</span>
              ))}
            </div>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {(raspored.statisti||[]).length===0 ? (
              <div className="text-center py-8 text-gray-600 text-sm">Nema statista. Dodajte ih klikom na "Dodaj statiste".</div>
            ) : (raspored.statisti||[]).map(s=>(
              <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-[#0e0e1a] border border-[#1e1e30]">
                <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-xs font-bold text-amber-400 flex-shrink-0">
                  {s.profilna_slika ? <img src={`photo://${s.profilna_slika}`} className="w-full h-full object-cover rounded-full" alt=""/> : (s.prezime||'?')[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-200">{s.prezime} {s.ime}</div>
                  <div className="text-[10px] text-gray-600">{s.telefon||'bez telefona'}</div>
                </div>
                <select value={s.status} onChange={e=>handleStatusChange(s.statista_id||s.id, e.target.value)}
                  className="text-xs bg-[#1a1a28] border border-[#2a2a40] text-gray-300 rounded-lg px-2 py-1 focus:outline-none">
                  {Object.entries(RS_STATUS).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                </select>
                <button onClick={()=>handleRemove(s.statista_id||s.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-500/20 text-gray-600 hover:text-red-400 transition-colors">
                  <X size={12}/>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RasporedPage() {
  const { projekti, toast } = useApp()
  const [rasporedi, setRasporedi] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [saving, setSaving] = useState(false)
  const [detailId, setDetailId] = useState(null)
  const [calYear, setCalYear] = useState(new Date().getFullYear())
  const [calMonth, setCalMonth] = useState(new Date().getMonth())
  const [view, setView] = useState('list')
  const [filterStatus, setFilterStatus] = useState('')

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    const data = await window.api.getRasporedi(filterStatus ? { status: filterStatus } : {})
    setRasporedi(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [filterStatus])

  const handleSave = async (f) => {
    setSaving(true)
    try {
      const payload = { ...f, projekat_id: f.projekat_id ? parseInt(f.projekat_id) : null }
      if (editItem) { await window.api.updateRaspored(editItem.id, payload); toast('Raspored ažuriran!') }
      else { await window.api.createRaspored(payload); toast('Raspored dodan!') }
      setShowForm(false); setEditItem(null); load()
    } finally { setSaving(false) }
  }

  const handleDelete = async (r) => {
    if (!confirm(`Obrisati raspored "${r.naziv}"?`)) return
    await window.api.deleteRaspored(r.id); toast('Raspored obrisan'); load()
  }

  // Calendar helpers
  const firstDay = new Date(calYear, calMonth, 1).getDay()
  const daysInMonth = new Date(calYear, calMonth+1, 0).getDate()
  const prevMonth = () => { if(calMonth===0){setCalMonth(11);setCalYear(y=>y-1)}else setCalMonth(m=>m-1) }
  const nextMonth = () => { if(calMonth===11){setCalMonth(0);setCalYear(y=>y+1)}else setCalMonth(m=>m+1) }
  const todayStr = new Date().toISOString().split('T')[0]

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2"><Calendar size={22} className="text-amber-400"/>Rasporedi snimanja</h1>
          <p className="text-xs text-gray-600 mt-0.5">{rasporedi.length} rasporeda ukupno</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-[#12121e] border border-[#2a2a40] rounded-lg overflow-hidden">
            {['list','cal'].map(v=>(
              <button key={v} onClick={()=>setView(v)} className={`px-3 py-2 text-xs font-medium transition-colors ${view===v?'bg-amber-500/20 text-amber-400':'text-gray-500 hover:text-gray-300'}`}>
                {v==='list'?'Lista':'Kalendar'}
              </button>
            ))}
          </div>
          <select className="input-field w-36 text-xs" value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
            <option value="">Svi statusi</option>
            {['planirano','u toku','zavrseno','otkazano'].map(s=><option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={()=>{setEditItem(null);setShowForm(!showForm)}} className="btn-primary">
            {showForm?<X size={14}/>:<Plus size={14}/>}{showForm?'Otkaži':'Novi raspored'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card mb-5 animate-slide-up">
          <div className="px-5 py-3 border-b border-[#1e1e30]"><span className="font-semibold text-sm text-gray-200">{editItem?`Uredi: ${editItem.naziv}`:'Novi raspored'}</span></div>
          <RasporedForm initial={editItem||{}} projekti={projekti} onSave={handleSave} onCancel={()=>{setShowForm(false);setEditItem(null)}} saving={saving}/>
        </div>
      )}

      {view==='cal' ? (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="btn-ghost p-2"><ChevronLeft size={16}/></button>
            <h2 className="font-bold text-gray-200">{MONTHS[calMonth]} {calYear}</h2>
            <button onClick={nextMonth} className="btn-ghost p-2"><ChevronRight size={16}/></button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Ned','Pon','Uto','Sri','Čet','Pet','Sub'].map(d=><div key={d} className="text-center text-[10px] text-gray-600 font-semibold py-1">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {[...Array(firstDay===0?6:firstDay-1)].map((_,i)=><div key={`e${i}`}/>)}
            {[...Array(daysInMonth)].map((_,i)=>{
              const day=i+1
              const dateStr=`${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
              const dayR=rasporedi.filter(r=>r.datum===dateStr)
              const isToday=dateStr===todayStr
              return (
                <div key={day} className={`min-h-[70px] rounded-xl p-1 border transition-colors ${isToday?'border-amber-500/50 bg-amber-500/5':'border-[#1e1e30] hover:border-[#2a2a40]'}`}>
                  <div className={`text-xs font-bold mb-1 w-6 h-6 rounded-full flex items-center justify-center ${isToday?'bg-amber-500 text-black':'text-gray-500'}`}>{day}</div>
                  {dayR.map(r=>(
                    <button key={r.id} onClick={()=>setDetailId(r.id)} className="w-full text-left text-[9px] rounded px-1 py-0.5 mb-0.5 truncate font-medium"
                      style={{background:`${r.status==='otkazano'?'rgba(239,68,68,0.2)':r.status==='zavrseno'?'rgba(34,197,94,0.15)':'rgba(245,158,11,0.15)'}`,color:`${r.status==='otkazano'?'#f87171':r.status==='zavrseno'?'#4ade80':'#fbbf24'}`}}>
                      {r.naziv}
                    </button>
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {loading ? [...Array(4)].map((_,i)=><div key={i} className="skeleton h-20 rounded-xl"/>) :
           rasporedi.length===0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-600">
              <Calendar size={40} className="mb-3 opacity-30"/>
              <p className="text-sm">Nema rasporeda. Dodajte prvi kliknuvši gore desno.</p>
            </div>
          ) : rasporedi.map(r=>(
            <div key={r.id} className="card p-4 hover:border-amber-500/20 transition-all">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${r.datum===todayStr?'bg-amber-500 text-black':'bg-[#1a1a28]'}`}>
                  <div className={`text-xs font-semibold ${r.datum===todayStr?'text-black':'text-gray-500'}`}>{r.datum?MONTHS[parseInt(r.datum.split('-')[1])-1].slice(0,3).toUpperCase():''}</div>
                  <div className={`text-lg font-black leading-none ${r.datum===todayStr?'text-black':'text-gray-200'}`}>{r.datum?r.datum.split('-')[2]:''}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-100 text-sm">{r.naziv}</span>
                    <span className={`badge text-[10px] ${STATUS_COLORS[r.status]||'badge-gray'}`}>{r.status}</span>
                    {r.datum===todayStr && <span className="badge badge-amber text-[10px]">Danas</span>}
                  </div>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    {r.projekat_naziv && <span className="text-[10px] text-gray-600">🎬 {r.projekat_naziv}</span>}
                    {r.lokacija && <span className="text-[10px] text-gray-600 flex items-center gap-1"><MapPin size={9}/>{r.lokacija}</span>}
                    {r.vrijeme_pocetka && <span className="text-[10px] text-gray-600 flex items-center gap-1"><Clock size={9}/>{r.vrijeme_pocetka}{r.vrijeme_zavrsetka&&` - ${r.vrijeme_zavrsetka}`}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <button onClick={()=>setDetailId(r.id)} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-amber-400 transition-colors">
                    <Users size={13}/><span className="font-semibold">{r.broj_statista}</span><span className="text-[10px]">({r.potvrdeno} ✓)</span>
                  </button>
                  <button onClick={()=>{setEditItem(r);setShowForm(true)}} className="btn-ghost p-1.5"><Edit size={13}/></button>
                  <button onClick={()=>handleDelete(r)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-500/20 text-gray-600 hover:text-red-400 transition-colors"><Trash2 size={12}/></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {detailId && <RasporedDetail id={detailId} onClose={()=>{setDetailId(null);load()}} toast={toast}/>}
    </div>
  )
}
