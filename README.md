# 📦 CepatRetur — Bot Asisten Penukaran & Pengembalian Barang

> **Final Project Customer Service AI Chatbot**  
> *Layanan Otomatisasi Pengecekan Kelayakan, Kode Retur, Panduan Pengemasan, dan Pelacakan Pengembalian Barang Berbasis Google Gemini AI.*

---

## 🌐 Demo Aplikasi Online (Render Deployment)
- **Live Application URL:** `https://cepatretur.onrender.com` *(Silakan ganti dengan URL Render publik Anda setelah deployment)*
- **API Health Check URL:** `https://cepatretur.onrender.com/api/health`

---

## 📑 Daftar Isi
- [1. Deskripsi Singkat](#1-deskripsi-singkat)
- [2. Latar Belakang Masalah](#2-latar-belakang-masalah)
- [3. Use Case Customer Service](#3-use-case-customer-service)
- [4. Fitur Utama](#4-fitur-utama)
- [5. Teknologi yang Digunakan](#5-teknologi-yang-digunakan)
- [6. Arsitektur Aplikasi](#6-arsitektur-aplikasi)
- [7. Struktur Folder Proyek](#7-struktur-folder-proyek)
- [8. Konfigurasi Google Gemini AI](#8-konfigurasi-google-gemini-ai)
- [9. Panduan Instalasi & Penggunaan](#9-panduan-instalasi--penggunaan)
- [10. Cara Menjalankan Pengujian (Testing)](#10-cara-menjalankan-pengujian-testing)
- [11. Dokumentasi Endpoint API](#11-dokumentasi-endpoint-api)
- [12. Kebijakan Simulasi & Batasan Proyek](#12-kebijakan-simulasi--batasan-proyek)
- [13. Keamanan API Key & Environment Variables](#13-keamanan-api-key--environment-variables)
- [14. Panduan Deployment ke Render](#14-panduan-deployment-ke-render)
- [15. Screenshot Aplikasi](#15-screenshot-aplikasi)
- [16. Identitas Pembuat](#16-identitas-pembuat)

---

## 1. Deskripsi Singkat

**CepatRetur** adalah chatbot *customer service* interaktif yang dibangun menggunakan **Node.js, Express, Vanilla JavaScript, HTML5, CSS3**, dan SDK resmi **`@google/genai` (Model: `gemini-2.5-flash`)**. Aplikasi ini dirancang khusus untuk memandu pengguna E-Commerce dalam mengecek kelayakan pengembalian/penukaran barang, menghasilkan kode retur simulasi otomatis, memberikan instruksi pengemasan produk sesuai kategori, dan melacak status pengembalian barang secara transparan melalui *timeline* interaktif.

---

## 2. Latar Belakang Masalah

Dalam industri E-Commerce, proses pengembalian dan penukaran barang sering kali menjadi kendala utama bagi pelanggan dan tim *Customer Service (CS)*:
- **Tingginya Beban Tiket CS:** Pertanyaan repetitif mengenai cara retur, syarat segel, dan melacak paket retur menyita waktu tim support.
- **Ketidakpastian Keputusan Kelayakan:** Pelanggan sering kebingungan apakah barang yang rusak atau salah ukuran masih dapat dikembalikan.
- **Kerusakan Saat Pengiriman Retur:** Kurangnya panduan pengemasan khusus per kategori barang (misal: barang elektronik vs pakaian) berisiko merusak paket di perjalanan.

**CepatRetur** hadir untuk menyelesaikan masalah ini dengan mengombinasikan *decision engine* deterministik backend untuk keputusan kebijakan retur serta kecerdasan alami **Google Gemini AI** untuk penjelasan CS yang ramah dan komunikatif.

---

## 3. Use Case Customer Service

1. **Self-Service Kelayakan Retur:** Pengguna menjawab 3 pertanyaan tombol interaktif untuk langsung mengetahui kelayakan pengajuan retur tanpa perlu menunggu tanggapan manual CS.
2. **Generasi Kode Retur & Instruksi Kemas:** Menghasilkan Kode Retur unik berbasis alfanumerik backend serta memberikan petunjuk kemas khusus kategori produk.
3. **Pelacakan Status & Mode Demonstrasi:** Pelanggan dapat memantau 8 tahapan *timeline* retur dan mensimulasikan kemajuan status paket secara langsung.
4. **Tanya Jawab Alami Berbasis AI:** Pengguna bebas menanyakan seputar kebijakan retur, syarat refund, maupun klaim garansi menggunakan bahasa alami Bahasa Indonesia.

---

## 4. Fitur Utama

- 🤖 **Chatbot AI Berbasis Google Gemini:** Menjawab pertanyaan bebas dalam Bahasa Indonesia dengan sopan, ramah, dan profesional.
- 📋 **Pemeriksa Kelayakan Retur (3 Pertanyaan Tombol):** Evaluasi deterministik berdasarkan Nomor Pesanan, Ketersediaan Segel, Rentang Hari, dan Alasan Pengembalian.
- 🏷️ **Pembuatan Kode Retur Backend Unik:** Generasi otomatis kode alfanumerik `RTR-YYYYMMDD-XXXX` tanpa karakter ambigu (`0/O`, `1/I`).
- 📦 **Panduan Pengemasan Khusus Kategori:** Instruksi kemas otomatis disesuaikan dengan kategori produk (*Fashion, Elektronik, Aksesori, Peralatan Rumah, Lainnya*).
- 🔍 **Pelacakan Status Retur & Visual Timeline 8 Tahap:** Progress bar dan timeline dari *Pengajuan Dibuat* hingga *Retur Selesai*, dilengkapi tombol mode demonstrasi.
- 💾 **Memori Percakapan & Data Persisten (`localStorage`):** Seluruh riwayat chat dan status retur tersimpan otomatis pada browser pengguna.
- ♿ **Aksesibilitas & Keamanan Tinggi:** Terproteksi penuh dari celah XSS (`textContent`), mendukung navigasi keyboard (`:focus-visible`), dan aria-live tags.

---

## 5. Teknologi yang Digunakan

- **Frontend:** HTML5 Semantik, Pure Vanilla CSS3 (Custom Design System, Glassmorphism, Micro-animations), Pure Vanilla JavaScript (DOM Native, ES Modules). *Tanpa CSS/JS Framework*.
- **Backend:** Node.js (v18+), Express.js (v5.x).
- **AI Integration:** `@google/genai` (SDK Resmi Google GenAI), Model: `gemini-2.5-flash`.
- **Environment & Middleware:** `dotenv`, `cors`.
- **Testing:** Native Node.js Test Runner (`node:test`, `node:assert`).

---

## 6. Arsitektur Aplikasi

```mermaid
graph TD
    A[Client Browser - Vanilla JS Frontend] -->|GET /api/health| B[Express Server Backend]
    A -->|POST /api/chat| C[routes/chatRoute.js]
    A -->|POST /api/returns/check| D[routes/returnRoute.js]
    A -->|POST /api/returns/create| D

    C -->|Generate Response| E[services/geminiService.js]
    E -->|@google/genai SDK| F[Google Gemini API gemini-2.5-flash]

    D -->|Evaluasi Deterministik| G[services/eligibilityService.js]
    D -->|Generasi Kode & Instruksi| H[services/returnService.js]

    A <-->|Persistensi Riwayat| I[Browser localStorage]
```

---

## 7. Struktur Folder Proyek

```text
cepatretur/
├── docs/
│   └── screenshots/
│       ├── README.md
│       ├── 01-home.png
│       ├── 02-ai-chat.png
│       ├── 03-eligibility-flow.png
│       ├── 04-return-code.png
│       ├── 05-tracking-status.png
│       └── 06-mobile-view.png
├── public/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   └── assets/
├── routes/
│   ├── chatRoute.js
│   └── returnRoute.js
├── services/
│   ├── geminiService.js
│   ├── eligibilityService.js
│   └── returnService.js
├── utils/
│   ├── validation.js
│   └── trackingHelper.js
├── tests/
│   ├── chat.test.js
│   ├── eligibility.test.js
│   ├── returnCode.test.js
│   ├── returns.test.js
│   ├── server.test.js
│   ├── tracking.test.js
│   └── validation.test.js
├── .env
├── .env.example
├── .gitignore
├── render.yaml
├── index.js
├── package.json
├── package-lock.json
└── README.md
```

---

## 8. Konfigurasi Google Gemini AI

- **Model:** `gemini-2.5-flash`
- **Temperature:** `0.3`
- **Top-P:** `0.8`
- **Top-K:** `20`

### 💡 Alasan Pemilihan Parameter:
- **Temperature (0.3):** Dipilih bernilai rendah agar jawaban Gemini tetap fokus, faktual, konsisten, dan tidak berhalusinasi atau memberikan janji kebijakan retur di luar aturan sistem.
- **Top-P (0.8) & Top-K (20):** Membatasi sampel kata yang dihasilkan agar tanggapan tetap alamiah dan ramah namun tetap terkontrol dalam ranah *Customer Service* retur barang.

---

## 9. Panduan Instalasi & Penggunaan

### 1️⃣ Clone Repositori & Instalasi Dependensi
```bash
git clone [https://github.com/USERNAME/cepatretur.git](https://github.com/raafiprawiras/cepatretur-chatbot)
cd cepatretur
npm install
```

### 2️⃣ Konfigurasi Environment Variable
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Buka file `.env` dan masukkan API Key Google Gemini Anda:
```env
GEMINI_API_KEY=masukkan_gemini_api_key_anda_di_sini
PORT=3000
```

### 3️⃣ Menjalankan Server Aplikasi
- **Development Mode:**
  ```bash
  npm run dev
  ```
- **Production Mode:**
  ```bash
  npm start
  ```
Buka browser Anda dan akses: `http://localhost:3000`

---

## 10. Cara Menjalankan Pengujian (Testing)

Seluruh pengujian unit & integrasi dibangun menggunakan **native test runner Node.js (`node:test`)**:
```bash
npm test
```

---

## 11. Dokumentasi Endpoint API

| Method | Endpoint | Fungsi | Payload Utama | Status Respon |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Cek status kesehatan server API | - | `200 OK` |
| `POST` | `/api/chat` | Mengirim percakapan ke Gemini AI | `{ conversation: [...], context: {} }` | `200 OK` / `400` / `500` |
| `POST` | `/api/returns/check` | Evaluasi kelayakan retur sistem | `{ orderNumber, sealAvailable, daysRange, reason }` | `200 OK` / `400` |
| `POST` | `/api/returns/create` | Buat Kode Retur & Panduan Kemas | `{ orderNumber, eligibilityResult, resolution, category }` | `200 OK` / `400` |

### 📩 Contoh Request & Response `POST /api/chat`:

**Request Payload:**
```json
{
  "conversation": [
    { "role": "user", "text": "Apakah barang salah ukuran dapat ditukar?" }
  ],
  "context": {
    "orderNumber": "ORD-2026-00125"
  }
}
```

**Response Success (200 OK):**
```json
{
  "result": "Tentu saja! Barang yang salah ukuran dapat ditukar selama label/segel masih utuh dan persediaan ukuran pengganti masih tersedia...",
  "model": "gemini-2.5-flash"
}
```

---

## 12. Kebijakan Simulasi & Batasan Proyek

> [!IMPORTANT]
> Seluruh fitur dan kebijakan pada aplikasi **CepatRetur** ditandai sebagai **"Kebijakan Simulasi Final Project"**:
> - **Tidak Terhubung ke Toko Nyata:** Aplikasi tidak terhubung ke basis data toko online asli.
> - **Tidak Terhubung ke Kurir Nyata:** Alamat pengiriman dan pelacakan status merupakan bentuk simulasi demonstrasi.
> - **Penyimpanan Lokal:** Data retur dan riwayat percakapan tersimpan secara independen pada `localStorage` browser pengguna.
> - **Tanpa Janji Refund Sebelum Inspeksi:** Pengembalian dana (refund) belum diproses/dijanjikan sebelum paket fisik tiba di gudang dan lolos inspeksi kualitas.

---

## 13. Keamanan API Key & Environment Variables

- API Key disembunyikan sepenuhnya di tingkat server backend (`process.env.GEMINI_API_KEY`).
- File `.env` secara ketat didaftarkan ke `.gitignore` sehingga tidak pernah ter-commit atau terpublikasi di repositori Git.
- Respon API tidak pernah membocorkan stack trace server atau nilai credential sensitif.

---

## 14. Panduan Deployment ke Render

Aplikasi CepatRetur siap di-deploy sebagai **Single Web Service** di [Render.com](https://render.com):

1. **Push Kode ke GitHub:**
   ```bash
   git add .
   git commit -m "feat: add render blueprint deployment config"
   git push origin main
   ```
2. **Login ke Render & Buat Web Service:**
   - Login ke Dashboard [Render.com](https://render.com).
   - Pilih tombol **New +** -> **Web Service** (atau gunakan Blueprint).
   - Hubungkan repositori GitHub CepatRetur.
3. **Atur Konfigurasi Build & Runtime:**
   - **Name:** `cepatretur`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. **Tambahkan Environment Variable:**
   - Masuk ke menu **Environment** pada dashboard Render.
   - Tambahkan key: `GEMINI_API_KEY` = *[API Key Gemini Anda]*
   - Tambahkan key: `NODE_ENV` = `production`
5. **Deploy & Pengujian:**
   - Klik **Deploy Web Service** dan tunggu proses build selesai.
   - Buka URL publik yang dihasilkan (misal: `https://cepatretur.onrender.com`).
   - Uji kesehatan API via `GET /api/health`.
   - Uji alur chat, ajukan retur, dan pelacakan status pada browser PC & mobile.

---

## 15. Screenshot Aplikasi

Daftar tangkapan layar pengujian antarmuka aplikasi dapat dilihat pada direktori [`docs/screenshots/`](file:///c:/project/gemini-chatbot-api/docs/screenshots/):
1. `01-home.png` — Tampilan Beranda CepatRetur
2. `02-ai-chat.png` — Tampilan Percakapan Alami dengan Gemini AI
3. `03-eligibility-flow.png` — Tampilan Form Kelayakan Retur (3 Pertanyaan Tombol)
4. `04-return-code.png` — Tampilan Ringkasan Kode Retur & Panduan Kemas
5. `05-tracking-status.png` — Tampilan Timeline Pelacakan & Mode Demonstrasi
6. `06-mobile-view.png` — Tampilan Responsif Mobile (360px)

---

## 16. Identitas Pembuat

- **Nama Pembuat:** Raafi Prawira Setiamudo
- **NIM / ID Peserta:** -
- **Kelas / Program:** Maju Bareng AI 2026
- **Repositori GitHub:** (https://github.com/raafiprawiras/cepatretur)
