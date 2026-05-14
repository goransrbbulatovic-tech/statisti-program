import React, { useState, useEffect } from 'react'
import { useApp } from '../App'
import { BarChart2, PieChart, TrendingUp, Users, Calendar, DollarSign } from 'lucide-react'

const AMBER = '#f59e0b'
const COLORS = ['#f59e0b','#60a5fa','#34d399','#a78bfa','#f87171','#fb923c','#4ade80','#22d3ee']

// Simple SVG bar chart
function BarChart({ data, height=160, color=AMBER }) {
  if (!data?.length) return <div className="text-center py-8 text-xs text-gray-600">Nema podataka</div>
  const max = Math.max(...data.map(d=>d.value), 1)
  const w = 100/data.length
  return (
    <svg viewBox={`0 0 100 ${height}`} className="w-full" style={{height}}>
      {data.map((d,i) => {
        const bh = (d.value/max)*(height-30)
        const x = i*w + w*0.1
        const bw = w*0.8
        return (
          <g key={i}>
            <rect x={x} y={height-30-bh} width={bw} height={bh} rx="2" fill={color} opacity="0.8"/>
            <text x={x+bw/2} y={height-15} textAnchor="middle" fill="#94a3b8" fontSize="5">{d.name?.slice(0,4)}</text>
            {d.value>0 && <text x={x+bw/2} y={height-33-bh} textAnchor="middle" fill={color} fontSize="5.5" fontWeight="bold">{d.value}</text>}
          </g>
        )
      })}
    </svg>
  )
}

// Simple SVG donut
function DonutChart({ data, size=140 }) {
  if (!data?.length || data.every(d=>d.value===0)) return <div className="text-center py-8 text-xs text-gray-600">Nema podataka</div>
  const total = data.reduce((s,d)=>s+d.value,0)
  if (total===0) return null
  const cx=size/2, cy=size/2, r=size*0.35, ir=size*0.22
  let angle=-Math.PI/2
  const arcs = data.filter(d=>d.value>0).map((d,i)=>{
    const sweep = (d.value/total)*Math.PI*2
    const x1=cx+r*Math.cos(angle), y1=cy+r*Math.sin(angle)
    angle+=sweep
    const x2=cx+r*Math.cos(angle), y2=cy+r*Math.sin(angle)
    const large=sweep>Math.PI?1:0
    const ix1=cx+ir*Math.cos(angle-sweep), iy1=cy+ir*Math.sin(angle-sweep)
    const ix2=cx+ir*Math.cos(angle), iy2=cy+ir*Math.sin(angle)
    return { path:`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${ir} ${ir} 0 ${large} 0 ${ix1} ${iy1} Z`, color:COLORS[i%COLORS.length], ...d }
  })
  return (
    <svg viewBox={`0 0 ${size} ${size}`} style={{width:size,height:size}}>
      {arcs.map((a,i)=><path key={i} d={a.path} fill={a.color} opacity="0.85"/>)}
      <text x={cx} y={cy-5} textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">{total}</text>
      <text x={cx} y={cy+8} textAnchor="middle" fill="#94a3b8" fontSize="6">ukupno</text>
    </svg>
  )
}

// Line chart for trend
function LineChart({ data, height=100 }) {
  if (!data?.length) return null
  const vals = Object.values(data)
  const keys = Object.keys(data)
  const max = Math.max(...vals, 1)
  const n = vals.length
  const W=300, H=height-20
  const pts = vals.map((v,i)=>({ x:(i/(n-1||1))*W, y:H-(v/max)*H, v, k:keys[i] }))
  const path = pts.map((p,i)=>`${i===0?'M':'L'} ${p.x} ${p.y}`).join(' ')
  return (
    <svg viewBox={`0 0 300 ${height}`} className="w-full" style={{height}}>
      <path d={path} stroke={AMBER} strokeWidth="1.5" fill="none" opacity="0.8"/>
      {pts.filter((_,i)=>i%7===0||i===pts.length-1).map((p,i)=>(
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="2" fill={AMBER}/>
          <text x={p.x} y={height-3} textAnchor="middle" fill="#64748b" fontSize="5">{p.k.slice(5)}</text>
          {p.v>0&&<text x={p.x} y={p.y-4} textAnchor="middle" fill={AMBER} fontSize="5">{p.v}</text>}
        </g>
      ))}
    </svg>
  )
}

function StatKartica({ icon:Icon, label, value, sub, color }) {
  return (
    <div className="card p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
        <Icon size={18} className="text-white/80"/>
      </div>
      <div>
        <div className="text-xl font-black text-white">{value}</div>
        <div className="text-xs text-gray-500">{label}</div>
        {sub && <div className="text-[10px] text-gray-700">{sub}</div>}
      </div>
    </div>
  )
}

export default function IzvjestajiPage() {
  const { statistike: s } = useApp()

  if (!s) return <div className="p-6 text-gray-600">Učitavam...</div>

  const prirast = s.novi_ovaj_mesec - (s.novi_prosli_mesec||0)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <BarChart2 size={22} className="text-amber-400"/>
        <div>
          <h1 className="text-2xl font-black text-white">Izvještaji & Statistike</h1>
          <p className="text-xs text-gray-600">Pregled baze statista i aktivnosti</p>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        <StatKartica icon={Users} label="Ukupno statista" value={s.ukupno_statista} sub={`${s.sa_slikom} sa foto`} color="bg-amber-500/20"/>
        <StatKartica icon={Users} label="Aktivnih" value={s.aktivnih} sub={`${s.neaktivnih} neaktivnih`} color="bg-green-500/20"/>
        <StatKartica icon={TrendingUp} label="Novi ovaj mj." value={s.novi_ovaj_mesec} sub={prirast>=0?`+${prirast} vs prošli`:`${prirast} vs prošli`} color="bg-blue-500/20"/>
        <StatKartica icon={Calendar} label="Rasporeda" value={s.ukupno_rasporeda||0} color="bg-purple-500/20"/>
        <StatKartica icon={DollarSign} label="Uk. honorari" value={`${(s.ukupno_honorara||0).toFixed(0)} BAM`} sub={`${(s.neplaceno||0).toFixed(0)} BAM čeka`} color="bg-orange-500/20"/>
        <StatKartica icon={Users} label="Grupe" value={s.ukupno_grupe||0} color="bg-indigo-500/20"/>
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-400"/>Pol
          </h3>
          <div className="flex items-center gap-4">
            <DonutChart data={s.by_pol} size={120}/>
            <div className="space-y-2">
              {s.by_pol?.map((d,i)=>(
                <div key={d.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{background:COLORS[i]}}/>
                  <span className="text-xs text-gray-400">{d.name}</span>
                  <span className="text-xs font-bold text-gray-200 ml-auto">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card p-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400"/>Status
          </h3>
          <div className="flex items-center gap-4">
            <DonutChart data={s.by_status} size={120}/>
            <div className="space-y-2">
              {s.by_status?.map((d,i)=>(
                <div key={d.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{background:COLORS[i]}}/>
                  <span className="text-xs text-gray-400">{d.name}</span>
                  <span className="text-xs font-bold text-gray-200 ml-auto">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card p-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-400"/>Boja kose
          </h3>
          <BarChart data={s.by_boja_kose?.slice(0,8)} height={130} color="#60a5fa"/>
        </div>
      </div>

      {/* Trend */}
      <div className="card p-4">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <TrendingUp size={12} className="text-amber-400"/>Dodani statisti — zadnjih 30 dana
        </h3>
        {s.aktivnosti_by_day && <LineChart data={s.aktivnosti_by_day} height={100}/>}
      </div>

      {/* Top projekti */}
      {s.top_projekti?.length>0 && (
        <div className="card p-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Top projekti po broju statista</h3>
          <div className="space-y-2">
            {s.top_projekti.map((p,i)=>(
              <div key={p.id} className="flex items-center gap-3">
                <span className="text-xs font-bold w-4 text-gray-600">{i+1}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-300">{p.naziv}</span>
                    <span className="text-xs font-bold text-amber-400">{p.broj}</span>
                  </div>
                  <div className="h-1.5 bg-[#1a1a28] rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-amber-500 transition-all" style={{width:`${(p.broj/s.top_projekti[0].broj)*100}%`}}/>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Visina distribucija */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Pregled sa fotografijama</h3>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-black text-amber-400">{s.sa_slikom}</div>
            <div className="flex-1">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Sa slikom</span>
                <span>{s.ukupno_statista>0?Math.round((s.sa_slikom/s.ukupno_statista)*100):0}%</span>
              </div>
              <div className="h-2 bg-[#1a1a28] rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-amber-500" style={{width:`${s.ukupno_statista>0?(s.sa_slikom/s.ukupno_statista)*100:0}%`}}/>
              </div>
              <div className="text-xs text-gray-600 mt-1">{s.ukupno_statista - s.sa_slikom} bez fotografije</div>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Finansijski pregled</h3>
          <div className="space-y-2">
            {[
              { l:'Ukupno honorara', v:`${(s.ukupno_honorara||0).toFixed(2)} BAM`, c:'text-amber-400' },
              { l:'Plaćeno', v:`${((s.ukupno_honorara||0)-(s.neplaceno||0)).toFixed(2)} BAM`, c:'text-green-400' },
              { l:'Čeka isplatu', v:`${(s.neplaceno||0).toFixed(2)} BAM`, c:'text-orange-400' },
            ].map(r=>(
              <div key={r.l} className="flex justify-between py-1.5 border-b border-[#1e1e30]/60 last:border-0">
                <span className="text-xs text-gray-600">{r.l}</span>
                <span className={`text-xs font-bold font-mono ${r.c}`}>{r.v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
