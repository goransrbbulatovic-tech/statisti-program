import React, { useState, useEffect } from 'react'
import { useApp } from '../App'
import {
  ArrowLeft, Save, User, FileText, Phone, Activity,
  Camera, Briefcase, StickyNote, X, Plus, Upload,
  Star, Check, Loader2, Info
} from 'lucide-react'

const BOJE_OCIJU = ['Smeđe', 'Plave', 'Zelene', 'Sive', 'Crne', 'Hazel', 'Ostalo']
const BOJE_KOSE  = ['Crna', 'Tamnosmeđa', 'Smeđa', 'Plavuša', 'Riđa', 'Sijeda', 'Obojena', 'Ostalo']
const VELICINE   = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
const JEZICI_OPT = ['Bosanski', 'Srpski', 'Hrvatski', 'Engleski', 'Njemački', 'Francuski', 'Talijanski', 'Španskic', 'Ostalo']
const VESTINE_OPT = ['Jahanje', 'Plivanje', 'Ples', 'Borilačke vještine', 'Tenis', 'Fudbal', 'Vožnja auta', 'Sviranje', 'Pjevanje', 'Ostalo']

const TABS = [
  { id: 'osnovno',  label: 'Osnovno',         icon: User },
  { id: 'dokument', label: 'Dok. & Kontakt',   icon: FileText },
  { id: 'fizicko',  label: 'Karakteristike',   icon: Activity },
  { id: 'projekti', label: 'Projekti',         icon: Briefcase },
  { id: 'foto',     label: 'Fotografije',      icon: Camera },
  { id: 'napomene', label: 'Napomene',         icon: StickyNote },
]

const EMPTY = {
  ime: '', prezime: '', status: 'aktivan', pol: '', datum_rodjenja: '',
  kratki_opis: '',
  maticni_broj: '', broj_licne_karte: '', broj_racuna: '',
  telefon: '', email: '',
  visina: '', tezina: '', boja_ociju: '', boja_kose: '',
  velicina_garderobe: '', broj_cipela: '',
  jezici: '[]', vestine: '[]', tagovi: '[]',
  napomene: '',
}

function MultiTag({ label, options, values, onChange }) {
  const parsed = (() => { try { return JSON.parse(values) } catch { return [] } })()

  const toggle = (opt) => {
    const next = parsed.includes(opt) ? parsed.filter(x => x !== opt) : [...parsed, opt]
    onChange(JSON.stringify(next))
  }

  return (
    <div>
      <label className="label">{label}</label>
      <div className="flex flex-wrap gap-1.5">
        {options.map(opt => {
          const active = parsed.includes(opt)
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${
                active
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  : 'bg-[#1a1a28] border-[#2a2a40] text-gray-500 hover:border-gray-600 hover:text-gray-400'
              }`}
            >
              {active && <Check size={9} className="inline mr-1" />}
              {opt}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function PhotoItem({ foto, onDelete, onSetProfile }) {
  return (
    <div className="relative group aspect-square">
      <img
        src={`photo://${foto.filename}`}
        className={`w-full h-full object-cover rounded-xl border-2 transition-all ${foto.je_profilna ? 'border-amber-500' : 'border-[#2a2a40] hover:border-[#3a3a55]'}`}
        alt=""
      />
      {foto.je_profilna && (
        <div className="absolute top-1 left-1 bg-amber-500 rounded-md px-1.5 py-0.5 flex items-center gap-1">
          <Star size={9} className="text-black" />
          <span className="text-[9px] font-bold text-black">Profil</span>
        </div>
      )}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
        {!foto.je_profilna && (
          <button
            type="button"
            onClick={() => onSetProfile(foto.id)}
            className="bg-amber-500 text-black rounded-lg px-2 py-1 text-[10px] font-bold flex items-center gap-1"
          >
            <Star size={9} /> Profil
          </button>
        )}
        <button
          type="button"
          onClick={() => onDelete(foto.id)}
          className="bg-red-500 text-white rounded-lg px-2 py-1 text-[10px] font-bold flex items-center gap-1"
        >
          <X size={9} /> Briši
        </button>
      </div>
    </div>
  )
}

export default function StatistaForm({ id }) {
  const { navigate, projekti, refresh, toast } = useApp()
  const [tab, setTab]       = useState('osnovno')
  const [form, setForm]     = useState(EMPTY)
  const [photos, setPhotos] = useState([])
  const [sproj, setSproj]   = useState([])
  const [allProj, setAllProj] = useState([])
  const [loading, setSaving]  = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const isEdit = Boolean(id)

  // Load data
  useEffect(() => {
    setAllProj(projekti)
    if (isEdit) loadStatista()
    else setAllProj(projekti)
  }, [id, projekti])

  async function loadStatista() {
    const data = await window.api.getStatista(id)
    if (!data) return navigate('statisti')
    const { fotografije, projekti: sProj, ...rest } = data
    setForm({ ...EMPTY, ...rest })
    setPhotos(fotografije || [])
    setSproj((sProj || []).map(p => p.id))
  }

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  // Auto-parse matični broj for date of birth (JMB format)
  const handleMaticni = (val) => {
    set('maticni_broj', val)
    if (val.length >= 7) {
      const dd   = val.slice(0, 2)
      const mm   = val.slice(2, 4)
      const yyy  = val.slice(4, 7)
      const year = parseInt(yyy) < 100 ? `20${yyy.padStart(2,'0')}` : `19${yyy}`
      const date = `${year}-${mm}-${dd}`
      if (!isNaN(Date.parse(date)) && !form.datum_rodjenja) {
        set('datum_rodjenja', date)
      }
    }
  }

  const handleAddPhoto = async () => {
    setUploadingPhoto(true)
    try {
      const paths = await window.api.selectPhotos()
      if (!paths.length) return

      for (let i = 0; i < paths.length; i++) {
        const isFirst = photos.length === 0 && i === 0
        const result = await window.api.addPhoto(id || 'temp', paths[i], isFirst)
        if (result) {
          setPhotos(prev => [...prev, {
            id: result.id,
            filename: result.filename,
            je_profilna: isFirst ? 1 : 0,
            statista_id: id
          }])
        }
      }
      toast('Fotografije dodane!', 'success')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleDeletePhoto = async (fotoId) => {
    if (!confirm('Obrisati fotografiju?')) return
    await window.api.deletePhoto(fotoId)
    setPhotos(prev => prev.filter(p => p.id !== fotoId))
    toast('Fotografija obrisana')
  }

  const handleSetProfile = async (fotoId) => {
    if (!id) {
      setPhotos(prev => prev.map(p => ({ ...p, je_profilna: p.id === fotoId ? 1 : 0 })))
      return
    }
    await window.api.setProfilePhoto(fotoId, id)
    setPhotos(prev => prev.map(p => ({ ...p, je_profilna: p.id === fotoId ? 1 : 0 })))
    toast('Profilna slika promijenjena')
  }

  const toggleProject = (pId) =>
    setSproj(prev => prev.includes(pId) ? prev.filter(x => x !== pId) : [...prev, pId])

  const handleSubmit = async () => {
    if (!form.ime.trim() || !form.prezime.trim()) {
      toast('Ime i prezime su obavezni!', 'error')
      setTab('osnovno')
      return
    }

    setSaving(true)
    try {
      const payload = {
        ...form,
        visina: form.visina ? parseInt(form.visina) : null,
        tezina: form.tezina ? parseInt(form.tezina) : null,
      }

      let sId = id
      if (isEdit) {
        await window.api.updateStatista(id, payload)
      } else {
        sId = await window.api.createStatista(payload)
      }

      // Handle photos for new statista
      if (!isEdit && photos.length > 0) {
        // Photos were already uploaded with 'temp', we need to re-add with real ID
        // Actually for simplicity, if statista is new, photos need to be re-linked
        // This is handled by the temp approach - we'll skip for now in new form
      }

      // Sync projects
      if (isEdit) {
        const current = (await window.api.getStatista(sId))?.projekti?.map(p => p.id) || []
        for (const pId of sproj) {
          if (!current.includes(pId)) await window.api.addStatistaToProjekat(sId, pId, {})
        }
        for (const pId of current) {
          if (!sproj.includes(pId)) await window.api.removeStatistaFromProjekat(sId, pId)
        }
      } else {
        for (const pId of sproj) {
          await window.api.addStatistaToProjekat(sId, pId, {})
        }
      }

      refresh()
      toast(isEdit ? 'Promjene sačuvane!' : 'Statista dodan!', 'success')
      navigate('statista-profile', { id: sId })
    } catch (err) {
      console.error(err)
      toast(err.message?.includes('UNIQUE') ? 'Matični broj već postoji!' : 'Greška pri čuvanju', 'error')
    } finally {
      setSaving(false)
    }
  }

  const renderTab = () => {
    switch (tab) {
      case 'osnovno': return (
        <div className="grid grid-cols-2 gap-4">
          <div className="form-group">
            <label className="label">Ime *</label>
            <input className="input-field" value={form.ime} onChange={e => set('ime', e.target.value)} placeholder="Npr. Marko" autoFocus />
          </div>
          <div className="form-group">
            <label className="label">Prezime *</label>
            <input className="input-field" value={form.prezime} onChange={e => set('prezime', e.target.value)} placeholder="Npr. Marković" />
          </div>
          <div className="form-group">
            <label className="label">Status</label>
            <select className="input-field" value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="aktivan">Aktivan</option>
              <option value="neaktivan">Neaktivan</option>
            </select>
          </div>
          <div className="form-group">
            <label className="label">Pol</label>
            <select className="input-field" value={form.pol} onChange={e => set('pol', e.target.value)}>
              <option value="">— odaberi —</option>
              <option value="muski">Muški</option>
              <option value="zenski">Ženski</option>
              <option value="ostalo">Ostalo</option>
            </select>
          </div>
          <div className="form-group">
            <label className="label">Datum rođenja</label>
            <input type="date" className="input-field" value={form.datum_rodjenja || ''} onChange={e => set('datum_rodjenja', e.target.value)} />
          </div>
          <div className="col-span-2 form-group">
            <label className="label">Kratki opis / Bio</label>
            <textarea className="input-field resize-none" rows={3} value={form.kratki_opis || ''} onChange={e => set('kratki_opis', e.target.value)} placeholder="Kratki opis osobe, iskustvo, napomene..." />
          </div>

          <div className="col-span-2">
            <MultiTag label="Tagovi" options={['Iskusan', 'Početnik', 'Pouzdani', 'Preporučen', 'Prioritet', 'Automobil', 'Licenca']} values={form.tagovi || '[]'} onChange={v => set('tagovi', v)} />
          </div>
        </div>
      )

      case 'dokument': return (
        <div className="grid grid-cols-2 gap-4">
          <div className="form-group col-span-2">
            <label className="label flex items-center gap-2">
              Matični broj (JMB)
              <span className="badge badge-blue text-[9px]">
                <Info size={8} className="mr-1" />auto-popunjava datum
              </span>
            </label>
            <input className="input-field font-mono" maxLength={13} value={form.maticni_broj || ''}
              onChange={e => handleMaticni(e.target.value)}
              placeholder="1234567890123" />
          </div>
          <div className="form-group">
            <label className="label">Broj lične karte</label>
            <input className="input-field font-mono" value={form.broj_licne_karte || ''} onChange={e => set('broj_licne_karte', e.target.value)} placeholder="BA123456" />
          </div>
          <div className="form-group">
            <label className="label">Broj bankovnog računa</label>
            <input className="input-field font-mono" value={form.broj_racuna || ''} onChange={e => set('broj_racuna', e.target.value)} placeholder="BA39 0000 0000 0000 00" />
          </div>
          <div className="col-span-2 border-t border-[#1e1e30] pt-4">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Kontakt podaci</div>
          </div>
          <div className="form-group">
            <label className="label">Telefon</label>
            <input type="tel" className="input-field" value={form.telefon || ''} onChange={e => set('telefon', e.target.value)} placeholder="+387 61 123 456" />
          </div>
          <div className="form-group">
            <label className="label">E-mail</label>
            <input type="email" className="input-field" value={form.email || ''} onChange={e => set('email', e.target.value)} placeholder="email@primjer.com" />
          </div>
        </div>
      )

      case 'fizicko': return (
        <div className="grid grid-cols-2 gap-4">
          <div className="form-group">
            <label className="label">Visina (cm)</label>
            <input type="number" className="input-field" value={form.visina || ''} onChange={e => set('visina', e.target.value)} min="140" max="230" placeholder="175" />
          </div>
          <div className="form-group">
            <label className="label">Težina (kg)</label>
            <input type="number" className="input-field" value={form.tezina || ''} onChange={e => set('tezina', e.target.value)} min="40" max="200" placeholder="70" />
          </div>
          <div className="form-group">
            <label className="label">Boja očiju</label>
            <select className="input-field" value={form.boja_ociju || ''} onChange={e => set('boja_ociju', e.target.value)}>
              <option value="">— odaberi —</option>
              {BOJE_OCIJU.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="label">Boja kose</label>
            <select className="input-field" value={form.boja_kose || ''} onChange={e => set('boja_kose', e.target.value)}>
              <option value="">— odaberi —</option>
              {BOJE_KOSE.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="label">Veličina garderobe</label>
            <select className="input-field" value={form.velicina_garderobe || ''} onChange={e => set('velicina_garderobe', e.target.value)}>
              <option value="">— odaberi —</option>
              {VELICINE.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="label">Broj cipela</label>
            <input type="number" className="input-field" value={form.broj_cipela || ''} onChange={e => set('broj_cipela', e.target.value)} min="34" max="50" placeholder="42" />
          </div>
          <div className="col-span-2">
            <MultiTag label="Jezici" options={JEZICI_OPT} values={form.jezici || '[]'} onChange={v => set('jezici', v)} />
          </div>
          <div className="col-span-2">
            <MultiTag label="Posebne vještine" options={VESTINE_OPT} values={form.vestine || '[]'} onChange={v => set('vestine', v)} />
          </div>
        </div>
      )

      case 'projekti': return (
        <div>
          <p className="text-sm text-gray-500 mb-4">Odaberite projekte u kojima je statista učestvovao:</p>
          {allProj.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              <Briefcase size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Nema projekata. Dodajte ih u sekciji Projekti.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {allProj.map(p => {
                const isIn = sproj.includes(p.id)
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => toggleProject(p.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                      isIn ? 'bg-amber-500/10 border-amber-500/40 text-amber-300' : 'bg-[#1a1a28] border-[#2a2a40] text-gray-400 hover:border-[#3a3a55]'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${isIn ? 'bg-amber-500 border-amber-500' : 'border-gray-600'}`}>
                      {isIn && <Check size={11} className="text-black" />}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{p.naziv}</div>
                      <div className="text-[10px] text-gray-600">{p.tip} {p.reziser ? `· ${p.reziser}` : ''}</div>
                    </div>
                    <span className={`ml-auto badge text-[10px] ${p.status === 'aktivan' ? 'badge-green' : 'badge-gray'}`}>{p.status}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )

      case 'foto': return (
        <div>
          {!isEdit && photos.length === 0 && (
            <div className="mb-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs flex items-start gap-2">
              <Info size={14} className="flex-shrink-0 mt-0.5" />
              <span>Fotografije možete dodati i nakon što sačuvate statista. Sačuvajte prvo osnovne podatke.</span>
            </div>
          )}

          {photos.length > 0 ? (
            <div className="grid grid-cols-3 gap-3 mb-4">
              {photos.map(foto => (
                <PhotoItem
                  key={foto.id}
                  foto={foto}
                  onDelete={handleDeletePhoto}
                  onSetProfile={handleSetProfile}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-600 mb-4">
              <Camera size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Nema fotografija</p>
            </div>
          )}

          {isEdit && (
            <button
              type="button"
              onClick={handleAddPhoto}
              disabled={uploadingPhoto}
              className="btn-secondary w-full justify-center"
            >
              {uploadingPhoto ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              {uploadingPhoto ? 'Dodajem...' : 'Dodaj fotografiju(e)'}
            </button>
          )}
        </div>
      )

      case 'napomene': return (
        <div className="space-y-4">
          <div className="form-group">
            <label className="label">Napomene (interno)</label>
            <textarea
              className="input-field resize-none"
              rows={8}
              value={form.napomene || ''}
              onChange={e => set('napomene', e.target.value)}
              placeholder="Interne napomene, posebni zahtjevi, dostupnost, prijevoz..."
            />
          </div>
        </div>
      )

      default: return null
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('statisti')} className="btn-ghost p-2">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-white">
            {isEdit ? 'Uredi statista' : 'Novi statista'}
          </h1>
          <p className="text-xs text-gray-600 mt-0.5">
            {isEdit ? `ID: ${id}` : 'Unesite podatke o novom statistu'}
          </p>
        </div>
      </div>

      <div className="card overflow-hidden max-w-4xl">
        {/* Tab navigation */}
        <div className="flex border-b border-[#1e1e30] overflow-x-auto">
          {TABS.map(({ id: tId, label, icon: Icon }) => (
            <button
              key={tId}
              onClick={() => setTab(tId)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold whitespace-nowrap transition-all border-b-2 ${
                tab === tId
                  ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                  : 'border-transparent text-gray-600 hover:text-gray-400 hover:bg-[#1a1a28]'
              }`}
            >
              <Icon size={13} />
              {label}
              {tId === 'foto' && photos.length > 0 && (
                <span className="w-4 h-4 bg-amber-500/20 text-amber-400 text-[9px] rounded-full flex items-center justify-center font-bold">
                  {photos.length}
                </span>
              )}
              {tId === 'projekti' && sproj.length > 0 && (
                <span className="w-4 h-4 bg-indigo-500/20 text-indigo-400 text-[9px] rounded-full flex items-center justify-center font-bold">
                  {sproj.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="p-6">
          {renderTab()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#1e1e30] bg-[#0e0e1a]">
          <button onClick={() => navigate('statisti')} className="btn-secondary">
            Otkaži
          </button>
          <div className="flex gap-2">
            <button onClick={handleSubmit} disabled={loading} className="btn-primary">
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {isEdit ? 'Sačuvaj izmjene' : 'Sačuvaj statista'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
