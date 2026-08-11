import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Simple hash function
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return "demo_" + Math.abs(hash).toString(16);
}

const DEMO_HASH = simpleHash("demo123");

async function main() {
  console.log("🌱 Starting database seed...\n");

  // ========== ADMIN USER ==========

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
          fullName: "Admin HR",
          employeeId: "EMP001",
          department: "Human Resources",
        },
      },
    },
  });
  console.log("✅ Admin created:", admin.email);

  // ========== JOB POSTINGS ==========

  const jobs = [
    {
      title: "Pramugara / Pramugari Kereta Api",
      division: "ON_TRAIN_SERVICE",
      location: "Jakarta, Bandung, Surabaya",
      description: "Melayani penumpang kereta api dengan ramah dan profesional, memastikan kenyamanan selama perjalanan.",
      requirements: "SMA/SMK semua jurusan, tinggi minimal 160cm (wanita) / 165cm (pria), usia 18-25 tahun",
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
      requirements: "SMA/SMK pariwisata atau perhotelan, pengalaman minimal 1 tahun",
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
      requirements: "S1 Teknik Informatika / Sistem Informasi, IPK minimal 3.0",
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
      requirements: "D3/S1 Teknik Mesin atau Elektro",
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
      requirements: "SMA/SMK, pengalaman cleaning service diutamakan",
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
    { jobId: "pramugara-pramugari-kereta-api", categories: "AKHLAK,HOSPITALITY,TECHNICAL,APTITUDE", weights: { AKHLAK: 25, HOSPITALITY: 35, TECHNICAL: 20, APTITUDE: 20 }, passing: { AKHLAK: 60, HOSPITALITY: 70, TECHNICAL: 55, APTITUDE: 60 }, duration: 90 },
    { jobId: "steward-kereta-api", categories: "AKHLAK,HOSPITALITY,APTITUDE", weights: { AKHLAK: 30, HOSPITALITY: 40, APTITUDE: 30 }, passing: { AKHLAK: 60, HOSPITALITY: 70, APTITUDE: 60 }, duration: 75 },
    { jobId: "staff-it-support", categories: "AKHLAK,TECHNICAL,APTITUDE", weights: { AKHLAK: 20, TECHNICAL: 50, APTITUDE: 30 }, passing: { AKHLAK: 55, TECHNICAL: 65, APTITUDE: 60 }, duration: 120 },
    { jobId: "teknisi-maintenance-kereta", categories: "AKHLAK,TECHNICAL,APTITUDE", weights: { AKHLAK: 20, TECHNICAL: 55, APTITUDE: 25 }, passing: { AKHLAK: 55, TECHNICAL: 65, APTITUDE: 60 }, duration: 90 },
    { jobId: "cleaning-service-resclean", categories: "AKHLAK,HOSPITALITY", weights: { AKHLAK: 40, HOSPITALITY: 60 }, passing: { AKHLAK: 60, HOSPITALITY: 65 }, duration: 60 },
    { jobId: "staff-administrasi", categories: "AKHLAK,APTITUDE", weights: { AKHLAK: 40, APTITUDE: 60 }, passing: { AKHLAK: 60, APTITUDE: 65 }, duration: 75 },
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
    { category: "AKHLAK", stem: "Apa singkatan dari nilai-nilai AKHLAK?", optionA: "Amanah, Kompeten, Harmonis, Loyal, Akhir", optionB: "Amanah, Kompeten, Harmonis, Loyal, Akhlak", optionC: "Amanah, Kuat, Harmonis, Loyal, Akhlak", optionD: "Amanah, Kreatif, Harmonis, Loyal, Akhlak", correctAnswer: "B", difficulty: "EASY" },
    { category: "AKHLAK", stem: "\"Jujur dalam pikiran, perkataan, dan perbuatan\" merupakan definisi dari nilai...", optionA: "Kompeten", optionB: "Harmonis", optionC: "Amanah", optionD: "Loyal", correctAnswer: "C", difficulty: "MEDIUM" },
    { category: "AKHLAK", stem: "Nilai \"Loyal\" berarti...", optionA: "Hanya bekerja sesuai jam kerja", optionB: "Setia pada perusahaan dan memberikan yang terbaik", optionC: "Tidak pernah mengajukan kritik", optionD: "Menghindari tanggung jawab", correctAnswer: "B", difficulty: "EASY" },
    { category: "AKHLAK", stem: "\"Kompeten\" berarti memiliki kemampuan untuk...", optionA: "Bekerja sama dengan tim", optionB: "Menyelesaikan tugas dengan baik sesuai standar", optionC: "Mengikuti semua peraturan", optionD: "Mengambil keputusan sendiri", correctAnswer: "B", difficulty: "MEDIUM" },
    { category: "AKHLAK", stem: "Dalam konflik dengan rekan kerja, AKHLAK menganjurkan...", optionA: "Menghindar sepenuhnya", optionB: "Membicarakan secara terbuka dan mencari solusi", optionC: "Melaporkan ke atasan langsung", optionD: "Mengabaikan masalah", correctAnswer: "B", difficulty: "MEDIUM" },
    { category: "HOSPITALITY", stem: "\"Service excellence\" berarti...", optionA: "Layanan standar sesuai prosedur", optionB: "Layanan terbaik yang melebihi ekspektasi pelanggan", optionC: "Layanan tercepat yang tersedia", optionD: "Layanan termurah", correctAnswer: "B", difficulty: "EASY" },
    { category: "HOSPITALITY", stem: "Langkah pertama saat penumpang mengeluh adalah...", optionA: "Mengabaikan keluhannya", optionB: "Mendengarkan dengan penuh perhatian", optionC: "Menyalahkan penumpang lain", optionD: "Langsung memberikan solusi", correctAnswer: "B", difficulty: "EASY" },
    { category: "HOSPITALITY", stem: "Saat kereta akan berangkat, pramugara sebaiknya...", optionA: "Duduk dan bersantai", optionB: "Memastikan semua penumpang sudah duduk dengan aman", optionC: "Makan bersama kru", optionD: "Berbincang dengan teman", correctAnswer: "B", difficulty: "EASY" },
    { category: "HOSPITALITY", stem: "Saat menghadapi penumpang marah, pendekatan terbaik adalah...", optionA: "Membalas kemarahan", optionB: "Tetap tenang, empati, dan cari solusi", optionC: "Menghindari penumpang tersebut", optionD: "Meminta maaf tanpa alasan", correctAnswer: "B", difficulty: "MEDIUM" },
    { category: "HOSPITALITY", stem: "Attitude positif dalam bekerja meliputi...", optionA: "Menyalahkan sistem", optionB: "Proaktif membantu dan ramah", optionC: "Bekerja sesuai instruksi saja", optionD: "Menghindari tanggung jawab", correctAnswer: "B", difficulty: "EASY" },
    { category: "TECHNICAL", stem: "KVL pada kereta berfungsi untuk...", optionA: "Pendingin ruangan", optionB: "Penghubung listrik antar gerbong", optionC: "Sistem keamanan", optionD: "Pengukur kecepatan", correctAnswer: "B", difficulty: "HARD" },
    { category: "TECHNICAL", stem: "Apa kepanjangan dari KAI?", optionA: "Kereta Api Indonesia", optionB: "KAI Services", optionC: "Komersial Angle Indonesia", optionD: "Koneksi Angkutan Intermoda", correctAnswer: "A", difficulty: "EASY" },
    { category: "TECHNICAL", stem: "PT Reska Multi Usaha adalah anak perusahaan dari...", optionA: "PT MRT Jakarta", optionB: "PT KAI", optionC: "PT Garuda Indonesia", optionD: "PT Transportasi Jakarta", correctAnswer: "B", difficulty: "EASY" },
    { category: "TECHNICAL", stem: "AC pada kereta api singkatan dari...", optionA: "Air Conditioner", optionB: "Automatic Control", optionC: "Alternating Current", optionD: "Air Compressor", correctAnswer: "A", difficulty: "EASY" },
    { category: "TECHNICAL", stem: "Sinyal kereta api berfungsi untuk...", optionA: "Menghias stasiun", optionB: "Mengatur dan menjaga keselamatan perjalanan", optionC: "Memberi peringatan suara", optionD: "Menghitung penumpang", correctAnswer: "B", difficulty: "EASY" },
    { category: "APTITUDE", stem: "Jika 3x + 7 = 22, maka x = ?", optionA: "3", optionB: "5", optionC: "7", optionD: "15", correctAnswer: "B", difficulty: "EASY" },
    { category: "APTITUDE", stem: "Hitung: 15% dari 200 = ?", optionA: "25", optionB: "30", optionC: "35", optionD: "40", correctAnswer: "B", difficulty: "EASY" },
    { category: "APTITUDE", stem: "Deret: 2, 6, 12, 20, 30, ...下一个是?", optionA: "40", optionB: "42", optionC: "44", optionD: "46", correctAnswer: "B", difficulty: "HARD" },
    { category: "APTITUDE", stem: "10, 8, 11, 9, 12, 10, 13, ...下一个是?", optionA: "11", optionB: "14", optionC: "12", optionD: "15", correctAnswer: "A", difficulty: "MEDIUM" },
    { category: "APTITUDE", stem: "Kamus : Kata = Perpustakaan : ...", optionA: "Buku", optionB: "Rak", optionC: "Mahasiswa", optionD: "Pengunjung", correctAnswer: "A", difficulty: "MEDIUM" },
    { category: "FACILITY", stem: "Area stasiun untuk menunggu kereta disebut...", optionA: "Peron", optionB: "Hall", optionC: "Kantin", optionD: "Ruang tunggu VIP", correctAnswer: "A", difficulty: "EASY" },
    { category: "FACILITY", stem: "Fasilitas untuk disabilitas meliputi...", optionA: "Hanya lift", optionB: "Lift, ramp, dan guiding block", optionC: "Hanya ramp", optionD: "Tidak ada", correctAnswer: "B", difficulty: "EASY" },
    { category: "FACILITY", stem: "Sistem informasi yang menampilkan jadwal kereta disebut...", optionA: "Papan informasi", optionB: "Tiket elektronik", optionC: "Loker bagasi", optionD: "Ruang menyusui", correctAnswer: "A", difficulty: "EASY" },
    { category: "FACILITY", stem: "Kelistrikan di kereta api dihasilkan oleh...", optionA: "Baterai saja", optionB: "Generator atau rel listrik", optionC: "Panel surya", optionD: "Tidak ada listrik", correctAnswer: "B", difficulty: "MEDIUM" },
    { category: "FACILITY", stem: "Toilet di kereta api harus dalam kondisi...", optionA: "Bebas digunakan kapan saja", optionB: "Bersih dan berfungsi dengan baik", optionC: "Dikunci setiap saat", optionD: "Tidak perlu perawatan", correctAnswer: "B", difficulty: "EASY" },
  ];

  await prisma.question.deleteMany({});
  for (const q of questions) {
    await prisma.question.create({ data: q });
  }
  console.log("✅ Questions created:", questions.length);

  console.log("\n🎉 Database seed completed!");
  console.log("\n📋 Test Credentials:");
  console.log("   Admin: admin@kai.co.id / demo123");
  console.log("\n📌 Catatan: Tidak ada data pelamar contoh.");
  console.log("   Silakan daftar sebagai pelamar baru.");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
