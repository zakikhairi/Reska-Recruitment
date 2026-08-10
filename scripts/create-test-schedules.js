// Script untuk bikin jadwal tes untuk 3 pelamar
const prisma = require("@/lib/db").default;

async function main() {
  console.log("Creating test schedules for 3 applicants...");

  // Get 3 applications dengan status APPROVED (sudah approve admin check)
  const applications = await prisma.application.findMany({
    where: {
      status: "ADMIN_CHECK", // atau status yang sesuai
    },
    take: 3,
    include: {
      applicant: true,
      jobPosting: {
        include: {
          testConfig: true,
        },
      },
    },
  });

  if (applications.length === 0) {
    console.log("Tidak ada aplikasi dengan status yang sesuai");
    // Coba dapatin semua aplikasi
    const allApps = await prisma.application.findMany({
      take: 3,
      include: {
        applicant: true,
        jobPosting: true,
        testSession: true,
      },
    });
    console.log("Semua aplikasi:", JSON.stringify(allApps.map(a => ({ id: a.id, status: a.status, applicant: a.applicant?.fullName })));
    return;
  }

  const testDate = new Date();
  testDate.setDate(testDate.getDate() + 2); // 2 hari dari sekarang

  for (const app of applications) {
    if (app.testSession) {
      console.log(`Application ${app.id} sudah ada session`);
      continue;
    }

    const session = await prisma.testSession.create({
      data: {
        applicationId: app.id,
        status: "SCHEDULED",
        scheduledAt: testDate,
      },
    });
    console.log(`Created test session ${session.id} untuk ${app.applicant.fullName}`);
  }

  console.log("Done!");
  process.exit(0);
}

main().catch(console.error);
