// Script bikin jadwal tes untuk 3 pelamar
// Jalankan: npx tsx scripts/create-test-schedules.ts

import prisma from "../src/lib/db";

async function main() {
  console.log("🔧 Membuat jadwal tes untuk 3 pelamar...\n");

  // Get aplikasi dengan job yang ada testConfig
  const applications = await prisma.application.findMany({
    take: 3,
    include: {
      applicant: true,
      jobPosting: {
        include: {
          testConfig: true,
        },
      },
      testSession: true,
    },
  });

  if (applications.length === 0) {
    console.log("❌ Tidak ada aplikasi ditemukan");
    process.exit(1);
  }

  console.log(`📋 Ditemukan ${applications.length} aplikasi\n`);

  const testDate = new Date();
  testDate.setDate(testDate.getDate() + 2); // 2 hari dari sekarang
  testDate.setHours(9, 0, 0, 0); // Jam 09:00

  let created = 0;

  for (const app of applications) {
    if (app.testSession) {
      console.log(`⏭️  ${app.applicant.fullName} - Sudah ada jadwal, skip`);
      continue;
    }

    if (!app.jobPosting.testConfig) {
      console.log(`⏭️  ${app.applicant.fullName} - Job tidak ada testConfig, skip`);
      continue;
    }

    const session = await prisma.testSession.create({
      data: {
        applicationId: app.id,
        status: "SCHEDULED",
        scheduledAt: testDate,
      },
    });

    // Update status application ke TEST_SCHEDULED
    await prisma.application.update({
      where: { id: app.id },
      data: { status: "TEST_SCHEDULED" },
    });

    console.log(`✅ ${app.applicant.fullName} - Jadwal tes: ${testDate.toLocaleString("id-ID")}`);
    created++;
  }

  console.log(`\n✨ Berhasil membuat ${created} jadwal tes`);
  process.exit(0);
}

main().catch(console.error);
