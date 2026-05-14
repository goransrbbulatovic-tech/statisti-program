import React, { useState, useEffect } from 'react'
import { useApp } from '../App'
import { DollarSign, Plus, Edit, Trash2, Check, X, Filter, TrendingUp, Clock, CheckCircle, Loader2, Save, Users } from 'lucide-react'

const VALUTE = ['BAM','EUR','USD','HRK','RSD']
const STATUS_COLOR = { ceka:'badge-amber', placeno:'badge-green', otkazano:'badge-red' }

function HonorarForm({ initial, statisti, projekti, onSave, onCancel, saving }) {
  const [f, setF] = useState({ statista_id:'', projekat_id:'', iznos:'', valuta:'BAM', status:'ceka', datum_isplate:'', opis:'', ...initial })
  const set = (k,v) => setF(p=>({...p,[k]:v}))
  return (
    <div className="p-5 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 form-group"><label className="label">Statista *</label>
          <select className="input-field" value={f.statista_id||''} onChange={e=>set('statista_id',e.target.value?parseInt(e.target.value):'')}>
            <option value="">— odaberi statista —</option>
            {statisti.map(s=><option key={s.id} value={s.id}>{s.prezime} {s.ime}</option>)}
          </select>
        </div>
        <div className="form-group"><label className="label">Projekat</label>
          <select className="input-field" value={f.projekat_id||''} onChange={e=>set('projekat_id',e.target.value?parseInt(e.target.value):'')}>
            <option value="">— bez projekta —</option>
            {projekti.map(p=><option key={p.id} value={p.id}>{p.naziv}</option>)}
          </select>
        </div>
        <div className="form-group"><label className="label">Status</label>
          <select className="input-field" value={f.status} onChange={e=>set('status',e.target.value)}>
            <option value="ceka">Čeka isplatu</option>
            <option value="placeno">Plaćeno</option>
            <option value="otkazano">Otkazano</option>
          </select>
        </div>
        <div className="form-group"><label className="label">Iznos *</label>
          <input type="number" className="input-field" value={f.iznos} onChange={e=>set('iznos',e.target.value)} placeholder="0.00" min="0" step="0.50"/>
        </div>
        <div className="form-group"><label className="label">Valuta</label>
          <select className="input-field" value={f.valuta} onChange={e=>set('valuta',e.target.value)}>
            {VALUTE.map(v=><option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div className="form-group"><label className="label">Datum isplate</label>
          <input type="date" className="input-field" value={f.datum_isplate||''} onChange={e=>set('datum_isplate',e.target.value)}/>
        </div>
        <div className="form-group"><label className="label">Opis / Napomena</label>
          <input className="input-field" value={f.opis||''} onChange={e=>set('opis',e.target.value)} placeholder="Dan snimanja, uloga..."/>
        </div>
      </div>
      <div className="flex gap-2"><button onClick={onCancel} className="btn-secondary flex-1">Otkaži</button>
        <button onClick={()=>onSave(f)} disabled={!f.statista_id||!f.iznos||saving} className="btn-primary flex-1">
          {saving?<Loader2 size={14} className="animate-spin"/>:<Save size={14}/>}Sačuvaj
        </button>
      </div>
    </div>
  )
}

export default function FinansijePage() {
  const { statisti, projekti, toast } = useApp()
  const [honorari, setHonorari] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [saving, setSaving] = useState(false)
  const [selected, setSelected] = useState([])
  const [filterStatus, setFilterStatus] = useState('')
  const [filterProjekat, setFilterProjekat] = useState('')

  useEffect(() => { load() }, [filterStatus, filterProjekat])

  const load = async () => {
    setLoading(true)
    const f = {}
    if (filterStatus) f.status = filterStatus
    if (filterProjekat) f.projekat_id = parseInt(filterProjekat)
    const [h, s] = await Promise.all([window.api.getHonorari(f), window.api.getFinansijeStats()])
    setHonorari(h||[])
    setStats(s)
    setLoading(false)
  }

  const handleSave = async (f) => {
    setSaving(true)
    try {
      const payload = { ...f, statista_id:parseInt(f.statista_id), projekat_id:f.projekat_id?parseInt(f.projekat_id):null, iznos:parseFloat(f.iznos)||0 }
      if (editItem) { await window.api.updateHonorar(editItem.id, payload); toast('Honorar ažuriran!') }
      else { await window.api.createHonorar(payload); toast('Honorar dodan!') }
      setShowForm(false); setEditItem(null); load()
    } finally { setSaving(false) }
  }

  const handleDelete = async (h) => {
    if (!confirm('Obrisati honorar?')) return
    await window.api.deleteHonorar(h.id); toast('Honorar obrisan'); load()
  }

  const handleBulkPlati = async () => {
    if (!selected.length) return
    await window.api.bulkPlatiHonorare(selected)
    toast(`${selected.length} honorara označeno kao plaćeno!`)
    setSelected([]); load()
  }

  const toggleSelect = (id) => setSelected(p => p.includes(id)?p.filter(x=>x!==id):[...p,id])
  const selectAll = () => setSelected(selected.length===honorari.length?[]:honorari.map(h=>h.id))

  const fmt = (iznos, valuta='BAM') => `${iznos?.toFixed(2)||'0.00'} ${valuta}`

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2"><DollarSign size={22} className="text-amber-400"/>Finansije & Honorari</h1>
          <p className="text-xs text-gray-600 mt-0.5">{honorari.length} zapisa</p>
        </div>
        <button onClick={()=>{setEditItem(null);setShowForm(!showForm)}} className="btn-primary">
          {showForm?<X size={14}/>:<Plus size={14}/>}{showForm?'Otkaži':'Novi honorar'}
        </button>
      </div>

      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          {[
            { label:'Ukupno', value:fmt(stats.uk_ukupno), icon:DollarSign, color:'bg-amber-500/20' },
            { label:'Plaćeno', value:fmt(stats.uk_placeno), icon:CheckCircle, color:'bg-green-500/20' },
            { label:'Čeka isplatu', value:fmt(stats.uk_ceka), icon:Clock, color:'bg-orange-500/20' },
            { label:'Br. neplaćenih', value:stats.broj_neplacenih, icon:Users, color:'bg-red-500/20' },
          ].map(c=>(
            <div key={c.label} className="card p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${c.color} flex items-center justify-center flex-shrink-0`}>
                <c.icon size={18} className="text-white/80"/>
              </div>
              <div><div className="text-lg font-black text-white">{c.value}</div><div className="text-xs text-gray-500">{c.label}</div></div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="card mb-5 animate-slide-up">
          <div className="px-5 py-3 border-b border-[#1e1e30]"><span className="font-semibold text-sm">{editItem?'Uredi honorar':'Novi honorar'}</span></div>
          <HonorarForm initial={editItem||{}} statisti={statisti} projekti={projekti} onSave={handleSave} onCancel={()=>{setShowForm(false);setEditItem(null)}} saving={saving}/>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        <select className="input-field w-40 text-xs" value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
          <option value="">Svi statusi</option>
          <option value="ceka">Čeka isplatu</option>
          <option value="placeno">Plaćeno</option>
          <option value="otkazano">Otkazano</option>
        </select>
        <select className="input-field w-48 text-xs" value={filterProjekat} onChange={e=>setFilterProjekat(e.target.value)}>
          <option value="">Svi projekti</option>
          {projekti.map(p=><option key={p.id} value={p.id}>{p.naziv}</option>)}
        </select>
      </div>

      {/* Bulk actions */}
      {selected.length>0 && (
        <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 animate-slide-up">
          <span className="text-sm font-semibold text-amber-400">{selected.length} odabrano</span>
          <button onClick={handleBulkPlati} className="btn-primary text-xs py-1.5 ml-auto"><CheckCircle size={12}/>Označi kao plaćeno</button>
          <button onClick={()=>setSelected([])} className="btn-ghost text-xs py-1.5"><X size={12}/></button>
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#0e0e1a] border-b border-[#1e1e30]">
            <tr>
              <th className="w-8 p-3"><button onClick={selectAll}><div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${selected.length===honorari.length&&honorari.length>0?'bg-amber-500 border-amber-500':'border-gray-600'}`}>{selected.length===honorari.length&&honorari.length>0&&<Check size={9} className="text-black"/>}</div></button></th>
              <th className="table-header text-left p-3">Statista</th>
              <th className="table-header text-left p-3 hidden md:table-cell">Projekat</th>
              <th className="table-header text-right p-3">Iznos</th>
              <th className="table-header text-center p-3">Status</th>
              <th className="table-header text-left p-3 hidden lg:table-cell">Datum</th>
              <th className="table-header text-left p-3 hidden xl:table-cell">Opis</th>
              <th className="p-3 w-20"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? [...Array(5)].map((_,i)=>(
              <tr key={i}><td colSpan={8} className="p-3"><div className="skeleton h-6 rounded w-full"/></td></tr>
            )) : honorari.length===0 ? (
              <tr><td colSpan={8} className="py-12 text-center text-gray-600 text-sm">Nema honorara</td></tr>
            ) : honorari.map(h=>(
              <tr key={h.id} className={`table-row ${selected.includes(h.id)?'bg-amber-500/5':''}`}>
                <td className="p-3" onClick={e=>e.stopPropagation()}><button onClick={()=>toggleSelect(h.id)}><div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${selected.includes(h.id)?'bg-amber-500 border-amber-500':'border-gray-600'}`}>{selected.includes(h.id)&&<Check size={9} className="text-black"/>}</div></button></td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    {h.profilna_slika && <img src={`photo://${h.profilna_slika}`} className="w-6 h-6 rounded-full object-cover flex-shrink-0" alt=""/>}
                    <span className="text-sm text-gray-200 font-medium">{h.statista_ime||'—'}</span>
                  </div>
                </td>
                <td className="p-3 hidden md:table-cell text-xs text-gray-500">{h.projekat_naziv||'—'}</td>
                <td className="p-3 text-right font-mono font-bold text-sm text-amber-400">{fmt(h.iznos, h.valuta)}</td>
                <td className="p-3 text-center"><span className={`badge text-[10px] ${STATUS_COLOR[h.status]||'badge-gray'}`}>{h.status==='ceka'?'Čeka':h.status==='placeno'?'Plaćeno':'Otkazano'}</span></td>
                <td className="p-3 hidden lg:table-cell text-xs text-gray-600">{h.datum_isplate||h.created_at?.split(' ')[0]||'—'}</td>
                <td className="p-3 hidden xl:table-cell text-xs text-gray-600 truncate max-w-[120px]">{h.opis||'—'}</td>
                <td className="p-3" onClick={e=>e.stopPropagation()}>
                  <div className="flex gap-1">
                    <button onClick={()=>{setEditItem(h);setShowForm(true)}} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#2a2a40] text-gray-500 hover:text-amber-400 transition-colors"><Edit size={12}/></button>
                    <button onClick={()=>handleDelete(h)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors"><Trash2 size={12}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
