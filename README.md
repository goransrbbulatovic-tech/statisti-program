# 🎬 ACMigo — Profesionalni Program za Evidenciju Statista

<p align="center">
  <img src="build/icon.svg" width="100" alt="ACMigo Logo" />
</p>

<p align="center">
  <strong>Desktop aplikacija za profesionalnu evidenciju statista u filmskoj industriji</strong><br/>
  Electron · React 18 · SQLite · Tailwind CSS
</p>

---

## ✨ Mogućnosti

### 👤 Upravljanje Statistima
- Kompletni podaci: ime, prezime, matični broj, lična karta, bankovni račun
- Kontakt: telefon, email
- Fizičke karakteristike: visina, težina, boja očiju, kose, veličina garderobe
- Tagovi, jezici, posebne vještine
- Kratki opis i interne napomene
- **Auto-parsiranje datuma** iz matičnog broja (JMB format)

### 📸 Fotografije
- **Profilna slika** (prikazana svuda kao avatar)
- Neograničena galerija dodatnih fotografija
- Lightbox pregledač sa navigacijom (tipke ← →)
- Postavljanje/promjena profilne slike jednim klikom

### 🎬 Projekti
- Evidencija filmova, serija, reklama, dokumentarnih filmova...
- Dodjela statista projektima s ulogom, honorarom i datumom snimanja
- Pregled svih statista po projektu

### 🔍 Napredna Pretraga & Filteri
- Pretraga po imenu, prezimenu, matičnom, projektima, tagu
- Filteri: status, pol, projekat, boja očiju, boja kose, raspon visine
- Sortiranje (A-Z, Z-A, najnoviji, izmijenjeni)
- Paginacija (24 kartice / 50 redova po stranici)

### 📊 Dashboard
- Statistike: ukupno, aktivnih, projekata, novih ovog mjeseca
- Pregled po polu, boji kose, fotografijama
- Nedavno dodani statisti
- Top projekti & log aktivnosti

### 📤 Izvoz
| Format | Mogućnosti |
|--------|-----------|
| **PDF** | Formatirani dokument, sa/bez fotografija, odabir polja |
| **Excel** | .xlsx tabela sa svim podacima, metadata sheet |
| **Štampa** | Direktno iz pregledača |

### 💾 Baza Podataka
- SQLite lokalna baza (podaci ostaju na računaru)
- **Backup** jednim klikom → .db fajl
- **Restore** iz prethodnog backupa
- WAL journal mode za brže pisanje

---

## 🚀 Pokretanje iz Source Koda

### Preduvjeti
- Node.js 18+ (preporučeno 20)
- npm 9+
- Git

```bash
# Kloniraj repozitorij
git clone https://github.com/TVOJ_USERNAME/acmigo.git
cd acmigo

# Instaliraj zavisnosti
npm install

# Pokreni u development modu
npm run dev
```

---

## 📦 Build (Pakovanje)

```bash
# Build za sve platforme
npm run dist:all

# Samo Windows (.exe NSIS installer)
npm run dist:win

# Samo macOS (.dmg)
npm run dist:mac

# Samo Linux (.AppImage + .deb)
npm run dist:linux
```

Build fajlovi se nalaze u `dist/` folderu.

---

## 🤖 GitHub Actions (Automatski Build)

### Pokretanje putem taga:
```bash
git add .
git commit -m "Initial release"
git tag v1.0.0
git push origin main --tags
```

GitHub Actions automatski builduje za:
- ✅ **Windows**: `ACMigo-Setup-1.0.0.exe` (NSIS installer)
- ✅ **macOS**: `ACMigo-1.0.0.dmg`
- ✅ **Linux**: `ACMigo-1.0.0.AppImage`, `acmigo_1.0.0_amd64.deb`

### Ručno pokretanje:
Na GitHub.com → Actions → Build ACMigo → **Run workflow**

---

## 🖥️ Instalacija

### Windows
1. Preuzmi `ACMigo-Setup-x.x.x.exe`
2. Pokreni installer
3. Odaberi folder instalacije (može se mijenjati!)
4. Klikni Install

### macOS
1. Preuzmi `ACMigo-x.x.x.dmg`
2. Otvori DMG, prevuci u Applications
3. Ako se pojavi upozorenje: Desni klik → Otvori

### Linux
```bash
# AppImage
chmod +x ACMigo-x.x.x.AppImage
./ACMigo-x.x.x.AppImage

# Debian/Ubuntu
sudo dpkg -i acmigo_x.x.x_amd64.deb
```

---

## 📁 Struktura Projekta

```
acmigo/
├── .github/workflows/     # GitHub Actions CI/CD
├── build/                 # Build resursi (ikona)
├── scripts/               # Build skripte (generisanje ikona)
├── src/
│   ├── main/              # Electron main process
│   │   ├── index.js       # Entry point, window, protokol
│   │   ├── database.js    # SQLite CRUD operacije
│   │   └── ipc-handlers.js # IPC bridge
│   ├── preload/
│   │   └── index.js       # contextBridge API
│   └── renderer/          # React frontend
│       └── src/
│           ├── App.jsx    # Router, global state
│           ├── components/
│           │   ├── Dashboard.jsx
│           │   ├── StatistaList.jsx
│           │   ├── StatistaForm.jsx
│           │   ├── StatistaProfile.jsx
│           │   ├── ProjektiPage.jsx
│           │   ├── ExportModal.jsx
│           │   └── Settings.jsx
│           └── utils/
│               └── exportUtils.js  # PDF + Excel generacija
├── package.json
└── electron.vite.config.js
```

---

## 🛠️ Tech Stack

| Tehnologija | Verzija | Namjena |
|-------------|---------|---------|
| Electron | 30 | Desktop okvir |
| electron-vite | 2.2 | Build alat |
| React | 18 | UI |
| Tailwind CSS | 3.4 | Stilovi |
| better-sqlite3 | 9.6 | SQLite baza |
| jsPDF + autoTable | 2.5 | PDF izvoz |
| XLSX (SheetJS) | 0.18 | Excel izvoz |
| Lucide React | 0.383 | Ikone |
| sharp | 0.33 | Generisanje ikona |

---

## 🔒 Sigurnost & Privatnost

- Svi podaci su **lokalni** — nema cloud sync-a, nema interneta
- Fotografije se čuvaju u `%APPDATA%/acmigo/photos/` (Windows) ili `~/Library/Application Support/acmigo/photos/` (macOS)
- Baza podataka: `%APPDATA%/acmigo/acmigo.db`

---

## 📝 Licenca

MIT License — slobodno koristite, mijenjajte i distribuirajte.

---

<p align="center">Napravljeno s ❤️ za filmsku industriju</p>
