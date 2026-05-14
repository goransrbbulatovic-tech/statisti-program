import React, { useState, useEffect, createContext, useContext, useCallback, useRef } from 'react'
import TitleBar from './components/TitleBar'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import StatistaList from './components/StatistaList'
import StatistaForm from './components/StatistaForm'
import StatistaProfile from './components/StatistaProfile'
import ProjektiPage from './components/ProjektiPage'
import RasporedPage from './components/RasporedPage'
import FinansijePage from './components/FinansijePage'
import GrupePage from './components/GrupePage'
import IzvjestajiPage from './components/IzvjestajiPage'
import Settings from './components/Settings'
import Toast from './components/Toast'

// ─── BACKGROUND ENGINE ──────────────────────────────────────────────────────
import { applyBg as applyBgToDom } from './utils/bgEngine'

export const AppContext = createContext(null)
export const useApp = () => useContext(AppContext)

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => { const t=setTimeout(()=>setDebounced(value),delay); return ()=>clearTimeout(t) }, [value, delay])
  return debounced
}

export default function App() {
  const [page, setPage]             = useState('dashboard')
  const [pageParams, setPageParams] = useState({})
  const [statisti, setStatisti]     = useState([])
  const [projekti, setProjekti]     = useState([])
  const [statistike, setStatistike] = useState(null)
  const [loading, setLoading]       = useState(false)
  const [search, setSearch]         = useState('')
  const [filters, setFilters]       = useState({})
  const [toasts, setToasts]         = useState([])
  const [selected, setSelected]     = useState([])
  const [theme, setTheme]           = useState('cinema')
  const [bgTheme, setBgTheme]       = useState('none')
  const [bgCustomUrl, setBgCustomUrl] = useState(null)
  const toastId = useRef(0)
  const debouncedSearch = useDebounce(search, 280)

  const navigate = useCallback((p, params={}) => { setPage(p); setPageParams(params); setSelected([]) }, [])

  const toast = useCallback((msg, type='success', duration=3000) => {
    const id = ++toastId.current
    setToasts(prev=>[...prev,{id,msg,type}])
    setTimeout(()=>setToasts(prev=>prev.filter(t=>t.id!==id)), duration)
  }, [])

  const loadStatisti = useCallback(async (q, f) => {
    setLoading(true)
    try { const data=await window.api.getStatisti(q??debouncedSearch, f??filters); setStatisti(data||[]) }
    catch(e) { console.error(e); toast('Greška pri učitavanju','error') }
    finally { setLoading(false) }
  }, [debouncedSearch, filters, toast])

  const loadProjekti = useCallback(async () => {
    try { const data=await window.api.getProjekti(); setProjekti(data||[]) } catch(e){console.error(e)}
  }, [])

  const loadStatistike = useCallback(async () => {
    try { const data=await window.api.getStatistike(); setStatistike(data) } catch(e){console.error(e)}
  }, [])

  const refresh = useCallback(() => { loadStatisti(); loadProjekti(); loadStatistike() }, [loadStatisti, loadProjekti, loadStatistike])

  const applyBg = useCallback((bg, customUrl = null) => {
    const id = bg || 'none'
    const url = customUrl || null
    applyBgToDom(id, url)
    setBgTheme(id)
    if (url) setBgCustomUrl(url)
    window.api?.setSetting?.('bg_theme', id)
  }, [])

  const applyTheme = useCallback((t) => {
    document.documentElement.setAttribute('data-theme', t)
    setTheme(t)
    window.api?.setSetting?.('theme', t)
  }, [])

  useEffect(() => { loadStatisti(debouncedSearch, filters) }, [debouncedSearch, filters])

  useEffect(() => {
    loadProjekti()
    loadStatistike()
    window.api?.getSetting?.('theme','cinema').then(t=>{ const saved=t||'cinema'; document.documentElement.setAttribute('data-theme',saved); setTheme(saved) }).catch(()=>document.documentElement.setAttribute('data-theme','cinema'))
    // Load saved background
    window.api?.getSetting?.('bg_theme','none').then(async bg => {
      if (bg && bg !== 'none') {
        if (bg === 'custom') {
          const filename = await window.api?.getCustomBg?.()
          if (filename) {
            const url = `bg://${filename}`
            applyBgToDom('custom', url)
            setBgCustomUrl(url)
            setBgTheme('custom')
          }
        } else {
          applyBgToDom(bg)
          setBgTheme(bg)
        }
      }
    }).catch(() => {})
    window.api.onDbRestored?.(() => toast('Baza vraćena! Restartujte aplikaciju.','info',6000))
  }, [])

  const ctx = { page, navigate, pageParams, statisti, projekti, statistike, loading, search, setSearch, filters, setFilters, selected, setSelected, refresh, loadStatisti, loadProjekti, loadStatistike, toast, theme, applyTheme }

  const renderPage = () => {
    switch(page) {
      case 'dashboard':        return <Dashboard/>
      case 'statisti':         return <StatistaList/>
      case 'statista-new':     return <StatistaForm/>
      case 'statista-edit':    return <StatistaForm id={pageParams.id}/>
      case 'statista-profile': return <StatistaProfile id={pageParams.id}/>
      case 'projekti':         return <ProjektiPage/>
      case 'rasporedi':        return <RasporedPage/>
      case 'finansije':        return <FinansijePage/>
      case 'grupe':            return <GrupePage/>
      case 'izvjestaji':       return <IzvjestajiPage/>
      case 'settings':         return <Settings/>
      default:                 return <Dashboard/>
    }
  }

  return (
    <AppContext.Provider value={ctx}>
      <div className="flex flex-col h-screen bg-[#0a0a14] overflow-hidden">
        <TitleBar/>
        <div className="flex flex-1 overflow-hidden">
          <Sidebar/>
          <main className="flex-1 overflow-y-auto scrollbar-thin bg-[#0a0a14]">
            <div className="animate-fade-in">{renderPage()}</div>
          </main>
        </div>
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
          {toasts.map(t=><Toast key={t.id} {...t}/>)}
        </div>
      </div>
    </AppContext.Provider>
  )
}
