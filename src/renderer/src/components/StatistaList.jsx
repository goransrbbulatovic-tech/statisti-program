import React, { useState, useRef, useEffect } from 'react'
import { useApp } from '../App'
import {
  Search, Filter, Grid, List, Plus, Download, Trash2,
  ChevronDown, ChevronUp, X, Check, Users, SlidersHorizontal,
  UserCheck, UserX, RefreshCw, Eye, Edit, CheckSquare, Square
} from 'lucide-react'
import ExportModal from './ExportModal'

function Avatar({ filename, name, size = 40 }) {
  const initials = (name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  return (
    <div
      className="rounded-full overflow-hidden flex-shrink-0 bg-amber-500/10 border border-amber-500/20 flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {filename
        ? <img src={`photo://${filename}`} className="w-full h-full object-cover" alt={name} />
        : <span className="font-bold text-amber-400" style={{ fontSize: size * 0.32 }}>{initials}</span>
      }
    </div>
  )
}

function FilterPanel({ filters, setFilters, projekti, onClose }) {
  const [local, setLocal] = useState({ ...filters })

  const apply = () => { setFilters(local); onClose() }
  const reset = () => { setLocal({}); setFilters({}); onClose() }
  const set = (k, v) => setLocal(p => ({ ...p, [k]: v || undefined }))

  return (
    <div className="card p-4 absolute top-12 right-0 z-30 w-72 shadow-2xl border border-[#2a2a40] animate-slide-up">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-gray-200">Napredni filteri</span>
        <button onClick={onClose} className="btn-ghost p-1"><X size={14} /></button>
      </div>

      <div className="space-y-3">
        <div className="form-group">
          <label className="label">Status</label>
          <select className="input-field" value={local.status || ''} onChange={e => set('status', e.target.value)}>
            <option value="">Svi statusi</option>
            <option value="aktivan">Aktivan</option>
            <option value="neaktivan">Neaktivan</option>
          </select>
        </div>

        <div className="form-group">
          <label className="label">Pol</label>
          <select className="input-field" value={local.pol || ''} onChange={e => set('pol', e.target.value)}>
            <option value="">Svi</option>
            <option value="muski">Muški</option>
            <option value="zenski">Ženski</option>
            <option value="ostalo">Ostalo</option>
          </select>
        </div>

        <div className="form-group">
          <label className="label">Projekat</label>
          <select className="input-field" value={local.projekat_id || ''} onChange={e => set('projekat_id', e.target.value)}>
            <option value="">Svi projekti</option>
            {projekti.map(p => <option key={p.id} value={p.id}>{p.naziv}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label className="label">Boja očiju</label>
          <select className="input-field" value={local.boja_ociju || ''} onChange={e => set('boja_ociju', e.target.value)}>
            <option value="">Sve boje</option>
            {['Smeđe', 'Plave', 'Zelene', 'Sive', 'Crne', 'Hazel'].map(b =>
              <option key={b} value={b}>{b}</option>
            )}
          </select>
        </div>

        <div className="form-group">
          <label className="label">Boja kose</label>
          <select className="input-field" value={local.boja_kose || ''} onChange={e => set('boja_kose', e.target.value)}>
            <option value="">Sve boje</option>
            {['Crna', 'Tamnosmeđa', 'Smeđa', 'Plavuša', 'Riđa', 'Sijeda', 'Ostalo'].map(b =>
              <option key={b} value={b}>{b}</option>
            )}
          </select>
        </div>

        <div className="form-group">
          <label className="label">Visina (cm)</label>
          <div className="flex gap-2">
            <input type="number" className="input-field" placeholder="Od" min="140" max="220"
              value={local.visina_od || ''} onChange={e => set('visina_od', e.target.value)} />
            <input type="number" className="input-field" placeholder="Do" min="140" max="220"
              value={local.visina_do || ''} onChange={e => set('visina_do', e.target.value)} />
          </div>
        </div>

        <div className="form-group">
          <label className="label">Sortiraj</label>
          <select className="input-field" value={local.sort || ''} onChange={e => set('sort', e.target.value)}>
            <option value="prezime_asc">Prezime A→Z</option>
            <option value="prezime_desc">Prezime Z→A</option>
            <option value="newest">Najnoviji</option>
            <option value="oldest">Najstariji</option>
            <option value="updated">Nedavno izmijenjeni</option>
          </select>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button onClick={reset} className="btn-secondary flex-1">Resetuj</button>
        <button onClick={apply} className="btn-primary flex-1">Primijeni</button>
      </div>
    </div>
  )
}

function StatistCard({ statista, selected, onSelect, onView, onEdit }) {
  const isSelected = selected.includes(statista.id)
  return (
    <div
      className={`card relative overflow-hidden transition-all duration-200 hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/5 group ${isSelected ? 'border-amber-500/50 ring-1 ring-amber-500/30' : ''}`}
    >
      {/* Selection checkbox */}
      <button
        onClick={(e) => { e.stopPropagation(); onSelect(statista.id) }}
        className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-amber-500 border-amber-500' : 'bg-[#0a0a14]/80 border-gray-600'}`}>
          {isSelected && <Check size={11} className="text-black" />}
        </div>
      </button>
      {isSelected && (
        <button onClick={(e) => { e.stopPropagation(); onSelect(statista.id) }}
          className="absolute top-2 left-2 z-10">
          <div className="w-5 h-5 rounded border-2 bg-amber-500 border-amber-500 flex items-center justify-center">
            <Check size={11} className="text-black" />
          </div>
        </button>
      )}

      <div className="cursor-pointer" onClick={() => onView(statista.id)}>
        {/* Photo */}
        <div className="relative h-36 bg-[#0e0e1a] overflow-hidden">
          {statista.profilna_slika ? (
            <img src={`photo://${statista.profilna_slika}`} className="w-full h-full object-cover" alt="" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 border-2 border-amber-500/20 flex items-center justify-center">
                <span className="text-xl font-black text-amber-400/60">
                  {(statista.prezime || '?')[0].toUpperCase()}
                </span>
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#12121e] via-transparent to-transparent" />
          <div className="absolute bottom-2 right-2">
            <span className={`badge text-[10px] ${statista.status === 'aktivan' ? 'badge-green' : 'badge-red'}`}>
              {statista.status}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-3">
          <div className="font-semibold text-sm text-white truncate">
            {statista.prezime} {statista.ime}
          </div>
          <div className="text-[10px] text-gray-600 mt-0.5 truncate">
            {statista.projekti_nazivi || 'Nema projekata'}
          </div>
          {statista.telefon && (
            <div className="text-[10px] text-gray-700 mt-1 truncate">{statista.telefon}</div>
          )}
          <div className="flex items-center gap-1 mt-2">
            {statista.broj_projekata > 0 && (
              <span className="badge badge-amber text-[9px]">🎬 {statista.broj_projekata} proj.</span>
            )}
            {statista.pol && (
              <span className="badge badge-gray text-[9px]">{statista.pol === 'muski' ? '♂' : statista.pol === 'zenski' ? '♀' : '⊕'}</span>
            )}
          </div>
        </div>
      </div>

      {/* Actions on hover */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={(e) => { e.stopPropagation(); onEdit(statista.id) }}
          className="w-7 h-7 bg-[#12121e]/90 rounded-lg flex items-center justify-center hover:bg-amber-500/20 text-gray-400 hover:text-amber-400 transition-colors">
          <Edit size={12} />
        </button>
      </div>
    </div>
  )
}

export default function StatistaList() {
  const { statisti, projekti, loading, search, setSearch, filters, setFilters, navigate, refresh, toast } = useApp()
  const [viewMode, setViewMode]       = useState('cards')
  const [showFilters, setShowFilters] = useState(false)
  const [selected, setSelected]       = useState([])
  const [showExport, setShowExport]   = useState(false)
  const [page, setPage]               = useState(1)
  const PER_PAGE = viewMode === 'cards' ? 24 : 50

  // Reset page when search/filters change
  useEffect(() => setPage(1), [search, filters])

  const hasFilters = Object.keys(filters).some(k => k !== 'sort' && filters[k])
  const totalPages = Math.ceil(statisti.length / PER_PAGE)
  const paged = statisti.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const toggleSelect = (id) =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const selectAll = () =>
    setSelected(selected.length === paged.length ? [] : paged.map(s => s.id))

  const handleBulkDelete = async () => {
    if (!selected.length) return
    if (!confirm(`Obrisati ${selected.length} statista? Ova akcija se ne može poništiti.`)) return
    await window.api.bulkDelete(selected)
    setSelected([])
    refresh()
    toast(`Obrisano ${selected.length} statista`)
  }

  const handleBulkStatus = async (status) => {
    if (!selected.length) return
    await window.api.bulkStatus(selected, status)
    setSelected([])
    refresh()
    toast(`Status promijenjen na "${status}"`)
  }

  const SORT_LABEL = { prezime_asc: 'A→Z', prezime_desc: 'Z→A', newest: 'Najnoviji', oldest: 'Najstariji', updated: 'Izmijenjeni' }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Users size={22} className="text-amber-400" />
            Statisti
          </h1>
          <p className="text-xs text-gray-600 mt-0.5">
            {statisti.length} {statisti.length === 1 ? 'osoba' : 'osoba'} u bazi
            {hasFilters && ' · filteri aktivni'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowExport(true)} className="btn-secondary">
            <Download size={14} />
            <span className="hidden sm:inline">Izvoz</span>
          </button>
          <button onClick={() => navigate('statista-new')} className="btn-primary">
            <Plus size={14} />
            Novi statista
          </button>
        </div>
      </div>

      {/* Search + Filter bar */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
          <input
            className="input-field pl-9 pr-9"
            placeholder="Pretraži po imenu, prezimenu, matičnom broju, projektima..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400">
              <X size={14} />
            </button>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary ${hasFilters ? 'border-amber-500/50 text-amber-400' : ''}`}
          >
            <SlidersHorizontal size={14} />
            Filteri
            {hasFilters && <span className="w-4 h-4 bg-amber-500 text-black text-[9px] rounded-full flex items-center justify-center font-bold">!</span>}
          </button>
          {showFilters && (
            <FilterPanel
              filters={filters}
              setFilters={setFilters}
              projekti={projekti}
              onClose={() => setShowFilters(false)}
            />
          )}
        </div>

        {/* View toggle */}
        <div className="flex bg-[#12121e] border border-[#2a2a40] rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode('cards')}
            className={`px-3 py-2 transition-colors ${viewMode === 'cards' ? 'bg-amber-500/20 text-amber-400' : 'text-gray-500 hover:text-gray-300'}`}
            title="Kartice"
          >
            <Grid size={15} />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-2 transition-colors ${viewMode === 'table' ? 'bg-amber-500/20 text-amber-400' : 'text-gray-500 hover:text-gray-300'}`}
            title="Tabela"
          >
            <List size={15} />
          </button>
        </div>

        <button onClick={refresh} className="btn-ghost" title="Osvježi">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Bulk action bar */}
      {selected.length > 0 && (
        <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 animate-slide-up">
          <span className="text-sm font-semibold text-amber-400">{selected.length} odabrano</span>
          <div className="flex gap-2 ml-auto">
            <button onClick={() => handleBulkStatus('aktivan')} className="btn-secondary text-xs py-1.5">
              <UserCheck size={12} /> Aktivan
            </button>
            <button onClick={() => handleBulkStatus('neaktivan')} className="btn-secondary text-xs py-1.5">
              <UserX size={12} /> Neaktivan
            </button>
            <button onClick={handleBulkDelete} className="btn-danger text-xs py-1.5">
              <Trash2 size={12} /> Obriši
            </button>
            <button onClick={() => setSelected([])} className="btn-ghost text-xs py-1.5">
              <X size={12} /> Otkaži
            </button>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="card overflow-hidden">
              <div className="skeleton h-36" />
              <div className="p-3 space-y-2">
                <div className="skeleton h-3 rounded w-3/4" />
                <div className="skeleton h-2 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && statisti.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4">
            <Users size={36} className="text-amber-500/40" />
          </div>
          <h3 className="text-lg font-semibold text-gray-400 mb-2">
            {search || hasFilters ? 'Nema rezultata' : 'Nema statista'}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {search || hasFilters
              ? 'Promijenite kriterije pretrage ili filtera'
              : 'Dodajte prvog statista klikom na dugme ispod'
            }
          </p>
          {!search && !hasFilters && (
            <button onClick={() => navigate('statista-new')} className="btn-primary">
              <Plus size={14} /> Dodaj statista
            </button>
          )}
          {(search || hasFilters) && (
            <button onClick={() => { setSearch(''); setFilters({}) }} className="btn-secondary">
              <X size={14} /> Resetuj pretragu
            </button>
          )}
        </div>
      )}

      {/* CARDS VIEW */}
      {!loading && viewMode === 'cards' && paged.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3">
          {/* Select all card */}
          <div
            className={`card flex flex-col items-center justify-center gap-2 cursor-pointer min-h-[200px] border-dashed hover:border-amber-500/40 transition-all ${selected.length > 0 ? 'border-amber-500/30' : ''}`}
            onClick={selectAll}
          >
            {selected.length === paged.length && paged.length > 0
              ? <CheckSquare size={24} className="text-amber-400" />
              : <Square size={24} className="text-gray-700" />
            }
            <span className="text-[11px] text-gray-600 text-center">
              {selected.length === paged.length && paged.length > 0 ? 'Odaberi sve' : 'Odaberi sve'}
            </span>
          </div>

          {paged.map(s => (
            <StatistCard
              key={s.id}
              statista={s}
              selected={selected}
              onSelect={toggleSelect}
              onView={id => navigate('statista-profile', { id })}
              onEdit={id => navigate('statista-edit', { id })}
            />
          ))}
        </div>
      )}

      {/* TABLE VIEW */}
      {!loading && viewMode === 'table' && paged.length > 0 && (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#0e0e1a] border-b border-[#1e1e30]">
              <tr>
                <th className="w-8 p-3">
                  <button onClick={selectAll}>
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${selected.length === paged.length && paged.length > 0 ? 'bg-amber-500 border-amber-500' : 'border-gray-600'}`}>
                      {selected.length === paged.length && paged.length > 0 && <Check size={9} className="text-black" />}
                    </div>
                  </button>
                </th>
                <th className="table-header text-left p-3 w-10"></th>
                <th className="table-header text-left p-3">Ime i prezime</th>
                <th className="table-header text-left p-3 hidden md:table-cell">Matični broj</th>
                <th className="table-header text-left p-3 hidden lg:table-cell">Telefon</th>
                <th className="table-header text-left p-3 hidden xl:table-cell">Projekti</th>
                <th className="table-header text-left p-3">Status</th>
                <th className="table-header text-right p-3">Akcije</th>
              </tr>
            </thead>
            <tbody>
              {paged.map(s => (
                <tr
                  key={s.id}
                  className={`table-row ${selected.includes(s.id) ? 'bg-amber-500/5' : ''}`}
                  onClick={() => navigate('statista-profile', { id: s.id })}
                >
                  <td className="p-3" onClick={e => e.stopPropagation()}>
                    <button onClick={() => toggleSelect(s.id)}>
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${selected.includes(s.id) ? 'bg-amber-500 border-amber-500' : 'border-gray-600'}`}>
                        {selected.includes(s.id) && <Check size={9} className="text-black" />}
                      </div>
                    </button>
                  </td>
                  <td className="p-3">
                    <Avatar filename={s.profilna_slika} name={`${s.ime} ${s.prezime}`} size={32} />
                  </td>
                  <td className="p-3">
                    <div className="font-medium text-sm text-gray-200">{s.prezime} {s.ime}</div>
                    {s.email && <div className="text-[10px] text-gray-600">{s.email}</div>}
                  </td>
                  <td className="p-3 hidden md:table-cell text-xs text-gray-500 font-mono">{s.maticni_broj || '—'}</td>
                  <td className="p-3 hidden lg:table-cell text-xs text-gray-500">{s.telefon || '—'}</td>
                  <td className="p-3 hidden xl:table-cell">
                    <span className="text-xs text-gray-600 truncate max-w-[160px] block">
                      {s.projekti_nazivi || '—'}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`badge text-[10px] ${s.status === 'aktivan' ? 'badge-green' : 'badge-red'}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="p-3" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => navigate('statista-profile', { id: s.id })}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#2a2a40] text-gray-500 hover:text-gray-300 transition-colors">
                        <Eye size={13} />
                      </button>
                      <button onClick={() => navigate('statista-edit', { id: s.id })}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#2a2a40] text-gray-500 hover:text-amber-400 transition-colors">
                        <Edit size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-gray-600">
            Prikazano {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, statisti.length)} od {statisti.length}
          </span>
          <div className="flex items-center gap-1">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary py-1.5 px-2.5 disabled:opacity-30">
              <ChevronDown size={13} className="rotate-90" />
            </button>
            {[...Array(Math.min(totalPages, 7))].map((_, i) => {
              const p = i + 1
              return (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${page === p ? 'bg-amber-500 text-black' : 'text-gray-500 hover:bg-[#1e1e30] hover:text-gray-300'}`}>
                  {p}
                </button>
              )
            })}
            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="btn-secondary py-1.5 px-2.5 disabled:opacity-30">
              <ChevronDown size={13} className="-rotate-90" />
            </button>
          </div>
        </div>
      )}

      {showExport && <ExportModal onClose={() => setShowExport(false)} />}
    </div>
  )
}
