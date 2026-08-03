import 'dotenv/config';
import { db } from '../src/lib/db';
import { users, admins, applicants, jobPostings, testConfigs, questions, applications, testSessions } from '../src/lib/db/schema';

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

async function main() {
  console.log("🌱 Starting database seed...\n");

  // ========== USERS ==========
  const adminUser1 = await db.insert(users).values({
    email: 'admin@kai.co.id',
    passwordHash: DEMO_HASH,
    role: 'SUPER_ADMIN',
    emailVerified: true,
  }).returning().then(r => r[0]);

  const adminUser2 = await db.insert(users).values({
    email: 'wubisonodhanu888@gmail.com',
    passwordHash: DEMO_HASH,
    role: 'HR_ADMIN',
    emailVerified: true,
  }).returning().then(r => r[0]);

  const applicantUser1 = await db.insert(users).values({
    email: 'applicant@kai.co.id',
    passwordHash: DEMO_HASH,
    role: 'APPLICANT',
    emailVerified: true,
  }).returning().then(r => r[0]);

  const applicantUser2 = await db.insert(users).values({
    email: 'siti@kai.co.id',
    passwordHash: DEMO_HASH,
    role: 'APPLICANT',
    emailVerified: true,
  }).returning().then(r => r[0]);

  const applicantUser3 = await db.insert(users).values({
    email: 'pelamar@test.com',
    passwordHash: DEMO_HASH,
    role: 'APPLICANT',
    emailVerified: true,
  }).returning().then(r => r[0]);

  console.log("✅ Users created");

  // ========== ADMINS ==========
  await db.insert(admins).values({
    userId: adminUser1.id,
    fullName: 'Admin Utama',
    employeeId: 'EMP001',
    department: 'HRD',
  });

  await db.insert(admins).values({
    userId: adminUser2.id,
    fullName: 'Wubisono Dhanu',
    employeeId: 'EMP002',
    department: 'Recruitment',
  });

  console.log("✅ Admin users created");

  // ========== APPLICANTS ==========
  const app1 = await db.insert(applicants).values({
    userId: applicantUser1.id,
    nik: '3201234567890001',
    fullName: 'Ahmad Wijaya',
    phone: '081234567890',
    dateOfBirth: new Date('1995-03-15'),
    placeOfBirth: 'Jakarta',
    gender: 'MALE',
    address: 'Jl. Sudirman No. 123',
    city: 'Jakarta Selatan',
    postalCode: '12190',
    height: 172,
    weight: 68,
    education: 'S1',
    university: 'Universitas Indonesia',
  }).returning().then(r => r[0]);

  const app2 = await db.insert(applicants).values({
    userId: applicantUser2.id,
    nik: '3201234567890002',
    fullName: 'Siti Nurhaliza',
    phone: '081234567891',
    dateOfBirth: new Date('1997-07-22'),
    placeOfBirth: 'Bandung',
    gender: 'FEMALE',
    address: 'Jl. Asia Afrika No. 45',
    city: 'Bandung',
    postalCode: '40111',
    height: 160,
    weight: 55,
    education: 'D3',
    university: 'Politeknik Bandung',
  }).returning().then(r => r[0]);

  const app3 = await db.insert(applicants).values({
    userId: applicantUser3.id,
    nik: '3201234567890003',
    fullName: 'Budi Santoso',
    phone: '081234567892',
    dateOfBirth: new Date('1993-11-08'),
    placeOfBirth: 'Surabaya',
    gender: 'MALE',
    address: 'Jl. Basuki Rahmat No. 78',
    city: 'Surabaya',
    postalCode: '60271',
    height: 168,
    weight: 72,
    education: 'SMA',
  }).returning().then(r => r[0]);

  console.log("✅ Applicants created");

  // ========== JOB POSTINGS ==========
  const jobs = await db.insert(jobPostings).values([
    {
      title: 'Pramugara',
      division: 'ON_TRAIN_SERVICE',
      location: 'Jakarta',
      description: 'Melayani penumpang kereta api dengan ramah dan profesional.',
      requirements: 'Usia 18-25 tahun, Tinggi minimal 165cm (pria) / 160cm (wanita), SMA/SMK semua jurusan',
      minHeight: 165,
      minEducation: 'SMA',
      minAge: 18,
      maxAge: 25,
      status: 'ACTIVE',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'Pramugari',
      division: 'ON_TRAIN_SERVICE',
      location: 'Jakarta',
      description: 'Melayani penumpang kereta api dengan ramah dan profesional.',
      requirements: 'Usia 18-25 tahun, Tinggi minimal 160cm, SMA/SMK semua jurusan',
      minHeight: 160,
      minEducation: 'SMA',
      minAge: 18,
      maxAge: 25,
      status: 'ACTIVE',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'Cleaning Service',
      division: 'RES_CLEAN',
      location: 'Jakarta',
      description: 'Menjaga kebersihan stasiun dan kereta api.',
      requirements: 'Usia 20-35 tahun, SMA/SMK semua jurusan',
      minEducation: 'SMA',
      minAge: 20,
      maxAge: 35,
      status: 'ACTIVE',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'Steward',
      division: 'RES_PARKING',
      location: 'Bandung',
      description: 'Melayani penumpang di area parkir dan rest area.',
      requirements: 'Usia 20-30 tahun, SMA/SMK semua jurusan',
      minEducation: 'SMA',
      minAge: 20,
      maxAge: 30,
      status: 'ACTIVE',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'Staff IT',
      division: 'IT_STAFF',
      location: 'Jakarta',
      description: 'Mengelola sistem informasi dan infrastruktur IT.',
      requirements: 'S1 Teknik Informatika / Sistem Informasi, Pengalaman min 2 tahun',
      minEducation: 'S1',
      minAge: 22,
      maxAge: 35,
      status: 'ACTIVE',
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'Admin Staff',
      division: 'ADMIN',
      location: 'Jakarta',
      description: 'Mengelola administrasi dan dokumentasi.',
      requirements: 'D3 / S1 Administrasi Bisnis atau jurusan terkait',
      minEducation: 'D3',
      minAge: 20,
      maxAge: 30,
      status: 'ACTIVE',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'Staff Logistik',
      division: 'LOGISTICS',
      location: 'Surabaya',
      description: 'Mengelola logistik dan distribusi.',
      requirements: 'SMA / D3 semua jurusan',
      minEducation: 'SMA',
      minAge: 20,
      maxAge: 35,
      status: 'ACTIVE',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  ]).returning();

  console.log(`✅ Jobs created: ${jobs.length}`);

  // ========== TEST CONFIGS ==========
  const testConfigsData = jobs.slice(0, 6).map(job => ({
    jobPostingId: job.id,
    categories: 'AKHLAK,HOSPITALITY',
    categoryWeights: JSON.stringify({ AKHLAK: 50, HOSPITALITY: 50 }),
    passingGrades: JSON.stringify({ AKHLAK: 60, HOSPITALITY: 70 }),
    overallPassingGrade: 65,
    totalDurationMinutes: 90,
    questionsPerCategory: 10,
    shuffleQuestions: true,
    shuffleAnswers: true,
    allowTabSwitch: false,
    maxTabSwitches: 3,
    isActive: true,
  }));

  await db.insert(testConfigs).values(testConfigsData);
  console.log(`✅ Test configs created: ${testConfigsData.length}`);

  // ========== QUESTIONS ==========
  const questionsData = [
    // AKHLAK Questions
    ...Array.from({ length: 15 }, (_, i) => ({
      category: 'AKHLAK' as const,
      stem: `Pertanyaan AKHLAK #${i + 1}: Apa arti amanah dalam AKHLAK KAI?`,
      optionA: 'Menjaga kepercayaan yang diberikan',
      optionB: 'Bekerja sesuai jam kerja',
      optionC: 'Menghindari kesalahan',
      optionD: 'Menyelesaikan tugas cepat',
      correctAnswer: 'A',
      difficulty: 'MEDIUM' as const,
      points: 1,
    })),
    // HOSPITALITY Questions
    ...Array.from({ length: 15 }, (_, i) => ({
      category: 'HOSPITALITY' as const,
      stem: `Pertanyaan Hospitality #${i + 1}: Bagaimana cara menangani penumpang yang protes?`,
      optionA: 'Mendengarkan dan membantu dengan ramah',
      optionB: 'Mengabaikan penumpang',
      optionC: 'Menyalahkan penumpang',
      optionD: 'Melapor ke atasan saja',
      correctAnswer: 'A',
      difficulty: 'MEDIUM' as const,
      points: 1,
    })),
    // TECHNICAL Questions
    ...Array.from({ length: 5 }, (_, i) => ({
      category: 'TECHNICAL' as const,
      stem: `Pertanyaan Teknis #${i + 1}: Apa yang Anda ketahui tentang sistem KAI?`,
      optionA: 'Sistem pelayanan kereta api Indonesia',
      optionB: 'Sistem keamanan',
      optionC: 'Sistem keuangan',
      optionD: 'Sistem pembelian',
      correctAnswer: 'A',
      difficulty: 'HARD' as const,
      points: 1,
    })),
    // FACILITY Questions
    ...Array.from({ length: 5 }, (_, i) => ({
      category: 'FACILITY' as const,
      stem: `Pertanyaan Facility #${i + 1}: Bagaimana menangani fasilitas kereta yang rusak?`,
      optionA: 'Melapor dan mengantisipasi kerusakan',
      optionB: 'Tidak tahu',
      optionC: 'Biarkan saja',
      optionD: 'Bermain peran',
      correctAnswer: 'A',
      difficulty: 'MEDIUM' as const,
      points: 1,
    })),
    // APTITUDE Questions
    ...Array.from({ length: 5 }, (_, i) => ({
      category: 'APTITUDE' as const,
      stem: `Pertanyaan Aptitude #${i + 1}: Hitung 15 + 27 = ?`,
      optionA: '42',
      optionB: '41',
      optionC: '43',
      optionD: '40',
      correctAnswer: 'A',
      difficulty: 'EASY' as const,
      points: 1,
    })),
  ];

  const createdQuestions = await db.insert(questions).values(questionsData).returning();
  console.log(`✅ Questions created: ${createdQuestions.length}`);

  // ========== APPLICATIONS ==========
  const application1 = await db.insert(applications).values({
    applicantId: app1.id,
    jobPostingId: jobs[0].id, // Pramugara
    status: 'TEST_COMPLETED',
  }).returning().then(r => r[0]);

  const application2 = await db.insert(applications).values({
    applicantId: app1.id,
    jobPostingId: jobs[4].id, // IT Staff
    status: 'PENDING',
  }).returning().then(r => r[0]);

  const application3 = await db.insert(applications).values({
    applicantId: app2.id,
    jobPostingId: jobs[1].id, // Pramugari
    status: 'TEST_SCHEDULED',
  }).returning().then(r => r[0]);

  console.log("✅ Applications created");

  // ========== TEST SESSIONS ==========
  await db.insert(testSessions).values({
    applicationId: application1.id,
    status: 'SCORED',
    totalScore: 75,
    passed: true,
  });

  console.log("✅ Test sessions created");

  console.log("\n🎉 Database seed completed!");
  console.log("\n📋 Test Credentials:");
  console.log("   Admin:      admin@kai.co.id / demo123");
  console.log("   Admin 2:   wubisonodhanu888@gmail.com / demo123");
  console.log("   Pelamar 1: applicant@kai.co.id / demo123");
  console.log("   Pelamar 2: siti@kai.co.id / demo123");
  console.log("   Pelamar 3: pelamar@test.com / demo123");
}

main().catch(console.error);
