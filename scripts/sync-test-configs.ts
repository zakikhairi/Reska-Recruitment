// Script to sync test configs from store to database (Drizzle ORM)
import "dotenv/config";
import { db, jobPostings, testConfigs } from "../src/lib/db";
import { eq } from "drizzle-orm";

const testConfigsData = [
  { division: "ON_TRAIN_SERVICE" as const, categories: ["AKHLAK", "HOSPITALITY", "TECHNICAL", "APTITUDE"], passingGrade: 65, duration: 90, questionsPerCategory: 5 },
  { division: "RES_CLEAN" as const, categories: ["AKHLAK", "HOSPITALITY"], passingGrade: 60, duration: 60, questionsPerCategory: 5 },
  { division: "LOGISTICS" as const, categories: ["AKHLAK", "TECHNICAL"], passingGrade: 65, duration: 90, questionsPerCategory: 5 },
  { division: "IT_STAFF" as const, categories: ["AKHLAK", "TECHNICAL", "APTITUDE"], passingGrade: 70, duration: 90, questionsPerCategory: 5 },
  { division: "ADMIN" as const, categories: ["AKHLAK", "APTITUDE"], passingGrade: 65, duration: 60, questionsPerCategory: 5 },
  { division: "RES_PARKING" as const, categories: ["AKHLAK", "HOSPITALITY"], passingGrade: 60, duration: 60, questionsPerCategory: 5 },
];

async function syncTestConfigs() {
  console.log("Starting test config sync...");

  for (const config of testConfigsData) {
    // Find job by division
    const jobs = await db.select().from(jobPostings).where(eq(jobPostings.division, config.division));
    const job = jobs.find(j => j.status === "ACTIVE");

    if (!job) {
      console.log(`No active job found for division: ${config.division}`);
      continue;
    }

    const weightPerCategory = Math.round(100 / config.categories.length);
    const weights: Record<string, number> = {};
    const passingGradesData: Record<string, number> = {};

    config.categories.forEach(cat => {
      weights[cat] = weightPerCategory;
      passingGradesData[cat] = config.passingGrade;
    });

    // Check if config exists
    const existingConfigs = await db.select().from(testConfigs).where(eq(testConfigs.jobPostingId, job.id));

    if (existingConfigs.length > 0) {
      // Update
      await db.update(testConfigs)
        .set({
          categories: config.categories.join(","),
          categoryWeights: JSON.stringify(weights),
          passingGrades: JSON.stringify(passingGradesData),
          overallPassingGrade: config.passingGrade,
          totalDurationMinutes: config.duration,
          questionsPerCategory: config.questionsPerCategory,
          shuffleQuestions: true,
          shuffleAnswers: true,
          allowTabSwitch: false,
          maxTabSwitches: 3,
          isActive: true,
        })
        .where(eq(testConfigs.jobPostingId, job.id));
    } else {
      // Create
      await db.insert(testConfigs).values({
        jobPostingId: job.id,
        categories: config.categories.join(","),
        categoryWeights: JSON.stringify(weights),
        passingGrades: JSON.stringify(passingGradesData),
        overallPassingGrade: config.passingGrade,
        totalDurationMinutes: config.duration,
        questionsPerCategory: config.questionsPerCategory,
        shuffleQuestions: true,
        shuffleAnswers: true,
        allowTabSwitch: false,
        maxTabSwitches: 3,
        isActive: true,
      });
    }

    console.log(`Synced test config for job: ${job.title} (${job.division})`);
  }

  console.log("Sync complete!");
  process.exit(0);
}

syncTestConfigs().catch(console.error);
