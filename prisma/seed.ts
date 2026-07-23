import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";
import dotenv from "dotenv";

// Load .env file
dotenv.config();

const dbPath = path.join(process.cwd(), "prisma", "dev.db");
const dbUrl = process.env.DATABASE_URL || `file:${dbPath}`;
const adapter = new PrismaLibSql({
  url: dbUrl,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting database seed...");

  // Create Admin User
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@kai.co.id" },
    update: {},
    create: {
      email: "admin@kai.co.id",
      passwordHash: "$2a$10$example_hash_admin", // In production, use proper hashing
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
  console.log("✅ Admin user created:", adminUser.email);

  // Create Applicant User
  const applicantUser = await prisma.user.upsert({
    where: { email: "applicant@kai.co.id" },
    update: {},
    create: {
      email: "applicant@kai.co.id",
      passwordHash: "$2a$10$example_hash_applicant",
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
          address: "Jl. Merdeka No. 123",
          city: "Bandung",
          postalCode: "40111",
          height: 172,
          weight: 68,
          education: "SMA",
        },
      },
    },
  });
  console.log("✅ Applicant user created:", applicantUser.email);

  // Create Job Postings
  const jobs = [
    {
      title: "Pramugara / Pramugari Kereta Api",
      division: "ON_TRAIN_SERVICE",
      location: "Jakarta, Bandung, Surabaya",
      description: "Melayani penumpang kereta api dengan ramah dan profesional",
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
      location: "Bandung",
      description: "Membantu kelancaran layanan di dalam kereta",
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
      description: "Mengelola sistem IT dan jaringan di seluruh cabang",
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
      location: "Madiun",
      description: "Merawat dan memperbaiki komponen kereta api",
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
      location: "Bandung, Jakarta",
      description: "Membersihkan dan menjaga kebersihan stasiun dan kereta",
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
      description: "Mengelola administrasi perkantoran",
      requirements: "D3/S1 Administrasi Bisnis atau Komunikasi",
      minHeight: null,
      minEducation: "D3",
      minAge: 20,
      maxAge: 30,
      status: "ACTIVE",
      deadline: new Date("2026-08-18"),
    },
  ];

  for (const job of jobs) {
    await prisma.jobPosting.upsert({
      where: { id: job.title.toLowerCase().replace(/\s+/g, "-") },
      update: job,
      create: {
        ...job,
        id: job.title.toLowerCase().replace(/\s+/g, "-"),
      },
    });
  }
  console.log("✅ Job postings created:", jobs.length);

  // Create Test Config for first job
  const pramugaraJob = await prisma.jobPosting.findUnique({
    where: { id: "pramugara-pramugari-kereta-api" },
  });

  if (pramugaraJob) {
    await prisma.testConfig.upsert({
      where: { jobPostingId: pramugaraJob.id },
      update: {},
      create: {
        jobPostingId: pramugaraJob.id,
        categories: "AKHLAK,HOSPITALITY,TECHNICAL,APTITUDE",
        categoryWeights: JSON.stringify({
          AKHLAK: 25,
          HOSPITALITY: 35,
          TECHNICAL: 20,
          APTITUDE: 20,
        }),
        passingGrades: JSON.stringify({
          AKHLAK: 60,
          HOSPITALITY: 70,
          TECHNICAL: 55,
          APTITUDE: 60,
        }),
        overallPassingGrade: 65,
        totalDurationMinutes: 90,
        questionsPerCategory: 10,
        shuffleQuestions: true,
        shuffleAnswers: true,
        allowTabSwitch: false,
        maxTabSwitches: 5,
      },
    });
    console.log("✅ Test config created for:", pramugaraJob.title);
  }

  // Create Questions
  const questions = [
    // AKHLAK Questions
    {
      category: "AKHLAK",
      stem: "Apa singkatan dari nilai-nilai AKHLAK yang menjadi budaya perusahaan BUMN?",
      optionA: "Amanah, Kompeten, Harmonis, Loyal, Akhir",
      optionB: "Amanah, Kompeten, Harmonis, Loyal, Akhlak",
      optionC: "Amanah, Kuat, Harmonis, Loyal, Akhlak",
      optionD: "Amanah, Kreatif, Harmonis, Loyal, Akhlak",
      correctAnswer: "B",
      difficulty: "EASY",
    },
    {
      category: "AKHLAK",
      stem: "\"Jujur dalam pikiran, perkataan, dan perbuatan\" merupakan definisi dari nilai...",
      optionA: "Kompeten",
      optionB: "Harmonis",
      optionC: "Amanah",
      optionD: "Loyal",
      correctAnswer: "C",
      difficulty: "MEDIUM",
    },
    {
      category: "AKHLAK",
      stem: "Nilai \"Harmonis\" dalam AKHLAK berarti...",
      optionA: "Bekerja keras tanpa henti",
      optionB: "Saling menghargai despite perbedaan",
      optionC: "Taat pada aturan perusahaan",
      optionD: "Mengutamakan kepentingan bersama",
      correctAnswer: "B",
      difficulty: "MEDIUM",
    },
    {
      category: "AKHLAK",
      stem: "Seorang karyawan yang \"Loyal\" ditunjukkan dengan...",
      optionA: "Hanya bekerja sesuai jam kerja",
      optionB: "Setia pada perusahaan dan memberikan yang terbaik",
      optionC: "Tidak pernah mengajukan kritik",
      optionD: "Menghindari tanggung jawab tambahan",
      correctAnswer: "B",
      difficulty: "EASY",
    },
    {
      category: "AKHLAK",
      stem: "\"AKHLAK\" merupakan akronim yangdigagas oleh...",
      optionA: "Kementerian BUMN",
      optionB: "PT Kereta Api Indonesia",
      optionC: "Presiden Republik Indonesia",
      optionD: "Kementerian Ketenagakerjaan",
      correctAnswer: "A",
      difficulty: "EASY",
    },
    // HOSPITALITY Questions
    {
      category: "HOSPITALITY",
      stem: "Seorang pramugara/pramugari kereta api harus memiliki kemampuan untuk menangani penumpang dengan berbagai tingkah laku. Ini termasuk dalam aspek...",
      optionA: "Keterampilan teknis",
      optionB: "Manajemen konflik",
      optionC: "Keterampilan komunikasi",
      optionD: "Kepemimpinan",
      correctAnswer: "B",
      difficulty: "MEDIUM",
    },
    {
      category: "HOSPITALITY",
      stem: "Apa yang dimaksud dengan \"service excellence\" dalam konteks layanan kereta api?",
      optionA: "Layanan standar sesuai prosedur",
      optionB: "Layanan terbaik yang melebihi ekspektasi pelanggan",
      optionC: "Layanan tercepat yang tersedia",
      optionD: "Layanan termurah yang bisa diberikan",
      correctAnswer: "B",
      difficulty: "EASY",
    },
    {
      category: "HOSPITALITY",
      stem: "Langkah pertama saat menangani penumpang yang mengeluh adalah...",
      optionA: "Mengabaikan keluhannya",
      optionB: "Mendengarkan dengan penuh perhatian",
      optionC: "Menyalahkan penumpang lain",
      optionD: "Langsung memberikan solusi",
      correctAnswer: "B",
      difficulty: "EASY",
    },
    {
      category: "HOSPITALITY",
      stem: "Dalam memberikan layanan, gesture \"Salam, Sapa, Senyum\" termasuk dalam kategori...",
      optionA: "Technical skill",
      optionB: "Soft skill",
      optionC: "Hard skill",
      optionD: "Management skill",
      correctAnswer: "B",
      difficulty: "EASY",
    },
    {
      category: "HOSPITALITY",
      stem: "Apa yang harus dilakukan saat penumpang membutuhkan bantuan khusus (disabilitas)?",
      optionA: "Meng arahkan ke petugas lain",
      optionB: "Memberikan bantuan dengan penuh perhatian dan hormat",
      optionC: "Membiarkan penumpang mencari sendiri",
      optionD: "Mengabaikan permintaan khusus",
      correctAnswer: "B",
      difficulty: "MEDIUM",
    },
    // TECHNICAL Questions
    {
      category: "TECHNICAL",
      stem: "Komponen utama yang menghubungkan antar gerbong kereta api disebut...",
      optionA: "Trunion",
      optionB: "Coupler",
      optionC: "Bogie",
      optionD: "Buffer",
      correctAnswer: "B",
      difficulty: "MEDIUM",
    },
    {
      category: "TECHNICAL",
      stem: "Sistem rem darurat pada kereta api bekerja berdasarkan prinsip...",
      optionA: "Tekanan hidrolik",
      optionB: "Tekanan udara comprimida",
      optionC: "Pegas mekanik",
      optionD: "Elektromagnetik",
      correctAnswer: "B",
      difficulty: "HARD",
    },
    {
      category: "TECHNICAL",
      stem: "Apa fungsi dari \"Bogie\" pada kereta api?",
      optionA: "Menggerakkan kereta",
      optionB: "Menyangga dan menopang gerbong",
      optionC: "Menghentikan kereta",
      optionD: "Menghubungkan gerbong",
      correctAnswer: "B",
      difficulty: "MEDIUM",
    },
    {
      category: "TECHNICAL",
      stem: "AC pada kereta api singkatan dari...",
      optionA: "Air Conditioner",
      optionB: "Automatic Control",
      optionC: "Alternating Current",
      optionD: "Air Compressor",
      correctAnswer: "A",
      difficulty: "EASY",
    },
    {
      category: "TECHNICAL",
      stem: "Kereta api diesel memiliki komponen utama berupa...",
      optionA: "Mesin bensin",
      optionB: "Mesin diesel elektrik",
      optionC: "Mesin uap",
      optionD: "Mesin turbo",
      correctAnswer: "B",
      difficulty: "HARD",
    },
    // APTITUDE Questions
    {
      category: "APTITUDE",
      stem: "Jika semua X adalah Y, dan beberapa Y adalah Z, maka...",
      optionA: "Semua X adalah Z",
      optionB: "Beberapa X adalah Z",
      optionC: "Tidak ada X yang adalah Z",
      optionD: "Tidak dapat ditentukan",
      correctAnswer: "D",
      difficulty: "HARD",
    },
    {
      category: "APTITUDE",
      stem: "Deret angka: 2, 6, 12, 20, 30, ... Bilangan selanjutnya adalah?",
      optionA: "40",
      optionB: "42",
      optionC: "44",
      optionD: "46",
      correctAnswer: "B",
      difficulty: "HARD",
    },
    {
      category: "APTITUDE",
      stem: "Jika 3x + 7 = 22, maka nilai x adalah...",
      optionA: "3",
      optionB: "5",
      optionC: "7",
      optionD: "15",
      correctAnswer: "B",
      difficulty: "EASY",
    },
    {
      category: "APTITUDE",
      stem: "Manusia : Otak = Bunga : ...",
      optionA: "Daun",
      optionB: "Akar",
      optionC: "Mahkota",
      optionD: "Tanah",
      correctAnswer: "C",
      difficulty: "MEDIUM",
    },
    {
      category: "APTITUDE",
      stem: "Sebuah toko menjual barang dengan harga Rp 150.000 dan memberikan diskon 20%. Harga setelah diskon adalah...",
      optionA: "Rp 120.000",
      optionB: "Rp 130.000",
      optionC: "Rp 140.000",
      optionD: "Rp 145.000",
      correctAnswer: "A",
      difficulty: "MEDIUM",
    },
  ];

  for (const question of questions) {
    await prisma.question.create({
      data: question,
    });
  }
  console.log("✅ Questions created:", questions.length);

  console.log("🎉 Database seed completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
