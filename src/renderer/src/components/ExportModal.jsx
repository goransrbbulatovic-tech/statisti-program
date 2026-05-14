import React, { useState } from 'react'
import { useApp } from '../App'
import { X, FileText, Table, Printer, Download, Loader2, Check, Settings } from 'lucide-react'
import { generatePDF, generateExcel } from '../utils/exportUtils'

const FIELDS = [
  { key: 'ime',                label: 'Ime i prezime',      always: true },
  { key: 'status',             label: 'Status' },
  { key: 'pol',                label: 'Pol' },
  { key: 'datum_rodjenja',     label: 'Datum rođenja' },
  { key: 'maticni_broj',       label: 'Matični broj' },
  { key: 'broj_licne_karte',   label: 'Br. lične karte' },
  { key: 'broj_racuna',        label: 'Br. računa' },
  { key: 'telefon',            label: 'Telefon' },
  { key: 'email',              label: 'E-mail' },
  { key: 'visina',             label: 'Visina' },
  { key: 'tezina',             label: 'Težina' },
  { key: 'boja_ociju',         label: 'Boja očiju' },
  { key: 'boja_kose',          label: 'Boja kose' },
  { key: 'velicina_garderobe', label: 'Vel. garderobe' },
  { key: 'broj_cipela',        label: 'Br. cipela' },
  { key: 'svi_projekti',       label: 'Projekti' },
  { key: 'napomene',           label: 'Napomene' },
]

export default function ExportModal({ onClose }) {
  const { statisti, filters, toast } = useApp()
  const [type, setType]           = useState('pdf')
  const [withPhotos, setWithPhotos] = useState(false)
  const [fields, setFields]       = useState(['ime', 'status', 'telefon', 'email', 'maticni_broj', 'broj_licne_karte', 'svi_projekti'])
  const [exporting, setExporting] = useState(false)
  const [exportFilter, setExportFilter] = useState('all')

  const toggleField = (k) =>
    setFields(prev => prev.includes(k) ? prev.filter(f => f !== k) : [...prev, k])

  const getDataToExport = async () => {
    if (exportFilter === 'current') return statisti
    return await window.api.getForExport({})
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const data = await getDataToExport()

      if (type === 'pdf') {
        let photoMap = {}
        if (withPhotos) {
          for (const s of data.slice(0, 100)) { // limit 100
            if (s.profilna_slika) {
              const b64 = await window.api.getPhotoBase64(s.profilna_slika)
              if (b64) photoMap[s.id] = b64
            }
          }
        }

        const pdfBase64 = await generatePDF(data, fields, { withPhotos, photoMap })
        const saved = await window.api.savePdf(pdfBase64)
        if (saved) toast(`PDF sačuvan: ${saved.split('/').pop() || saved.split('\\').pop()}`)

      } else if (type === 'excel') {
        let photoMap = {}
        if (withPhotos) {
          for (const s of data.slice(0, 100)) {
            if (s.profilna_slika) {
              const b64 = await window.api.getPhotoBase64(s.profilna_slika)
              if (b64) photoMap[s.id] = b64
            }
          }
        }
        const xlsxBase64 = await generateExcel(data, fields, { withPhotos, photoMap })
        const saved = await window.api.saveExcel(xlsxBase64)
        if (saved) toast(`Excel sačuvan: ${saved.split('/').pop() || saved.split('\\').pop()}`)

      } else if (type === 'print') {
        window.print()
      }

      onClose()
    } catch (err) {
      console.error(err)
      toast('Greška pri izvozu: ' + err.message, 'error')
    } finally {
      setExporting(false)
    }
  }

  const TYPE_OPTIONS = [
    { id: 'pdf',   icon: FileText, label: 'PDF dokument',   desc: 'Formatirani PDF, idealan za štampu' },
    { id: 'excel', icon: Table,    label: 'Excel tabela',   desc: 'XLSX fajl za obradu u Excelu' },
    { id: 'print', icon: Printer,  label: 'Štampa',         desc: 'Direktno na štampač' },
  ]

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-lg" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#2a2a40]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Download size={16} className="text-amber-400" />
            </div>
            <div>
              <h2 className="font-bold text-gray-100 text-sm">Izvoz podataka</h2>
              <p className="text-[10px] text-gray-600">Odaberite format i opcije izvoza</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-ghost p-1.5"><X size={15} /></button>
        </div>

        <div className="p-5 space-y-5">
          {/* Export type */}
          <div>
            <label className="label">Format izvoza</label>
            <div className="grid grid-cols-3 gap-2">
              {TYPE_OPTIONS.map(({ id, icon: Icon, label, desc }) => (
                <button
                  key={id}
                  onClick={() => setType(id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    type === id
                      ? 'bg-amber-500/15 border-amber-500/50 text-amber-300'
                      : 'bg-[#1a1a28] border-[#2a2a40] text-gray-500 hover:border-[#3a3a55]'
                  }`}
                >
                  <Icon size={18} className="mb-2" />
                  <div className="text-xs font-semibold">{label}</div>
                  <div className="text-[9px] mt-0.5 opacity-70">{desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Data filter */}
          <div>
            <label className="label">Koji podaci</label>
            <div className="flex gap-2">
              {[
                { id: 'all', label: 'Svi statisti' },
                { id: 'current', label: 'Trenutni prikaz' },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setExportFilter(opt.id)}
                  className={`flex-1 py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                    exportFilter === opt.id
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                      : 'bg-[#1a1a28] border-[#2a2a40] text-gray-500 hover:border-gray-600'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-gray-700 mt-1">
              {exportFilter === 'current' ? `${statisti.length} statista (trenutni filteri)` : 'Svi statisti iz baze'}
            </p>
          </div>

          {/* Photo option — PDF and Excel */}
          {(type === 'pdf' || type === 'excel') && (
            <div>
              <button
                onClick={() => setWithPhotos(!withPhotos)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  withPhotos ? 'bg-indigo-500/15 border-indigo-500/40' : 'bg-[#1a1a28] border-[#2a2a40]'
                }`}
              >
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                  withPhotos ? 'bg-indigo-500 border-indigo-500' : 'border-gray-600'
                }`}>
                  {withPhotos && <Check size={11} className="text-white" />}
                </div>
                <div className="text-left">
                  <div className="text-xs font-medium text-gray-300">Uključi fotografije</div>
                  <div className="text-[10px] text-gray-600">Profilne slike u PDF/Excel dokumentu</div>
                </div>
              </button>
            </div>
          )}

          {/* Fields selection */}
          {type !== 'print' && (
            <div>
              <label className="label flex items-center gap-2">
                <Settings size={11} />
                Polja za izvoz
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {FIELDS.map(({ key, label, always }) => {
                  const isOn = always || fields.includes(key)
                  return (
                    <button
                      key={key}
                      disabled={always}
                      onClick={() => !always && toggleField(key)}
                      className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border text-[10px] font-medium transition-all ${
                        isOn
                          ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                          : 'bg-[#1a1a28] border-[#2a2a40] text-gray-600 hover:border-gray-500'
                      } ${always ? 'opacity-60 cursor-default' : ''}`}
                    >
                      {isOn && <Check size={9} />}
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-5 border-t border-[#2a2a40]">
          <button onClick={onClose} className="btn-secondary flex-1">Otkaži</button>
          <button onClick={handleExport} disabled={exporting} className="btn-primary flex-1 justify-center">
            {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            {exporting ? 'Izvoz...' : type === 'print' ? 'Štampaj' : 'Izvezi'}
          </button>
        </div>
      </div>
    </div>
  )
}
