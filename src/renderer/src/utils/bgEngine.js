/**
 * bgEngine.js — Background image engine
 * Completely independent from React. Call applyBg() from anywhere.
 */

export const BG_MAP = {
  'none':      null,
  'noir':      'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.06) 2px,rgba(0,0,0,0.06) 4px),radial-gradient(ellipse at 20% 50%,rgba(40,30,10,0.55) 0%,transparent 60%),linear-gradient(160deg,#0a0805 0%,#0f0c08 40%,#060408 100%)',
  'cinema-red':'radial-gradient(ellipse at 0% 0%,rgba(150,15,15,0.55) 0%,transparent 50%),radial-gradient(ellipse at 100% 100%,rgba(130,8,8,0.45) 0%,transparent 50%),radial-gradient(ellipse at 50% 50%,rgba(90,5,5,0.25) 0%,transparent 60%),linear-gradient(135deg,#0d0303 0%,#1a0707 50%,#0a0303 100%)',
  'cosmos':    'radial-gradient(2px 2px at 15% 25%,rgba(255,255,255,0.85) 0%,transparent 100%),radial-gradient(1px 1px at 55% 10%,rgba(255,255,255,0.9) 0%,transparent 100%),radial-gradient(2px 2px at 80% 65%,rgba(255,255,255,0.75) 0%,transparent 100%),radial-gradient(1px 1px at 35% 82%,rgba(255,255,255,0.65) 0%,transparent 100%),radial-gradient(1px 1px at 92% 35%,rgba(255,255,255,0.7) 0%,transparent 100%),radial-gradient(3px 3px at 50% 45%,rgba(147,197,253,0.55) 0%,transparent 100%),radial-gradient(ellipse at 30% 40%,rgba(29,78,216,0.28) 0%,transparent 50%),radial-gradient(ellipse at 70% 70%,rgba(109,40,217,0.22) 0%,transparent 50%),linear-gradient(160deg,#010307 0%,#020410 50%,#010207 100%)',
  'golden':    'radial-gradient(ellipse at 0% 100%,rgba(190,85,15,0.45) 0%,transparent 50%),radial-gradient(ellipse at 100% 0%,rgba(210,135,8,0.4) 0%,transparent 50%),radial-gradient(ellipse at 50% 50%,rgba(160,85,8,0.18) 0%,transparent 60%),linear-gradient(160deg,#0c0801 0%,#180f02 40%,#090600 100%)',
  'neon-city': 'radial-gradient(ellipse at 10% 90%,rgba(236,72,153,0.35) 0%,transparent 40%),radial-gradient(ellipse at 90% 10%,rgba(34,211,238,0.28) 0%,transparent 40%),radial-gradient(ellipse at 50% 50%,rgba(139,92,246,0.18) 0%,transparent 50%),repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(99,102,241,0.025) 3px,rgba(99,102,241,0.025) 6px),linear-gradient(160deg,#020107 0%,#04020b 50%,#010107 100%)',
  'forest':    'radial-gradient(ellipse at 20% 80%,rgba(15,90,25,0.45) 0%,transparent 50%),radial-gradient(ellipse at 80% 20%,rgba(8,70,18,0.35) 0%,transparent 50%),radial-gradient(ellipse at 50% 50%,rgba(5,45,12,0.2) 0%,transparent 60%),linear-gradient(160deg,#010902 0%,#040e04 50%,#010801 100%)',
  'ocean':     'radial-gradient(ellipse at 50% 0%,rgba(12,130,155,0.3) 0%,transparent 60%),radial-gradient(ellipse at 20% 70%,rgba(2,115,168,0.25) 0%,transparent 50%),radial-gradient(ellipse at 80% 40%,rgba(6,98,140,0.2) 0%,transparent 50%),linear-gradient(180deg,#010710 0%,#020b18 50%,#010710 100%)',
}

export function applyBg(bg, customUrl) {
  // Get or create our dedicated style tag
  let styleEl = document.getElementById('__acmigo_bg_engine__')
  if (!styleEl) {
    styleEl = document.createElement('style')
    styleEl.id = '__acmigo_bg_engine__'
    document.head.insertBefore(styleEl, document.head.firstChild)
  }

  if (!bg || bg === 'none') {
    styleEl.textContent = ''
    return
  }

  let bgImg = ''
  if (bg === 'custom' && customUrl) {
    bgImg = `linear-gradient(rgba(0,0,0,0.52),rgba(0,0,0,0.52)), url("${customUrl}")`
  } else {
    bgImg = BG_MAP[bg] || ''
  }

  if (!bgImg) {
    styleEl.textContent = ''
    return
  }

  styleEl.textContent = `
    html {
      background-image: ${bgImg} !important;
      background-size: cover !important;
      background-position: center center !important;
      background-repeat: no-repeat !important;
      background-attachment: fixed !important;
      min-height: 100vh !important;
    }
    body, #root, #root > div.flex {
      background-color: transparent !important;
      background-image: none !important;
    }
    #root > div.flex > aside {
      background-color: rgba(4, 4, 10, 0.84) !important;
      backdrop-filter: blur(20px) !important;
      -webkit-backdrop-filter: blur(20px) !important;
    }
    #root > div.flex > main {
      background-color: transparent !important;
    }
    .card {
      background-color: rgba(15, 15, 26, 0.82) !important;
      backdrop-filter: blur(14px) !important;
      -webkit-backdrop-filter: blur(14px) !important;
    }
    .modal-content {
      background-color: rgba(12, 12, 20, 0.97) !important;
      backdrop-filter: blur(24px) !important;
    }
    .modal-overlay {
      background: rgba(0,0,0,0.72) !important;
    }
  `
}
