import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";

const dbPath = path.join(process.cwd(), "prisma", "dev.db");
const adapter = new PrismaLibSql({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@kai.co.id" },
    update: {},
    create: {
      email: "admin@kai.co.id",
      passwordHash: "demo123",
      role: "HR_ADMIN",
      emailVerified: true,
      admin: {
        create: {
          fullName: "Administrator HRD",
          employeeId: "EMP001",
          department: "Human Resources",
        },
      },
    },
  });
  console.log("✅ Admin user:", adminUser.email);

  // Create applicant user for testing
  const applicantUser = await prisma.user.upsert({
    where: { email: "pelamar@kai.co.id" },
    update: {},
    create: {
      email: "pelamar@kai.co.id",
      passwordHash: "demo123",
      role: "APPLICANT",
      emailVerified: true,
      applicant: {
        create: {
          nik: "1234567890123456",
          fullName: "Budi Pelamar",
          phone: "081234567890",
          dateOfBirth: new Date("1998-05-15"),
          placeOfBirth: "Jakarta",
          gender: "MALE",
          address: "Jl. Sudirman No. 123",
          city: "Jakarta",
          postalCode: "10220",
          education: "SMA",
          university: null,
        },
      },
    },
  });
  console.log("✅ Applicant user:", applicantUser.email);

  // Create sample jobs
  const jobs = [
    {
      title: "Pramugara / Pramugari Kereta Api",
      division: "ON_TRAIN_SERVICE",
      location: "Jakarta, Bandung, Surabaya",
      description: "Bertanggung jawab memberikan layanan terbaik kepada penumpang kereta api dengan standar internasional.",
      requirements: "• Usia maksimal 35 tahun\n• Sehat jasmani dan rohani\n• Tinggi badan minimal 160 cm\n• Pendidikan minimal SMA/SMK\n• Mampu berkomunikasi dengan baik",
      minEducation: "SMA",
      deadline: new Date("2026-08-15"),
      status: "ACTIVE",
    },
    {
      title: "Steward Kereta Api",
      division: "ON_TRAIN_SERVICE",
      location: "Bandung",
      description: "Memberikan pelayanan prima kepada penumpang kereta api selama perjalanan.",
      requirements: "• Usia maksimal 30 tahun\n• Sehat jasmani dan rohani\n• Pendidikan minimal SMA/SMK",
      minEducation: "SMA",
      deadline: new Date("2026-08-20"),
      status: "ACTIVE",
    },
    {
      title: "Staff IT Support",
      division: "IT_STAFF",
      location: "Jakarta",
      description: "Mengelola dan mendukung infrastruktur IT perusahaan untuk kelancaran operasional.",
      requirements: "• Pendidikan S1 Teknik Informatika atau setara\n• Pengalaman minimal 2 tahun di bidang IT",
      minEducation: "S1",
      deadline: new Date("2026-08-10"),
      status: "ACTIVE",
    },
    {
      title: "Teknisi Maintenance Kereta",
      division: "LOGISTICS",
      location: "Madiun",
      description: "Melakukan perawatan dan perbaikan kereta api untuk menjaga keselamatan.",
      requirements: "• Pendidikan D3 Teknik Mesin\n• Pengalaman di bidang maintenance",
      minEducation: "D3",
      deadline: new Date("2026-08-25"),
      status: "ACTIVE",
    },
    {
      title: "Cleaning Service - ResClean",
      division: "RES_CLEAN",
      location: "Bandung, Jakarta",
      description: "Membersihkan dan merawat kebersihan kereta api dan area stasiun.",
      requirements: "• Pendidikan minimal SMA/SMK\n• Sehat jasmani",
      minEducation: "SMA",
      deadline: new Date("2026-09-01"),
      status: "ACTIVE",
    },
    {
      title: "Staff Administrasi",
      division: "ADMIN",
      location: "Jakarta",
      description: "Mengelola administrasi kantor dan dokumentasi perusahaan.",
      requirements: "• Pendidikan D3 Administrasi atau setara\n• Menguasai MS Office",
      minEducation: "D3",
      deadline: new Date("2026-08-18"),
      status: "ACTIVE",
    },
  ];

  for (const jobData of jobs) {
    const existingJob = await prisma.jobPosting.findFirst({
      where: { title: jobData.title },
    });

    if (!existingJob) {
      await prisma.jobPosting.create({
        data: jobData,
      });
      console.log(`✅ Job: ${jobData.title}`);
    } else {
      console.log(`⏭️ Job exists: ${jobData.title}`);
    }
  }

  // Create test config for first job
  const firstJob = await prisma.jobPosting.findFirst({
    where: { title: "Pramugara / Pramugari Kereta Api" },
  });

  if (firstJob) {
    const existingConfig = await prisma.testConfig.findUnique({
      where: { jobPostingId: firstJob.id },
    });

    if (!existingConfig) {
      await prisma.testConfig.create({
        data: {
          jobPostingId: firstJob.id,
          categories: "AKHLAK,HOSPITALITY,APTITUDE",
          categoryWeights: JSON.stringify({ AKHLAK: 34, HOSPITALITY: 33, APTITUDE: 33 }),
          passingGrades: JSON.stringify({ AKHLAK: 60, HOSPITALITY: 60, APTITUDE: 60 }),
          overallPassingGrade: 60,
          totalDurationMinutes: 90,
          questionsPerCategory: 10,
          isActive: true,
        },
      });
      console.log("✅ Test config created");
    }
  }

  console.log("\n🎉 Seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
