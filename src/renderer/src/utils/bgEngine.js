// bgEngine.js — applies background directly to document.body inline style

const GRADIENTS = {
  'noir':       'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.07) 2px,rgba(0,0,0,0.07) 4px),radial-gradient(ellipse at 20% 50%,rgba(50,35,10,0.6) 0%,transparent 60%),linear-gradient(160deg,#0a0805 0%,#100d08 40%,#060408 100%)',
  'cinema-red': 'radial-gradient(ellipse at 5% 5%,rgba(160,10,10,0.65) 0%,transparent 50%),radial-gradient(ellipse at 95% 95%,rgba(140,5,5,0.55) 0%,transparent 50%),radial-gradient(ellipse at 50% 50%,rgba(100,3,3,0.3) 0%,transparent 65%),linear-gradient(150deg,#0d0202 0%,#1e0606 45%,#0a0202 100%)',
  'cosmos':     'radial-gradient(2px 2px at 12% 22%,#fff 0%,transparent 100%),radial-gradient(1px 1px at 52% 8%,#fff 0%,transparent 100%),radial-gradient(2px 2px at 78% 62%,#ddd 0%,transparent 100%),radial-gradient(1px 1px at 33% 80%,#ccc 0%,transparent 100%),radial-gradient(1px 1px at 90% 33%,#eee 0%,transparent 100%),radial-gradient(1px 1px at 65% 90%,#bbb 0%,transparent 100%),radial-gradient(3px 3px at 48% 44%,rgba(147,197,253,0.7) 0%,transparent 100%),radial-gradient(ellipse at 28% 38%,rgba(30,80,220,0.32) 0%,transparent 50%),radial-gradient(ellipse at 72% 72%,rgba(110,40,220,0.28) 0%,transparent 50%),linear-gradient(155deg,#010307 0%,#020411 50%,#010207 100%)',
  'golden':     'radial-gradient(ellipse at 0% 100%,rgba(200,90,10,0.55) 0%,transparent 50%),radial-gradient(ellipse at 100% 0%,rgba(220,140,5,0.5) 0%,transparent 50%),radial-gradient(ellipse at 55% 45%,rgba(170,90,5,0.2) 0%,transparent 60%),linear-gradient(155deg,#0d0901 0%,#1c1102 40%,#0a0700 100%)',
  'neon-city':  'radial-gradient(ellipse at 8% 92%,rgba(236,72,153,0.45) 0%,transparent 38%),radial-gradient(ellipse at 92% 8%,rgba(34,211,238,0.4) 0%,transparent 38%),radial-gradient(ellipse at 50% 50%,rgba(139,92,246,0.22) 0%,transparent 52%),repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(99,102,241,0.03) 3px,rgba(99,102,241,0.03) 6px),linear-gradient(155deg,#020107 0%,#04020c 50%,#010107 100%)',
  'forest':     'radial-gradient(ellipse at 15% 85%,rgba(10,100,22,0.55) 0%,transparent 50%),radial-gradient(ellipse at 85% 15%,rgba(6,75,16,0.45) 0%,transparent 50%),radial-gradient(ellipse at 50% 50%,rgba(4,50,10,0.22) 0%,transparent 62%),linear-gradient(155deg,#010a02 0%,#051004 50%,#010901 100%)',
  'ocean':      'radial-gradient(ellipse at 50% 0%,rgba(10,140,165,0.38) 0%,transparent 58%),radial-gradient(ellipse at 18% 72%,rgba(1,120,175,0.32) 0%,transparent 50%),radial-gradient(ellipse at 82% 38%,rgba(5,100,145,0.25) 0%,transparent 50%),linear-gradient(175deg,#010812 0%,#020d1c 50%,#010810 100%)',
}

export const BG_NAMES = {
  'none':       'Bez pozadine',
  'noir':       'Film Noir',
  'cinema-red': 'Crveni Zastor',
  'cosmos':     'Svemirski Film',
  'golden':     'Zlatni Sat',
  'neon-city':  'Neonski Grad',
  'forest':     'Noćna Šuma',
  'ocean':      'Duboki Ocean',
  'custom':     'Vlastita slika',
}

export function applyBg(bg, customUrl) {
  const body = document.body
  const clearBg = () => {
    body.style.backgroundImage = ''
    body.style.backgroundSize = ''
    body.style.backgroundPosition = ''
    body.style.backgroundAttachment = ''
    body.style.backgroundRepeat = ''
    const el = document.getElementById('__bg_glass__')
    if (el) el.textContent = ''
  }

  if (!bg || bg === 'none') { clearBg(); return }

  const img = bg === 'custom' && customUrl
    ? `linear-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0.5)),url("${customUrl}")`
    : GRADIENTS[bg]

  if (!img) { clearBg(); return }

  // Set on body directly — inline style beats everything
  body.style.backgroundImage = img
  body.style.backgroundSize = 'cover'
  body.style.backgroundPosition = 'center'
  body.style.backgroundAttachment = 'fixed'
  body.style.backgroundRepeat = 'no-repeat'

  // Glass effect on cards
  let el = document.getElementById('__bg_glass__')
  if (!el) {
    el = document.createElement('style')
    el.id = '__bg_glass__'
    document.head.appendChild(el)
  }
  el.textContent = `
    body > #root > div { background: transparent !important; }
    body > #root > div > main { background: transparent !important; }
    body > #root > div > aside {
      background: rgba(3,3,8,0.86) !important;
      backdrop-filter: blur(22px) !important;
      -webkit-backdrop-filter: blur(22px) !important;
    }
    .card {
      background: rgba(14,14,24,0.83) !important;
      backdrop-filter: blur(16px) !important;
      -webkit-backdrop-filter: blur(16px) !important;
    }
    .modal-content {
      background: rgba(10,10,18,0.97) !important;
      backdrop-filter: blur(28px) !important;
    }
  `
}
