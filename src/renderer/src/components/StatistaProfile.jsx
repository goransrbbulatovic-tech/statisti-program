import React, { useState, useEffect } from 'react'
import { useApp } from '../App'
import {
  ArrowLeft, Edit, Trash2, Phone, Mail, Calendar,
  CreditCard, Building, User, Film, Camera, Star,
  ChevronLeft, ChevronRight, X, Maximize2, Download,
  Activity, FileText, Hash, Ruler, Weight, Eye as EyeIcon,
  Palette, Shirt, Footprints, Globe, Zap, Tag
} from 'lucide-react'

function InfoRow({ icon: Icon, label, value, mono }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3 py-2 border-b border-[#1e1e30]/60 last:border-0">
      <Icon size={13} className="text-gray-600 mt-0.5 flex-shrink-0" />
      <span className="text-xs text-gray-600 w-28 flex-shrink-0">{label}</span>
      <span className={`text-xs text-gray-200 ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  )
}

function TagBadge({ tag }) {
  const colors = {
    'Iskusan': 'badge-amber', 'Pouzdani': 'badge-green', 'Prioritet': 'badge-purple',
    'Preporučen': 'badge-blue', 'Početnik': 'badge-gray',
  }
  return <span className={`badge ${colors[tag] || 'badge-gray'} text-[10px]`}>{tag}</span>
}

function Lightbox({ photos, startIdx, onClose }) {
  const [idx, setIdx] = useState(startIdx)
  const prev = () => setIdx(i => (i - 1 + photos.length) % photos.length)
  const next = () => setIdx(i => (i + 1) % photos.length)

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [photos.length])

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="relative flex items-center justify-center w-full h-full" onClick={e => e.stopPropagation()}>
        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors">
          <X size={18} />
        </button>

        {/* Nav */}
        {photos.length > 1 && (
          <>
            <button onClick={prev} className="absolute left-4 z-10 w-12 h-12 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors">
              <ChevronLeft size={22} />
            </button>
            <button onClick={next} className="absolute right-4 z-10 w-12 h-12 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors">
              <ChevronRight size={22} />
            </button>
          </>
        )}

        {/* Image */}
        <img
          src={`photo://${photos[idx].filename}`}
          className="max-w-[85vw] max-h-[85vh] object-contain rounded-2xl shadow-2xl"
          alt=""
        />

        {/* Counter */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
          {photos.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)}
              className={`rounded-full transition-all ${i === idx ? 'w-6 h-2 bg-amber-400' : 'w-2 h-2 bg-white/30'}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function StatistaProfile({ id }) {
  const { navigate, refresh, toast } = useApp()
  const [statista, setStatista] = useState(null)
  const [loading, setLoading]   = useState(true)
  const [lightbox, setLightbox] = useState(null)

  useEffect(() => { loadData() }, [id])

  async function loadData() {
    setLoading(true)
    try {
      const data = await window.api.getStatista(id)
      if (!data) return navigate('statisti')
      setStatista(data)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Obrisati statista "${statista.ime} ${statista.prezime}"?\n\nOva akcija se ne može poništiti.`)) return
    await window.api.deleteStatista(id)
    refresh()
    toast('Statista obrisan', 'success')
    navigate('statisti')
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="skeleton h-64 rounded-2xl mb-4" />
        <div className="grid grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="skeleton h-40 rounded-xl" />)}
        </div>
      </div>
    )
  }

  if (!statista) return null

  const { fotografije = [], projekti: sProj = [] } = statista
  const profilnaSlika = fotografije.find(f => f.je_profilna)
  const ostaleSlika = fotografije.filter(f => !f.je_profilna)

  const parseTags = (v) => { try { return JSON.parse(v || '[]') } catch { return [] } }
  const tagovi  = parseTags(statista.tagovi)
  const jezici  = parseTags(statista.jezici)
  const vestine = parseTags(statista.vestine)

  const calcAge = (dob) => {
    if (!dob) return null
    const d = new Date(dob)
    const age = new Date().getFullYear() - d.getFullYear()
    return `${age} godina (${d.toLocaleDateString('sr-Latn')})`
  }

  return (
    <div className="pb-8">
      {/* Hero Section */}
      <div className="relative h-56 overflow-hidden">
        {/* Blurred background */}
        {profilnaSlika ? (
          <img src={`photo://${profilnaSlika.filename}`}
            className="absolute inset-0 w-full h-full object-cover scale-110 blur-md opacity-30" alt="" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 via-[#0a0a14] to-indigo-900/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a14]/50 to-[#0a0a14]" />

        {/* Back button */}
        <div className="absolute top-4 left-4 z-10">
          <button onClick={() => navigate('statisti')} className="flex items-center gap-2 bg-black/40 hover:bg-black/60 text-white rounded-xl px-3 py-2 text-sm transition-colors backdrop-blur-sm">
            <ArrowLeft size={14} /> Nazad
          </button>
        </div>

        {/* Actions */}
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <button onClick={() => navigate('statista-edit', { id })}
            className="flex items-center gap-2 bg-amber-500/80 hover:bg-amber-500 text-black font-semibold rounded-xl px-3 py-2 text-sm transition-colors backdrop-blur-sm">
            <Edit size={13} /> Uredi
          </button>
          <button onClick={handleDelete}
            className="w-9 h-9 flex items-center justify-center bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-xl transition-colors backdrop-blur-sm">
            <Trash2 size={14} />
          </button>
        </div>

        {/* Profile photo + name */}
        <div className="absolute bottom-0 left-6 flex items-end gap-4 pb-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-amber-500/50 shadow-2xl bg-[#12121e] flex items-center justify-center">
              {profilnaSlika ? (
                <img src={`photo://${profilnaSlika.filename}`}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => setLightbox(0)}
                  alt="" />
              ) : (
                <span className="text-3xl font-black text-amber-400/50">
                  {(statista.prezime || '?')[0].toUpperCase()}
                </span>
              )}
            </div>
            {fotografije.length > 0 && (
              <div className="absolute -bottom-1 -right-1 bg-amber-500 rounded-full w-5 h-5 flex items-center justify-center">
                <span className="text-[9px] font-bold text-black">{fotografije.length}</span>
              </div>
            )}
          </div>

          <div className="pb-1">
            <h1 className="text-2xl font-black text-white drop-shadow-lg">
              {statista.prezime} {statista.ime}
            </h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className={`badge text-xs ${statista.status === 'aktivan' ? 'badge-green' : 'badge-red'}`}>
                {statista.status}
              </span>
              {statista.pol && (
                <span className="text-xs text-gray-400">
                  {statista.pol === 'muski' ? '♂ Muški' : statista.pol === 'zenski' ? '♀ Ženski' : statista.pol}
                </span>
              )}
              {tagovi.map(t => <TagBadge key={t} tag={t} />)}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Main info */}
        <div className="lg:col-span-2 space-y-4">
          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="card p-3 text-center">
              <div className="text-xl font-black text-amber-400">{sProj.length}</div>
              <div className="text-[10px] text-gray-600">Projekata</div>
            </div>
            <div className="card p-3 text-center">
              <div className="text-xl font-black text-gray-300">{statista.visina ? `${statista.visina}cm` : '—'}</div>
              <div className="text-[10px] text-gray-600">Visina</div>
            </div>
            <div className="card p-3 text-center">
              <div className="text-xl font-black text-gray-300">{statista.velicina_garderobe || '—'}</div>
              <div className="text-[10px] text-gray-600">Garderoba</div>
            </div>
          </div>

          {/* Kontakt */}
          <div className="card p-4">
            <h3 className="section-title flex items-center gap-2">
              <Phone size={12} className="text-amber-400" /> Kontakt
            </h3>
            <InfoRow icon={Phone}    label="Telefon"  value={statista.telefon} />
            <InfoRow icon={Mail}     label="E-mail"   value={statista.email} />
            <InfoRow icon={Calendar} label="Datum r." value={calcAge(statista.datum_rodjenja)} />
          </div>

          {/* Dokumenti */}
          <div className="card p-4">
            <h3 className="section-title flex items-center gap-2">
              <FileText size={12} className="text-amber-400" /> Dokumenti
            </h3>
            <InfoRow icon={Hash}      label="Matični br." value={statista.maticni_broj}      mono />
            <InfoRow icon={CreditCard} label="Lična karta" value={statista.broj_licne_karte} mono />
            <InfoRow icon={Building}  label="Br. računa"   value={statista.broj_racuna}      mono />
          </div>

          {/* Fizičke karakteristike */}
          {(statista.boja_ociju || statista.boja_kose || statista.tezina || statista.broj_cipela) && (
            <div className="card p-4">
              <h3 className="section-title flex items-center gap-2">
                <Activity size={12} className="text-amber-400" /> Fizičke karakteristike
              </h3>
              <InfoRow icon={Ruler}    label="Visina"    value={statista.visina   ? `${statista.visina} cm`   : null} />
              <InfoRow icon={Weight}   label="Težina"    value={statista.tezina   ? `${statista.tezina} kg`   : null} />
              <InfoRow icon={EyeIcon}  label="Oči"       value={statista.boja_ociju} />
              <InfoRow icon={Palette}  label="Kosa"      value={statista.boja_kose} />
              <InfoRow icon={Shirt}    label="Garderoba" value={statista.velicina_garderobe} />
              <InfoRow icon={Footprints} label="Cipele"  value={statista.broj_cipela} />
            </div>
          )}

          {/* Jezici & Vještine */}
          {(jezici.length > 0 || vestine.length > 0) && (
            <div className="card p-4">
              <h3 className="section-title flex items-center gap-2">
                <Zap size={12} className="text-amber-400" /> Vještine
              </h3>
              {jezici.length > 0 && (
                <div className="mb-3">
                  <div className="text-[10px] text-gray-600 mb-2 flex items-center gap-1">
                    <Globe size={10} /> Jezici
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {jezici.map(j => <span key={j} className="badge badge-blue text-[10px]">{j}</span>)}
                  </div>
                </div>
              )}
              {vestine.length > 0 && (
                <div>
                  <div className="text-[10px] text-gray-600 mb-2 flex items-center gap-1">
                    <Zap size={10} /> Posebne vještine
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {vestine.map(v => <span key={v} className="badge badge-purple text-[10px]">{v}</span>)}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bio */}
          {statista.kratki_opis && (
            <div className="card p-4">
              <h3 className="section-title flex items-center gap-2">
                <User size={12} className="text-amber-400" /> O osobi
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">{statista.kratki_opis}</p>
            </div>
          )}

          {/* Napomene */}
          {statista.napomene && (
            <div className="card p-4 border-amber-500/10">
              <h3 className="section-title flex items-center gap-2">
                <Tag size={12} className="text-amber-400" /> Napomene
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-wrap">{statista.napomene}</p>
            </div>
          )}

          {/* Projects */}
          {sProj.length > 0 && (
            <div className="card p-4">
              <h3 className="section-title flex items-center gap-2">
                <Film size={12} className="text-amber-400" /> Projekti ({sProj.length})
              </h3>
              <div className="space-y-2">
                {sProj.map(p => (
                  <div key={p.id} className="flex items-center gap-3 p-3 bg-[#0e0e1a] rounded-xl">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                      <Film size={14} className="text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-200 truncate">{p.naziv}</div>
                      <div className="text-[10px] text-gray-600">
                        {p.uloga && <span>{p.uloga} · </span>}
                        {p.tip}
                        {p.datum_snimanja && ` · ${p.datum_snimanja}`}
                      </div>
                    </div>
                    {p.honorar && (
                      <span className="text-xs text-green-400 font-semibold">{p.honorar} €</span>
                    )}
                    <span className={`badge text-[10px] ${p.status === 'aktivan' ? 'badge-green' : 'badge-gray'}`}>
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Photo gallery */}
        <div className="space-y-4">
          {fotografije.length > 0 ? (
            <div className="card p-4">
              <h3 className="section-title flex items-center gap-2">
                <Camera size={12} className="text-amber-400" />
                Galerija ({fotografije.length})
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {fotografije.map((foto, idx) => (
                  <div
                    key={foto.id}
                    className={`relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer group
                      ${foto.je_profilna ? 'ring-2 ring-amber-500' : ''}`}
                    onClick={() => setLightbox(idx)}
                  >
                    <img
                      src={`photo://${foto.filename}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      alt=""
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <Maximize2 size={18} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    {foto.je_profilna && (
                      <div className="absolute top-1 left-1 bg-amber-500/90 rounded-md p-1">
                        <Star size={9} className="text-black" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={() => navigate('statista-edit', { id })}
                className="btn-secondary w-full mt-3 justify-center text-xs"
              >
                <Camera size={12} /> Upravljaj fotografijama
              </button>
            </div>
          ) : (
            <div className="card p-6 text-center">
              <Camera size={28} className="mx-auto mb-2 text-gray-700" />
              <p className="text-xs text-gray-600 mb-3">Nema fotografija</p>
              <button
                onClick={() => navigate('statista-edit', { id })}
                className="btn-secondary text-xs w-full justify-center"
              >
                <Camera size={12} /> Dodaj fotografije
              </button>
            </div>
          )}

          {/* Metadata */}
          <div className="card p-4 text-xs space-y-2">
            <div className="text-gray-600 flex justify-between">
              <span>Dodan:</span>
              <span className="text-gray-500">{statista.created_at ? new Date(statista.created_at).toLocaleDateString('sr-Latn') : '—'}</span>
            </div>
            <div className="text-gray-600 flex justify-between">
              <span>Izmjenjen:</span>
              <span className="text-gray-500">{statista.updated_at ? new Date(statista.updated_at).toLocaleDateString('sr-Latn') : '—'}</span>
            </div>
            <div className="text-gray-600 flex justify-between">
              <span>ID:</span>
              <span className="text-gray-500 font-mono">{statista.id}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && fotografije.length > 0 && (
        <Lightbox photos={fotografije} startIdx={lightbox} onClose={() => setLightbox(null)} />
      )}
    </div>
  )
}
