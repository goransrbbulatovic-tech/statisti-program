import { app, shell, BrowserWindow, protocol, net, ipcMain, dialog } from 'electron'
import path from 'path'
import { pathToFileURL } from 'url'
import { existsSync, mkdirSync, appendFileSync } from 'fs'
import { setupDatabase } from './database'
import { registerIpcHandlers } from './ipc-handlers'

// ── CRITICAL: Fix userData path BEFORE anything else ──────────────────────
// Always use "ACMigo" folder regardless of productName changes
// This keeps data intact across version updates
app.setPath('userData', path.join(app.getPath('appData'), 'ACMigo'))

let mainWindow

protocol.registerSchemesAsPrivileged([
  { scheme: 'photo', privileges: { secure: true, supportFetchAPI: true, bypassCSP: true, corsEnabled: true } },
  { scheme: 'bg',    privileges: { secure: true, supportFetchAPI: true, bypassCSP: true, corsEnabled: true } }
])

function writeLog(msg) {
  try {
    appendFileSync(path.join(app.getPath('userData'), 'acmigo-log.txt'),
      `[${new Date().toISOString()}] ${msg}\n`)
  } catch {}
}

function createWindow() {
  writeLog(`createWindow() userData=${app.getPath('userData')}`)

  const photosDir = path.join(app.getPath('userData'), 'photos')
  if (!existsSync(photosDir)) mkdirSync(photosDir, { recursive: true })

  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 680,
    show: false,
    frame: false,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    backgroundColor: '#0a0a14',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  // Show when ready
  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    mainWindow.focus()
  })

  // Fallback show after 4s
  const showFallback = setTimeout(() => {
    if (mainWindow && !mainWindow.isDestroyed() && !mainWindow.isVisible()) {
      mainWindow.show()
      mainWindow.focus()
    }
  }, 4000)
  mainWindow.once('show', () => clearTimeout(showFallback))

  mainWindow.webContents.on('did-finish-load', () => writeLog('Renderer OK'))
  mainWindow.webContents.on('did-fail-load', (e, code, desc) => {
    writeLog(`Load failed: ${code} ${desc}`)
    if (!mainWindow.isDestroyed() && !mainWindow.isVisible()) mainWindow.show()
  })
  mainWindow.webContents.on('render-process-gone', (e, details) => {
    writeLog(`Renderer gone: ${details.reason}`)
    if (!mainWindow.isDestroyed() && !mainWindow.isVisible()) mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  ipcMain.on('window:minimize', () => mainWindow?.minimize())
  ipcMain.on('window:maximize', () => {
    if (mainWindow?.isMaximized()) mainWindow.unmaximize()
    else mainWindow?.maximize()
  })
  ipcMain.on('window:close', () => mainWindow?.close())
  ipcMain.handle('window:isMaximized', () => mainWindow?.isMaximized() || false)
  mainWindow.on('maximize',   () => mainWindow.webContents.send('window:maximized', true))
  mainWindow.on('unmaximize', () => mainWindow.webContents.send('window:maximized', false))

  const htmlPath = path.join(__dirname, '../renderer/index.html')
  writeLog(`Loading: ${htmlPath} exists=${existsSync(htmlPath)}`)
  mainWindow.loadFile(htmlPath)
}

app.whenReady().then(() => {
  writeLog('app ready')

  // bg:// protocol for background images
  protocol.handle('bg', (request) => {
    const filename = decodeURIComponent(request.url.replace('bg://', ''))
    const filePath = path.join(app.getPath('userData'), 'backgrounds', filename)
    return net.fetch(pathToFileURL(filePath).href)
  })

  protocol.handle('photo', (request) => {
    const filename = decodeURIComponent(request.url.replace('photo://', ''))
    const filePath = path.join(app.getPath('userData'), 'photos', filename)
    return net.fetch(pathToFileURL(filePath).href)
  })

  try { setupDatabase(); writeLog('DB ok') }
  catch (err) { writeLog(`DB error: ${err.message}`) }

  createWindow()

  try { registerIpcHandlers(() => mainWindow); writeLog('IPC ok') }
  catch (err) { writeLog(`IPC error: ${err.message}`) }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
}).catch(err => writeLog(`whenReady error: ${err.message}`))

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

process.on('uncaughtException', (err) => {
  writeLog(`Uncaught: ${err.message}\n${err.stack}`)
})
