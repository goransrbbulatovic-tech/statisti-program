const { contextBridge, ipcRenderer } = require('electron')

const api = {
  // Statisti
  getStatisti:(s,f)=>ipcRenderer.invoke('statisti:getAll',s,f),
  getStatista:(id)=>ipcRenderer.invoke('statisti:getById',id),
  createStatista:(d)=>ipcRenderer.invoke('statisti:create',d),
  updateStatista:(id,d)=>ipcRenderer.invoke('statisti:update',id,d),
  deleteStatista:(id)=>ipcRenderer.invoke('statisti:delete',id),
  bulkDelete:(ids)=>ipcRenderer.invoke('statisti:bulkDelete',ids),
  bulkStatus:(ids,s)=>ipcRenderer.invoke('statisti:bulkStatus',ids,s),
  getSuggestions:(q)=>ipcRenderer.invoke('statisti:suggestions',q),
  getForExport:(f)=>ipcRenderer.invoke('statisti:forExport',f),
  // Photos
  selectPhotos:()=>ipcRenderer.invoke('photos:select'),
  addPhoto:(sId,path,isP)=>ipcRenderer.invoke('photos:add',sId,path,isP),
  deletePhoto:(id)=>ipcRenderer.invoke('photos:delete',id),
  setProfilePhoto:(fId,sId)=>ipcRenderer.invoke('photos:setProfile',fId,sId),
  // Projekti
  getProjekti:()=>ipcRenderer.invoke('projekti:getAll'),
  uploadProjekatSlika:(id)=>ipcRenderer.invoke('projekti:uploadSlika',id),
  deleteProjekatSlika:(id)=>ipcRenderer.invoke('projekti:deleteSlika',id),
  getProjekat:(id)=>ipcRenderer.invoke('projekti:getById',id),
  createProjekat:(d)=>ipcRenderer.invoke('projekti:create',d),
  updateProjekat:(id,d)=>ipcRenderer.invoke('projekti:update',id,d),
  deleteProjekat:(id)=>ipcRenderer.invoke('projekti:delete',id),
  addStatistaToProjekat:(sId,pId,d)=>ipcRenderer.invoke('projekti:addStatista',sId,pId,d),
  removeStatistaFromProjekat:(sId,pId)=>ipcRenderer.invoke('projekti:removeStatista',sId,pId),
  getStatistaByProjekat:(pId)=>ipcRenderer.invoke('projekti:getStatisti',pId),
  // Rasporedi
  getRasporedi:(f)=>ipcRenderer.invoke('rasporedi:getAll',f),
  getRaspored:(id)=>ipcRenderer.invoke('rasporedi:getById',id),
  createRaspored:(d)=>ipcRenderer.invoke('rasporedi:create',d),
  updateRaspored:(id,d)=>ipcRenderer.invoke('rasporedi:update',id,d),
  deleteRaspored:(id)=>ipcRenderer.invoke('rasporedi:delete',id),
  addStatistaToRaspored:(sId,rId,st)=>ipcRenderer.invoke('rasporedi:addStatista',sId,rId,st),
  updateRasporedStatus:(sId,rId,st)=>ipcRenderer.invoke('rasporedi:updateStatus',sId,rId,st),
  removeStatistaFromRaspored:(sId,rId)=>ipcRenderer.invoke('rasporedi:removeStatista',sId,rId),
  // Honorari
  getHonorari:(f)=>ipcRenderer.invoke('honorari:getAll',f),
  createHonorar:(d)=>ipcRenderer.invoke('honorari:create',d),
  updateHonorar:(id,d)=>ipcRenderer.invoke('honorari:update',id,d),
  deleteHonorar:(id)=>ipcRenderer.invoke('honorari:delete',id),
  bulkPlatiHonorare:(ids)=>ipcRenderer.invoke('honorari:bulkPlati',ids),
  getFinansijeStats:()=>ipcRenderer.invoke('honorari:stats'),
  // Grupe
  getGrupe:()=>ipcRenderer.invoke('grupe:getAll'),
  createGrupa:(d)=>ipcRenderer.invoke('grupe:create',d),
  updateGrupa:(id,d)=>ipcRenderer.invoke('grupe:update',id,d),
  deleteGrupa:(id)=>ipcRenderer.invoke('grupe:delete',id),
  addStatistaToGrupa:(sId,gId)=>ipcRenderer.invoke('grupe:addStatista',sId,gId),
  removeStatistaFromGrupa:(sId,gId)=>ipcRenderer.invoke('grupe:removeStatista',sId,gId),
  getStatistaByGrupa:(gId)=>ipcRenderer.invoke('grupe:getStatisti',gId),
  bulkAddToGrupa:(ids,gId)=>ipcRenderer.invoke('grupe:bulkAdd',ids,gId),
  // Kontakt log
  addKontaktLog:(sId,d)=>ipcRenderer.invoke('kontakt:add',sId,d),
  deleteKontaktLog:(id)=>ipcRenderer.invoke('kontakt:delete',id),
  // Brzi poziv
  getBrziPozivLista:(ids)=>ipcRenderer.invoke('brziPoziv:getLista',ids),
  // Stats
  getStatistike:()=>ipcRenderer.invoke('app:statistike'),
  getNotifikacije:()=>ipcRenderer.invoke('app:notifikacije'),
  // Export
  savePdf:(b64)=>ipcRenderer.invoke('export:savePdf',b64),
  saveExcel:(b64)=>ipcRenderer.invoke('export:saveExcel',b64),
  saveDnevniRaspored:(b64,n)=>ipcRenderer.invoke('export:saveDnevniRaspored',b64,n),
  getPhotoBase64:(f)=>ipcRenderer.invoke('export:getPhotoBase64',f),
  // DB
  backupDb:()=>ipcRenderer.invoke('db:backup'),
  restoreDb:()=>ipcRenderer.invoke('db:restore'),
  openPhotosFolder:()=>ipcRenderer.invoke('db:exportPhotosBackup'),
  // App
  getVersion:()=>ipcRenderer.invoke('app:version'),
  getDataPath:()=>ipcRenderer.invoke('app:dataPath'),
  openDataFolder:()=>ipcRenderer.invoke('app:openDataFolder'),
  getSetting:(k,d)=>ipcRenderer.invoke('settings:get',k,d),
  setSetting:(k,v)=>ipcRenderer.invoke('settings:set',k,v),
  // Background image
  uploadBgImage: () => ipcRenderer.invoke('bg:upload'),
  getCustomBg: () => ipcRenderer.invoke('bg:getCustom'),
  deleteCustomBg: () => ipcRenderer.invoke('bg:deleteCustom'),
  // Window
  minimize:()=>ipcRenderer.send('window:minimize'),
  maximize:()=>ipcRenderer.send('window:maximize'),
  close:()=>ipcRenderer.send('window:close'),
  isMaximized:()=>ipcRenderer.invoke('window:isMaximized'),
  onMaximized:(cb)=>ipcRenderer.on('window:maximized',(_,v)=>cb(v)),
  onDbRestored:(cb)=>ipcRenderer.on('db:restored',cb),
}

try { contextBridge.exposeInMainWorld('api', api) } catch(e) { console.error('Preload error:',e) }
