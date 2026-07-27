# BUSINESS REQUIREMENTS DOCUMENT (BRD)
## SISTEM REKRUTMEN CERDAS KAI (SMART RECRUITMENT)
### PT Reska Multi Usaha - PT Kereta Api Indonesia

---

**Versi Dokumen:** 1.0  
**Tanggal:** Juli 2026  
**Status:** Final Draft  
**Penulis:** Tim Pengembang KAI Recruitment

---

## DAFTAR ISI

1. Ringkasan Eksekutif
2. Latar Belakang Proyek
3. Tujuan Proyek
4. Ruang Lingkup
5. Stakeholder
6. Persyaratan Fungsional
7. Persyaratan Non-Fungsional
8. User Stories
9. Use Case Diagram
10. Arsitektur Sistem
11. Persyaratan Teknis
12. Timeline Proyek
13. Risiko dan Mitigasi
14. Anggaran
15. Approval

---

## 1. RINGKASAN EKSEKUTIF

### 1.1 Gambaran Umum
Sistem Rekrutmen Cerdas KAI adalah platform berbasis web yang digunakan untuk mengelola proses rekrutmen di PT Reska Multi Usaha, bagian dari PT Kereta Api Indonesia. Sistem ini menyediakan solusi digital end-to-end untuk pendaftaran pelamar, tes kompetensi, seleksi berbasis kompetensi, dan pengelolaan data pelamar.

### 1.2 Masalah yang Diresahkan
- Proses rekrutmen masih manual dan memakan waktu lama
- Penyimpanan data pelamar tidak terpusat
- Tes kompetensi dilakukan secara offline
- Tidak ada sistem tracking status pelamar
- Kesulitan dalam analisis dan pelaporan data rekrutmen

### 1.3 Solusi yang Ditawarkan
- Platform digital untuk pendaftaran online
- Sistem tes kompetensi berbasis komputer
- Dashboard admin untuk monitoring real-time
- Automasi proses seleksi
- Laporan dan analitik otomatis

### 1.4 Benefit Utama

| Benefit | Deskripsi | Target |
|---------|-----------|--------|
| Efisiensi Waktu | Reduksi waktu proses rekrutmen | 50% lebih cepat |
| Akurasi Data | Data terpusat dan terstandarisasi | 100% |
| Transparansi | Tracking status pelamar real-time | Full visibility |
| Penghematan Biaya | Kurangi biaya operasional | 30% penghematan |
| Kualitas Seleksi | Tes kompetensi konsisten | Standarisasi |

---

## 2. LATAR BELAKANG PROYEEK

### 2.1 Profil Perusahaan

**PT Reska Multi Usaha (KAI Services)**
- Anak perusahaan PT Kereta Api Indonesia (KAI)
- Bidang usaha: layanan sarana dan prasarana kereta api
- Jumlah karyawan: 5.000+ karyawan
- Lokasi: Seluruh Indonesia

### 2.2 Kebutuhan Bisnis

PT Reska Multi Usaha memerlukan sistem rekrutmen yang:
1. Mendukung perekrutan dalam skala besar
2. Memastikan objektivitas dalam seleksi
3. Mempercepat waktu hiring
4. Menyediakan audit trail yang lengkap
5. Mematuhi regulasi ketenagakerjaan Indonesia

### 2.3 Permasalahan Saat Ini

| No | Masalah | Dampak |
|----|---------|--------|
| 1 | Pendaftaran manual | Antrian panjang, human error |
| 2 | Tes tertulis offline | Biaya tinggi, keamanan rendah |
| 3 | Data tersebar | Sulit dilacak, redundan |
| 4 | Komunikasi manual | Respons lambat ke pelamar |
| 5 | Laporan manual | Tidak real-time, tidak akurat |

---

## 3. TUJUAN PROYEK

### 3.1 Tujuan Umum
Membangun sistem rekrutmen digital yang komprehensif untuk mendukung proses rekrutmen PT Reska Multi Usaha dari awal hingga akhir.

### 3.2 Tujuan Khusus

| No | Tujuan | Metrik Keberhasilan |
|----|--------|---------------------|
| 1 | Digitalisasi pendaftaran | 100% pendaftaran online |
| 2 | Otomatisasi tes | Tes dapat dilakukan 24/7 |
| 3 | Centralisasi data | Single source of truth |
| 4 | Tracking real-time | Status update < 1 menit |
| 5 | Reporting otomatis | Laporan bulanan otomatis |

### 3.3 Deliverables

1. Website rekrutmen responsif
2. Sistem manajemen konten (CMS) lowongan
3. Modul tes kompetensi online
4. Dashboard admin HR
5. Dashboard pelamar
6. Sistem notifikasi email
7. Modul laporan dan analitik
8. Dokumentasi teknis dan user manual

---

## 4. RUANG LINGKUP

### 4.1 Lingkup Dalam (In-Scope)

**Modul Pelamar:**
- Pendaftaran akun
- Pengisian formulir lamaran
- Upload dokumen (foto, CV, ijazah)
- Tes kompetensi online
- Tracking status lamaran
- Notifikasi email

**Modul Admin HR:**
- Manajemen lowongan kerja
- Review aplikasi pelamar
- Penjadwalan tes
- Pengelolaan soal tes
- Monitoring real-time
- Laporan dan analitik
- Export data (PDF, Excel, CSV)

**Modul Sistem:**
- Autentikasi dan otorisasi
- Manajemen pengguna
- Sistem notifikasi
- Backup dan restore data
- Logging dan audit trail

### 4.2 Lingkup Luar (Out-of-Scope)

- Integrasi dengan sistem HRIS existing
- Aplikasi mobile native (iOS/Android)
- Integrasi dengan portal pemerintah
- Pembayaran online
- Sistem interview video
- Background checking otomatis

### 4.3 Batasan Proyek

| Aspek | Batasan |
|-------|---------|
| Bahasa | Bahasa Indonesia |
| Mata Uang | IDR (Rupiah) |
| Waktu Operasional | 24 jam, 7 hari seminggu |
| Kapasitas | Hingga 10.000 pelamar bersamaan |
| Masa Penyimpanan Data | 5 tahun |

---

## 5. STAKEHOLDER

### 5.1 Daftar Stakeholder

| Stakeholder | Peran | Kepentingan |
|-------------|-------|--------------|
| Manajemen KAI | Sponsor proyek | Monitoring ROI |
| HRD KAI | Primary user | Operational efficiency |
| IT KAI | Technical support | System maintenance |
| Pelamar Kerja | End user | User experience |
| Supervisor/Manager | Approver | Decision making |

### 5.2 Matriks Stakeholder

| Stakeholder | Kebutuhan Utama | Harapan |
|-------------|-----------------|---------|
| Manajemen | ROI, laporan | Transparansi |
| HRD | Kemudahan kerja | Efisiensi |
| IT | Stabilitas sistem | Dokumentasi |
| Pelamar | Kemudahan daftar | Respons cepat |
| Supervisor | Approval mudah | Data akurat |

---

## 6. PERSYARATAN FUNGSIONAL

### 6.1 Modul Autentikasi

| ID | Persyaratan | Prioritas |
|----|-------------|-----------|
| AUTH-001 | Sistem login dengan email dan password | Wajib |
| AUTH-002 | Registrasi akun pelamar baru | Wajib |
| AUTH-003 | Lupa password dengan reset via email | Wajib |
| AUTH-004 | Logout otomatis setelah 30 menit idle | Wajib |
| AUTH-005 | Session management dengan JWT | Wajib |
| AUTH-006 | Role-based access control (RBAC) | Wajib |

### 6.2 Modul Pendaftaran Pelamar

| ID | Persyaratan | Prioritas |
|----|-------------|-----------|
| REG-001 | Formulir pendaftaran multi-step | Wajib |
| REG-002 | Upload foto profil (max 2MB, JPG/PNG) | Wajib |
| REG-003 | Upload CV (max 5MB, PDF) | Wajib |
| REG-004 | Input data pribadi (NIK, TTL, dll) | Wajib |
| REG-005 | Validasi NIK 16 digit | Wajib |
| REG-006 | Validasi nomor HP Indonesia | Wajib |
| REG-007 | Konfirmasi email setelah daftar | Wajib |

### 6.3 Modul Lowongan Kerja

| ID | Persyaratan | Prioritas |
|----|-------------|-----------|
| JOB-001 | CRUD lowongan kerja | Wajib |
| JOB-002 | Set deadline pendaftaran | Wajib |
| JOB-003 | Kategori divisi pekerjaan | Wajib |
| JOB-004 | Persyaratan lowongan (pendidikan, usia) | Wajib |
| JOB-005 | Status lowongan (draft/aktif/ditutup) | Wajib |
| JOB-006 | Preview lowongan sebelum publish | Opsional |

### 6.4 Modul Tes Kompetensi

| ID | Persyaratan | Prioritas |
|----|-------------|-----------|
| TEST-001 | Bank soal dengan kategori | Wajib |
| TEST-002 | Tes dengan timer | Wajib |
| TEST-003 | Soal acak per pelamar | Wajib |
| TEST-004 | Anti-tab switch (jika diperlukan) | Opsional |
| TEST-005 | Scoring otomatis | Wajib |
| TEST-006 | Hasil tes per kategori | Wajib |
| TEST-007 | Passing grade per lowongan | Wajib |
| TEST-008 | Review jawaban setelah tes | Opsional |

### 6.5 Modul Seleksi

| ID | Persyaratan | Prioritas |
|----|-------------|-----------|
| SEL-001 | Status lamaran (ADMIN_CHECK, TEST, INTERVIEW, MCU, OFFERED, dll) | Wajib |
| SEL-002 | Penjadwalan interview | Wajib |
| TEST-003 | Upload hasil medical check-up | Wajib |
| SEL-004 | Pemberian offer letter | Wajib |
| SEL-005 | Konversi pelamar ke karyawan | Opsional |

### 6.6 Modul Laporan

| ID | Persyaratan | Prioritas |
|----|-------------|-----------|
| REP-001 | Dashboard statistik pelamar | Wajib |
| REP-002 | Laporan jumlah pelamar per lowongan | Wajib |
| REP-003 | Laporan hasil tes | Wajib |
| REP-004 | Export PDF laporan | Wajib |
| REP-005 | Export Excel data pelamar | Wajib |
| REP-006 | Export CSV untuk import | Wajib |
| REP-007 | Grafik dan visualisasi data | Wajib |

### 6.7 Modul Notifikasi

| ID | Persyaratan | Prioritas |
|----|-------------|-----------|
| NOT-001 | Email notifikasi pendaftaran | Wajib |
| NOT-002 | Email notifikasi status lamaran | Wajib |
| NOT-003 | Email reminder tes | Wajib |
| NOT-004 | Email hasil tes | Wajib |
| NOT-005 | Email pengumuman kelulusan | Wajib |

---

## 7. PERSYARATAN NON-FUNGSIONAL

### 7.1 Performa

| Parameter | Target |
|-----------|--------|
| Waktu response halaman | < 3 detik |
| Waktu load halaman utama | < 5 detik |
| Waktu submit form | < 2 detik |
| Kapasitas concurrent user | 1.000+ user |
| Availability | 99.5% uptime |

### 7.2 Keamanan

| Aspek | Persyaratan |
|-------|-------------|
| Enkripsi data | TLS 1.2+ |
| Enkripsi password | SHA-256 atau lebih |
| SQL Injection prevention | Prepared statements |
| XSS prevention | Input sanitization |
| CSRF protection | Token validation |
| Session timeout | 30 menit |
| Backup | Daily automatic |

### 7.3 Kompatibilitas

| Browser | Versi Minimum |
|---------|---------------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |
| Mobile Browser | iOS 14+, Android 10+ |

### 7.4 Skalabilitas

- Mendukung upgrade dari SQLite ke PostgreSQL
- Arsitektur microservices-ready
- CDN-ready untuk static assets
- Load balancer ready

---

## 8. USER STORIES

### 8.1 User Stories - Pelamar

| ID | Sebagai | Saya ingin | Agar | Prioritas |
|----|---------|-----------|------|-----------|
| US-001 | Pelamar | Mampu mendaftar online | Tidak perlu ke kantor | Must |
| US-002 | Pelamar | Mengisi formulir lamaran | Data tersimpan lengkap | Must |
| US-003 | Pelamar | Upload dokumen | Persyaratan terpenuhi | Must |
| US-004 | Pelamar | Mengikuti tes online | Bisa seleksi tahapan berikutnya | Must |
| US-005 | Pelamar | Cek status lamaran | Tahu posisi lamaran saya | Must |
| US-006 | Pelamar | Dapat notifikasi email | Tidak miss informasi | Should |
| US-007 | Pelamar | Reset password sendiri | Tetap bisa login | Must |

### 8.2 User Stories - Admin HR

| ID | Sebagai | Saya ingin | Agar | Prioritas |
|----|---------|-----------|------|-----------|
| US-101 | Admin HR | Buat lowongan kerja | Pelamar bisa melamar | Must |
| US-102 | Admin HR | Review aplikasi | Seleksi pelamar | Must |
| US-103 | Admin HR | Jadwalkan tes | Pelamar bisa ikut tes | Must |
| US-104 | Admin HR | Update status lamaran | Pelamar tahu progresnya | Must |
| US-105 | Admin HR | Export laporan | Analisis data | Must |
| US-106 | Admin HR | Kelola soal tes | Bank soal lengkap | Should |
| US-107 | Admin HR | Dashboard real-time | Monitoring mudah | Should |

### 8.3 User Stories - Supervisor

| ID | Sebagai | Saya ingin | Agar | Prioritas |
|----|---------|-----------|------|-----------|
| US-201 | Supervisor | Approval offer | Pastikan kandidat layak | Must |
| US-202 | Supervisor | Review hasil tes | Decision informed | Must |
| US-203 | Supervisor | Lihat statistik | Evaluasi proses | Should |

---

## 9. USE CASE DIAGRAM

### 9.1 Use Case - Pelamar

```
+------------------------+
|    PELAMAR             |
+------------------------+
|                        |
| +--------------------+ |
| | Daftar Akun        | |
| +--------------------+ |
|          |            |
|          v            |
| +--------------------+ |
| | Login              | |
| +--------------------+ |
|          |            |
|          v            |
| +--------------------+ |
| | Lengkapi Profil    | |
| +--------------------+ |
|          |            |
|          v            |
| +--------------------+ |
| | Lihat Lowongan    |<----+
| +--------------------+ |
|          |            |
|          v            |
| +--------------------+ |
| | Lamar Lowongan    | |
| +--------------------+ |
|          |            |
|          v            |
| +--------------------+ |
| | Ikuti Tes         | |
| +--------------------+ |
|          |            |
|          v            |
| +--------------------+ |
| | Cek Status Lamaran | |
| +--------------------+ |
|          |            |
|          v            |
| +--------------------+ |
| | Reset Password     | |
| +--------------------+ |
+------------------------+
```

### 9.2 Use Case - Admin HR

```
+------------------------+
|    ADMIN HR            |
+------------------------+
|                        |
| +--------------------+ |
| | Login              | |
| +--------------------+ |
|          |            |
|          v            |
| +--------------------+ |
| | CRUD Lowongan      | |
| +--------------------+ |
|          |            |
|          v            |
| +--------------------+ |
| | Review Aplikasi    | |
| +--------------------+ |
|          |            |
|          v            |
| +--------------------+ |
| | Kelola Tes         | |
| +--------------------+ |
|          |            |
|          v            |
| +--------------------+ |
| | Update Status      | |
| +--------------------+ |
|          |            |
|          v            |
| +--------------------+ |
| | Export Laporan     | |
| +--------------------+ |
|          |            |
|          v            |
| +--------------------+ |
| | Dashboard          | |
| +--------------------+ |
+------------------------+
```

### 9.3 Use Case Detail - Login

| Field | Detail |
|-------|--------|
| Use Case ID | UC-001 |
| Use Case Name | Login |
| Actor | Pelamar, Admin HR, Supervisor |
| Description | User melakukan login ke sistem |
| Pre-condition | User sudah memiliki akun |
| Post-condition | User masuk ke dashboard sesuai role |
| Basic Flow | 1. User klik tombol Login |
| | 2. User masukkan email dan password |
| | 3. Sistem validasi kredensial |
| | 4. Sistem redirect ke dashboard |
| Alternative Flow | A1: Email/password salah |
| | -> Tampilkan pesan error |
| | A2: Akun tidak ditemukan |
| | -> Tampilkan pesan error |
| Exception | E1: Koneksi database gagal |
| | -> Tampilkan error maintenance |

---

## 10. ARSITEKTUR SISTEM

### 10.1 Arsitektur Umum

```
                    +------------------+
                    |     CLIENT       |
                    |  (Browser/App)   |
                    +--------+---------+
                             |
                             | HTTPS
                             v
                    +------------------+
                    |   LOAD BALANCER  |
                    +--------+---------+
                             |
              +--------------+--------------+
              |              |              |
              v              v              v
    +-----------------+ +------------------+ +------------------+
    |   WEB SERVER    | |   WEB SERVER     | |   WEB SERVER    |
    |    (Vercel)     | |    (Vercel)      | |    (Vercel)      |
    +--------+--------+ +--------+---------+ +--------+---------+
             |                     |                      |
             +---------------------+----------------------+
                                   |
                                   v
                         +------------------+
                         |   DATABASE       |
                         |  (PostgreSQL)    |
                         +------------------+
                                   |
                         +------------------+
                         |   SMTP SERVER    |
                         |   (Email)        |
                         +------------------+
```

### 10.2 Arsitektur Aplikasi (Next.js)

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── auth/          # Authentication APIs
│   │   ├── jobs/         # Job management APIs
│   │   └── applicants/   # Applicant APIs
│   ├── admin/            # Admin pages
│   ├── applicant/        # Applicant pages
│   └── auth/             # Auth pages (login, register)
├── components/            # React components
│   ├── ui/               # UI components
│   └── layout/           # Layout components
├── lib/                   # Utilities
│   ├── db.ts             # Database connection
│   └── utils.ts          # Helper functions
├── stores/                # Zustand stores
└── types/                # TypeScript types
```

### 10.3 Database Schema Overview

```
User (1) ----< (0:1) Admin
User (1) ----< (0:1) Applicant
User (1) ----< (0:1) PasswordReset

Applicant (1) ----< (*) Application
Applicant (1) ----< (*) TestSession
Applicant (1) ----< (*) Document

JobPosting (1) ----< (*) Application
JobPosting (1) ----< (0:1) TestConfig
JobPosting (1) ----< (*) Question

Application (1) ----< (0:1) Interview
Application (1) ----< (0:1) MedicalCheckup
Application (1) ----< (*) StatusHistory
Application (1) ----< (0:1) TestSession

TestConfig (1) ----< (*) Question
TestSession (1) ----< (*) ApplicantAnswer
```

---

## 11. PERSYARATAN TEKNIS

### 11.1 Tech Stack

| Layer | Teknologi | Keterangan |
|-------|-----------|------------|
| Frontend | Next.js 16 | React framework |
| Backend | Next.js API Routes | Serverless functions |
| Database | PostgreSQL | Primary database |
| ORM | Prisma | Database ORM |
| State Management | Zustand | Client state |
| Styling | Tailwind CSS | Utility-first CSS |
| Email | Nodemailer | Email sending |
| Auth | NextAuth.js | Authentication |
| Hosting | Vercel | Cloud platform |

### 11.2 Persyaratan Server

**Development:**
- Node.js 18+
- npm atau yarn
- SQLite untuk development

**Production:**
- PostgreSQL 14+
- 2 vCPU
- 4 GB RAM
- 50 GB SSD

### 11.3 Environment Variables

```env
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://...
EMAIL_USER=...
EMAIL_PASS=...
```

---

## 12. TIMELINE PROYEK

### 12.1 Fase Proyek

| Fase | Aktivitas | Durasi |
|------|-----------|--------|
| Fase 1 | Planning & Analysis | 2 minggu |
| Fase 2 | Design & Prototyping | 2 minggu |
| Fase 3 | Development Sprint 1 | 3 minggu |
| Fase 4 | Development Sprint 2 | 3 minggu |
| Fase 5 | Testing | 2 minggu |
| Fase 6 | UAT & Training | 2 minggu |
| Fase 7 | Go-Live | 1 minggu |
| **Total** | | **15 minggu** |

### 12.2 Gantt Chart Sederhana

```
Week    1  2  3  4  5  6  7  8  9  10 11 12 13 14 15
Fase 1  XX XX
Fase 2       XX XX
Fase 3            XXXX XXX
Fase 4                     XXX XXX
Fase 5                          XX XX
Fase 6                               XX XX
Fase 7                                    XX
```

### 12.3 Milestone

| Milestone | Tanggal | Deliverable |
|-----------|---------|-------------|
| M1 - Kickoff | Week 1 | Project charter, tim |
| M2 - Design Complete | Week 4 | Wireframes, mockups |
| M3 - MVP Ready | Week 8 | Core features functional |
| M4 - Testing Complete | Week 12 | All tests passed |
| M5 - UAT Complete | Week 14 | User acceptance signed |
| M6 - Go-Live | Week 15 | System production ready |

---

## 13. RISIKO DAN MITIGASI

### 13.1 Risk Register

| ID | Risiko | Dampak | Probabilitas | Mitigasi |
|----|--------|--------|--------------|----------|
| R1 | Keterlambatan vendor | Tinggi | Sedang | Kontrak tegas, milestone |
| R2 | Perubahan requirement | Tinggi | Tinggi | Change request process |
| R3 | Quality issue | Sedang | Rendah | Code review, testing |
| R4 | Security breach | Sangat Tinggi | Rendah | Security audit, SSL |
| R5 | Data loss | Tinggi | Rendah | Backup harian |
| R6 | User adoption rendah | Sedang | Sedang | Training, user involvement |
| R7 | Infrastructure failure | Tinggi | Rendah | Monitoring, SLA |

### 13.2 Mitigation Plan

**R1 - Keterlambatan Vendor:**
- Weekly progress meeting
- Liquidated damages clause
- Alternative vendor on standby

**R2 - Perubahan Requirement:**
- Clear scope document
- Change request form
- Impact analysis before approval

**R4 - Security Breach:**
- Penetration testing
- OWASP compliance
- Security awareness training

---

## 14. ANGGARAN

### 14.1 Ringkasan Anggaran

| Kategori | Jumlah (IDR) |
|----------|--------------|
| Pengembangan | 150.000.000 |
| Infrastruktur (1 tahun) | 36.000.000 |
| Lisensi Software | 15.000.000 |
| Training | 20.000.000 |
| contingensi (10%) | 22.100.000 |
| **Total** | **243.100.000** |

### 14.2 Detail Anggaran Pengembangan

| Komponen | Jumlah (IDR) |
|----------|--------------|
| Frontend Development | 50.000.000 |
| Backend Development | 50.000.000 |
| UI/UX Design | 25.000.000 |
| Project Management | 15.000.000 |
| QA & Testing | 10.000.000 |

### 14.3 Alokasi Anggaran

```
Pengembangan ████████████████████ 62%
Infrastruktur ██ 15%
Training █ 8%
Lisensi █ 6%
Contingency █ 9%
```

---

## 15. APPROVAL

### 15.1 Daftar Penerima

| Peran | Nama | Tanggal | Tanda Tangan |
|-------|------|---------|--------------|
| Sponsor Proyek | | | |
| Project Manager | | | |
| IT Manager | | | |
| HR Manager | | | |
| Quality Assurance | | | |

### 15.2 Riwayat Revisi

| Versi | Tanggal | Author | Perubahan |
|-------|---------|--------|-----------|
| 1.0 | Juli 2026 | Tim Pengembang | Initial draft |

---

## LAMPIRAN

### Lampiran A: Glossary

| Term | Definisi |
|------|----------|
| BRD | Business Requirements Document |
| HRIS | Human Resource Information System |
| KAI | PT Kereta Api Indonesia |
| MCU | Medical Check-Up |
| RBAC | Role-Based Access Control |
| UAT | User Acceptance Testing |

### Lampiran B: Referensi

1. PT Kereta Api Indonesia - Annual Report 2025
2. Permenaker No. 10 Tahun 2018 tentang Tata Cara Penyusunan Formasi
3. OWASP Top 10 Security Guidelines
4. Next.js Documentation v16
5. Prisma Documentation

### Lampiran C: Kontak

| Peran | Nama | Email |
|-------|------|-------|
| Project Manager | Tim KAI | pm@kai-recruitment.com |
| Technical Lead | Tim Dev | dev@kai-recruitment.com |
| IT Support | Helpdesk | support@kai-recruitment.com |

---

**Dokumen ini dibuat untuk keperluan internal PT Reska Multi Usaha**

**© 2026 PT Reska Multi Usaha. Hak cipta dilindungi undang-undang.**
