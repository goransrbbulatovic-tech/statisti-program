/**
 * ACMigo Database - JSON storage
 * Collections: statisti, projekti, statista_projekti, fotografije,
 *              rasporedi, raspored_statisti, honorari, grupe, grupa_statisti,
 *              ugovori, kontakt_log, aktivnosti, settings
 */

import { app } from 'electron'
import { join } from 'path'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'

let dbPath
let data = {
  statisti: [], projekti: [], statista_projekti: [], fotografije: [],
  rasporedi: [], raspored_statisti: [], honorari: [],
  grupe: [], grupa_statisti: [],
  ugovori: [], kontakt_log: [],
  aktivnosti: [], settings: {},
  _counters: {}
}

export function setupDatabase() {
  const userDataPath = app.getPath('userData')
  dbPath = join(userDataPath, 'acmigo-data.json')
  const photosDir = join(userDataPath, 'photos')
  if (!existsSync(photosDir)) mkdirSync(photosDir, { recursive: true })

  if (existsSync(dbPath)) {
    try {
      const raw = readFileSync(dbPath, 'utf8')
      const loaded = JSON.parse(raw)
      // Merge with defaults so new collections always exist
      data = { ...data, ...loaded }
      if (!data._counters) data._counters = {}
      // Ensure all collections exist
      for (const k of ['rasporedi','raspored_statisti','honorari','grupe','grupa_statisti','ugovori','kontakt_log']) {
        if (!data[k]) data[k] = []
      }
      // Recalc counters
      for (const table of Object.keys(data)) {
        if (Array.isArray(data[table]) && data[table].length > 0) {
          data._counters[table] = Math.max(...data[table].map(r => r.id || 0))
        }
      }
    } catch (e) { console.error('DB load error:', e.message) }
  }
  save()
}

function save() {
  try { writeFileSync(dbPath, JSON.stringify(data, null, 0), 'utf8') } catch (e) { console.error('Save error:', e) }
}

function nextId(table) {
  data._counters[table] = (data._counters[table] || 0) + 1
  return data._counters[table]
}

function now() { return new Date().toISOString().replace('T',' ').substring(0,19) }

function logActivity(tip, opis, statistaId=null, projekatId=null) {
  data.aktivnosti.unshift({ id: nextId('aktivnosti'), tip, opis, statista_id: statistaId, projekat_id: projekatId, created_at: now() })
  if (data.aktivnosti.length > 200) data.aktivnosti = data.aktivnosti.slice(0, 200)
}

export function getDbPath() { return dbPath }

// ─── STATISTI ────────────────────────────────────────────────────────────────
export function getAllStatisti(search='', filters={}) {
  let rows = [...data.statisti]
  if (search && search.trim()) {
    const s = search.trim().toLowerCase()
    rows = rows.filter(r =>
      (r.ime||'').toLowerCase().includes(s) || (r.prezime||'').toLowerCase().includes(s) ||
      (`${r.ime} ${r.prezime}`).toLowerCase().includes(s) ||
      (`${r.prezime} ${r.ime}`).toLowerCase().includes(s) ||
      (r.maticni_broj||'').includes(s) || (r.telefon||'').includes(s) ||
      (r.email||'').toLowerCase().includes(s) || (r.tagovi||'').toLowerCase().includes(s)
    )
  }
  if (filters.status)     rows = rows.filter(r => r.status === filters.status)
  if (filters.pol)        rows = rows.filter(r => r.pol === filters.pol)
  if (filters.boja_ociju) rows = rows.filter(r => r.boja_ociju === filters.boja_ociju)
  if (filters.boja_kose)  rows = rows.filter(r => r.boja_kose === filters.boja_kose)
  if (filters.visina_od)  rows = rows.filter(r => r.visina >= parseInt(filters.visina_od))
  if (filters.visina_do)  rows = rows.filter(r => r.visina <= parseInt(filters.visina_do))
  if (filters.grupa_id) {
    const ids = new Set(data.grupa_statisti.filter(gs => gs.grupa_id === parseInt(filters.grupa_id)).map(gs => gs.statista_id))
    rows = rows.filter(r => ids.has(r.id))
  }
  if (filters.projekat_id) {
    const ids = new Set(data.statista_projekti.filter(sp => sp.projekat_id === parseInt(filters.projekat_id)).map(sp => sp.statista_id))
    rows = rows.filter(r => ids.has(r.id))
  }
  // Casting filters
  if (filters.godine_od || filters.godine_do) {
    const curY = new Date().getFullYear()
    rows = rows.filter(r => {
      if (!r.datum_rodjenja) return false
      const age = curY - new Date(r.datum_rodjenja).getFullYear()
      if (filters.godine_od && age < parseInt(filters.godine_od)) return false
      if (filters.godine_do && age > parseInt(filters.godine_do)) return false
      return true
    })
  }
  if (filters.ima_auto)   rows = rows.filter(r => (r.tagovi||'').includes('Automobil'))
  if (filters.jezici)     rows = rows.filter(r => (r.jezici||'[]').includes(filters.jezici))
  if (filters.vestine)    rows = rows.filter(r => (r.vestine||'[]').includes(filters.vestine))

  const sort = filters.sort || 'prezime_asc'
  rows.sort((a,b) => {
    if (sort==='prezime_asc')  return (a.prezime||'').localeCompare(b.prezime||'')||(a.ime||'').localeCompare(b.ime||'')
    if (sort==='prezime_desc') return (b.prezime||'').localeCompare(a.prezime||'')
    if (sort==='newest')       return new Date(b.created_at)-new Date(a.created_at)
    if (sort==='oldest')       return new Date(a.created_at)-new Date(b.created_at)
    if (sort==='updated')      return new Date(b.updated_at||b.created_at)-new Date(a.updated_at||a.created_at)
    return 0
  })

  return rows.map(r => {
    const foto = data.fotografije.find(f => f.statista_id===r.id && f.je_profilna)
    const spRows = data.statista_projekti.filter(sp => sp.statista_id===r.id)
    const projNames = spRows.map(sp => { const p=data.projekti.find(p=>p.id===sp.projekat_id); return p?p.naziv:null }).filter(Boolean).slice(0,3).join(', ')
    const grupe = data.grupa_statisti.filter(gs=>gs.statista_id===r.id).map(gs=>{ const g=data.grupe.find(g=>g.id===gs.grupa_id); return g?g.naziv:null }).filter(Boolean)
    const ukHonorar = data.honorari.filter(h=>h.statista_id===r.id).reduce((s,h)=>s+(h.iznos||0),0)
    const neplaceno = data.honorari.filter(h=>h.statista_id===r.id && h.status==='ceka').reduce((s,h)=>s+(h.iznos||0),0)
    return { ...r, profilna_slika: foto?foto.filename:null, broj_projekata: spRows.length, projekti_nazivi: projNames||null, grupe, uk_honorar: ukHonorar, neplaceno }
  })
}

export function getStatistaById(id) {
  const s = data.statisti.find(r => r.id===id)
  if (!s) return null
  const fotografije = data.fotografije.filter(f=>f.statista_id===id).sort((a,b)=>b.je_profilna-a.je_profilna)
  const projekti = data.statista_projekti.filter(sp=>sp.statista_id===id).map(sp=>{
    const p=data.projekti.find(p=>p.id===sp.projekat_id)
    return p ? {...p,...sp,sp_status:sp.status} : null
  }).filter(Boolean).sort((a,b)=>new Date(b.created_at||0)-new Date(a.created_at||0))
  const grupe = data.grupa_statisti.filter(gs=>gs.statista_id===id).map(gs=>data.grupe.find(g=>g.id===gs.grupa_id)).filter(Boolean)
  const honorari = data.honorari.filter(h=>h.statista_id===id).sort((a,b)=>new Date(b.created_at)-new Date(a.created_at))
  const kontakt_log = data.kontakt_log.filter(k=>k.statista_id===id).sort((a,b)=>new Date(b.datum)-new Date(a.datum)).slice(0,20)
  const rasporedi = data.raspored_statisti.filter(rs=>rs.statista_id===id).map(rs=>{
    const r=data.rasporedi.find(r=>r.id===rs.raspored_id); return r?{...r,rs_status:rs.status}:null
  }).filter(Boolean)
  return {...s, fotografije, projekti, grupe, honorari, kontakt_log, rasporedi}
}

export function createStatista(d) {
  const id = nextId('statisti')
  if (d.maticni_broj && data.statisti.some(s=>s.maticni_broj===d.maticni_broj)) throw new Error('UNIQUE constraint failed: maticni_broj')
  const record = { id, ime:d.ime, prezime:d.prezime, maticni_broj:d.maticni_broj||null, broj_licne_karte:d.broj_licne_karte||null, broj_racuna:d.broj_racuna||null, telefon:d.telefon||null, email:d.email||null, kratki_opis:d.kratki_opis||null, napomene:d.napomene||null, status:d.status||'aktivan', pol:d.pol||null, datum_rodjenja:d.datum_rodjenja||null, visina:d.visina?parseInt(d.visina):null, tezina:d.tezina?parseInt(d.tezina):null, boja_ociju:d.boja_ociju||null, boja_kose:d.boja_kose||null, velicina_garderobe:d.velicina_garderobe||null, broj_cipela:d.broj_cipela||null, jezici:d.jezici||'[]', vestine:d.vestine||'[]', tagovi:d.tagovi||'[]', created_at:now(), updated_at:now() }
  data.statisti.push(record)
  logActivity('kreiran',`Dodat statista: ${d.ime} ${d.prezime}`,id)
  save()
  return id
}

export function updateStatista(id, d) {
  const idx = data.statisti.findIndex(r=>r.id===id)
  if (idx===-1) return
  if (d.maticni_broj) { const dup=data.statisti.find(s=>s.maticni_broj===d.maticni_broj&&s.id!==id); if(dup) throw new Error('UNIQUE constraint failed: maticni_broj') }
  data.statisti[idx] = { ...data.statisti[idx], ime:d.ime, prezime:d.prezime, maticni_broj:d.maticni_broj||null, broj_licne_karte:d.broj_licne_karte||null, broj_racuna:d.broj_racuna||null, telefon:d.telefon||null, email:d.email||null, kratki_opis:d.kratki_opis||null, napomene:d.napomene||null, status:d.status||'aktivan', pol:d.pol||null, datum_rodjenja:d.datum_rodjenja||null, visina:d.visina?parseInt(d.visina):null, tezina:d.tezina?parseInt(d.tezina):null, boja_ociju:d.boja_ociju||null, boja_kose:d.boja_kose||null, velicina_garderobe:d.velicina_garderobe||null, broj_cipela:d.broj_cipela||null, jezici:d.jezici||'[]', vestine:d.vestine||'[]', tagovi:d.tagovi||'[]', updated_at:now() }
  logActivity('izmenjen',`Izmenjen: ${d.ime} ${d.prezime}`,id)
  save()
}

export function deleteStatista(id) {
  const s = data.statisti.find(r=>r.id===id)
  const photos = data.fotografije.filter(f=>f.statista_id===id).map(f=>f.filename)
  data.fotografije = data.fotografije.filter(f=>f.statista_id!==id)
  data.statista_projekti = data.statista_projekti.filter(sp=>sp.statista_id!==id)
  data.raspored_statisti = data.raspored_statisti.filter(rs=>rs.statista_id!==id)
  data.honorari = data.honorari.filter(h=>h.statista_id!==id)
  data.grupa_statisti = data.grupa_statisti.filter(gs=>gs.statista_id!==id)
  data.kontakt_log = data.kontakt_log.filter(k=>k.statista_id!==id)
  data.statisti = data.statisti.filter(r=>r.id!==id)
  if (s) logActivity('obrisan',`Obrisan: ${s.ime} ${s.prezime}`)
  save()
  return photos
}

export function bulkDeleteStatisti(ids) { const p=[]; for(const id of ids) p.push(...deleteStatista(id)); return p }
export function bulkUpdateStatus(ids, status) { for(const id of ids){const idx=data.statisti.findIndex(r=>r.id===id); if(idx!==-1){data.statisti[idx].status=status;data.statisti[idx].updated_at=now()}} save() }

// ─── FOTOGRAFIJE ─────────────────────────────────────────────────────────────
export function addFotografija(statistaId, filename, jeProfilna=false, opis='') {
  if (jeProfilna) data.fotografije.forEach(f=>{if(f.statista_id===statistaId)f.je_profilna=false})
  const id = nextId('fotografije')
  data.fotografije.push({id, statista_id:statistaId, filename, je_profilna:jeProfilna, opis, created_at:now()})
  save(); return id
}
export function deleteFotografija(id) {
  const foto = data.fotografije.find(f=>f.id===id); if(!foto) return null
  data.fotografije = data.fotografije.filter(f=>f.id!==id)
  if (foto.je_profilna) { const next=data.fotografije.find(f=>f.statista_id===foto.statista_id); if(next) next.je_profilna=true }
  save(); return foto
}
export function setProfilnaSlika(fotoId, statistaId) {
  data.fotografije.forEach(f=>{if(f.statista_id===statistaId)f.je_profilna=false})
  const foto=data.fotografije.find(f=>f.id===fotoId); if(foto) foto.je_profilna=true; save()
}

// ─── PROJEKTI ────────────────────────────────────────────────────────────────
export function getAllProjekti() {
  return data.projekti.map(p=>({...p, broj_statista:data.statista_projekti.filter(sp=>sp.projekat_id===p.id).length})).sort((a,b)=>new Date(b.created_at)-new Date(a.created_at))
}
export function getProjekatById(id) { const p=data.projekti.find(r=>r.id===id); if(!p) return null; return {...p,statisti:getStatistaByProjekat(id)} }
export function createProjekat(d) {
  const id=nextId('projekti')
  data.projekti.push({id,naziv:d.naziv,opis:d.opis||null,reziser:d.reziser||null,produkcija:d.produkcija||null,lokacija:d.lokacija||null,datum_pocetka:d.datum_pocetka||null,datum_zavrsetka:d.datum_zavrsetka||null,status:d.status||'aktivan',tip:d.tip||'film',budzet:d.budzet||null,napomena:d.napomena||null,slika:d.slika||null,created_at:now()})
  save(); return id
}
export function updateProjekat(id, d) { const idx=data.projekti.findIndex(r=>r.id===id); if(idx===-1) return; data.projekti[idx]={...data.projekti[idx],...d,id}; save() }
export function deleteProjekat(id) { data.statista_projekti=data.statista_projekti.filter(sp=>sp.projekat_id!==id); data.projekti=data.projekti.filter(r=>r.id!==id); save() }
export function setProjekatSlika(id, filename) {
  const idx = data.projekti.findIndex(r => r.id === id)
  if (idx !== -1) { data.projekti[idx].slika = filename; save() }
}
export function clearProjekatSlika(id) {
  const idx = data.projekti.findIndex(r => r.id === id)
  if (idx !== -1) { const old = data.projekti[idx].slika; data.projekti[idx].slika = null; save(); return old }
  return null
}
export function addStatistaToProjekat(statistaId, projekatId, d={}) {
  const ei=data.statista_projekti.findIndex(sp=>sp.statista_id===statistaId&&sp.projekat_id===projekatId)
  const rec={id:ei===-1?nextId('statista_projekti'):data.statista_projekti[ei].id,statista_id:statistaId,projekat_id:projekatId,uloga:d.uloga||null,datum_snimanja:d.datum_snimanja||null,honorar:d.honorar||null,napomena:d.napomena||null,status:d.status||'potvrdjen'}
  if(ei===-1) data.statista_projekti.push(rec); else data.statista_projekti[ei]=rec; save()
}
export function removeStatistaFromProjekat(statistaId, projekatId) { data.statista_projekti=data.statista_projekti.filter(sp=>!(sp.statista_id===statistaId&&sp.projekat_id===projekatId)); save() }
export function getStatistaByProjekat(projekatId) {
  return data.statista_projekti.filter(sp=>sp.projekat_id===projekatId).map(sp=>{
    const s=data.statisti.find(s=>s.id===sp.statista_id); if(!s) return null
    const foto=data.fotografije.find(f=>f.statista_id===s.id&&f.je_profilna)
    return {...s,...sp,sp_status:sp.status,profilna_slika:foto?foto.filename:null}
  }).filter(Boolean).sort((a,b)=>(a.prezime||'').localeCompare(b.prezime||''))
}

// ─── RASPOREDI ───────────────────────────────────────────────────────────────
export function getAllRasporedi(filters={}) {
  let rows = [...data.rasporedi]
  if (filters.projekat_id) rows=rows.filter(r=>r.projekat_id===parseInt(filters.projekat_id))
  if (filters.datum_od)    rows=rows.filter(r=>r.datum>=filters.datum_od)
  if (filters.datum_do)    rows=rows.filter(r=>r.datum<=filters.datum_do)
  if (filters.status)      rows=rows.filter(r=>r.status===filters.status)
  rows.sort((a,b)=>a.datum.localeCompare(b.datum)||(a.vrijeme_pocetka||'').localeCompare(b.vrijeme_pocetka||''))
  return rows.map(r=>{
    const p=data.projekti.find(p=>p.id===r.projekat_id)
    const statisti=data.raspored_statisti.filter(rs=>rs.raspored_id===r.id)
    return {...r,projekat_naziv:p?p.naziv:null,broj_statista:statisti.length,potvrdeno:statisti.filter(rs=>rs.status==='potvrdjen').length}
  })
}
export function getRasporedById(id) {
  const r=data.rasporedi.find(r=>r.id===id); if(!r) return null
  const p=data.projekti.find(p=>p.id===r.projekat_id)
  const statisti=data.raspored_statisti.filter(rs=>rs.raspored_id===id).map(rs=>{
    const s=data.statisti.find(s=>s.id===rs.statista_id); if(!s) return null
    const foto=data.fotografije.find(f=>f.statista_id===s.id&&f.je_profilna)
    return {...s,...rs,profilna_slika:foto?foto.filename:null}
  }).filter(Boolean).sort((a,b)=>(a.prezime||'').localeCompare(b.prezime||''))
  return {...r,projekat_naziv:p?p.naziv:null,statisti}
}
export function createRaspored(d) {
  const id=nextId('rasporedi')
  data.rasporedi.push({id,naziv:d.naziv,projekat_id:d.projekat_id||null,datum:d.datum,vrijeme_pocetka:d.vrijeme_pocetka||null,vrijeme_zavrsetka:d.vrijeme_zavrsetka||null,lokacija:d.lokacija||null,opis:d.opis||null,napomena:d.napomena||null,status:d.status||'planirano',created_at:now()})
  logActivity('raspored_kreiran',`Dodan raspored: ${d.naziv} (${d.datum})`)
  save(); return id
}
export function updateRaspored(id, d) { const idx=data.rasporedi.findIndex(r=>r.id===id); if(idx===-1) return; data.rasporedi[idx]={...data.rasporedi[idx],...d,id}; save() }
export function deleteRaspored(id) { data.raspored_statisti=data.raspored_statisti.filter(rs=>rs.raspored_id!==id); data.rasporedi=data.rasporedi.filter(r=>r.id!==id); save() }
export function addStatistaToRaspored(statistaId, rasporedId, status='pozvan') {
  const ei=data.raspored_statisti.findIndex(rs=>rs.statista_id===statistaId&&rs.raspored_id===rasporedId)
  const rec={id:ei===-1?nextId('raspored_statisti'):data.raspored_statisti[ei].id,statista_id:statistaId,raspored_id:rasporedId,status,napomena:null}
  if(ei===-1) data.raspored_statisti.push(rec); else data.raspored_statisti[ei]=rec; save()
}
export function updateRasporedStatistaStatus(statistaId, rasporedId, status) {
  const rs=data.raspored_statisti.find(rs=>rs.statista_id===statistaId&&rs.raspored_id===rasporedId)
  if(rs) { rs.status=status; save() }
}
export function removeStatistaFromRaspored(statistaId, rasporedId) { data.raspored_statisti=data.raspored_statisti.filter(rs=>!(rs.statista_id===statistaId&&rs.raspored_id===rasporedId)); save() }

// ─── HONORARI ────────────────────────────────────────────────────────────────
export function getAllHonorari(filters={}) {
  let rows = [...data.honorari]
  if (filters.statista_id) rows=rows.filter(h=>h.statista_id===parseInt(filters.statista_id))
  if (filters.projekat_id) rows=rows.filter(h=>h.projekat_id===parseInt(filters.projekat_id))
  if (filters.status)      rows=rows.filter(h=>h.status===filters.status)
  rows.sort((a,b)=>new Date(b.created_at)-new Date(a.created_at))
  return rows.map(h=>{
    const s=data.statisti.find(s=>s.id===h.statista_id)
    const p=data.projekti.find(p=>p.id===h.projekat_id)
    const foto=s?data.fotografije.find(f=>f.statista_id===s.id&&f.je_profilna):null
    return {...h,statista_ime:s?`${s.prezime} ${s.ime}`:null,projekat_naziv:p?p.naziv:null,profilna_slika:foto?foto.filename:null}
  })
}
export function createHonorar(d) {
  const id=nextId('honorari')
  data.honorari.push({id,statista_id:d.statista_id,projekat_id:d.projekat_id||null,raspored_id:d.raspored_id||null,iznos:parseFloat(d.iznos)||0,valuta:d.valuta||'BAM',status:d.status||'ceka',datum_isplate:d.datum_isplate||null,opis:d.opis||null,created_at:now()})
  save(); return id
}
export function updateHonorar(id, d) { const idx=data.honorari.findIndex(h=>h.id===id); if(idx===-1) return; data.honorari[idx]={...data.honorari[idx],...d,id}; save() }
export function deleteHonorar(id) { data.honorari=data.honorari.filter(h=>h.id!==id); save() }
export function bulkPlatiHonorare(ids) {
  const today=new Date().toISOString().split('T')[0]
  for(const id of ids){const idx=data.honorari.findIndex(h=>h.id===id);if(idx!==-1){data.honorari[idx].status='placeno';data.honorari[idx].datum_isplate=today}}
  save()
}
export function getFinansijeStats() {
  const uk=data.honorari.reduce((s,h)=>s+(h.iznos||0),0)
  const placeno=data.honorari.filter(h=>h.status==='placeno').reduce((s,h)=>s+(h.iznos||0),0)
  const ceka=data.honorari.filter(h=>h.status==='ceka').reduce((s,h)=>s+(h.iznos||0),0)
  const byProjekat=data.projekti.map(p=>({...p,uk_honorar:data.honorari.filter(h=>h.projekat_id===p.id).reduce((s,h)=>s+(h.iznos||0),0),ceka:data.honorari.filter(h=>h.projekat_id===p.id&&h.status==='ceka').reduce((s,h)=>s+(h.iznos||0),0)})).filter(p=>p.uk_honorar>0).sort((a,b)=>b.uk_honorar-a.uk_honorar)
  return {uk_ukupno:uk,uk_placeno:placeno,uk_ceka:ceka,broj_neplacenih:data.honorari.filter(h=>h.status==='ceka').length,by_projekat:byProjekat}
}

// ─── GRUPE ───────────────────────────────────────────────────────────────────
export function getAllGrupe() {
  return data.grupe.map(g=>({...g,broj_clanova:data.grupa_statisti.filter(gs=>gs.grupa_id===g.id).length})).sort((a,b)=>a.naziv.localeCompare(b.naziv))
}
export function createGrupa(d) {
  const id=nextId('grupe')
  data.grupe.push({id,naziv:d.naziv,opis:d.opis||null,boja:d.boja||'#f59e0b',created_at:now()})
  save(); return id
}
export function updateGrupa(id, d) { const idx=data.grupe.findIndex(g=>g.id===id); if(idx===-1) return; data.grupe[idx]={...data.grupe[idx],...d,id}; save() }
export function deleteGrupa(id) { data.grupa_statisti=data.grupa_statisti.filter(gs=>gs.grupa_id!==id); data.grupe=data.grupe.filter(g=>g.id!==id); save() }
export function addStatistaToGrupa(statistaId, grupaId) {
  if(!data.grupa_statisti.find(gs=>gs.statista_id===statistaId&&gs.grupa_id===grupaId)) { data.grupa_statisti.push({id:nextId('grupa_statisti'),statista_id:statistaId,grupa_id:grupaId}); save() }
}
export function removeStatistaFromGrupa(statistaId, grupaId) { data.grupa_statisti=data.grupa_statisti.filter(gs=>!(gs.statista_id===statistaId&&gs.grupa_id===grupaId)); save() }
export function getStatistaByGrupa(grupaId) {
  return data.grupa_statisti.filter(gs=>gs.grupa_id===grupaId).map(gs=>{
    const s=data.statisti.find(s=>s.id===gs.statista_id); if(!s) return null
    const foto=data.fotografije.find(f=>f.statista_id===s.id&&f.je_profilna)
    return {...s,profilna_slika:foto?foto.filename:null}
  }).filter(Boolean).sort((a,b)=>(a.prezime||'').localeCompare(b.prezime||''))
}
export function bulkAddToGrupa(statistaIds, grupaId) { for(const id of statistaIds) addStatistaToGrupa(id,grupaId) }

// ─── KONTAKT LOG ─────────────────────────────────────────────────────────────
export function addKontaktLog(statistaId, d) {
  const id=nextId('kontakt_log')
  data.kontakt_log.push({id,statista_id:statistaId,tip:d.tip||'poziv',napomena:d.napomena||'',datum:d.datum||now(),created_at:now()})
  save(); return id
}
export function deleteKontaktLog(id) { data.kontakt_log=data.kontakt_log.filter(k=>k.id!==id); save() }

// ─── NOTIFIKACIJE ────────────────────────────────────────────────────────────
export function getNotifikacije() {
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  const notes = []

  // 1. Neplaćeni honorari stariji od 14 dana
  const stariNeplaceni = data.honorari.filter(h => {
    if (h.status !== 'ceka') return false
    const daysOld = (today - new Date(h.created_at)) / 86400000
    return daysOld > 14
  })
  if (stariNeplaceni.length > 0) {
    notes.push({ id:'hon_old', tip:'warning', naslov:`${stariNeplaceni.length} neplaćenih honorara`, opis:'Honorari čekaju isplatu više od 14 dana', link:'finansije' })
  }

  // 2. Raspored danas
  const danasnji = data.rasporedi.filter(r => r.datum === todayStr && r.status !== 'otkazano')
  for (const r of danasnji) {
    const br = data.raspored_statisti.filter(rs => rs.raspored_id === r.id).length
    notes.push({ id:`rasp_${r.id}`, tip:'info', naslov:`Snimanje danas: ${r.naziv}`, opis:`${br} statista, ${r.lokacija||'lokacija nije navedena'}`, link:'rasporedi' })
  }

  // 3. Raspored sutra
  const sutra = new Date(today); sutra.setDate(sutra.getDate()+1)
  const sutraStr = sutra.toISOString().split('T')[0]
  const sutrasnji = data.rasporedi.filter(r => r.datum === sutraStr && r.status !== 'otkazano')
  for (const r of sutrasnji) {
    notes.push({ id:`rasp_sut_${r.id}`, tip:'info', naslov:`Snimanje sutra: ${r.naziv}`, opis:r.lokacija||'', link:'rasporedi' })
  }

  // 4. Rođendani ove sedmice
  const next7 = Array.from({length:7},(_,i)=>{ const d=new Date(today); d.setDate(d.getDate()+i); return `${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` })
  for (const s of data.statisti) {
    if (!s.datum_rodjenja) continue
    const mmdd = s.datum_rodjenja.slice(5)
    if (next7.includes(mmdd)) {
      const age = today.getFullYear() - new Date(s.datum_rodjenja).getFullYear()
      const isToday = mmdd === `${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`
      notes.push({ id:`bday_${s.id}`, tip: isToday?'success':'info', naslov:`${isToday?'🎂 Danas':'Uskoro'} rođendan: ${s.ime} ${s.prezime}`, opis:`Puni ${age} godina`, link:'statisti', statista_id:s.id })
    }
  }

  // 5. Statisti bez kontakta (telefon i email prazni)
  const bezKontakta = data.statisti.filter(s => s.status==='aktivan' && !s.telefon && !s.email).length
  if (bezKontakta > 0) {
    notes.push({ id:'no_contact', tip:'warning', naslov:`${bezKontakta} statista bez kontakta`, opis:'Aktivni statisti bez telefona niti e-maila', link:'statisti' })
  }

  return notes
}

// ─── BRZI POZIV ──────────────────────────────────────────────────────────────
export function getBrziPozivLista(statistaIds) {
  return statistaIds.map(id => {
    const s = data.statisti.find(s=>s.id===id); if(!s) return null
    const foto = data.fotografije.find(f=>f.statista_id===id&&f.je_profilna)
    return { id:s.id, ime:s.ime, prezime:s.prezime, telefon:s.telefon, email:s.email, profilna_slika:foto?foto.filename:null }
  }).filter(Boolean)
}

// ─── STATISTIKE ──────────────────────────────────────────────────────────────
export function getStatistike() {
  const now2 = new Date()
  const thisMonth = `${now2.getFullYear()}-${String(now2.getMonth()+1).padStart(2,'0')}`
  const prevMonth = new Date(now2.getFullYear(), now2.getMonth()-1, 1)
  const prevMonthStr = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth()+1).padStart(2,'0')}`

  // Aktivnosti po danima (zadnjih 30 dana)
  const aktivnostiByDay = {}
  for (let i=29; i>=0; i--) {
    const d=new Date(now2); d.setDate(d.getDate()-i)
    const k=d.toISOString().split('T')[0]
    aktivnostiByDay[k] = data.statisti.filter(s=>s.created_at&&s.created_at.startsWith(k)).length
  }

  return {
    ukupno_statista: data.statisti.length,
    aktivnih: data.statisti.filter(s=>s.status==='aktivan').length,
    neaktivnih: data.statisti.filter(s=>s.status==='neaktivan').length,
    ukupno_projekata: data.projekti.length,
    aktivnih_projekata: data.projekti.filter(p=>p.status==='aktivan').length,
    muskih: data.statisti.filter(s=>s.pol==='muski').length,
    zenskih: data.statisti.filter(s=>s.pol==='zenski').length,
    novi_ovaj_mesec: data.statisti.filter(s=>(s.created_at||'').startsWith(thisMonth)).length,
    novi_prosli_mesec: data.statisti.filter(s=>(s.created_at||'').startsWith(prevMonthStr)).length,
    sa_slikom: new Set(data.fotografije.filter(f=>f.je_profilna).map(f=>f.statista_id)).size,
    ukupno_honorara: data.honorari.reduce((s,h)=>s+(h.iznos||0),0),
    neplaceno: data.honorari.filter(h=>h.status==='ceka').reduce((s,h)=>s+(h.iznos||0),0),
    ukupno_rasporeda: data.rasporedi.length,
    ukupno_grupe: data.grupe.length,
    nedavno_dodani: [...data.statisti].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at)).slice(0,8).map(s=>{
      const foto=data.fotografije.find(f=>f.statista_id===s.id&&f.je_profilna)
      return {...s,profilna_slika:foto?foto.filename:null}
    }),
    top_projekti: data.projekti.map(p=>({...p,broj:data.statista_projekti.filter(sp=>sp.projekat_id===p.id).length})).sort((a,b)=>b.broj-a.broj).slice(0,5),
    aktivnosti: data.aktivnosti.slice(0,15).map(a=>{
      const s=data.statisti.find(s=>s.id===a.statista_id)
      return {...a,ime:s?.ime,prezime:s?.prezime}
    }),
    aktivnosti_by_day: aktivnostiByDay,
    // Distribucije za grafove
    by_pol: [ {name:'Muški',value:data.statisti.filter(s=>s.pol==='muski').length}, {name:'Ženski',value:data.statisti.filter(s=>s.pol==='zenski').length}, {name:'Ostalo',value:data.statisti.filter(s=>s.pol&&s.pol!=='muski'&&s.pol!=='zenski').length} ].filter(x=>x.value>0),
    by_status: [ {name:'Aktivni',value:data.statisti.filter(s=>s.status==='aktivan').length}, {name:'Neaktivni',value:data.statisti.filter(s=>s.status==='neaktivan').length} ],
    by_boja_kose: Object.entries(data.statisti.reduce((acc,s)=>{if(s.boja_kose){acc[s.boja_kose]=(acc[s.boja_kose]||0)+1}return acc},{})).map(([k,v])=>({name:k,value:v})).sort((a,b)=>b.value-a.value),
    notifikacije: getNotifikacije(),
  }
}

// ─── SETTINGS ────────────────────────────────────────────────────────────────
export function getSetting(key, def=null) { return data.settings[key]!==undefined?data.settings[key]:def }
export function setSetting(key, value) { data.settings[key]=String(value); save() }
export function getSearchSuggestions(query) {
  const s=query.toLowerCase()
  return data.statisti.filter(r=>(`${r.ime} ${r.prezime}`).toLowerCase().includes(s)||(`${r.prezime} ${r.ime}`).toLowerCase().includes(s)).sort((a,b)=>(a.prezime||'').localeCompare(b.prezime||'')).slice(0,8).map(r=>{const foto=data.fotografije.find(f=>f.statista_id===r.id&&f.je_profilna);return{id:r.id,ime:r.ime,prezime:r.prezime,profilna_slika:foto?foto.filename:null}})
}
export function getAllForExport(filters={}) {
  let rows=[...data.statisti]
  if(filters.status) rows=rows.filter(r=>r.status===filters.status)
  if(filters.pol) rows=rows.filter(r=>r.pol===filters.pol)
  rows.sort((a,b)=>(a.prezime||'').localeCompare(b.prezime||''))
  return rows.map(r=>{
    const foto=data.fotografije.find(f=>f.statista_id===r.id&&f.je_profilna)
    const projekti=data.statista_projekti.filter(sp=>sp.statista_id===r.id).map(sp=>data.projekti.find(p=>p.id===sp.projekat_id)?.naziv).filter(Boolean).join('; ')
    const uk_honorar=data.honorari.filter(h=>h.statista_id===r.id).reduce((s,h)=>s+(h.iznos||0),0)
    return{...r,profilna_slika:foto?foto.filename:null,svi_projekti:projekti||null,uk_honorar}
  })
}
