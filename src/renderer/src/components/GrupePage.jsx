import React, { useState, useEffect } from 'react'
import { useApp } from '../App'
import { Users, Plus, Edit, Trash2, X, Save, Loader2, UserPlus, UserMinus, MessageSquare, Phone, Mail, Copy } from 'lucide-react'

const BOJE = ['#f59e0b','#3b82f6','#10b981','#8b5cf6','#ec4899','#ef4444','#06b6d4','#f97316','#84cc16','#6366f1']

function GrupaForm({ initial, onSave, onCancel, saving }) {
  const [f, setF] = useState({ naziv:'', opis:'', boja:'#f59e0b', ...initial })
  return (
    <div className="p-4 space-y-3">
      <div className="form-group"><label className="label">Naziv grupe *</label><input className="input-field" value={f.naziv} onChange={e=>setF(p=>({...p,naziv:e.target.value}))} placeholder="Npr. Vozači, Vojnici, Djeca..." autoFocus/></div>
      <div className="form-group"><label className="label">Opis</label><input className="input-field" value={f.opis||''} onChange={e=>setF(p=>({...p,opis:e.target.value}))} placeholder="Kratki opis grupe"/></div>
      <div className="form-group">
        <label className="label">Boja oznake</label>
        <div className="flex gap-2 flex-wrap">
          {BOJE.map(b=>(
            <button key={b} onClick={()=>setF(p=>({...p,boja:b}))} className="w-7 h-7 rounded-lg border-2 transition-all" style={{background:b,borderColor:f.boja===b?'white':'transparent',transform:f.boja===b?'scale(1.2)':'scale(1)'}}/>
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={onCancel} className="btn-secondary flex-1">Otkaži</button>
        <button onClick={()=>onSave(f)} disabled={!f.naziv||saving} className="btn-primary flex-1">
          {saving?<Loader2 size={14} className="animate-spin"/>:<Save size={14}/>}Sačuvaj
        </button>
      </div>
    </div>
  )
}

function BrziPozivModal({ statisti, grupaNaziv, onClose }) {
  const [poruka, setPoruka] = useState(`Poštovani,\n\nPozivamo Vas na snimanje.\n\nS poštovanjem,\nProdukcija`)
  const [copied, setCopied] = useState(false)

  const withTelefon = statisti.filter(s=>s.telefon)
  const withEmail = statisti.filter(s=>s.email)

  const copyBrojeve = () => {
    const txt = withTelefon.map(s=>`${s.prezime} ${s.ime}: ${s.telefon}`).join('\n')
    navigator.clipboard.writeText(txt).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000)})
  }

  const copyViberFormat = () => {
    const txt = withTelefon.map(s=>s.telefon).join('\n')
    navigator.clipboard.writeText(txt).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000)})
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-xl" onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-[#2a2a40]">
          <div>
            <h2 className="font-bold text-white flex items-center gap-2"><MessageSquare size={16} className="text-amber-400"/>Brzi poziv — {grupaNaziv}</h2>
            <p className="text-xs text-gray-600 mt-0.5">{statisti.length} statista · {withTelefon.length} sa telefonom · {withEmail.length} sa emailom</p>
          </div>
          <button onClick={onClose} className="btn-ghost p-1.5"><X size={14}/></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="form-group"><label className="label">Poruka / Tekst poziva</label>
            <textarea className="input-field resize-none" rows={4} value={poruka} onChange={e=>setPoruka(e.target.value)}/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={copyBrojeve} className="btn-secondary justify-center flex-col items-center py-3 gap-1">
              <Phone size={16} className="text-green-400"/>
              <span className="text-xs font-semibold">Kopiraj brojeve</span>
              <span className="text-[10px] text-gray-600">Ime + broj telefona</span>
            </button>
            <button onClick={copyViberFormat} className="btn-secondary justify-center flex-col items-center py-3 gap-1">
              <MessageSquare size={16} className="text-purple-400"/>
              <span className="text-xs font-semibold">Viber / WhatsApp</span>
              <span className="text-[10px] text-gray-600">Samo brojevi za import</span>
            </button>
          </div>
          {copied && <div className="text-center text-xs text-green-400 animate-fade-in">✓ Kopirano u clipboard!</div>}
          <div className="border border-[#1e1e30] rounded-xl overflow-hidden max-h-64 overflow-y-auto">
            {statisti.map(s=>(
              <div key={s.id} className="flex items-center gap-3 px-3 py-2 border-b border-[#1e1e30]/50 last:border-0">
                <div className="w-7 h-7 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-xs font-bold text-amber-400 flex-shrink-0">
                  {s.profilna_slika?<img src={`photo://${s.profilna_slika}`} className="w-full h-full object-cover rounded-full" alt=""/>:(s.prezime||'?')[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-gray-300">{s.prezime} {s.ime}</div>
                </div>
                {s.telefon && <span className="text-[10px] font-mono text-gray-500">{s.telefon}</span>}
                {!s.telefon && !s.email && <span className="text-[10px] text-red-400">bez kontakta</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function GrupePage() {
  const { statisti, toast } = useApp()
  const [grupe, setGrupe] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [saving, setSaving] = useState(false)
  const [openGrupa, setOpenGrupa] = useState(null)
  const [grupaStatisti, setGrupaStatisti] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [search, setSearch] = useState('')
  const [brziPoziv, setBrziPoziv] = useState(null)

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    setGrupe(await window.api.getGrupe() || [])
    setLoading(false)
  }

  const openDetail = async (g) => {
    setOpenGrupa(g)
    const s = await window.api.getStatistaByGrupa(g.id)
    setGrupaStatisti(s||[])
    setShowAdd(false)
  }

  const handleSave = async (f) => {
    setSaving(true)
    try {
      if (editItem) { await window.api.updateGrupa(editItem.id, f); toast('Grupa ažurirana!') }
      else { await window.api.createGrupa(f); toast('Grupa kreirana!') }
      setShowForm(false); setEditItem(null); load()
    } finally { setSaving(false) }
  }

  const handleDelete = async (g) => {
    if (!confirm(`Obrisati grupu "${g.naziv}"? Statisti ostaju, samo se veza briše.`)) return
    await window.api.deleteGrupa(g.id); toast('Grupa obrisana'); load(); if(openGrupa?.id===g.id) setOpenGrupa(null)
  }

  const handleAddStatista = async (sId) => {
    await window.api.addStatistaToGrupa(sId, openGrupa.id)
    const s = await window.api.getStatistaByGrupa(openGrupa.id)
    setGrupaStatisti(s||[]); load()
    toast('Statista dodan u grupu')
  }

  const handleRemoveStatista = async (sId) => {
    await window.api.removeStatistaFromGrupa(sId, openGrupa.id)
    setGrupaStatisti(p=>p.filter(s=>s.id!==sId)); load()
  }

  const inGrupa = new Set(grupaStatisti.map(s=>s.id))
  const filteredAll = statisti.filter(s => !inGrupa.has(s.id) && (`${s.ime} ${s.prezime}`).toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2"><Users size={22} className="text-amber-400"/>Grupe statista</h1>
          <p className="text-xs text-gray-600 mt-0.5">{grupe.length} grupa</p>
        </div>
        <button onClick={()=>{setEditItem(null);setShowForm(!showForm)}} className="btn-primary">
          {showForm?<X size={14}/>:<Plus size={14}/>}{showForm?'Otkaži':'Nova grupa'}
        </button>
      </div>

      {showForm && (
        <div className="card mb-5 max-w-md animate-slide-up">
          <div className="px-4 py-3 border-b border-[#1e1e30]"><span className="font-semibold text-sm">{editItem?`Uredi: ${editItem.naziv}`:'Nova grupa'}</span></div>
          <GrupaForm initial={editItem||{}} onSave={handleSave} onCancel={()=>{setShowForm(false);setEditItem(null)}} saving={saving}/>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? [...Array(3)].map((_,i)=><div key={i} className="skeleton h-32 rounded-xl"/>) :
         grupe.length===0 ? (
          <div className="col-span-3 text-center py-16 text-gray-600">
            <Users size={40} className="mx-auto mb-3 opacity-30"/>
            <p className="text-sm">Nema grupa. Kreirajte prvu grupu gore desno.</p>
          </div>
        ) : grupe.map(g=>(
          <div key={g.id} className={`card overflow-hidden transition-all hover:shadow-lg cursor-pointer ${openGrupa?.id===g.id?'ring-2':'hover:border-opacity-50'}`} style={openGrupa?.id===g.id?{ringColor:g.boja}:{}} onClick={()=>openDetail(g)}>
            <div className="h-1.5" style={{background:g.boja}}/>
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{background:g.boja}}/>
                    <span className="font-bold text-gray-100">{g.naziv}</span>
                  </div>
                  {g.opis && <p className="text-xs text-gray-600 ml-5">{g.opis}</p>}
                </div>
                <div className="flex gap-1" onClick={e=>e.stopPropagation()}>
                  <button onClick={()=>{setEditItem(g);setShowForm(true)}} className="btn-ghost p-1.5"><Edit size={12}/></button>
                  <button onClick={()=>handleDelete(g)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-500/20 text-gray-600 hover:text-red-400 transition-colors"><Trash2 size={12}/></button>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-3">
                <span className="text-2xl font-black" style={{color:g.boja}}>{g.broj_clanova}</span>
                <span className="text-xs text-gray-600">članova</span>
                <button onClick={e=>{e.stopPropagation();openDetail(g).then(()=>setBrziPoziv(g))}} className="ml-auto text-xs text-gray-600 hover:text-amber-400 flex items-center gap-1 transition-colors">
                  <Phone size={11}/>Poziv
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sidebar detail */}
      {openGrupa && (
        <div className="fixed right-0 top-0 bottom-0 w-96 bg-[#0e0e1a] border-l border-[#1e1e30] z-40 flex flex-col shadow-2xl animate-slide-in">
          <div className="flex items-center justify-between p-4 border-b border-[#1e1e30]">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{background:openGrupa.boja}}/>
              <span className="font-bold text-white">{openGrupa.naziv}</span>
              <span className="badge badge-gray text-[10px]">{grupaStatisti.length}</span>
            </div>
            <div className="flex gap-1">
              <button onClick={()=>setBrziPoziv(openGrupa)} className="btn-secondary text-xs py-1.5"><Phone size={11}/>Poziv</button>
              <button onClick={()=>{setOpenGrupa(null);setShowAdd(false)}} className="btn-ghost p-1.5"><X size={14}/></button>
            </div>
          </div>

          <div className="p-3 border-b border-[#1e1e30]">
            <button onClick={()=>setShowAdd(!showAdd)} className="btn-secondary w-full justify-center text-xs">
              <UserPlus size={12}/>{showAdd?'Zatvori':'Dodaj statiste'}
            </button>
            {showAdd && (
              <div className="mt-2">
                <input className="input-field text-xs mb-2" placeholder="Pretraži..." value={search} onChange={e=>setSearch(e.target.value)} autoFocus/>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {filteredAll.slice(0,15).map(s=>(
                    <button key={s.id} onClick={()=>handleAddStatista(s.id)} className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-[#1a1a28] transition-colors text-left">
                      <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center text-[10px] font-bold text-amber-400 flex-shrink-0">{(s.prezime||'?')[0]}</div>
                      <span className="text-xs text-gray-300 truncate">{s.prezime} {s.ime}</span>
                      <Plus size={10} className="text-amber-400 ml-auto flex-shrink-0"/>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {grupaStatisti.length===0 ? (
              <div className="text-center py-8 text-xs text-gray-600">Nema članova. Dodajte statiste.</div>
            ) : grupaStatisti.map(s=>(
              <div key={s.id} className="flex items-center gap-2 p-2 rounded-xl hover:bg-[#1a1a28] transition-colors group">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-xs font-bold text-amber-400 flex-shrink-0">
                  {s.profilna_slika?<img src={`photo://${s.profilna_slika}`} className="w-full h-full object-cover" alt=""/>:(s.prezime||'?')[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-gray-200 truncate">{s.prezime} {s.ime}</div>
                  <div className="text-[10px] text-gray-600">{s.telefon||'bez tel.'}</div>
                </div>
                <button onClick={()=>handleRemoveStatista(s.id)} className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-lg hover:bg-red-500/20 text-gray-600 hover:text-red-400 transition-all">
                  <UserMinus size={11}/>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {brziPoziv && (
        <BrziPozivModal
          statisti={grupaStatisti}
          grupaNaziv={brziPoziv.naziv}
          onClose={()=>setBrziPoziv(null)}
        />
      )}
    </div>
  )
}
