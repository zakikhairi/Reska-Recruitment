# Business Requirements Document (BRD)
# KAI Recruitment - Sistem Rekrutmen Smart

**Versi:** 1.0  
**Tanggal:** 24 Juli 2026  
**Perusahaan:** PT Reska Multi Usaha (KAI Services)  
**Pemilik Dokumen:** Tim Development  

---

## 1. Gambaran Umum Proyek

### 1.1 Latar Belakang
KAI Services memerlukan sistem rekrutmen berbasis web yang efisien untuk mengelola proses seleksi karyawan secara digital. Sistem ini dirancang untuk menggantikan proses manual dengan solusi digital yang mencakup seluruh siklus rekrutmen - dari pendaftaran pelamar hingga penempatan karyawan.

### 1.2 Tujuan Proyek
- **Tujuan Utama:** Menerapkan sistem rekrutmen digital end-to-end untuk PT Reska Multi Usaha
- **Tujuan Bisnis:**
  - Mengurangi waktu proses rekrutmen
  - Meningkatkan akurasi seleksi kandidat
  - Menyediakan data real-time untuk pengambilan keputusan
  - Memastikan transparansi proses rekrutmen

### 1.3 Ruang Lingkup
| Termasuk | Tidak Termasuk |
|----------|----------------|
| Landing page publik | Integrasi payroll |
| Pendaftaran pelamar | Sistem absensi |
| Tes kompetensi online | Manajemen kinerja |
| Dashboard HR Admin | Sistem onboarding lengkap |
| Pelaporan dan analitik | Integrasi ERP |

---

## 2. Pengguna Sistem

### 2.1 Jenis Pengguna

| Peran | Deskripsi | Jumlah Estimasi |
|-------|-----------|-----------------|
| **Super Admin** | Akses penuh ke semua fitur sistem | 1-2 |
| **HR Admin** | Mengelola lowongan, pelamar, dan proses seleksi | 3-5 |
| **Applicant (Pelamar)** | Mendaftar dan melamar posisi yang tersedia | 1000+/bulan |

### 2.2 Hak Akses per Peran

| Fitur | Super Admin | HR Admin | Applicant |
|-------|:-----------:|:--------:|:---------:|
| Dashboard Analytics | ✓ | ✓ | ✗ |
| Kelola Lowongan | ✓ | ✓ | ✗ |
| Kelola Bank Soal | ✓ | ✓ | ✗ |
| Konfigurasi Tes | ✓ | ✓ | ✗ |
| Review Pelamar | ✓ | ✓ | ✗ |
| Jadwal Interview | ✓ | ✓ | ✗ |
| Jadwal MCU | ✓ | ✓ | ✗ |
| Export Laporan | ✓ | ✓ | ✗ |
| Lihat Lowongan | ✓ | ✓ | ✓ |
| Daftar Akun | ✗ | ✗ | ✓ |
| Ikuti Tes | ✗ | ✗ | ✓ |
| Lacak Status | ✗ | ✗ | ✓ |

---

## 3. Fitur Utama

### 3.1 Modul Landing Page Publik

#### 3.1.1 Halaman Utama
- Hero section dengan statistik perusahaan
- Informasi manfaat bekerja di KAI Services
- Alur proses lamaran (5 langkah)
- Daftar lowongan tersedia
- Filter berdasarkan divisi dan lokasi
- Search lowongan

#### 3.1.2 Persyaratan
- Responsif untuk mobile dan desktop
- Animasi scroll yang smooth
- Load time < 3 detik

---

### 3.2 Modul Autentikasi

#### 3.2.1 Pendaftaran Pelamar
**Field yang Diperlukan:**
- Email (unique)
- Password (min. 8 karakter)
- NIK (unique)
- Nama Lengkap
- Nomor Telepon
- Tanggal Lahir
- Tempat Lahir
- Jenis Kelamin
- Alamat Lengkap
- Kota
- Kode Pos
- Tinggi Badan (opsional)
- Berat Badan (opsional)
- Pendidikan Terakhir
- Universitas (jika ada)

**Dokumen yang Diupload:**
- Foto Diri
- CV
- Ijazah
- Transkrip Nilai
- Sertifikat (opsional)

#### 3.2.2 Login
- Email + Password
- Remember me option
- Forgot password (future)

---

### 3.3 Modul Dashboard HR Admin

#### 3.3.1 Statistik Utama
- Total Pelamar
- Tes Diselesaikan
- Passing Rate
- Lowongan Aktif

#### 3.3.2 Visualisasi Data
- Grafik tren pelamar bulanan
- Distribusi status pelamar
- Top divisi berdasarkan pelamar
- Recent applications table

#### 3.3.3 Quick Actions
- Buat Lowongan Baru
- Kelola Bank Soal
- Export Laporan

---

### 3.4 Modul Manajemen Lowongan

#### 3.4.1 Buat Lowongan
| Field | Tipe | Wajib |
|-------|------|:-----:|
| Judul Posisi | Text | ✓ |
| Divisi | Select | ✓ |
| Lokasi | Text | ✓ |
| Deskripsi | Textarea | ✓ |
| Persyaratan | Textarea | ✓ |
| Tinggi Badan Min | Number | ✗ |
| Pendidikan Min | Select | ✓ |
| Usia Min | Number | ✗ |
| Usia Max | Number | ✗ |
| Batas Akhir | Date | ✓ |
| Status | Select | ✓ |

#### 3.4.2 Divisi yang Tersedia
- ON_TRAIN_SERVICE (Pramugara/Pramugari Kereta)
- RES_CLEAN (Cleaning Service)
- RES_PARKING (Parkir)
- LOGISTICS (Logistik)
- IT_STAFF (Staff IT)
- ADMIN (Administrasi)

#### 3.4.3 Status Lowongan
- DRAFT
- ACTIVE
- CLOSED
- FILLED

---

### 3.5 Modul Bank Soal

#### 3.5.1 Kategori Soal
| Kode | Kategori | Deskripsi |
|------|----------|-----------|
| AKHLAK | Nilai AKHLAK | Penilaian sikap dan etika kerja |
| HOSPITALITY | Hospitality | Kemampuan layanan pelanggan |
| TECHNICAL | Teknis | Pengetahuan teknis sesuai divisi |
| FACILITY | Fasilitas | Pengelolaan fasilitas kereta |
| APTITUDE | Psikometri | Tes kemampuan berpikir |

#### 3.5.2 Struktur Soal
- Stem (pertanyaan)
- 4 Opsi (A, B, C, D)
- Jawaban Benar
- Tingkat Kesulitan (Easy, Medium, Hard)
- Points
- Explanation (opsional)

---

### 3.6 Modul Tes Kompetensi

#### 3.6.1 Konfigurasi Tes per Lowongan
| Parameter | Default | Deskripsi |
|-----------|---------|-----------|
| Total Durasi | 90 menit | Waktu total tes |
| Waktu per Soal | 90 detik | Opsional |
| Soal per Kategori | 10 | Jumlah soal per kategori |
| Shuffle Questions | Yes | Acak urutan soal |
| Shuffle Answers | Yes | Acak urutan jawaban |
| Allow Tab Switch | No | Izin pindah tab |
| Max Tab Switches | 5 | Maksimum perpindahan tab |

#### 3.6.2 Bobot Penilaian per Kategori
| Kategori | Default Weight |
|----------|----------------|
| AKHLAK | 20% |
| HOSPITALITY | 30% |
| TECHNICAL | 25% |
| FACILITY | 15% |
| APTITUDE | 10% |

#### 3.6.3 Passing Grade
- Per kategori: minimum 60-70%
- Overall: minimum 65%

#### 3.6.4 Monitoring Tes
- Log perpindahan tab
- Timestamp jawaban
- Auto-save progress
- Anti-cheating measures

---

### 3.7 Modul Pelacakan Lamaran

#### 3.7.1 Status Lamaran
| Status | Deskripsi |
|--------|-----------|
| PENDING | Menunggu verifikasi admin |
| ADMIN_CHECK | Sedang diverifikasi admin |
| TEST_SCHEDULED | Tes dijadwalkan |
| IN_TEST | Pelamar sedang mengerjakan tes |
| TEST_COMPLETED | Tes selesai |
| INTERVIEW | Menunggu/dalam interview |
| MCU | Medical Check-Up |
| OFFERED | Offer letter dikirim |
| ACCEPTED | Pelamar menerima offer |
| REJECTED | Ditolak |
| WITHDRAWN | Pelamar withdraw |

#### 3.7.2 Status History
- Tracking setiap perubahan status
- Timestamp perubahan
- Catatan dari admin
- Reviewed by

---

### 3.8 Modul Interview

#### 3.8.1 Detail Interview
| Field | Deskripsi |
|-------|-----------|
| Scheduled At | Tanggal dan waktu |
| Location | Tempat interview |
| Interviewer | Nama pewawancara |
| Type | Recording / Face-to-Face / Hybrid |
| Score | Nilai interview |
| Result | Passed / Failed / Reschedule |

---

### 3.9 Modul Medical Check-Up (MCU)

#### 3.9.1 Detail MCU
| Field | Deskripsi |
|-------|-----------|
| Scheduled At | Tanggal pemeriksaan |
| Location | Tempat MCU |
| Result | FIT / UNFIT / CONDITIONAL |
| Notes | Catatan hasil |

---

### 3.10 Modul Pelaporan

#### 3.10.1 Jenis Laporan
- Laporan Pelamar per Lowongan
- Laporan Hasil Tes
- Laporan Statistik Divisi
- Laporan Passing Rate

#### 3.10.2 Format Export
- PDF Report
- Excel Spreadsheet

---

## 4. Arsitektur Teknis

### 4.1 Stack Teknologi

| Komponen | Teknologi |
|----------|-----------|
| Frontend Framework | Next.js 16.2.11 |
| UI Components | Radix UI + Custom |
| Styling | Tailwind CSS 4 |
| State Management | Zustand |
| Forms | React Hook Form + Zod |
| Database | SQLite (Dev) |
| ORM | Prisma |
| Charts | Recharts |
| PDF Generation | jsPDF + jspdf-autotable |
| Excel Export | xlsx |

### 4.2 Struktur Database

#### Core Entities:
1. **User** - Akun dan autentikasi
2. **Admin** - Data admin HR
3. **Applicant** - Data lengkap pelamar
4. **Document** - Dokumen pelamar
5. **JobPosting** - Lowongan kerja
6. **Application** - Lamaran pelamar
7. **StatusHistory** - Riwayat status
8. **Interview** - Jadwal interview
9. **MedicalCheckup** - Jadwal MCU
10. **TestConfig** - Konfigurasi tes
11. **Question** - Bank soal
12. **TestSession** - Sesi tes pelamar
13. **ApplicantAnswer** - Jawaban tes

### 4.3 API Endpoints

#### Authentication
- POST /api/auth/login - Login user

#### Test Management
- GET /api/test/[sessionId] - Get test session
- POST /api/test/[sessionId]/answer - Submit answer
- POST /api/test/[sessionId]/submit - Submit test
- POST /api/test/[sessionId]/tab-switch - Log tab switch

---

## 5. Alur Proses Bisnis

### 5.1 Alur Pendaftaran Pelamar

\\\
1. Pelamar buka landing page
2. Pelamar klik "Daftar"
3. Pelamar isi form registrasi
4. Sistem buat akun & profile
5. Pelamar login
6. Pelamar lihat lowongan
7. Pelamar klik "Lamar"
8. Sistem buat Application (status: PENDING)
9. Pelamar upload dokumen
10. Notifikasi ke HR Admin
\\\

### 5.2 Alur Seleksi

\\\
1. HR Admin review lamaran
2. Status: ADMIN_CHECK → TEST_SCHEDULED
3. Pelamar mengerjakan tes online
4. Sistem auto-scoring
5. HR Admin lihat hasil
6. Decision: Interview / Reject
7. Jadwal interview
8. Scoring interview
9. Decision: MCU / Reject
10. Jadwal MCU
11. Decision: Offer / Reject
12. Offer letter
13. Pelamar accept/reject
\\\

---

## 6. Requirements Non-Fungsional

### 6.1 Performa
- Page load time: < 3 detik
- API response: < 500ms
- Support 1000+ concurrent users

### 6.2 Keamanan
- Password hashing (bcrypt/future)
- Session-based auth
- Input validation
- XSS protection
- CSRF protection

### 6.3 UX/UI
- Mobile responsive
- Accessible (WCAG 2.1 AA)
- Keyboard navigation
- Loading states
- Error messages yang jelas

### 6.4 Kompatibilitas Browser
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## 7. Roadmap Pengembangan

### Phase 1 - MVP (Current)
- [x] Landing page
- [x] Autentikasi
- [x] Dashboard HR Admin
- [x] Manajemen lowongan
- [x] Bank soal
- [x] Tes online
- [x] Tracking lamaran
- [x] Basic reporting

### Phase 2 - Enhancements
- [ ] Email notifications
- [ ] Dashboard pelamar
- [ ] Profile management
- [ ] Advanced analytics

### Phase 3 - Enterprise
- [ ] Multi-branch support
- [ ] Integration with HRIS
- [ ] AI-powered screening
- [ ] Mobile app

---

## 8. Glossary

| Istilah | Definisi |
|---------|----------|
| Applicant | Pelamar kerja |
| HR Admin | Staff HR yang mengelola rekrutmen |
| Test Session | Sesi pengerjaan tes oleh pelamar |
| Passing Grade | Nilai minimum untuk lulus tes |
| MCU | Medical Check-Up |
| AKHLAK | Nilai-nilai: Amanah, Kompeten, Harmonis, Loyal, Adaptif, Kolaboratif |
| Division |Unit/bagian perusahaan |

---

## 9. Approval

| Peran | Nama | Tanggal | Tanda Tangan |
|-------|------|---------|--------------|
| Project Owner | | | |
| Business Analyst | | | |
| Tech Lead | | | |
| QA Lead | | | |

---

*Dokumen ini adalah properti PT Reska Multi Usaha. Tidak diperbolehkan mendistribusikan tanpa izin.*
