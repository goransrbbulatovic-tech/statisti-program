import React, { useState, useEffect } from 'react'
import { useApp } from '../App'
import {
  Film, Plus, Edit, Trash2, Users, X, Save,
  Loader2, ChevronDown, ChevronUp, Calendar,
  MapPin, User, Clapperboard, Check, Image, Upload
} from 'lucide-react'

const EMPTY_PROJ = {
  naziv: '', opis: '', reziser: '', produkcija: '',
  lokacija: '', datum_pocetka: '', datum_zavrsetka: '',
  status: 'aktivan', tip: 'film', budzet: '', napomena: '', slika: null
}

function Avatar({ filename, name, size = 32 }) {
  const initials = (name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  return (
    <div className="rounded-full overflow-hidden flex-shrink-0 bg-amber-500/10 border border-amber-500/20 flex items-center justify-center"
      style={{ width: size, height: size }}>
      {filename
        ? <img src={`photo://${filename}`} className="w-full h-full object-cover" alt={name} />
        : <span className="font-bold text-amber-400" style={{ fontSize: size * 0.33 }}>{initials}</span>
      }
    </div>
  )
}

function ProjekatForm({ initial, onSave, onCancel, saving, savedId }) {
  const [form, setForm] = useState({ ...EMPTY_PROJ, ...initial })
  const [uploading, setUploading] = useState(false)
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleUploadSlika = async () => {
    // Can only upload photo after project is saved (we have an ID)
    if (!savedId) {
      alert('Sačuvajte projekat prvo, a zatim dodajte sliku.')
      return
    }
    setUploading(true)
    try {
      const filename = await window.api.uploadProjekatSlika(savedId)
      if (filename) set('slika', filename)
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteSlika = async () => {
    if (!savedId) return
    await window.api.deleteProjekatSlika(savedId)
    set('slika', null)
  }

  return (
    <div className="p-5 space-y-4">
      <div className="grid grid-cols-2 gap-3">

        {/* Slika projekta — full width at top */}
        <div className="col-span-2">
          <label className="label flex items-center gap-2">
            <Image size={11} />
            Slika projekta
            {!savedId && <span className="text-[10px] text-gray-700">(dostupno nakon čuvanja)</span>}
          </label>
          <div className="flex items-center gap-3">
            {form.slika ? (
              <div className="relative w-32 h-20 rounded-xl overflow-hidden border border-[#2a2a40] flex-shrink-0 group">
                <img src={`photo://${form.slika}`} className="w-full h-full object-cover" alt="" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                  <button type="button" onClick={handleUploadSlika}
                    className="bg-amber-500 text-black text-[9px] font-bold px-2 py-1 rounded">
                    Promijeni
                  </button>
                  <button type="button" onClick={handleDeleteSlika}
                    className="bg-red-500 text-white text-[9px] font-bold px-2 py-1 rounded">
                    Briši
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleUploadSlika}
                disabled={!savedId || uploading}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-medium transition-all
                  ${savedId
                    ? 'border-dashed border-amber-500/30 text-amber-400 hover:bg-amber-500/10 cursor-pointer'
                    : 'border-dashed border-[#2a2a40] text-gray-700 cursor-not-allowed'
                  }`}
              >
                {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                {uploading ? 'Učitavam...' : 'Dodaj sliku projekta'}
              </button>
            )}
          </div>
        </div>

        <div className="col-span-2 form-group">
          <label className="label">Naziv projekta *</label>
          <input className="input-field" value={form.naziv}
            onChange={e => set('naziv', e.target.value)}
            placeholder="Npr. Film 'Mostarski dani'" autoFocus />
        </div>
        <div className="form-group">
          <label className="label">Tip</label>
          <select className="input-field" value={form.tip} onChange={e => set('tip', e.target.value)}>
            {['film','serija','reklama','dokumentarni','kratki film','muzicki video','ostalo'].map(t =>
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            )}
          </select>
        </div>
        <div className="form-group">
          <label className="label">Status</label>
          <select className="input-field" value={form.status} onChange={e => set('status', e.target.value)}>
            <option value="aktivan">Aktivan</option>
            <option value="u toku">U toku</option>
            <option value="zavrseno">Završeno</option>
            <option value="pauzirano">Pauzirano</option>
          </select>
        </div>
        <div className="form-group">
          <label className="label">Redatelj</label>
          <input className="input-field" value={form.reziser || ''} onChange={e => set('reziser', e.target.value)} placeholder="Ime redatelja" />
        </div>
        <div className="form-group">
          <label className="label">Produkcija</label>
          <input className="input-field" value={form.produkcija || ''} onChange={e => set('produkcija', e.target.value)} placeholder="Naziv produkcije" />
        </div>
        <div className="form-group">
          <label className="label">Lokacija snimanja</label>
          <input className="input-field" value={form.lokacija || ''} onChange={e => set('lokacija', e.target.value)} placeholder="Grad, lokacija" />
        </div>
        <div className="form-group">
          <label className="label">Budžet (€)</label>
          <input type="number" className="input-field" value={form.budzet || ''} onChange={e => set('budzet', e.target.value)} placeholder="0" />
        </div>
        <div className="form-group">
          <label className="label">Datum početka</label>
          <input type="date" className="input-field" value={form.datum_pocetka || ''} onChange={e => set('datum_pocetka', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="label">Datum završetka</label>
          <input type="date" className="input-field" value={form.datum_zavrsetka || ''} onChange={e => set('datum_zavrsetka', e.target.value)} />
        </div>
        <div className="col-span-2 form-group">
          <label className="label">Opis / Napomena</label>
          <textarea className="input-field resize-none" rows={2}
            value={form.napomena || ''} onChange={e => set('napomena', e.target.value)}
            placeholder="Kratki opis, upute, posebni zahtjevi..." />
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={onCancel} className="btn-secondary flex-1">Otkaži</button>
        <button onClick={() => onSave(form)} disabled={!form.naziv || saving} className="btn-primary flex-1">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {savedId ? 'Sačuvaj izmjene' : 'Sačuvaj projekat'}
        </button>
      </div>
    </div>
  )
}

const TYPE_ICON = {
  film: '🎬', serija: '📺', reklama: '📢', dokumentarni: '🎥',
  'kratki film': '🎞️', 'muzicki video': '🎵', ostalo: '📽️'
}
const STATUS_COLOR = {
  aktivan: 'badge-green', 'u toku': 'badge-amber',
  zavrseno: 'badge-gray', pauzirano: 'badge-red'
}

function ProjekatCard({ projekat, onEdit, onDelete, onNavigate, onUploadSlika }) {
  const [expanded, setExpanded] = useState(false)
  const [statisti, setStatisti] = useState([])
  const [loadingS, setLoadingS] = useState(false)

  const loadStatisti = async () => {
    setLoadingS(true)
    try {
      const data = await window.api.getStatistaByProjekat(projekat.id)
      setStatisti(data || [])
    } finally { setLoadingS(false) }
  }

  const toggle = () => {
    if (!expanded && !statisti.length) loadStatisti()
    setExpanded(!expanded)
  }

  return (
    <div className="card overflow-hidden transition-all duration-200 hover:border-amber-500/20">
      <div className="flex">
        {/* Project image — left side, only if has slika */}
        {projekat.slika && (
          <div className="relative w-28 flex-shrink-0 group cursor-pointer" onClick={() => onUploadSlika(projekat.id)}>
            <img
              src={`photo://${projekat.slika}`}
              className="w-full h-full object-cover"
              style={{ minHeight: '80px' }}
              alt=""
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Image size={18} className="text-white" />
            </div>
          </div>
        )}

        <div className="flex-1 p-4">
          <div className="flex items-start gap-3">
            {/* Icon — only when no image */}
            {!projekat.slika && (
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center flex-shrink-0 text-lg">
                {TYPE_ICON[projekat.tip] || '🎬'}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-gray-100 text-sm">{projekat.naziv}</h3>
                <span className={`badge text-[10px] ${STATUS_COLOR[projekat.status] || 'badge-gray'}`}>
                  {projekat.status}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                {projekat.reziser && (
                  <span className="text-[10px] text-gray-600 flex items-center gap-1">
                    <User size={9} /> {projekat.reziser}
                  </span>
                )}
                {projekat.lokacija && (
                  <span className="text-[10px] text-gray-600 flex items-center gap-1">
                    <MapPin size={9} /> {projekat.lokacija}
                  </span>
                )}
                {projekat.datum_pocetka && (
                  <span className="text-[10px] text-gray-600 flex items-center gap-1">
                    <Calendar size={9} /> {projekat.datum_pocetka}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={toggle}
                className="flex items-center gap-1.5 text-[10px] text-gray-500 hover:text-amber-400 transition-colors px-2 py-1">
                <Users size={12} />
                <span className="font-semibold">{projekat.broj_statista}</span>
                {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
              </button>
              {/* Upload image button — always visible */}
              <button
                onClick={() => onUploadSlika(projekat.id)}
                title={projekat.slika ? 'Promijeni sliku' : 'Dodaj sliku projekta'}
                className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors
                  ${projekat.slika
                    ? 'text-amber-400 hover:bg-amber-500/20'
                    : 'text-gray-600 hover:text-amber-400 hover:bg-amber-500/10'
                  }`}
              >
                <Image size={13} />
              </button>
              <button onClick={() => onEdit(projekat)} className="btn-ghost p-1.5"><Edit size={12} /></button>
              <button onClick={() => onDelete(projekat)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-500/20 text-gray-600 hover:text-red-400 transition-colors">
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Statisti list */}
      {expanded && (
        <div className="border-t border-[#1e1e30] bg-[#0e0e1a] px-4 py-3">
          {loadingS ? (
            <div className="text-xs text-gray-600 py-2">Učitavam...</div>
          ) : statisti.length === 0 ? (
            <div className="text-xs text-gray-600 py-2 text-center">
              Nema statista na ovom projektu
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-[10px] text-gray-600 uppercase tracking-wider font-semibold mb-2">
                Statisti ({statisti.length})
              </div>
              <div className="grid grid-cols-2 gap-2">
                {statisti.map(s => (
                  <button key={s.id} onClick={() => onNavigate(s.id)}
                    className="flex items-center gap-2 p-2 bg-[#12121e] rounded-xl hover:bg-[#1a1a28] transition-colors text-left">
                    <Avatar filename={s.profilna_slika} name={`${s.ime} ${s.prezime}`} size={28} />
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-gray-300 truncate">{s.prezime} {s.ime}</div>
                      {s.uloga && <div className="text-[9px] text-gray-600 truncate">{s.uloga}</div>}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function ProjektiPage() {
  const { navigate, loadProjekti, toast } = useApp()
  const [projekti, setProjekti] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editProj, setEditProj] = useState(null)
  const [savedId, setSavedId] = useState(null) // ID of last saved project (for photo upload)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    const data = await window.api.getProjekti()
    setProjekti(data || [])
    setLoading(false)
  }

  const handleSave = async (form) => {
    setSaving(true)
    try {
      const payload = {
        ...form,
        budzet: form.budzet ? parseFloat(form.budzet) : null
      }
      if (editProj) {
        await window.api.updateProjekat(editProj.id, payload)
        toast('Projekat ažuriran!')
        setSavedId(editProj.id)
      } else {
        const newId = await window.api.createProjekat(payload)
        toast('Projekat dodan! Sada možete dodati i sliku.')
        setSavedId(newId)
        setEditProj({ ...payload, id: newId })
        // Don't close form — let user add photo
        load()
        loadProjekti()
        return
      }
      setShowForm(false)
      setEditProj(null)
      setSavedId(null)
      load()
      loadProjekti()
    } finally { setSaving(false) }
  }

  const handleUploadSlika = async (projId) => {
    const filename = await window.api.uploadProjekatSlika(projId)
    if (filename) {
      toast('Slika projekta dodana!')
      load()
      loadProjekti()
    }
  }

  const handleEdit = (proj) => {
    setEditProj(proj)
    setSavedId(proj.id)
    setShowForm(true)
  }

  const handleDelete = async (proj) => {
    if (!confirm(`Obrisati projekat "${proj.naziv}"?`)) return
    await window.api.deleteProjekat(proj.id)
    toast('Projekat obrisan')
    load()
    loadProjekti()
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditProj(null)
    setSavedId(null)
    load()
  }

  const filtered = projekti.filter(p =>
    !search ||
    p.naziv.toLowerCase().includes(search.toLowerCase()) ||
    p.reziser?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Film size={22} className="text-amber-400" /> Projekti
          </h1>
          <p className="text-xs text-gray-600 mt-0.5">{projekti.length} projekata ukupno</p>
        </div>
        <button
          onClick={() => {
            if (showForm) { handleCloseForm() }
            else { setEditProj(null); setSavedId(null); setShowForm(true) }
          }}
          className="btn-primary"
        >
          {showForm ? <X size={14} /> : <Plus size={14} />}
          {showForm ? 'Otkaži' : 'Novi projekat'}
        </button>
      </div>

      {/* Add/Edit form */}
      {showForm && (
        <div className="card mb-5 animate-slide-up">
          <div className="px-5 py-3 border-b border-[#1e1e30] flex items-center gap-2">
            <Clapperboard size={14} className="text-amber-400" />
            <span className="font-semibold text-sm text-gray-200">
              {editProj?.id ? `Uredi: ${editProj.naziv}` : 'Novi projekat'}
            </span>
            {savedId && !editProj?.id && (
              <span className="badge badge-green text-[10px] ml-auto">
                ✓ Sačuvan — dodajte sliku ako želite
              </span>
            )}
          </div>
          <ProjekatForm
            initial={editProj || {}}
            savedId={savedId}
            onSave={handleSave}
            onCancel={handleCloseForm}
            saving={saving}
          />
        </div>
      )}

      {/* Search */}
      {projekti.length > 0 && (
        <div className="mb-4">
          <input
            className="input-field max-w-sm"
            placeholder="Pretraži projekte..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      )}

      {/* Projects list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="skeleton h-20 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-4">
            <Film size={36} className="text-indigo-500/40" />
          </div>
          <h3 className="text-lg font-semibold text-gray-400 mb-2">
            {search ? 'Nema rezultata' : 'Nema projekata'}
          </h3>
          <p className="text-sm text-gray-600">
            {search ? 'Promijenite kriterije pretrage' : 'Dodajte prvi projekat klikom gore desno'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(p => (
            <ProjekatCard
              key={p.id}
              projekat={p}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onNavigate={id => navigate('statista-profile', { id })}
              onUploadSlika={handleUploadSlika}
            />
          ))}
        </div>
      )}
    </div>
  )
}
