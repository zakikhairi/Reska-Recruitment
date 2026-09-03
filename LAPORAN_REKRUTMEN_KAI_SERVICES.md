# LAPORAN PENYELENGGARAAN SISTEM REKRUTMEN KAI SERVICES

**Disusun untuk:** Bapak/Ibu Atasan
**Tanggal:** 3 September 2026
**Disusun oleh:** [Nama Pegawai]

---

## 1. DASAR PEMIKIRAN

PT KAI Services merupakan anak perusahaan dari PT Kereta Api Indonesia (KAI) yang bergerak di bidang jasa layanan kereta api. Seiring dengan meningkatnya kebutuhan akan SDM berkualitas di sektor transportasi kereta api, diperlukan sistem rekrutmen yang efisien, transparan, dan akuntabel untuk menjaring calon karyawan terbaik.

Sistem Rekrutmen KAI Services dirancang untuk memfasilitasi seluruh proses rekrutmen secara digital, mulai dari pendaftaran hingga penempatan karyawan baru.

---

## 2. TUJUAN SISTEM

### 2.1 Tujuan Umum
Mewujudkan sistem rekrutmen yang modern, efisien, dan bebas korupsi untuk PT KAI Services.

### 2.2 Tujuan Khusus
1. **Digitalisasi Proses Rekrutmen** - Menghilangkan proses manual yang rentan manipulasi
2. **Transparansi Seleksi** - Memberikan akses informasi yang jelas bagi pelamar
3. **Efisiensi Administratif** - Mempercepat proses administrasi dan seleksi
4. **Akuntabilitas Data** - Mencatat seluruh aktivitas rekrutmen secara digital
5. **Standarisasi Kualitas** - Memastikan proses seleksi yang objektif dan terukur

---

## 3. RUANG LINGKUP SISTEM

### 3.1 Fitur Utama untuk Pelamar (Applicant)

| Modul | Deskripsi |
|-------|-----------|
| Pendaftaran Akun | Pelamar membuat akun dengan data diri lengkap |
| Lengkapi Profil | Upload dokumen identitas, ijazah, foto, dll. |
| Jelajahi Lowongan | Melihat daftar posisi yang tersedia |
| Lamar Lowongan | Mengajukan lamaran pada posisi yang diinginkan |
| Jadwal Tes | Melihat jadwal tes kompetensi dan interview |
| Ujian Online | Mengikuti tes kompetensi secara digital |
| Lacak Aplikasi | Memantau status lamaran secara real-time |

### 3.2 Fitur Utama untuk Admin (Tim HRD)

| Modul | Deskripsi |
|-------|-----------|
| Kelola Lowongan | Membuat, mengedit, dan menutup posisi kosong |
| Kelola Pelamar | Melihat dan memfilter data pelamar |
| Konfigurasi Tes | Mengatur soal dan durasi ujian |
| Kelola Jadwal | Menjadwalkan tes dan interview |
| Penilaian | Memberikan skor dan feedback |
| Laporan | Menghasilkan laporan rekrutmen |
| Kontak | Mengelola daftar kontak pelamar |

### 3.3 Fitur Pendukung

| Fitur | Deskripsi |
|-------|-----------|
| Notifikasi Email | Otomatis kirim email pada setiap perubahan status |
| Chat Interaktif | Floating chat untuk bantuan pelamar |
| Dashboard Real-time | Visualisasi data rekrutmen |
| Export Data | Ekspor laporan ke PDF/Excel |

---

## 4. ARSITEKTUR TEKNOLOGI

### 4.1 Stack Teknologi yang Digunakan

| Komponen | Teknologi | Keterangan |
|----------|-----------|------------|
| Frontend | Next.js 16.2.11 | Framework React modern |
| UI Library | Radix UI + Tailwind CSS | Komponen antarmuka yang responsif |
| Animasi | Framer Motion | Animasi halus pada halaman |
| Backend | Next.js API Routes | Server-side rendering |
| Database | PostgreSQL + Prisma ORM | Penyimpanan data terstruktur |
| Chart | Recharts | Visualisasi data statistik |
| Form | React Hook Form + Zod | Validasi form yang robust |
| State | Zustand | Manajemen state aplikasi |

### 4.2 Bahasa Pemrograman yang Digunakan

| Bahasa | Versi | Fungsi |
|--------|-------|--------|
| **TypeScript** | 5.x | Bahasa utama untuk seluruh kode aplikasi |
| **JavaScript (ES6+)** | - | Untuk script tambahan dan konfigurasi |

**Keterangan:**
- TypeScript dipilih karena memberikan **type safety** yang mengurangi bug saat development
- Semua kode diketik secara eksplisit untuk kemudahan maintenance

### 4.3 Spesifikasi Database

| Aspek | Detail |
|-------|--------|
| **Database Engine** | PostgreSQL |
| **ORM** | Prisma ORM v5.22.0 |
| **Database Adapter** | @prisma/adapter-pg (PostgreSQL) |
| **Alternative** | juga mendukung SQLite (better-sqlite3) untuk development |

**Tabel Database Utama:**

| No | Nama Tabel | Fungsi |
|----|------------|--------|
| 1 | users | Data akun pengguna (pelamar & admin) |
| 2 | jobs | Data lowongan pekerjaan |
| 3 | applications | Data lamaran pelamar |
| 4 | tests | Konfigurasi soal tes |
| 5 | questions | Bank soal |
| 6 | test_sessions | Sesi ujian pelamar |
| 7 | scores | Nilai hasil tes |
| 8 | schedules | Jadwal tes dan interview |
| 9 | contacts | Daftar kontak |
| 10 | reports | Laporan rekrutmen |

### 4.4 Library dan Package Utama

| Library | Versi | Fungsi |
|---------|-------|--------|
| react | 19.2.4 | Library UI utama |
| react-dom | 19.2.4 | DOM rendering |
| next | 16.2.11 | Framework full-stack |
| prisma | 5.22.0 | ORM untuk database |
| zod | 4.4.3 | Schema validation |
| react-hook-form | 7.82.0 | Form handling |
| zustand | 5.0.14 | State management |
| framer-motion | 12.42.2 | Animasi |
| recharts | 3.10.0 | Chart/visualisasi |
| nodemailer | 9.0.3 | Pengiriman email |
| jspdf | 4.2.1 | Generate PDF |
| xlsx | 0.18.5 | Export Excel |
| date-fns | 4.4.0 | Format tanggal |
| lucide-react | 1.25.0 | Icon library |
| tailwindcss | 4 | CSS framework |

### 4.5 Infrastruktur Server

| Komponen | Minimum | Rekomendasi |
|----------|---------|-------------|
| CPU | 2 Core | 4 Core |
| RAM | 4 GB | 8 GB |
| Storage | 50 GB SSD | 100 GB SSD |
| OS | Ubuntu 22.04 / Windows Server 2019 | Ubuntu 22.04 LTS |
| Node.js | v18+ | v20 LTS |
| PostgreSQL | v14 | v16 LTS |

### 4.6 Keamanan Sistem

| Aspek Keamanan | Implementasi |
|----------------|--------------|
| **Autentikasi** | Login dengan email + password (bcrypt hashed) |
| **Session Management** | HTTP-only cookies dengan token JWT |
| **Autorisasi** | Role-based access (Admin / Pelamar) |
| **Validasi Input** | Zod schema validation |
| **SQL Injection** | Parameterized queries via Prisma ORM |
| **XSS Protection** | React's built-in escaping |
| **CSRF Protection** | Next.js built-in CSRF tokens |
| **Rate Limiting** | Terbatas pada API routes |
| **Password Policy** | Min. 8 karakter, hashed dengan bcrypt |

### 4.7 Dependensi Tambahan (Peer Dependencies)

| Library | Fungsi |
|---------|--------|
| Radix UI Components | Dialog, Dropdown, Select, Tabs, dll |
| Class Variance Authority (CVA) | Variant management untuk komponen |
| Clsx + Tailwind-merge | Conditional class handling |

### 4.8 Lisensi dan Legal

| Aspek | Keterangan |
|-------|------------|
| Lisensi | Proprietary (milik KAI Services) |
| Source Code | Tidak open source |
| third-party | Menggunakan library open source dengan lisensi MIT/Apache |

---

## 5. DESAIN ANTARMUKA (UI/UX)

### 5.1 Identitas Visual

| Elemen | Spesifikasi |
|--------|-------------|
| Warna Utama | Biru Tua (#00205B) - Warna korporasi KAI |
| Warna Aksen | Orange (#FF5E00) - Tombol CTA dan highlight |
| Tipografi | Font modern dengan keterbacaan tinggi |
| Layout | Responsive untuk desktop, tablet, dan mobile |

### 5.2 Struktur Halaman Homepage

Halaman utama dirancang dengan section berikut:

1. **Hero Section** - Slideshow informasi dengan animasi modern
2. **Statistik** - Angka rolling animasi (pelamar, posisi, dsb.)
3. **Mengapa Bergabung** - Keuntungan bekerja di KAI Services
4. **Cara Melamar** - Panduan langkah demi langkah
5. **Lowongan Terbaru** - Daftar posisi yang dibuka
6. **Footer** - Kontak dan tautan penting

---

## 7. MANFAAT SISTEM

### 7.1 Manfaat bagi Perusahaan

| Aspek | Sebelum (Manual) | Sesudah (Digital) |
|-------|------------------|------------------|
| Waktu Processing | 2-4 minggu | 3-7 hari |
| Biaya Operasional | Tinggi (cetak, ruangan) | Minimal |
| Akurasi Data | Rentan error manusia | 99.9% akurat |
| Transparansi | Sulit diawasi | Full audit trail |
| Kapasitas Pelamar | Terbatas | Unlimited |

### 7.2 Manfaat bagi Pelamar

- Pendaftaran mudah dari mana saja
- Tidak perlu datang ke kantor untuk awal proses
- Transparansi status lamaran
- Feedback yang cepat
- Hemat waktu dan biaya

### 7.3 Manfaat bagi Tim HRD

- Manajemen data pelamar yang terorganisir
- Otomatisasi proses administrasi
- Laporan real-time
- Seleksi berbasis data
- Efisiensi waktu untuk fokus pada wawancara

---

## 8. PROSES REKRUTMEN

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  REGISTER   │───▶│   PROFILE   │───▶│   APPLY     │───▶│    TEST     │───▶│ INTERVIEW   │
│  & LOGIN    │    │  COMPLETE   │    │   JOB       │    │  ONLINE     │    │             │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                                                                    │
                                                                                    ▼
                                                                           ┌─────────────┐
                                                                           │   OFFER     │
                                                                           │  & HIRE     │
                                                                           └─────────────┘
```

### Tahapan Seleksi:
1. **Registrasi & Verifikasi** - Pelamar membuat akun
2. **Kelengkapan Dokumen** - Upload persyaratan
3. **Seleksi Administrasi** - Admin memfilter pelamar
4. **Tes Kompetensi Online** - Ujian sesuai posisi
5. **Interview** - Wawancara HRD dan User
6. **Offering Letter** - Penawaran kerja
7. **Onboarding** - Orientasi dan penempatan

---

## 9. KEBIJAKAN ANTIKORUPSI

### 8.1 Mekanisme Pencegahan

| Potensi Masalah | Solusi Sistem |
|----------------|---------------|
| Manipulasi data pelamar | Audit log untuk seluruh perubahan |
| Kecurangan ujian | Timer terkontrol + random soal |
| Nepotisme | Screening anonim untuk admin |
| Mark-up biaya | Tidak ada komponen pembayaran |
| Seleksi tidak objektif | Scoring terstandarisasi |

### 8.2 Transparansi

- Pelamar dapat melihat status lamaran secara real-time
- Jadwal tes diinformasikan melalui email
- Hasil seleksi disertai alasan/kriteria
- Dashboard publik untuk statistik rekrutmen

---

## 10. RENCANA PENGEMBANGAN

### 9.1 Short Term (2026)
- Integrasi dengan sistem HRD existing KAI
- Modul assessment psikotes
- Dashboard analitik tingkat lanjut

### 9.2 Long Term (2027)
- Aplikasi mobile untuk pelamar
- Integrasi dengan NJPT ( Nasional Jasa Pengadaan Terintegrasi)
- Fitur video interview
- AI-powered resume screening

---

## 11. KESIMPULAN

Sistem Rekrutmen KAI Services merupakan wujud komitmen perusahaan dalam menerapkan prinsip **Good Corporate Governance (GCG)** dalam proses rekrutmen. Dengan sistem ini, diharapkan:

1. **Proses lebih efisien** dan bebas dari praktik Korupsi, Kolusi, dan Nepotisme (KKN)
2. **SDM lebih berkualitas** melalui seleksi yang objektif dan terukur
3. **Transparansi meningkat** sehingga membangun kepercayaan publik
4. **Image perusahaan menguat** sebagai BUMN yang profesional

---

## 12. LAMPIRAN

### A. Screenshot Tampilan Sistem
(Lampirkan screenshot halaman utama, halaman pelamar, halaman admin)

### B. Dokumen Pendukung
- User Manual Pelamar
- User Manual Admin
- Panduan Teknis Instalasi
- Data Flow Diagram

### C. Kontak Teknis
- Tim IT Support: [nomor kontak]
- Email: [alamat email]

---

**Mengetahui/Menyetujui,**

_________________________
[Nama Atasan]
[Jabatan]


_________________________
[Nama Pegawai]
[Nama Jabatan]
