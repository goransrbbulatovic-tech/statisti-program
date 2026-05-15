const GRADIENTS = {
  'noir':       'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.07) 2px,rgba(0,0,0,0.07) 4px),radial-gradient(ellipse at 20% 50%,rgba(50,35,10,0.6) 0%,transparent 60%),linear-gradient(160deg,#0a0805 0%,#100d08 40%,#060408 100%)',
  'cinema-red': 'radial-gradient(ellipse at 5% 5%,rgba(160,10,10,0.65) 0%,transparent 50%),radial-gradient(ellipse at 95% 95%,rgba(140,5,5,0.55) 0%,transparent 50%),linear-gradient(150deg,#0d0202 0%,#1e0606 45%,#0a0202 100%)',
  'cosmos':     'radial-gradient(2px 2px at 12% 22%,#fff 0%,transparent 100%),radial-gradient(1px 1px at 52% 8%,#fff 0%,transparent 100%),radial-gradient(2px 2px at 78% 62%,#ddd 0%,transparent 100%),radial-gradient(1px 1px at 33% 80%,#ccc 0%,transparent 100%),radial-gradient(1px 1px at 90% 33%,#eee 0%,transparent 100%),radial-gradient(3px 3px at 48% 44%,rgba(147,197,253,0.7) 0%,transparent 100%),radial-gradient(ellipse at 28% 38%,rgba(30,80,220,0.32) 0%,transparent 50%),radial-gradient(ellipse at 72% 72%,rgba(110,40,220,0.28) 0%,transparent 50%),linear-gradient(155deg,#010307 0%,#020411 50%,#010207 100%)',
  'golden':     'radial-gradient(ellipse at 0% 100%,rgba(200,90,10,0.55) 0%,transparent 50%),radial-gradient(ellipse at 100% 0%,rgba(220,140,5,0.5) 0%,transparent 50%),linear-gradient(155deg,#0d0901 0%,#1c1102 40%,#0a0700 100%)',
  'neon-city':  'radial-gradient(ellipse at 8% 92%,rgba(236,72,153,0.45) 0%,transparent 38%),radial-gradient(ellipse at 92% 8%,rgba(34,211,238,0.4) 0%,transparent 38%),radial-gradient(ellipse at 50% 50%,rgba(139,92,246,0.22) 0%,transparent 52%),repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(99,102,241,0.03) 3px,rgba(99,102,241,0.03) 6px),linear-gradient(155deg,#020107 0%,#04020c 50%,#010107 100%)',
  'forest':     'radial-gradient(ellipse at 15% 85%,rgba(10,100,22,0.55) 0%,transparent 50%),radial-gradient(ellipse at 85% 15%,rgba(6,75,16,0.45) 0%,transparent 50%),linear-gradient(155deg,#010a02 0%,#051004 50%,#010901 100%)',
  'ocean':      'radial-gradient(ellipse at 50% 0%,rgba(12,130,155,0.38) 0%,transparent 58%),radial-gradient(ellipse at 18% 72%,rgba(2,115,168,0.32) 0%,transparent 50%),linear-gradient(175deg,#010710 0%,#020b18 50%,#010710 100%)',
}

export const BG_LABELS = {
  none: 'Bez pozadine', noir: 'Film Noir', 'cinema-red': 'Crveni Zastor',
  cosmos: 'Svemirski Film', golden: 'Zlatni Sat', 'neon-city': 'Neonski Grad',
  forest: 'Noćna Šuma', ocean: 'Duboki Ocean', custom: 'Vlastita slika',
}

export function applyBg(bg, customUrl) {
  const body = document.body

  if (!bg || bg === 'none') {
    body.style.backgroundImage = ''
    body.style.backgroundSize = ''
    body.style.backgroundPosition = ''
    body.style.backgroundAttachment = ''
    body.classList.remove('has-bg')
    return
  }

  const img = bg === 'custom' && customUrl
    ? `linear-gradient(rgba(0,0,0,0.50),rgba(0,0,0,0.50)),url("${customUrl}")`
    : GRADIENTS[bg]

  if (!img) return

  body.style.backgroundImage = img
  body.style.backgroundSize = 'cover'
  body.style.backgroundPosition = 'center'
  body.style.backgroundAttachment = 'fixed'
  body.classList.add('has-bg')
}
