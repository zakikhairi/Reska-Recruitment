// Script to sync test configs from store to database
import "dotenv/config";
import prisma from "../src/lib/db";

const testConfigs = [
  { division: "ON_TRAIN_SERVICE", categories: ["AKHLAK", "HOSPITALITY", "TECHNICAL", "APTITUDE"], passingGrade: 65, duration: 90, questionsPerCategory: 5 },
  { division: "RES_CLEAN", categories: ["AKHLAK", "HOSPITALITY"], passingGrade: 60, duration: 60, questionsPerCategory: 5 },
  { division: "LOGISTICS", categories: ["AKHLAK", "TECHNICAL"], passingGrade: 65, duration: 90, questionsPerCategory: 5 },
  { division: "IT_STAFF", categories: ["AKHLAK", "TECHNICAL", "APTITUDE"], passingGrade: 70, duration: 90, questionsPerCategory: 5 },
  { division: "ADMIN", categories: ["AKHLAK", "APTITUDE"], passingGrade: 65, duration: 60, questionsPerCategory: 5 },
  { division: "RES_PARKING", categories: ["AKHLAK", "HOSPITALITY"], passingGrade: 60, duration: 60, questionsPerCategory: 5 },
];

async function syncTestConfigs() {
  console.log("Starting test config sync...");

  for (const config of testConfigs) {
    // Find job by division
    const job = await prisma.jobPosting.findFirst({
      where: { division: config.division, status: "ACTIVE" },
    });

    if (!job) {
      console.log(`No active job found for division: ${config.division}`);
      continue;
    }

    const weightPerCategory = Math.round(100 / config.categories.length);
    const weights: Record<string, number> = {};
    const passingGrades: Record<string, number> = {};

    config.categories.forEach(cat => {
      weights[cat] = weightPerCategory;
      passingGrades[cat] = config.passingGrade;
    });

    // Upsert test config
    await prisma.testConfig.upsert({
      where: { jobPostingId: job.id },
      update: {
        categories: config.categories.join(","),
        categoryWeights: JSON.stringify(weights),
        passingGrades: JSON.stringify(passingGrades),
        overallPassingGrade: config.passingGrade,
        totalDurationMinutes: config.duration,
        questionsPerCategory: config.questionsPerCategory,
        shuffleQuestions: true,
        shuffleAnswers: true,
        allowTabSwitch: false,
        maxTabSwitches: 3,
        isActive: true,
      },
      create: {
        jobPostingId: job.id,
        categories: config.categories.join(","),
        categoryWeights: JSON.stringify(weights),
        passingGrades: JSON.stringify(passingGrades),
        overallPassingGrade: config.passingGrade,
        totalDurationMinutes: config.duration,
        questionsPerCategory: config.questionsPerCategory,
        shuffleQuestions: true,
        shuffleAnswers: true,
        allowTabSwitch: false,
        maxTabSwitches: 3,
        isActive: true,
      },
    });

    console.log(`Synced test config for job: ${job.title} (${job.division})`);
  }

  console.log("Sync complete!");
  process.exit(0);
}

syncTestConfigs().catch(console.error);
