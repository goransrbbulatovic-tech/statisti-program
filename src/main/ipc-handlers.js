import { ipcMain, dialog, app, shell } from 'electron'
import { join, extname } from 'path'
import { copyFileSync, unlinkSync, existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs'
import * as db from './database'

export function registerIpcHandlers(getWindow) {
  // ─── STATISTI ───────────────────────────────────────────────────────────────
  ipcMain.handle('statisti:getAll',    (_, s, f)    => db.getAllStatisti(s||'', f||{}))
  ipcMain.handle('statisti:getById',   (_, id)      => db.getStatistaById(id))
  ipcMain.handle('statisti:create',    (_, d)       => db.createStatista(sanitize(d)))
  ipcMain.handle('statisti:update',    (_, id, d)   => { db.updateStatista(id, sanitize(d)); return true })
  ipcMain.handle('statisti:delete',    (_, id)      => { const photos=db.deleteStatista(id); delPhotos(photos); return true })
  ipcMain.handle('statisti:bulkDelete',(_, ids)     => { const photos=db.bulkDeleteStatisti(ids); delPhotos(photos); return true })
  ipcMain.handle('statisti:bulkStatus',(_, ids, s)  => { db.bulkUpdateStatus(ids, s); return true })
  ipcMain.handle('statisti:suggestions',(_, q)      => db.getSearchSuggestions(q))
  ipcMain.handle('statisti:forExport', (_, f)       => db.getAllForExport(f||{}))

  // ─── PHOTOS ─────────────────────────────────────────────────────────────────
  ipcMain.handle('photos:select', async () => {
    const r = await dialog.showOpenDialog(getWindow(), { title:'Odaberi fotografije', properties:['openFile','multiSelections'], filters:[{name:'Slike',extensions:['jpg','jpeg','png','webp','gif','bmp']}] })
    return r.canceled ? [] : r.filePaths
  })
  ipcMain.handle('photos:add', (_, sId, filePath, isProfile) => {
    const photosDir=join(app.getPath('userData'),'photos')
    if(!existsSync(photosDir)) mkdirSync(photosDir,{recursive:true})
    const ext=extname(filePath).toLowerCase()||'.jpg'
    const filename=`${sId}_${Date.now()}${ext}`
    copyFileSync(filePath, join(photosDir,filename))
    const id=db.addFotografija(sId,filename,Boolean(isProfile))
    return {id,filename}
  })
  ipcMain.handle('photos:delete',     (_, id)           => { const f=db.deleteFotografija(id); if(f){const p=join(app.getPath('userData'),'photos',f.filename);if(existsSync(p))try{unlinkSync(p)}catch{}} return true })
  ipcMain.handle('photos:setProfile', (_, fId, sId)     => { db.setProfilnaSlika(fId,sId); return true })

  // ─── PROJEKTI ───────────────────────────────────────────────────────────────
  ipcMain.handle('projekti:getAll',         ()             => db.getAllProjekti())
  ipcMain.handle('projekti:getById',        (_, id)        => db.getProjekatById(id))
  ipcMain.handle('projekti:create',         (_, d)         => db.createProjekat(d))
  ipcMain.handle('projekti:update',         (_, id, d)     => { db.updateProjekat(id,d); return true })
  ipcMain.handle('projekti:delete',         (_, id)        => { db.deleteProjekat(id); return true })
  ipcMain.handle('projekti:uploadSlika', async (_, id) => {
    const win = getWindow()
    const { canceled, filePaths } = await dialog.showOpenDialog(win, {
      title: 'Odaberi sliku projekta',
      properties: ['openFile'],
      filters: [{ name: 'Slike', extensions: ['jpg','jpeg','png','webp'] }]
    })
    if (canceled || !filePaths.length) return null
    const photosDir = join(app.getPath('userData'), 'photos')
    if (!existsSync(photosDir)) mkdirSync(photosDir, { recursive: true })
    const ext = extname(filePaths[0]).toLowerCase() || '.jpg'
    const filename = `proj_${id}_${Date.now()}${ext}`
    copyFileSync(filePaths[0], join(photosDir, filename))
    // Delete old slika if exists
    const oldFilename = db.clearProjekatSlika(id)
    if (oldFilename) {
      const oldPath = join(app.getPath('userData'), 'photos', oldFilename)
      if (existsSync(oldPath)) try { unlinkSync(oldPath) } catch {}
    }
    db.setProjekatSlika(id, filename)
    return filename
  })

  ipcMain.handle('projekti:deleteSlika', (_, id) => {
    const filename = db.clearProjekatSlika(id)
    if (filename) {
      const p = join(app.getPath('userData'), 'photos', filename)
      if (existsSync(p)) try { unlinkSync(p) } catch {}
    }
    return true
  })

  ipcMain.handle('projekti:addStatista',    (_, sId,pId,d) => { db.addStatistaToProjekat(sId,pId,d||{}); return true })
  ipcMain.handle('projekti:removeStatista', (_, sId,pId)   => { db.removeStatistaFromProjekat(sId,pId); return true })
  ipcMain.handle('projekti:getStatisti',    (_, pId)       => db.getStatistaByProjekat(pId))

  // ─── RASPOREDI ──────────────────────────────────────────────────────────────
  ipcMain.handle('rasporedi:getAll',           (_, f)         => db.getAllRasporedi(f||{}))
  ipcMain.handle('rasporedi:getById',          (_, id)        => db.getRasporedById(id))
  ipcMain.handle('rasporedi:create',           (_, d)         => db.createRaspored(d))
  ipcMain.handle('rasporedi:update',           (_, id, d)     => { db.updateRaspored(id,d); return true })
  ipcMain.handle('rasporedi:delete',           (_, id)        => { db.deleteRaspored(id); return true })
  ipcMain.handle('rasporedi:addStatista',      (_, sId,rId,st)=> { db.addStatistaToRaspored(sId,rId,st); return true })
  ipcMain.handle('rasporedi:updateStatus',     (_, sId,rId,st)=> { db.updateRasporedStatistaStatus(sId,rId,st); return true })
  ipcMain.handle('rasporedi:removeStatista',   (_, sId,rId)   => { db.removeStatistaFromRaspored(sId,rId); return true })

  // ─── HONORARI ───────────────────────────────────────────────────────────────
  ipcMain.handle('honorari:getAll',   (_, f)      => db.getAllHonorari(f||{}))
  ipcMain.handle('honorari:create',   (_, d)      => db.createHonorar(d))
  ipcMain.handle('honorari:update',   (_, id, d)  => { db.updateHonorar(id,d); return true })
  ipcMain.handle('honorari:delete',   (_, id)     => { db.deleteHonorar(id); return true })
  ipcMain.handle('honorari:bulkPlati',(_, ids)    => { db.bulkPlatiHonorare(ids); return true })
  ipcMain.handle('honorari:stats',    ()          => db.getFinansijeStats())

  // ─── GRUPE ──────────────────────────────────────────────────────────────────
  ipcMain.handle('grupe:getAll',          ()            => db.getAllGrupe())
  ipcMain.handle('grupe:create',          (_, d)        => db.createGrupa(d))
  ipcMain.handle('grupe:update',          (_, id, d)    => { db.updateGrupa(id,d); return true })
  ipcMain.handle('grupe:delete',          (_, id)       => { db.deleteGrupa(id); return true })
  ipcMain.handle('grupe:addStatista',     (_, sId, gId) => { db.addStatistaToGrupa(sId,gId); return true })
  ipcMain.handle('grupe:removeStatista',  (_, sId, gId) => { db.removeStatistaFromGrupa(sId,gId); return true })
  ipcMain.handle('grupe:getStatisti',     (_, gId)      => db.getStatistaByGrupa(gId))
  ipcMain.handle('grupe:bulkAdd',         (_, ids, gId) => { db.bulkAddToGrupa(ids,gId); return true })

  // ─── KONTAKT LOG ────────────────────────────────────────────────────────────
  ipcMain.handle('kontakt:add',    (_, sId, d) => db.addKontaktLog(sId, d))
  ipcMain.handle('kontakt:delete', (_, id)     => { db.deleteKontaktLog(id); return true })

  // ─── BRZI POZIV ─────────────────────────────────────────────────────────────
  ipcMain.handle('brziPoziv:getLista', (_, ids) => db.getBrziPozivLista(ids))

  // ─── STATS & NOTIF ──────────────────────────────────────────────────────────
  ipcMain.handle('app:statistike',    () => db.getStatistike())
  ipcMain.handle('app:notifikacije',  () => db.getNotifikacije())

  // ─── EXPORT ─────────────────────────────────────────────────────────────────
  ipcMain.handle('export:savePdf', async (_, b64) => {
    const { canceled, filePath } = await dialog.showSaveDialog(getWindow(), { title:'Sačuvaj PDF', defaultPath:`ACMigo-statisti-${fmtDateTime()}.pdf`, filters:[{name:'PDF',extensions:['pdf']}] })
    if (canceled||!filePath) return null
    try { writeFileSync(filePath, Buffer.from(b64,'base64')); shell.openPath(filePath); return filePath }
    catch(err) { if(['EBUSY','EPERM','EACCES'].includes(err.code)){const alt=filePath.replace(/\.pdf$/i,`-${Date.now()}.pdf`);writeFileSync(alt,Buffer.from(b64,'base64'));shell.openPath(alt);return alt} throw err }
  })
  ipcMain.handle('export:saveExcel', async (_, b64) => {
    const { canceled, filePath } = await dialog.showSaveDialog(getWindow(), { title:'Sačuvaj Excel', defaultPath:`ACMigo-statisti-${fmtDateTime()}.xlsx`, filters:[{name:'Excel',extensions:['xlsx']}] })
    if (canceled||!filePath) return null
    try { writeFileSync(filePath, Buffer.from(b64,'base64')); shell.openPath(filePath); return filePath }
    catch(err) { if(['EBUSY','EPERM','EACCES'].includes(err.code)){const alt=filePath.replace(/\.xlsx$/i,`-${Date.now()}.xlsx`);writeFileSync(alt,Buffer.from(b64,'base64'));shell.openPath(alt);return alt} throw err }
  })
  ipcMain.handle('export:saveDnevniRaspored', async (_, b64, naziv) => {
    const { canceled, filePath } = await dialog.showSaveDialog(getWindow(), { title:'Sačuvaj raspored', defaultPath:`Raspored-${naziv||'dnevni'}-${fmtDate()}.pdf`, filters:[{name:'PDF',extensions:['pdf']}] })
    if (canceled||!filePath) return null
    writeFileSync(filePath, Buffer.from(b64,'base64')); shell.openPath(filePath); return filePath
  })
  ipcMain.handle('export:getPhotoBase64', (_, filename) => {
    if (!filename) return null
    const p=join(app.getPath('userData'),'photos',filename)
    if (!existsSync(p)) return null
    try { return readFileSync(p).toString('base64') } catch { return null }
  })

  // ─── DB ─────────────────────────────────────────────────────────────────────
  ipcMain.handle('db:backup', async () => {
    const { canceled, filePath } = await dialog.showSaveDialog(getWindow(), { title:'Backup baze', defaultPath:`ACMigo-backup-${fmtDate()}.json`, filters:[{name:'JSON baza',extensions:['json']}] })
    if (canceled||!filePath) return {success:false}
    copyFileSync(db.getDbPath(), filePath); return {success:true,path:filePath}
  })
  ipcMain.handle('db:restore', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog(getWindow(), { title:'Učitaj backup', filters:[{name:'JSON baza',extensions:['json']}] })
    if (canceled||!filePaths.length) return {success:false}
    try { copyFileSync(filePaths[0], db.getDbPath()); getWindow().webContents.send('db:restored'); return {success:true} }
    catch(err) { return {success:false,error:err.message} }
  })
  ipcMain.handle('db:exportPhotosBackup', () => { shell.openPath(join(app.getPath('userData'),'photos')); return {success:true} })

  // ─── APP ────────────────────────────────────────────────────────────────────
  ipcMain.handle('app:version',       () => app.getVersion())
  ipcMain.handle('app:dataPath',      () => app.getPath('userData'))
  ipcMain.handle('app:openDataFolder',() => shell.openPath(app.getPath('userData')))
  ipcMain.handle('settings:get',      (_, k, d) => db.getSetting(k,d))
  ipcMain.handle('settings:set',      (_, k, v) => { db.setSetting(k,v); return true })
}

// ─── BACKGROUND IMAGE ─────────────────────────────────────────────────────────

ipcMain.handle('bg:upload', async () => {
  const win = require('./index').getMainWindow?.() || null
  const result = await dialog.showOpenDialog({
    title: 'Odaberi pozadinsku sliku',
    properties: ['openFile'],
    filters: [{ name: 'Slike', extensions: ['jpg','jpeg','png','webp'] }]
  })
  if (result.canceled || !result.filePaths.length) return null
  const bgDir = join(app.getPath('userData'), 'backgrounds')
  if (!existsSync(bgDir)) mkdirSync(bgDir, { recursive: true })
  const ext = extname(result.filePaths[0]).toLowerCase() || '.jpg'
  const filename = `custom_bg${ext}`
  const dest = join(bgDir, filename)
  copyFileSync(result.filePaths[0], dest)
  return filename
})

ipcMain.handle('bg:getCustom', () => {
  const bgDir = join(app.getPath('userData'), 'backgrounds')
  for (const ext of ['jpg','jpeg','png','webp']) {
    const p = join(bgDir, `custom_bg.${ext}`)
    if (existsSync(p)) return `custom_bg.${ext}`
  }
  return null
})

ipcMain.handle('bg:deleteCustom', () => {
  const bgDir = join(app.getPath('userData'), 'backgrounds')
  for (const ext of ['jpg','jpeg','png','webp']) {
    const p = join(bgDir, `custom_bg.${ext}`)
    if (existsSync(p)) try { unlinkSync(p) } catch {}
  }
  return true
})

function sanitize(d) { const o={}; for(const [k,v] of Object.entries(d)){o[k]=(v===''||v===undefined)?null:v}; return o }
function fmtDate() { return new Date().toISOString().split('T')[0] }
function fmtDateTime() { return new Date().toISOString().replace('T','_').replace(/:/g,'-').split('.')[0] }
function delPhotos(filenames) {
  const dir=join(app.getPath('userData'),'photos')
  for(const f of filenames){const p=join(dir,f);if(existsSync(p))try{unlinkSync(p)}catch{}}
}
