import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

// Simple hash function
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return "demo_" + Math.abs(hash).toString(16);
}

const DEMO_HASH = simpleHash("demo123");

const dbPath = path.join(process.cwd(), "prisma", "dev.db");
const dbUrl = process.env.DATABASE_URL || `file:${dbPath}`;
const adapter = new PrismaLibSql({ url: dbUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting database seed...\n");

  // ========== USERS ==========

  // Admin User
  const admin = await prisma.user.upsert({
    where: { email: "admin@kai.co.id" },
    update: { passwordHash: DEMO_HASH },
    create: {
      email: "admin@kai.co.id",
      passwordHash: DEMO_HASH,
      role: "HR_ADMIN",
      emailVerified: true,
      admin: {
        create: {
          fullName: "Dewi Lestari",
          employeeId: "EMP001",
          department: "Human Resources",
        },
      },
    },
  });
  console.log("✅ Admin:", admin.email);

  // Applicant User
  const applicant = await prisma.user.upsert({
    where: { email: "applicant@kai.co.id" },
    update: { passwordHash: DEMO_HASH },
    create: {
      email: "applicant@kai.co.id",
      passwordHash: DEMO_HASH,
      role: "APPLICANT",
      emailVerified: true,
      applicant: {
        create: {
          nik: "3201234567890123",
          fullName: "Ahmad Wijaya",
          phone: "081234567890",
          dateOfBirth: new Date("1998-05-15"),
          placeOfBirth: "Bandung",
          gender: "MALE",
          address: "Jl. Merdeka No. 123, RT 001/RW 005",
          city: "Bandung",
          postalCode: "40111",
          height: 172,
          weight: 68,
          education: "SMA",
          university: null,
        },
      },
    },
    include: { applicant: true },
  });
  console.log("✅ Applicant:", applicant.email);

  // Second Applicant
  const applicant2 = await prisma.user.upsert({
    where: { email: "siti@kai.co.id" },
    update: { passwordHash: DEMO_HASH },
    create: {
      email: "siti@kai.co.id",
      passwordHash: DEMO_HASH,
      role: "APPLICANT",
      emailVerified: true,
      applicant: {
        create: {
          nik: "3201234567890124",
          fullName: "Siti Nurhaliza",
          phone: "081234567891",
          dateOfBirth: new Date("1999-03-22"),
          placeOfBirth: "Jakarta",
          gender: "FEMALE",
          address: "Jl. Sudirman No. 45",
          city: "Jakarta Selatan",
          postalCode: "12190",
          height: 160,
          weight: 52,
          education: "S1",
          university: "Universitas Indonesia",
        },
      },
    },
    include: { applicant: true },
  });
  console.log("✅ Applicant:", applicant2.email);

  // ========== JOB POSTINGS ==========

  const jobs = [
    {
      title: "Pramugara / Pramugari Kereta Api",
      division: "ON_TRAIN_SERVICE",
      location: "Jakarta, Bandung, Surabaya",
      description: "Melayani penumpang kereta api dengan ramah dan profesional, memastikan kenyamanan selama perjalanan.",
      requirements: "SMA/SMK semua jurusan, tinggi minimal 160cm (wanita) / 165cm (pria), usia 18-25 tahun, mampu berbahasa Inggris dasar",
      minHeight: 160,
      minEducation: "SMA",
      minAge: 18,
      maxAge: 25,
      status: "ACTIVE",
      deadline: new Date("2026-08-15"),
    },
    {
      title: "Steward Kereta Api",
      division: "ON_TRAIN_SERVICE",
      location: "Bandung, Jakarta",
      description: "Membantu kelancaran layanan di dalam kereta, melayani makanan dan minuman penumpang.",
      requirements: "SMA/SMK pariwisata atau perhotelan, pengalaman minimal 1 tahun di bidang hospitality",
      minHeight: 158,
      minEducation: "SMA",
      minAge: 20,
      maxAge: 30,
      status: "ACTIVE",
      deadline: new Date("2026-08-20"),
    },
    {
      title: "Staff IT Support",
      division: "IT_STAFF",
      location: "Jakarta",
      description: "Mengelola sistem IT dan jaringan di seluruh cabang KAI Services.",
      requirements: "S1 Teknik Informatika / Sistem Informasi, IPK minimal 3.0, pengalaman jaringan komputer",
      minHeight: null,
      minEducation: "S1",
      minAge: 22,
      maxAge: 35,
      status: "ACTIVE",
      deadline: new Date("2026-08-10"),
    },
    {
      title: "Teknisi Maintenance Kereta",
      division: "LOGISTICS",
      location: "Madiun, Bandung",
      description: "Merawat dan memperbaiki komponen mekanik dan elektrik kereta api.",
      requirements: "D3/S1 Teknik Mesin atau Elektro, memiliki sertifikat kompetensi diutamakan",
      minHeight: null,
      minEducation: "D3",
      minAge: 20,
      maxAge: 35,
      status: "ACTIVE",
      deadline: new Date("2026-08-25"),
    },
    {
      title: "Cleaning Service - ResClean",
      division: "RES_CLEAN",
      location: "Bandung, Jakarta, Surabaya",
      description: "Membersihkan dan menjaga kebersihan stasiun, kereta, dan area вокзал.",
      requirements: "SMA/SMK, pengalaman cleaning service diutamakan, berusia 18-35 tahun",
      minHeight: 155,
      minEducation: "SMA",
      minAge: 18,
      maxAge: 35,
      status: "ACTIVE",
      deadline: new Date("2026-09-01"),
    },
    {
      title: "Staff Administrasi",
      division: "ADMIN",
      location: "Jakarta",
      description: "Mengelola administrasi perkantoran, dokumentasi, dan komunikasi internal.",
      requirements: "D3/S1 Administrasi Bisnis atau Komunikasi, mahir Microsoft Office",
      minHeight: null,
      minEducation: "D3",
      minAge: 20,
      maxAge: 30,
      status: "ACTIVE",
      deadline: new Date("2026-08-18"),
    },
    {
      title: "Pengelola Parkir - ResParking",
      division: "RES_PARKING",
      location: "Bandung, Jakarta",
      description: "Mengelola area parkir di stasiun kereta api.",
      requirements: "SMA/SMK, pengalaman di bidang parkir atau keamanan",
      minHeight: 160,
      minEducation: "SMA",
      minAge: 20,
      maxAge: 40,
      status: "ACTIVE",
      deadline: new Date("2026-09-10"),
    },
  ];

  const createdJobs = [];
  for (const job of jobs) {
    const created = await prisma.jobPosting.upsert({
      where: { id: job.title.toLowerCase().replace(/\s+/g, "-").replace(/\//g, "-") },
      update: job,
      create: {
        ...job,
        id: job.title.toLowerCase().replace(/\s+/g, "-").replace(/\//g, "-"),
      },
    });
    createdJobs.push(created);
  }
  console.log("✅ Jobs created:", createdJobs.length);

  // ========== TEST CONFIGURATIONS ==========

  const testConfigs = [
    {
      jobId: "pramugara-pramugari-kereta-api",
      categories: "AKHLAK,HOSPITALITY,TECHNICAL,APTITUDE",
      weights: { AKHLAK: 25, HOSPITALITY: 35, TECHNICAL: 20, APTITUDE: 20 },
      passing: { AKHLAK: 60, HOSPITALITY: 70, TECHNICAL: 55, APTITUDE: 60 },
      duration: 90,
    },
    {
      jobId: "steward-kereta-api",
      categories: "AKHLAK,HOSPITALITY,APTITUDE",
      weights: { AKHLAK: 30, HOSPITALITY: 40, APTITUDE: 30 },
      passing: { AKHLAK: 60, HOSPITALITY: 70, APTITUDE: 60 },
      duration: 75,
    },
    {
      jobId: "staff-it-support",
      categories: "AKHLAK,TECHNICAL,APTITUDE",
      weights: { AKHLAK: 20, TECHNICAL: 50, APTITUDE: 30 },
      passing: { AKHLAK: 55, TECHNICAL: 65, APTITUDE: 60 },
      duration: 120,
    },
    {
      jobId: "teknisi-maintenance-kereta",
      categories: "AKHLAK,TECHNICAL,APTITUDE",
      weights: { AKHLAK: 20, TECHNICAL: 55, APTITUDE: 25 },
      passing: { AKHLAK: 55, TECHNICAL: 65, APTITUDE: 60 },
      duration: 90,
    },
    {
      jobId: "cleaning-service-resclean",
      categories: "AKHLAK,HOSPITALITY",
      weights: { AKHLAK: 40, HOSPITALITY: 60 },
      passing: { AKHLAK: 60, HOSPITALITY: 65 },
      duration: 60,
    },
    {
      jobId: "staff-administrasi",
      categories: "AKHLAK,APTITUDE",
      weights: { AKHLAK: 40, APTITUDE: 60 },
      passing: { AKHLAK: 60, APTITUDE: 65 },
      duration: 75,
    },
  ];

  for (const config of testConfigs) {
    const job = await prisma.jobPosting.findUnique({ where: { id: config.jobId } });
    if (job) {
      await prisma.testConfig.upsert({
        where: { jobPostingId: job.id },
        update: {},
        create: {
          jobPostingId: job.id,
          categories: config.categories,
          categoryWeights: JSON.stringify(config.weights),
          passingGrades: JSON.stringify(config.passing),
          overallPassingGrade: 65,
          totalDurationMinutes: config.duration,
          questionsPerCategory: 5,
          shuffleQuestions: true,
          shuffleAnswers: true,
          allowTabSwitch: false,
          maxTabSwitches: 3,
        },
      });
    }
  }
  console.log("✅ Test configs created:", testConfigs.length);

  // ========== QUESTIONS ==========

  const questions = [
    // AKHLAK - 10 questions
    { category: "AKHLAK", stem: "Apa singkatan dari nilai-nilai AKHLAK yang menjadi budaya perusahaan BUMN?", optionA: "Amanah, Kompeten, Harmonis, Loyal, Akhir", optionB: "Amanah, Kompeten, Harmonis, Loyal, Akhlak", optionC: "Amanah, Kuat, Harmonis, Loyal, Akhlak", optionD: "Amanah, Kreatif, Harmonis, Loyal, Akhlak", correctAnswer: "B", difficulty: "EASY" },
    { category: "AKHLAK", stem: "\"Jujur dalam pikiran, perkataan, dan perbuatan\" merupakan definisi dari nilai...", optionA: "Kompeten", optionB: "Harmonis", optionC: "Amanah", optionD: "Loyal", correctAnswer: "C", difficulty: "MEDIUM" },
    { category: "AKHLAK", stem: "Nilai \"Harmonis\" dalam AKHLAK berarti...", optionA: "Bekerja keras tanpa henti", optionB: "Saling menghargai despite perbedaan", optionC: "Taat pada aturan perusahaan", optionD: "Mengutamakan kepentingan bersama", correctAnswer: "B", difficulty: "MEDIUM" },
    { category: "AKHLAK", stem: "Seorang karyawan yang \"Loyal\" ditunjukkan dengan...", optionA: "Hanya bekerja sesuai jam kerja", optionB: "Setia pada perusahaan dan memberikan yang terbaik", optionC: "Tidak pernah mengajukan kritik", optionD: "Menghindari tanggung jawab tambahan", correctAnswer: "B", difficulty: "EASY" },
    { category: "AKHLAK", stem: "\"AKHLAK\" merupakan akronim yang digagas oleh...", optionA: "Kementerian BUMN", optionB: "PT Kereta Api Indonesia", optionC: "Presiden Republik Indonesia", optionD: "Kementerian Ketenagakerjaan", correctAnswer: "A", difficulty: "EASY" },
    { category: "AKHLAK", stem: "\"Kompeten\" berarti memiliki kemampuan untuk...", optionA: "Bekerja sama dengan tim", optionB: "Menyelesaikan tugas dengan baik sesuai standar", optionC: "Mengikuti semua peraturan", optionD: "Mengambil keputusan sendiri", correctAnswer: "B", difficulty: "MEDIUM" },
    { category: "AKHLAK", stem: "Nilai \"Adaptif\" dalam AKHLAK mendorong karyawan untuk...", optionA: "Tetap pada cara lama yang sudah terbukti", optionB: "Terus belajar dan mengikuti perubahan", optionC: "Menolak perubahan apapun", optionD: "Bekerja secara individual", correctAnswer: "B", difficulty: "MEDIUM" },
    { category: "AKHLAK", stem: "\"Kolaboratif\" berarti bersedia untuk...", optionA: "Bekerja sendiri tanpa bantuan orang lain", optionB: "Bekerja sama mencapai tujuan bersama", optionC: "Mengambil kredit atas kerja tim", optionD: "Menghindari komunikasi", correctAnswer: "B", difficulty: "EASY" },
    { category: "AKHLAK", stem: "Dalam situasi konflik dengan rekan kerja, nilai AKHLAK menganjurkan...", optionA: "Menghindar sepenuhnya", optionB: "Membicarakan secara terbuka dan mencari solusi", optionC: "Melaporkan ke atasan langsung", optionD: "Mengabaikan masalah", correctAnswer: "B", difficulty: "MEDIUM" },
    { category: "AKHLAK", stem: "Menjaga citra positif perusahaan termasuk penerapan nilai...", optionA: "Hanya Loyal", optionB: "Loyal dan Amanah", optionC: "Hanya Kompeten", optionD: "Hanya Harmonis", correctAnswer: "B", difficulty: "MEDIUM" },

    // HOSPITALITY - 10 questions
    { category: "HOSPITALITY", stem: "Seorang pramugara/pramugari kereta api harus mampu menangani penumpang dengan berbagai tingkah laku. Ini termasuk dalam aspek...", optionA: "Keterampilan teknis", optionB: "Manajemen konflik", optionC: "Keterampilan komunikasi", optionD: "Kepemimpinan", correctAnswer: "B", difficulty: "MEDIUM" },
    { category: "HOSPITALITY", stem: "Apa yang dimaksud dengan \"service excellence\" dalam konteks layanan kereta api?", optionA: "Layanan standar sesuai prosedur", optionB: "Layanan terbaik yang melebihi ekspektasi pelanggan", optionC: "Layanan tercepat yang tersedia", optionD: "Layanan termurah yang bisa diberikan", correctAnswer: "B", difficulty: "EASY" },
    { category: "HOSPITALITY", stem: "Langkah pertama saat menangani penumpang yang mengeluh adalah...", optionA: "Mengabaikan keluhannya", optionB: "Mendengarkan dengan penuh perhatian", optionC: "Menyalahkan penumpang lain", optionD: "Langsung memberikan solusi", correctAnswer: "B", difficulty: "EASY" },
    { category: "HOSPITALITY", stem: "Gesture \"Salam, Sapa, Senyum\" termasuk dalam kategori...", optionA: "Technical skill", optionB: "Soft skill", optionC: "Hard skill", optionD: "Management skill", correctAnswer: "B", difficulty: "EASY" },
    { category: "HOSPITALITY", stem: "Apa yang harus dilakukan saat penumpang membutuhkan bantuan khusus (disabilitas)?", optionA: "Meng arahkan ke petugas lain", optionB: "Memberikan bantuan dengan penuh perhatian dan hormat", optionC: "Membiarkan penumpang mencari sendiri", optionD: "Mengabaikan permintaan khusus", correctAnswer: "B", difficulty: "MEDIUM" },
    { category: "HOSPITALITY", stem: "Saat kereta akan berangkat, apa yang harus dilakukan pramugara?", optionA: "Duduk dan bersantai", optionB: "Memastikan semua penumpang sudah duduk dengan aman", optionC: "Makan bersama kru", optionD: "Berbincang dengan teman", correctAnswer: "B", difficulty: "EASY" },
    { category: "HOSPITALITY", stem: "Jika ada penumpang yang merokok di area terlarang, pramugara sebaiknya...", optionA: "Mengabaikan", optionB: "Mengingatkan dengan sopan dan informatif", optionC: "Menegur dengan keras", optionD: "Melaporkan ke polisi", correctAnswer: "B", difficulty: "MEDIUM" },
    { category: "HOSPITALITY", stem: "Kualitas layanan yang baik terhadap penumpang dapat meningkatkan...", optionA: "Biaya operasional", optionB: "Reputasi dan kepercayaan pelanggan terhadap KAI", optionC: "Jumlah karyawan", optionD: "Harga tiket", correctAnswer: "B", difficulty: "EASY" },
    { category: "HOSPITALITY", stem: "Attitude positif dalam bekerja di layanan kereta api meliputi...", optionA: "Menyalahkan sistem jika ada masalah", optionB: "Proaktif membantu dan ramah kepada penumpang", optionC: "Bekerja sesuai instruksi saja", optionD: "Menghindari tanggung jawab", correctAnswer: "B", difficulty: "EASY" },
    { category: "HOSPITALITY", stem: "Saat menghadapi penumpang yang marah, pendekatan terbaik adalah...", optionA: "Membalas kemarahan dengan kemarahan", optionB: "Tetap tenang, empati, dan cari solusi", optionC: "Menghindari penumpang tersebut", optionD: "Meminta maaf tanpa alasan", correctAnswer: "B", difficulty: "MEDIUM" },

    // TECHNICAL - 10 questions
    { category: "TECHNICAL", stem: "Komponen utama yang menghubungkan antar gerbong kereta api disebut...", optionA: "Trunion", optionB: "Coupler", optionC: "Bogie", optionD: "Buffer", correctAnswer: "B", difficulty: "MEDIUM" },
    { category: "TECHNICAL", stem: "Sistem rem darurat pada kereta api bekerja berdasarkan prinsip...", optionA: "Tekanan hidrolik", optionB: "Tekanan udara comprimida", optionC: "Pegas mekanik", optionD: "Elektromagnetik", correctAnswer: "B", difficulty: "HARD" },
    { category: "TECHNICAL", stem: "Apa fungsi dari \"Bogie\" pada kereta api?", optionA: "Menggerakkan kereta", optionB: "Menyangga dan menopang gerbong", optionC: "Menghentikan kereta", optionD: "Menghubungkan gerbong", correctAnswer: "B", difficulty: "MEDIUM" },
    { category: "TECHNICAL", stem: "AC pada kereta api singkatan dari...", optionA: "Air Conditioner", optionB: "Automatic Control", optionC: "Alternating Current", optionD: "Air Compressor", correctAnswer: "A", difficulty: "EASY" },
    { category: "TECHNICAL", stem: "Kereta api diesel memiliki komponen utama berupa...", optionA: "Mesin bensin", optionB: "Mesin diesel elektrik", optionC: "Mesin uap", optionD: "Mesin turbo", correctAnswer: "B", difficulty: "HARD" },
    { category: "TECHNICAL", stem: "Siginal kereta api berfungsi untuk...", optionA: "Menghias stasiun", optionB: "Mengatur dan menjaga keselamatan perjalanan", optionC: "Memberi peringatan suara", optionD: "Menghitung penumpang", correctAnswer: "B", difficulty: "EASY" },
    { category: "TECHNICAL", stem: "Rel kereta api diletakkan di atas...", optionA: "Tanah langsung", optionB: "Bantalan dan ballast", optionC: "Karet", optionD: "Besi hollow", correctAnswer: "B", difficulty: "MEDIUM" },
    { category: "TECHNICAL", stem: "Apa kepanjangan dari KAI?", optionA: "Kereta Api Indonesia", optionB: "KAI Services", optionC: "Komersial Angle Indonesia", optionD: "Koneksi Angkutan Intermoda", correctAnswer: "A", difficulty: "EASY" },
    { category: "TECHNICAL", stem: "PT Reska Multi Usaha merupakan anak perusahaan dari...", optionA: "PT MRT Jakarta", optionB: "PT KAI (Kereta Api Indonesia)", optionC: "PT Garuda Indonesia", optionD: "PT Transportasi Jakarta", correctAnswer: "B", difficulty: "EASY" },
    { category: "TECHNICAL", stem: "KVL (Kabel Vest Led) pada kereta berfungsi untuk...", optionA: "Pendingin ruangan", optionB: "Penghubung listrik antar gerbong", optionC: "Sistem keamanan", optionD: "Pengukur kecepatan", correctAnswer: "B", difficulty: "HARD" },

    // APTITUDE - 10 questions
    { category: "APTITUDE", stem: "Jika semua X adalah Y, dan beberapa Y adalah Z, maka...", optionA: "Semua X adalah Z", optionB: "Beberapa X adalah Z", optionC: "Tidak ada X yang adalah Z", optionD: "Tidak dapat ditentukan", correctAnswer: "D", difficulty: "HARD" },
    { category: "APTITUDE", stem: "Deret angka: 2, 6, 12, 20, 30, ... Bilangan selanjutnya adalah?", optionA: "40", optionB: "42", optionC: "44", optionD: "46", correctAnswer: "B", difficulty: "HARD" },
    { category: "APTITUDE", stem: "Jika 3x + 7 = 22, maka nilai x adalah...", optionA: "3", optionB: "5", optionC: "7", optionD: "15", correctAnswer: "B", difficulty: "EASY" },
    { category: "APTITUDE", stem: "Manusia : Otak = Bunga : ...", optionA: "Daun", optionB: "Akar", optionC: "Mahkota", optionD: "Tanah", correctAnswer: "C", difficulty: "MEDIUM" },
    { category: "APTITUDE", stem: "Sebuah toko menjual barang dengan harga Rp 150.000 dan memberikan diskon 20%. Harga setelah diskon adalah...", optionA: "Rp 120.000", optionB: "Rp 130.000", optionC: "Rp 140.000", optionD: "Rp 145.000", correctAnswer: "A", difficulty: "MEDIUM" },
    { category: "APTITUDE", stem: "10, 8, 11, 9, 12, 10, 13, ... pola bilangan selanjutnya?", optionA: "11", optionB: "14", optionC: "12", optionD: "15", correctAnswer: "A", difficulty: "MEDIUM" },
    { category: "APTITUDE", stem: "Semua mahasiswa adalah orang yang belajar. Semua orang yang belajar akan Pintar. Jadi...", optionA: "Semua mahasiswa pasti Pintar", optionB: "Beberapa mahasiswa tidak Pintar", optionC: "Tidak ada kesimpulan yang pasti", optionD: "Semua yang Pintar adalah mahasiswa", correctAnswer: "A", difficulty: "MEDIUM" },
    { category: "APTITUDE", stem: "Hitung: 15% dari 200 = ?", optionA: "25", optionB: "30", optionC: "35", optionD: "40", correctAnswer: "B", difficulty: "EASY" },
    { category: "APTITUDE", stem: "Kamus : Kata = Perpustakaan : ...", optionA: "Buku", optionB: "Rak", optionC: "Mahasiswa", optionD: "Pengunjung", correctAnswer: "A", difficulty: "MEDIUM" },
    { category: "APTITUDE", stem: "Jika 4 pekerja dapat menyelesaikan pekerjaan dalam 6 hari, berapa hari jika 8 pekerja?", optionA: "2 hari", optionB: "3 hari", optionC: "4 hari", optionD: "12 hari", correctAnswer: "B", difficulty: "MEDIUM" },

    // FACILITY - 5 questions
    { category: "FACILITY", stem: "Area вокзал yang digunakan untuk menunggu kereta disebut...", optionA: "Peron", optionB: "Hall", optionC: "Kantin", optionD: "Ruang tunggu VIP", correctAnswer: "A", difficulty: "EASY" },
    { category: "FACILITY", stem: "Fasilitas untuk penumpang disabilitas di stasiun meliputi...", optionA: "Hanya lift", optionB: "Lift, ramp, dan guiding block", optionC: "Hanya ramp", optionD: "Tidak ada fasilitas khusus", correctAnswer: "B", difficulty: "EASY" },
    { category: "FACILITY", stem: "Toilet di kereta api harus dalam kondisi...", optionA: "Bebas digunakan kapan saja", optionB: "Bersih dan berfungsi dengan baik", optionC: "Dikunci setiap saat", optionD: "Tidak perlu perawatan", correctAnswer: "B", difficulty: "EASY" },
    { category: "FACILITY", stem: "Sistem informasi di stasiun yang menampilkan jadwal kereta называется...", optionA: "Papan informasi", optionB: "Tiket elektronik", optionC: "Loker bagasi", optionD: "Ruang menyusui", correctAnswer: "A", difficulty: "EASY" },
    { category: "FACILITY", stem: "Kelistrikan di kereta api dihasilkan oleh...", optionA: "Baterai saja", optionB: "Generator atau rel listrik", optionC: "Panel surya", optionD: "Tidak ada listrik", correctAnswer: "B", difficulty: "MEDIUM" },
  ];

  // Clear existing questions and create new ones
  await prisma.question.deleteMany({});
  for (const q of questions) {
    await prisma.question.create({ data: q });
  }
  console.log("✅ Questions created:", questions.length);

  // ========== APPLICATIONS ==========

  if (applicant.applicant) {
    const pramugara = createdJobs.find(j => j.title.includes("Pramugara"));
    const itStaff = createdJobs.find(j => j.title.includes("IT Support"));

    if (pramugara) {
      await prisma.application.upsert({
        where: { applicantId_jobPostingId: { applicantId: applicant.applicant.id, jobPostingId: pramugara.id } },
        update: {},
        create: {
          applicantId: applicant.applicant.id,
          jobPostingId: pramugara.id,
          status: "TEST_COMPLETED",
          notes: "Tes kompetensi selesai dengan nilai baik",
        },
      });
      console.log("✅ Application 1 (Pramugara) created for applicant 1");
    }

    if (itStaff) {
      await prisma.application.upsert({
        where: { applicantId_jobPostingId: { applicantId: applicant.applicant.id, jobPostingId: itStaff.id } },
        update: {},
        create: {
          applicantId: applicant.applicant.id,
          jobPostingId: itStaff.id,
          status: "INTERVIEW",
          notes: "Lulus tes, menunggu jadwal interview",
        },
      });
      console.log("✅ Application 2 (IT Staff) created for applicant 1");
    }
  }

  // Create application for applicant 2
  if (applicant2.applicant) {
    const steward = createdJobs.find(j => j.title.includes("Steward"));
    if (steward) {
      await prisma.application.upsert({
        where: { applicantId_jobPostingId: { applicantId: applicant2.applicant.id, jobPostingId: steward.id } },
        update: {},
        create: {
          applicantId: applicant2.applicant.id,
          jobPostingId: steward.id,
          status: "PENDING",
          notes: "Lamaran baru",
        },
      });
      console.log("✅ Application (Steward) created for applicant 2");
    }
  }

  console.log("\n🎉 Database seed completed!");
  console.log("\n📋 Test Credentials:");
  console.log("   Admin:     admin@kai.co.id / demo123");
  console.log("   Applicant: applicant@kai.co.id / demo123");
  console.log("   Applicant2: siti@kai.co.id / demo123");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
