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
import { getBgStyle } from './utils/bgEngine'

export const AppContext = createContext(null)
export const useApp = () => useContext(AppContext)

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

export default function App() {
  const [page, setPage]               = useState('dashboard')
  const [pageParams, setPageParams]   = useState({})
  const [statisti, setStatisti]       = useState([])
  const [projekti, setProjekti]       = useState([])
  const [statistike, setStatistike]   = useState(null)
  const [loading, setLoading]         = useState(false)
  const [search, setSearch]           = useState('')
  const [filters, setFilters]         = useState({})
  const [toasts, setToasts]           = useState([])
  const [selected, setSelected]       = useState([])
  const [theme, setTheme]             = useState('cinema')
  const [bgTheme, setBgTheme]         = useState('none')
  const [bgCustomUrl, setBgCustomUrl] = useState(null)
  const toastId = useRef(0)
  const debouncedSearch = useDebounce(search, 280)

  // Compute bg gradient from state — pure React, no DOM tricks
  const bgStyle = getBgStyle(bgTheme, bgCustomUrl)
  const hasBg = Boolean(bgStyle)

  const navigate = useCallback((p, params = {}) => {
    setPage(p); setPageParams(params); setSelected([])
  }, [])

  const toast = useCallback((msg, type = 'success', duration = 3000) => {
    const id = ++toastId.current
    setToasts(prev => [...prev, { id, msg, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration)
  }, [])

  const loadStatisti = useCallback(async (q, f) => {
    setLoading(true)
    try {
      const data = await window.api.getStatisti(q ?? debouncedSearch, f ?? filters)
      setStatisti(data || [])
    } catch (e) { toast('Greška pri učitavanju', 'error') }
    finally { setLoading(false) }
  }, [debouncedSearch, filters, toast])

  const loadProjekti  = useCallback(async () => {
    try { setProjekti((await window.api.getProjekti()) || []) } catch {}
  }, [])

  const loadStatistike = useCallback(async () => {
    try { setStatistike(await window.api.getStatistike()) } catch {}
  }, [])

  const refresh = useCallback(() => {
    loadStatisti(); loadProjekti(); loadStatistike()
  }, [loadStatisti, loadProjekti, loadStatistike])

  const applyTheme = useCallback((t) => {
    document.documentElement.setAttribute('data-theme', t)
    setTheme(t)
    window.api?.setSetting?.('theme', t)
  }, [])

  // applyBg just updates React state — the bg div re-renders automatically
  const applyBg = useCallback((bg, customUrl = null) => {
    setBgTheme(bg || 'none')
    if (customUrl) setBgCustomUrl(customUrl)
    window.api?.setSetting?.('bg_theme', bg || 'none')
  }, [])

  useEffect(() => { loadStatisti(debouncedSearch, filters) }, [debouncedSearch, filters])

  useEffect(() => {
    loadProjekti()
    loadStatistike()
    // Load saved theme
    window.api?.getSetting?.('theme', 'cinema').then(t => {
      const saved = t || 'cinema'
      document.documentElement.setAttribute('data-theme', saved)
      setTheme(saved)
    }).catch(() => document.documentElement.setAttribute('data-theme', 'cinema'))
    // Load saved bg
    window.api?.getSetting?.('bg_theme', 'none').then(async bg => {
      if (bg && bg !== 'none') {
        if (bg === 'custom') {
          const f = await window.api?.getCustomBg?.()
          if (f) { setBgCustomUrl(`bg://${f}`); setBgTheme('custom') }
        } else {
          setBgTheme(bg)
        }
      }
    }).catch(() => {})
    window.api.onDbRestored?.(() => toast('Baza vraćena! Restartujte.', 'info', 6000))
  }, [])

  const ctx = {
    page, navigate, pageParams, statisti, projekti, statistike,
    loading, search, setSearch, filters, setFilters,
    selected, setSelected, refresh, loadStatisti, loadProjekti, loadStatistike,
    toast, theme, applyTheme, bgTheme, bgCustomUrl, setBgCustomUrl, applyBg
  }

  const renderPage = () => {
    switch (page) {
      case 'dashboard':        return <Dashboard />
      case 'statisti':         return <StatistaList />
      case 'statista-new':     return <StatistaForm />
      case 'statista-edit':    return <StatistaForm id={pageParams.id} />
      case 'statista-profile': return <StatistaProfile id={pageParams.id} />
      case 'projekti':         return <ProjektiPage />
      case 'rasporedi':        return <RasporedPage />
      case 'finansije':        return <FinansijePage />
      case 'grupe':            return <GrupePage />
      case 'izvjestaji':       return <IzvjestajiPage />
      case 'settings':         return <Settings />
      default:                 return <Dashboard />
    }
  }

  return (
    <AppContext.Provider value={ctx}>
      {/* BACKGROUND LAYER — fixed div, pure React, renders behind everything */}
      {hasBg && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 0,
            backgroundImage: bgStyle,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* APP SHELL — sits on top of bg layer */}
      <div
        style={{ position: 'relative', zIndex: 1 }}
        className="flex flex-col h-screen overflow-hidden"
      >
        <TitleBar />
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar — semi-transparent when bg active */}
          <div
            className="flex-shrink-0 border-r border-[#1a1a28]"
            style={{
              background: hasBg ? 'rgba(4,4,10,0.88)' : '#08080f',
              backdropFilter: hasBg ? 'blur(20px)' : 'none',
              WebkitBackdropFilter: hasBg ? 'blur(20px)' : 'none',
            }}
          >
            <Sidebar />
          </div>

          {/* Main content — transparent when bg active */}
          <main
            className="flex-1 overflow-y-auto scrollbar-thin"
            style={{ background: hasBg ? 'transparent' : '#0a0a14' }}
          >
            <div className="animate-fade-in">{renderPage()}</div>
          </main>
        </div>

        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
          {toasts.map(t => <Toast key={t.id} {...t} />)}
        </div>
      </div>
    </AppContext.Provider>
  )
}
