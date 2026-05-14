import React, { useEffect } from 'react'
import { useApp } from '../App'
import {
  Users, Film, UserCheck, UserX, TrendingUp, Plus,
  Activity, Clock, Star, Camera, ArrowRight, Clapperboard
} from 'lucide-react'

function StatCard({ icon: Icon, label, value, sub, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className="card p-5 flex items-center gap-4 hover:border-amber-500/20 transition-all duration-200 w-full text-left group"
    >
      <div className={`stat-icon ${color}`}>
        <Icon size={22} className="text-white/90" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-2xl font-black text-white leading-none">{value ?? '—'}</div>
        <div className="text-xs text-gray-500 mt-1">{label}</div>
        {sub && <div className="text-[10px] text-gray-700 mt-0.5">{sub}</div>}
      </div>
      <ArrowRight size={14} className="text-gray-700 group-hover:text-amber-500/50 transition-colors flex-shrink-0" />
    </button>
  )
}

function MiniBar({ label, value, max, color }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-gray-400">{label}</span>
        <span className="text-gray-300 font-semibold">{value}</span>
      </div>
      <div className="h-1.5 bg-[#1a1a28] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function ActivityItem({ item }) {
  const ICONS = {
    kreiran: '➕',
    izmenjen: '✏️',
    obrisan: '🗑️',
    kreiran_projekat: '🎬',
  }
  const fmtTime = (dt) => {
    const d = new Date(dt)
    const now = new Date()
    const diff = (now - d) / 1000
    if (diff < 60)   return 'malopre'
    if (diff < 3600) return `${Math.floor(diff/60)}min`
    if (diff < 86400) return `${Math.floor(diff/3600)}h`
    return d.toLocaleDateString('sr-Latn')
  }
  return (
    <div className="flex items-start gap-3 py-2">
      <span className="text-base flex-shrink-0">{ICONS[item.tip] || '•'}</span>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-gray-300 truncate">{item.opis}</div>
        <div className="text-[10px] text-gray-600 mt-0.5">{fmtTime(item.created_at)}</div>
      </div>
    </div>
  )
}

function PhotoAvatar({ src, name, size = 'sm' }) {
  const dim = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10'
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm'
  const initials = (name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  return (
    <div className={`${dim} rounded-full overflow-hidden flex-shrink-0 bg-amber-500/10 border border-amber-500/20 flex items-center justify-center`}>
      {src
        ? <img src={`photo://${src}`} className="w-full h-full object-cover" alt={name} />
        : <span className={`${textSize} font-bold text-amber-400`}>{initials}</span>
      }
    </div>
  )
}

export default function Dashboard() {
  const { statistike, navigate, loadStatistike } = useApp()

  useEffect(() => { loadStatistike() }, [])

  const s = statistike
  const today = new Date().toLocaleDateString('sr-Latn', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Clapperboard size={20} className="text-amber-400" />
            <h1 className="text-2xl font-black text-white">Dobrodošli u <span className="text-amber-400">ACMigo</span></h1>
          </div>
          <p className="text-sm text-gray-600">{today}</p>
        </div>
        <button
          onClick={() => navigate('statista-new')}
          className="btn-primary"
        >
          <Plus size={15} />
          Novi statista
        </button>
      </div>

      {/* Main stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users} label="Ukupno statista"
          value={s?.ukupno_statista ?? 0}
          sub={`${s?.sa_slikom ?? 0} sa fotografijom`}
          color="bg-amber-500/20"
          onClick={() => navigate('statisti')}
        />
        <StatCard
          icon={UserCheck} label="Aktivnih"
          value={s?.aktivnih ?? 0}
          sub={`${s?.zenskih ?? 0} ž / ${s?.muskih ?? 0} m`}
          color="bg-green-500/20"
          onClick={() => navigate('statisti', { filter: 'aktivan' })}
        />
        <StatCard
          icon={Film} label="Projekata"
          value={s?.ukupno_projekata ?? 0}
          sub={`${s?.aktivnih_projekata ?? 0} aktivnih`}
          color="bg-indigo-500/20"
          onClick={() => navigate('projekti')}
        />
        <StatCard
          icon={TrendingUp} label="Novi ovaj mj."
          value={s?.novi_ovaj_mesec ?? 0}
          sub="u tekućem mjesecu"
          color="bg-purple-500/20"
          onClick={() => navigate('statisti')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Recently added */}
        <div className="lg:col-span-2 xl:col-span-3 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
              <Clock size={14} className="text-amber-400" />
              Nedavno dodani
            </h2>
            <button onClick={() => navigate('statisti')} className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors">
              Svi <ArrowRight size={11} />
            </button>
          </div>
          <div className="space-y-1">
            {s?.nedavno_dodani?.length > 0 ? s.nedavno_dodani.map(st => (
              <button
                key={st.id}
                onClick={() => navigate('statista-profile', { id: st.id })}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#1a1a28] transition-colors group"
              >
                <PhotoAvatar src={st.profilna_slika} name={`${st.ime} ${st.prezime}`} />
                <div className="flex-1 min-w-0 text-left">
                  <div className="text-sm font-medium text-gray-200 truncate">
                    {st.prezime} {st.ime}
                  </div>
                  <div className="text-[10px] text-gray-600">
                    {new Date(st.created_at).toLocaleDateString('sr-Latn')}
                  </div>
                </div>
                <span className={`badge text-[10px] ${st.status === 'aktivan' ? 'badge-green' : 'badge-gray'}`}>
                  {st.status}
                </span>
              </button>
            )) : (
              <div className="text-center py-8 text-gray-600">
                <Users size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Još nema statista</p>
                <button onClick={() => navigate('statista-new')} className="text-amber-400 text-xs mt-1 hover:underline">
                  Dodaj prvog →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Gender & Status breakdown */}
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-gray-300 flex items-center gap-2 mb-4">
              <Activity size={14} className="text-amber-400" />
              Pregled baze
            </h2>
            <div className="space-y-3">
              <MiniBar label="Aktivnih" value={s?.aktivnih ?? 0} max={s?.ukupno_statista ?? 1} color="bg-green-500" />
              <MiniBar label="Neaktivnih" value={s?.neaktivnih ?? 0} max={s?.ukupno_statista ?? 1} color="bg-red-400" />
              <MiniBar label="Muških" value={s?.muskih ?? 0} max={s?.ukupno_statista ?? 1} color="bg-blue-500" />
              <MiniBar label="Ženskih" value={s?.zenskih ?? 0} max={s?.ukupno_statista ?? 1} color="bg-pink-400" />
              <MiniBar label="Sa fotografijom" value={s?.sa_slikom ?? 0} max={s?.ukupno_statista ?? 1} color="bg-amber-500" />
            </div>
          </div>

          {/* Top projects */}
          {s?.top_projekti?.length > 0 && (
            <div className="card p-5">
              <h2 className="text-sm font-semibold text-gray-300 flex items-center gap-2 mb-3">
                <Star size={14} className="text-amber-400" />
                Top projekti
              </h2>
              <div className="space-y-2">
                {s.top_projekti.map((p, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-amber-500/10 flex items-center justify-center text-[9px] font-bold text-amber-500 flex-shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-300 truncate">{p.naziv}</div>
                    </div>
                    <span className="text-xs text-amber-400 font-bold flex-shrink-0">{p.broj}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Activity log */}
      {s?.aktivnosti?.length > 0 && (
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-300 flex items-center gap-2 mb-3">
            <Activity size={14} className="text-amber-400" />
            Nedavne aktivnosti
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 divide-y divide-[#1e1e30]">
            {s.aktivnosti.map(a => (
              <ActivityItem key={a.id} item={a} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
