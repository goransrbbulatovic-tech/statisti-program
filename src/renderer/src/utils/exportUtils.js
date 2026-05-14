/**
 * ACMigo Export Utils
 * PDF  — card layout, large photos, beautiful typography
 * Excel — exceljs with embedded images, professional styling
 */

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function fmtVal(key, val) {
  if (val === null || val === undefined || val === '') return '—'
  if (key === 'datum_rodjenja') {
    try { return new Date(val).toLocaleDateString('sr-Latn') } catch { return val }
  }
  if (key === 'visina') return `${val} cm`
  if (key === 'tezina') return `${val} kg`
  if (key === 'status') return val === 'aktivan' ? 'Aktivan' : 'Neaktivan'
  if (key === 'pol') return val === 'muski' ? 'Muški' : val === 'zenski' ? 'Ženski' : val
  return String(val)
}

const FIELD_LABELS = {
  ime: 'Ime i prezime', status: 'Status', pol: 'Pol',
  datum_rodjenja: 'Datum rođenja', maticni_broj: 'Matični broj',
  broj_licne_karte: 'Br. lične karte', broj_racuna: 'Br. računa',
  telefon: 'Telefon', email: 'E-mail', visina: 'Visina',
  tezina: 'Težina', boja_ociju: 'Boja očiju', boja_kose: 'Boja kose',
  velicina_garderobe: 'Garderoba', broj_cipela: 'Br. cipela',
  svi_projekti: 'Projekti', napomene: 'Napomene',
}

// Convert base64 to data URL
function toDataUrl(base64, mime = 'image/jpeg') {
  if (!base64) return null
  if (base64.startsWith('data:')) return base64
  return `data:${mime};base64,${base64}`
}

// ═══════════════════════════════════════════════════════════════════════════
//  PDF  — Beautiful card layout with large photos
// ═══════════════════════════════════════════════════════════════════════════

export async function generatePDF(data, fields, options = {}) {
  const { withPhotos = false, photoMap = {} } = options
  const { default: jsPDF } = await import('jspdf')

  // A4 landscape for 2-column cards, portrait for list
  const useCards = withPhotos
  const doc = new jsPDF({
    orientation: useCards ? 'landscape' : 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const PW = doc.internal.pageSize.getWidth()
  const PH = doc.internal.pageSize.getHeight()
  const M  = 12  // margin

  // ── Colors ──
  const C = {
    dark:    [10, 10, 20],
    card:    [22, 22, 36],
    amber:   [245, 158, 11],
    amber2:  [251, 191, 36],
    white:   [255, 255, 255],
    gray:    [148, 163, 184],
    gray2:   [71, 85, 105],
    border:  [40, 40, 65],
    green:   [34, 197, 94],
    red:     [239, 68, 68],
  }

  // ── Header ──
  function drawHeader(pageNum, totalPages) {
    doc.setFillColor(...C.dark)
    doc.rect(0, 0, PW, PH, 'F')

    doc.setFillColor(...C.amber)
    doc.rect(0, 0, PW, 16, 'F')

    doc.setTextColor(...C.dark)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('ACMigo — Evidencija Statista', M, 10.5)

    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'normal')
    const dt = new Date().toLocaleDateString('sr-Latn', { day:'2-digit', month:'2-digit', year:'numeric' })
    doc.text(`${dt}  ·  ${data.length} statista  ·  str. ${pageNum}/${totalPages}`, PW - M, 10.5, { align: 'right' })
  }

  // ── Rounded rect helper ──
  function rRect(x, y, w, h, r, fill) {
    const k = r * 0.552
    doc.moveTo(x + r, y)
    doc.lineTo(x + w - r, y)
    doc.curveTo(x + w - r + k, y, x + w, y + r - k, x + w, y + r)
    doc.lineTo(x + w, y + h - r)
    doc.curveTo(x + w, y + h - r + k, x + w - r + k, y + h, x + w - r, y + h)
    doc.lineTo(x + r, y + h)
    doc.curveTo(x + r - k, y + h, x, y + h - r + k, x, y + h - r)
    doc.lineTo(x, y + r)
    doc.curveTo(x, y + r - k, x + r - k, y, x + r, y)
    doc.closePath()
    if (fill) doc.fill()
    else doc.stroke()
  }

  if (useCards) {
    // ════════════════════════════════════════════
    //  CARD LAYOUT — 2 columns, large photos
    // ════════════════════════════════════════════
    const CARD_W = (PW - 2 * M - 8) / 2   // ~134mm each on landscape
    const CARD_H = 68
    const PHOTO_W = 50
    const PHOTO_H = 62
    const cardsPerPage = 3  // 2 columns × up to 2 rows... actually let's do 2 rows
    const COLS = 2
    const ROWS_PER_PAGE = 2
    const CARDS_PER_PAGE = COLS * ROWS_PER_PAGE

    const totalPages = Math.ceil(data.length / CARDS_PER_PAGE)

    for (let pi = 0; pi < data.length; pi += CARDS_PER_PAGE) {
      if (pi > 0) doc.addPage()
      const pageNum = Math.floor(pi / CARDS_PER_PAGE) + 1
      drawHeader(pageNum, totalPages)

      const pageItems = data.slice(pi, pi + CARDS_PER_PAGE)

      pageItems.forEach((person, idx) => {
        const col = idx % COLS
        const row = Math.floor(idx / COLS)
        const cx = M + col * (CARD_W + 8)
        const cy = 20 + row * (CARD_H + 6)

        // Card background
        doc.setFillColor(...C.card)
        doc.setDrawColor(...C.border)
        doc.setLineWidth(0.3)
        doc.roundedRect(cx, cy, CARD_W, CARD_H, 3, 3, 'FD')

        // Left accent bar
        doc.setFillColor(...C.amber)
        doc.roundedRect(cx, cy, 2.5, CARD_H, 1.5, 1.5, 'F')

        // ── Photo ──
        const px = cx + 6
        const py = cy + 3
        const imgData = photoMap[person.id]

        doc.setFillColor(...C.dark)
        doc.setDrawColor(...C.border)
        doc.roundedRect(px, py, PHOTO_W, PHOTO_H, 2, 2, 'FD')

        if (imgData) {
          try {
            // Add image maintaining aspect ratio, filling the box
            doc.addImage(
              toDataUrl(imgData),
              'JPEG',
              px, py,
              PHOTO_W, PHOTO_H,
              undefined,
              'FAST'
            )
          } catch {}
        } else {
          // Placeholder
          doc.setFontSize(20)
          doc.setTextColor(...C.border)
          doc.text(
            ((person.prezime || '?')[0] || '?').toUpperCase(),
            px + PHOTO_W / 2, py + PHOTO_H / 2 + 4,
            { align: 'center' }
          )
        }

        // ── Info area ──
        const ix = px + PHOTO_W + 5
        const iw = CARD_W - PHOTO_W - 14
        let iy = cy + 8

        // Name
        doc.setFontSize(13)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(...C.white)
        const fullName = `${person.prezime || ''} ${person.ime || ''}`.trim()
        const nameLines = doc.splitTextToSize(fullName, iw)
        doc.text(nameLines.slice(0, 2), ix, iy)
        iy += nameLines.slice(0, 2).length * 5.5 + 2

        // Status badge
        const isActive = person.status === 'aktivan'
        doc.setFillColor(...(isActive ? C.green : C.red))
        doc.roundedRect(ix, iy, 22, 5, 1.5, 1.5, 'F')
        doc.setFontSize(6)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(...C.white)
        doc.text(isActive ? 'Aktivan' : 'Neaktivan', ix + 11, iy + 3.5, { align: 'center' })
        iy += 8

        // Detail rows
        const INFO_FIELDS = [
          ['telefon',        'Tel:'],
          ['email',          'Email:'],
          ['maticni_broj',   'Mat.br:'],
          ['broj_licne_karte','L.karta:'],
          ['datum_rodjenja', 'Rodjen:'],
          ['svi_projekti',   'Projekti:'],
          ['broj_racuna',    'Racun:'],
        ]

        doc.setFontSize(7)
        doc.setFont('helvetica', 'normal')

        for (const [fk, label] of INFO_FIELDS) {
          const val = fields.includes(fk) ? fmtVal(fk, person[fk]) : null
          if (!val || val === '—') continue
          if (iy > cy + CARD_H - 5) break

          // Label
          doc.setTextColor(...C.gray2)
          doc.setFont('helvetica', 'bold')
          doc.text(label, ix, iy)

          // Value
          doc.setFont('helvetica', 'normal')
          doc.setTextColor(...C.gray)
          const labelW = doc.getTextWidth(label) + 2
          const maxValW = iw - labelW - 2
          const truncated = doc.splitTextToSize(val, maxValW)[0] || val
          doc.text(truncated, ix + labelW, iy)
          iy += 5
        }
      })
    }
  } else {
    // ════════════════════════════════════════════
    //  TABLE LAYOUT — portrait, no photos
    // ════════════════════════════════════════════
    await import('jspdf-autotable')

    const visFields = fields.filter(f => f !== 'napomene')
    const headers = visFields.map(f => FIELD_LABELS[f] || f)
    const rows = data.map(s => visFields.map(f => {
      if (f === 'ime') return `${s.prezime || ''} ${s.ime || ''}`.trim()
      return fmtVal(f, s[f])
    }))

    const totalPages = 1  // autotable handles its own pages
    drawHeader(1, 1)

    doc.autoTable({
      head: [headers],
      body: rows,
      startY: 20,
      margin: { left: M, right: M },
      styles: {
        fontSize: 8,
        textColor: [220, 220, 220],
        fillColor: [22, 22, 36],
        lineColor: [40, 40, 65],
        lineWidth: 0.3,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [30, 30, 50],
        textColor: [245, 158, 11],
        fontStyle: 'bold',
        fontSize: 7.5,
      },
      alternateRowStyles: { fillColor: [16, 16, 26] },
      didDrawPage: (d) => {
        drawHeader(d.pageNumber, d.pageCount)
      },
    })
  }

  // Footer on all pages
  const totalPagesFinal = doc.internal.getNumberOfPages()
  for (let i = 1; i <= totalPagesFinal; i++) {
    doc.setPage(i)
    doc.setFontSize(6.5)
    doc.setTextColor(...C.gray2)
    doc.text('ACMigo — Evidencija Statista', M, PH - 5)
    doc.text(`${i} / ${totalPagesFinal}`, PW - M, PH - 5, { align: 'right' })
    doc.setDrawColor(...C.border)
    doc.setLineWidth(0.3)
    doc.line(M, PH - 8, PW - M, PH - 8)
  }

  const output = doc.output('arraybuffer')
  const bytes = new Uint8Array(output)
  let bin = ''
  for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i])
  return btoa(bin)
}

// ═══════════════════════════════════════════════════════════════════════════
//  EXCEL — ExcelJS with embedded images, beautiful styling
// ═══════════════════════════════════════════════════════════════════════════

export async function generateExcel(data, fields, options = {}) {
  const { withPhotos = false, photoMap = {} } = options
  const ExcelJS = (await import('exceljs')).default || (await import('exceljs'))

  const wb = new ExcelJS.Workbook()
  wb.creator = 'ACMigo'
  wb.created = new Date()

  const ws = wb.addWorksheet('Statisti', {
    pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true }
  })

  // ── Column definitions ──
  const PHOTO_COL_W  = 18   // ~135px
  const NAME_COL_W   = 28
  const ROW_H_PHOTO  = 90   // points (≈120px)
  const ROW_H_NORMAL = 20

  const cols = []
  if (withPhotos) {
    cols.push({ key: '_foto', header: 'Foto', width: PHOTO_COL_W })
  }
  for (const f of fields) {
    const w = f === 'ime' ? NAME_COL_W
            : f === 'svi_projekti' || f === 'napomene' ? 40
            : f === 'email' || f === 'maticni_broj' ? 22
            : 18
    cols.push({ key: f, header: FIELD_LABELS[f] || f, width: w })
  }
  ws.columns = cols

  // ── Header row ──
  const headerRow = ws.getRow(1)
  headerRow.height = 28

  cols.forEach((col, ci) => {
    const cell = headerRow.getCell(ci + 1)
    cell.value = col.header
    cell.font     = { bold: true, color: { argb: 'FFF59E0B' }, size: 10 }
    cell.fill     = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0E0E1E' } }
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
    cell.border = {
      bottom: { style: 'medium', color: { argb: 'FFF59E0B' } },
      right:  { style: 'thin',   color: { argb: 'FF1E1E30' } },
    }
  })

  // ── Data rows ──
  const FILL_ODD  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF12121E' } }
  const FILL_EVEN = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0E0E18' } }

  for (let di = 0; di < data.length; di++) {
    const person   = data[di]
    const rowIdx   = di + 2
    const row      = ws.getRow(rowIdx)
    const hasPhoto = withPhotos && photoMap[person.id]

    row.height = hasPhoto ? ROW_H_PHOTO : ROW_H_NORMAL

    const fill = di % 2 === 0 ? FILL_ODD : FILL_EVEN

    let colOffset = 0

    // Photo column
    if (withPhotos) {
      const photoCell = row.getCell(1)
      photoCell.fill = fill
      photoCell.alignment = { vertical: 'middle', horizontal: 'center' }
      photoCell.border = { right: { style: 'thin', color: { argb: 'FF1E1E30' } } }
      colOffset = 1

      if (hasPhoto) {
        try {
          const imgId = wb.addImage({
            base64: photoMap[person.id],
            extension: 'jpeg',
          })

          // Use ext (pixels) for reliable image sizing - maintains proportions
          const IMG_W = 90   // px - fits within col width of 18 chars
          const IMG_H = 112  // px - portrait ratio 4:5, fits 90pt row height
          ws.addImage(imgId, {
            tl: { col: 0, row: rowIdx - 1 },
            ext: { width: IMG_W, height: IMG_H },
          })
        } catch {}
      }
    }

    // Data columns
    fields.forEach((f, fi) => {
      const cell = row.getCell(fi + 1 + colOffset)
      cell.fill = fill
      cell.border = {
        right:  { style: 'thin', color: { argb: 'FF1E1E30' } },
        bottom: { style: 'thin', color: { argb: 'FF1E1E30' } },
      }
      cell.alignment = { vertical: 'middle', wrapText: true, horizontal: 'left' }

      if (f === 'ime') {
        const name = `${person.prezime || ''} ${person.ime || ''}`.trim()
        cell.value = name
        cell.font  = { bold: true, color: { argb: 'FFF1F5F9' }, size: hasPhoto ? 13 : 10 }
        cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: false }
      } else if (f === 'status') {
        const isAkt = person.status === 'aktivan'
        cell.value = isAkt ? 'Aktivan' : 'Neaktivan'
        cell.font  = { bold: true, color: { argb: isAkt ? 'FF22C55E' : 'FFEF4444' }, size: 9 }
        cell.alignment = { vertical: 'middle', horizontal: 'center' }
      } else {
        const raw = person[f]
        const val = (raw === null || raw === undefined || raw === '') ? '' : fmtVal(f, raw)
        cell.value = val === '—' ? '' : val
        cell.font  = { color: { argb: 'FF94A3B8' }, size: 9 }
      }
    })

    row.commit()
  }

  // ── Freeze top row ──
  ws.views = [{ state: 'frozen', ySplit: 1, xSplit: withPhotos ? 1 : 0 }]

  // ── Auto-filter ──
  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: cols.length } }

  // ── Metadata sheet ──
  const metaWs = wb.addWorksheet('Info')
  metaWs.getColumn(1).width = 30
  metaWs.getColumn(2).width = 40
  ;[
    ['ACMigo — Evidencija Statista', ''],
    ['Generisano:', new Date().toLocaleString('sr-Latn')],
    ['Ukupno statista:', data.length],
    ['Sa fotografijama:', withPhotos ? 'Da' : 'Ne'],
  ].forEach((r, i) => {
    const row = metaWs.getRow(i + 1)
    row.getCell(1).value = r[0]
    row.getCell(2).value = r[1]
    row.getCell(1).font = { bold: i === 0, color: { argb: i === 0 ? 'FFF59E0B' : 'FF94A3B8' } }
    row.getCell(2).font = { color: { argb: 'FFF1F5F9' } }
  })

  const buffer = await wb.xlsx.writeBuffer()
  const bytes  = new Uint8Array(buffer)
  let bin = ''
  for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i])
  return btoa(bin)
}
