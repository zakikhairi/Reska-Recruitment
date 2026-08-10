// Setup test config dan jadwal tes untuk 3 pelamar
import prisma from "../src/lib/db";

async function main() {
  console.log("Setup test config dan jadwal tes\n");

  // Get applications
  const applications = await prisma.application.findMany({
    take: 5,
    include: {
      jobPosting: true,
      applicant: true,
      testSession: true,
    },
  });

  console.log("Ditemukan " + applications.length + " aplikasi");

  if (applications.length === 0) {
    console.log("Tidak ada aplikasi");
    process.exit(1);
  }

  // Filter yang ada jobPostingId-nya
  const withJob = applications.filter(a => a.jobPostingId && a.jobPosting);
  console.log("Dengan job: " + withJob.length + "\n");

  // Create testConfig untuk jobPosting unik
  const seenJobs = new Set<string>();
  for (const app of withJob) {
    if (seenJobs.has(app.jobPostingId)) continue;
    seenJobs.add(app.jobPostingId);

    const config = await prisma.testConfig.findFirst({ where: { jobPostingId: app.jobPostingId } });
    if (!config) {
      await prisma.testConfig.create({
        data: {
          jobPostingId: app.jobPostingId,
          totalDurationMinutes: 90,
          categories: "AKHLAK,HOSPITALITY,TECHNICAL",
          categoryWeights: JSON.stringify({ AKHLAK: 30, HOSPITALITY: 25, TECHNICAL: 25, FACILITY: 10, APTITUDE: 10 }),
          passingGrades: JSON.stringify({ AKHLAK: 70, HOSPITALITY: 70, TECHNICAL: 70, FACILITY: 60, APTITUDE: 60 }),
          overallPassingGrade: 70,
          questionsPerCategory: 5,
          shuffleQuestions: true,
          shuffleAnswers: true,
          allowTabSwitch: true,
          maxTabSwitches: 5,
          isActive: true,
        },
      });
      console.log("Config dibuat untuk: " + app.jobPosting.title);
    }
  }

  // Setup jadwal tes
  const testDate = new Date();
  testDate.setDate(testDate.getDate() + 1);
  testDate.setHours(9, 0, 0, 0);

  let created = 0;
  for (const app of withJob.slice(0, 3)) {
    if (app.testSession) {
      console.log("Skip " + app.applicant.fullName + " - Sudah ada jadwal");
      continue;
    }

    await prisma.testSession.create({
      data: {
        applicationId: app.id,
        status: "SCHEDULED",
        scheduledAt: testDate,
      },
    });

    await prisma.application.update({
      where: { id: app.id },
      data: { status: "TEST_SCHEDULED" },
    });

    console.log("OK " + app.applicant.fullName + " - " + testDate.toLocaleString("id-ID"));
    created++;
  }

  console.log("\nSelesai: " + created + " jadwal dibuat");
  process.exit(0);
}

main().catch(console.error);
