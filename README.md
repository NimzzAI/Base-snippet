# ⚡ Nimzz Code

Platform berbagi snippet, script otomasi, modul bot, dan project code untuk para developer. Didesain dengan gaya **Neo-Brutalism** yang clean, modern, responsif, dan profesional.

---

## 🚀 Fitur Unggulan

### 1. Editor & Viewer Ala Visual Studio Code
- **VS Code Dark+ Highlighting**: Tampilan syntax highlighting akurat dengan palet warna resmi tema VS Code (`vscDarkPlus`).
- **Gutter & Tab Bar**: Dilengkapi nomor baris rapi dengan pembatas vertikal, tab bar atas dengan ikon bahasa pemrograman sesuai ekstensi file, dan status bar bawah (informasi baris/kolom, indentasi `Spaces: 2`, encoding `UTF-8`, serta bahasa aktif).
- **Tooling Lengkap**: Tombol **Word Wrap** (bungkus baris), **View Raw**, **Download File**, dan **Salin Kode** instan dengan feedback toast.

### 2. Berbagi Cepat dengan Web Share API
- Tombol **Share** pada halaman detail kode (`/app/code/[slug]`) memanfaatkan **Web Share API** bawaan perangkat untuk membagikan URL dan judul snippet langsung ke WhatsApp, Telegram, Twitter/X, atau aplikasi native lainnya.
- Menyediakan *graceful fallback* otomatis ke clipboard copy jika peramban tidak mendukung Web Share API.

### 3. Kategori Real-Time (Live Firestore Synchronization)
- Kategori disinkronkan secara live menggunakan listener Firestore (`onSnapshot`).
- Administrator dapat menambah atau menghapus kategori baru kapan saja di **Panel Admin → Kategori Realtime**, atau saat mempublikasikan kode baru. Perubahan langsung terupdate seketika di seluruh halaman tanpa reload.

### 4. Navigasi Mobile Tab Bar & Navbar Minimalis
- **Mobile Bottom Tab Bar**: Menempel di bagian bawah layar (*fixed bottom navigation*) pada perangkat mobile (`< 900px`) untuk akses cepat ke:
  - **Beranda** (`/`)
  - **Cari** (`/search`)
  - **Request** (`/request`)
  - **Owner** (`/owner`)
  - **Panel / Admin** (`/dashboard` saat login atau `/admin/login` saat belum login).
- **Navbar Bersih**: Header navbar hanya menampilkan tombol **Hamburger** (untuk membuka sidebar penuh) dan **Search Bar** pencarian kode yang luas, membuat tampilan mobile dan desktop bebas distraksi.

### 5. Halaman Profil Developer & Owner (`/owner`)
- Halaman profil developer yang menampilkan banner kustom, avatar, badge *Verified Creator & Platform Owner*, bio lengkap, dan tech stack chips (TypeScript, Next.js, React, Node.js, Python, Tailwind, Firebase).
- Kartu resmi tautan komunitas: **WhatsApp Channel**, **GitHub**, **Telegram**, dan **TikTok**.
- **Real-Time Avatar & Banner Sync**: Kustomisasi avatar dan banner yang disimpan admin di Dashboard seketika terupdate secara langsung di Halaman Owner, Topbar, dan Sidebar via listener live Firestore `onSnapshot`.

### 6. Keamanan & Sistem Login Admin Mandiri
- **Username & Password Only**: Bebas dari ketergantungan OAuth atau Google Sign-In pihak ketiga yang rentan gagal di lingkungan preview.
- **Proteksi Brute-Force & Lockout**:
  - Dibatasi maksimal **5 kali percobaan gagal berturut-turut**.
  - Lockout sementara selama **15 menit** dengan countdown timer interaktif.
  - Tracking berbasis kombinasi **IP Address + Device ID**.
  - Hash password menggunakan **bcrypt** dengan constant-time comparison (mencegah timing attack & enumerasi user).
  - Session aman dikelola via token HMAC SHA-256 tersandi dalam cookie `httpOnly`.

### 7. Konfigurasi Terpusat (`/lib/config.ts`)
- Seluruh informasi platform (nama website, branding, deskripsi, tautan sosial, kredensial dasar admin, dan kategori default) diatur di satu file terpusat (`lib/config.ts` dan `settings.js`).

### 8. Sistem Test Internal Terintegrasi (`/lib/internal-test.ts`)
- Dilengkapi test runner otomatis terintegrasi yang menguji 5 aspek krusial:
  1. **Config Integrity**: Integritas data konfigurasi terpusat.
  2. **Admin Credential Verification**: Verifikasi login dan pencegahan user enumeration.
  3. **Session Token Security**: Validasi tanda tangan kriptografi token HMAC.
  4. **Rate Limiting & Lockout**: Verifikasi pemblokiran pada percobaan ke-5 dan pemulihan reset.
  5. **Input Sanitization**: Netralisasi serangan XSS & tag HTML berbahaya.
- Dapat dijalankan via CLI maupun endpoint API terproteksi (`/api/internal-test`).

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS & Neo-Brutalism Custom System
- **Database & Realtime**: Firebase Firestore
- **Syntax Highlighting**: `react-syntax-highlighter` (Prism VS Code Dark+)
- **Security**: `bcryptjs`, Crypto HMAC SHA-256, IP + Device ID rate limiting
- **Icons**: FontAwesome & Lucide React

---

## 📦 Panduan Instalasi & Menjalankan Project

### 1. Salin Environment Variables
Salin file `.env.example` menjadi `.env.local`:
```bash
cp .env.example .env.local
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Jalankan Development Server
```bash
npm run dev
```
Buka browser pada [http://localhost:3000](http://localhost:3000).

### 4. Build untuk Production
```bash
npm run build
npm start
```

---

## ⚙️ Variabel Lingkungan (`.env.example`)

File `.env.example` telah disediakan dengan dokumentasi lengkap:

| Variabel | Deskripsi | Default / Contoh |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SITE_URL` | URL basis website untuk metadata dan SEO | `http://localhost:3000` |
| `ADMIN_USERNAME` | Username akun administrator | `admin` |
| `ADMIN_PASSWORD` | Password plaintext administrator (otomatis di-hash saat start) | `admin123` |
| `ADMIN_PASSWORD_HASH` | (Opsional) Hash bcrypt precomputed untuk password admin | - |
| `ADMIN_SECRET` | Kunci rahasia untuk menandatangani HMAC session cookie | `nimzz-code-secure-secret-token-key-2026` |
| `INTERNAL_TEST_SECRET` | Token otorisasi untuk endpoint uji internal `/api/internal-test` | `INTERNAL_TEST_BYPASS_TOKEN_2026` |
| `NEXT_PUBLIC_SUPABASE_URL` | URL project Supabase untuk menyimpan data di Vercel | - |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key Supabase, hanya di server | - |
| `TELEGRAM_BOT_TOKEN` | (Opsional) Token bot Telegram untuk notifikasi | - |
| `TELEGRAM_OWNER_CHAT_ID` | (Opsional) Chat ID pemilik bot Telegram | - |

---

## 💾 Penyimpanan dan Upload

- Di Vercel filesystem bersifat read only, jadi data disimpan di Supabase. Jalankan `supabase.sql` sekali di SQL Editor, lalu isi `NEXT_PUBLIC_SUPABASE_URL` dan `SUPABASE_SERVICE_ROLE_KEY` di Environment Variables Vercel, lalu redeploy. Di laptop tanpa env tersebut data tetap pakai file di folder `data`.
- Upload avatar, banner, dan thumbnail lewat AceImg seperti di NgawiHub, gratis tanpa API key. Hanya png dan jpg, gambar otomatis dikecilkan di browser sebelum dikirim.
- Folder `public` tidak berisi svg, semua ikon pakai png.

---

## 🔌 API Publik, Embed, dan SEO

Diambil dari sistem NgawiHub. Dokumentasi lengkap dengan tombol coba langsung ada di `/api-docs`.

- `GET /api/v1/snippets` daftar snippet, filter search, category, language, tag, limit, offset
- `GET /api/v1/snippets/:slug` detail lengkap dengan kode
- `GET /api/v1/snippets/:slug/raw` kode mentah, tambah `download=1` untuk unduh file
- `/embed/:slug` widget iframe, tombol Embed di halaman detail kode menyalin kodenya
- `/sitemap.xml` dan `/robots.txt` dibuat otomatis dari data kode

---

## 🧪 Menjalankan Pengujian Internal

Anda dapat menjalankan test suite mandiri kapan saja melalui terminal:

```bash
npx tsx -e "import { runInternalTests } from './lib/internal-test'; console.log(JSON.stringify(runInternalTests(), null, 2));"
```

---

## 📁 Struktur Direktori

```text
├── app/
│   ├── admin/login/       # Halaman login administrator (brute-force protected)
│   ├── api/
│   │   ├── admin/         # Endpoint login, logout, & session verification
│   │   └── internal-test/ # Protected internal test runner API
│   ├── code/[slug]/       # Detail kode, VS Code viewer, & Web Share API
│   │   └── raw/           # View raw clean code viewer
│   ├── dashboard/         # Panel admin, custom avatar/banner, kategori realtime
│   ├── owner/             # Profil developer & tautan komunitas resmi
│   ├── publish/           # Form upload snippet kode baru
│   ├── request/           # Form permohonan modul kode dari pengguna
│   ├── search/            # Pencarian dan filter kategori realtime
│   ├── layout.tsx         # Root layout & providers
│   ├── page.tsx           # Halaman beranda interaktif
│   └── globals.css        # Neo-brutalist custom styling & tema VS Code
├── components/
│   ├── AppShell.tsx       # Layout container wrapper
│   ├── CodeCard.tsx       # Kartu snippet kode
│   ├── CodePreviewModal.tsx # Quick preview modal dengan VS Code editor
│   ├── MobileTabBar.tsx   # Fixed bottom tab bar khusus mobile
│   ├── Sidebar.tsx        # Neo-brutalist sidebar & drawer navigasi
│   ├── Topbar.tsx         # Navbar minimalis (hamburger + search bar)
│   └── VSCodeViewer.tsx   # Editor code ala Visual Studio Code Dark+
├── lib/
│   ├── auth-context.tsx   # Client auth context & listener live Firestore
│   ├── auth-server.ts     # Server session, rate limiter 5 attempts, bcrypt
│   ├── categories.ts      # Manajemen kategori realtime Firestore
│   ├── config.ts          # Konfigurasi terpusat (Branding, admin, categories)
│   ├── internal-test.ts   # Suite pengujian internal bawaan
│   ├── sample-codes.ts    # Snippet kode awal berkualitas tinggi
│   └── types.ts           # Definisi tipe TypeScript
├── settings.js            # CJS runtime config & build helper
├── .env.example           # Template environment variables
└── README.md              # Dokumentasi lengkap platform
```

---

## 📄 Lisensi
Dikelola oleh **Nimzz** — Dibuat untuk komunitas developer Indonesia.
