// API Route: Get Test Results for Admin
// GET /api/admin/test-results

import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    // Get all test sessions that have been submitted or scored
    const sessions = await prisma.testSession.findMany({
      where: {
        OR: [
          { status: "SUBMITTED" },
          { status: "SCORED" },
          { status: "IN_PROGRESS" },
        ],
      },
      include: {
        application: {
          include: {
            applicant: true,
            jobPosting: {
              include: {
                testConfig: true,
              },
            },
          },
        },
      },
      orderBy: { submittedAt: "desc" },
    });

    // Format the results
    const results = sessions.map((session) => {
      const application = session.application;
      const config = application?.jobPosting?.testConfig;

      // Calculate category scores from rawScores if available
      let categoryScores: any[] = [];
      if (session.rawScores && config) {
        const categories = config.categories.split(",");
        const passingGrades = config.passingGrades ? JSON.parse(config.passingGrades) : {};
        const weights = config.categoryWeights ? JSON.parse(config.categoryWeights) : {};

        categoryScores = categories.map((cat: string) => {
          const score = session.rawScores?.[cat as keyof typeof session.rawScores] || 0;
          const passingGrade = passingGrades[cat] || 60;
          // Calculate percentage based on questions per category
          const questionsPerCategory = config.questionsPerCategory || 10;
          const correctAnswers = Math.round((score / 100) * questionsPerCategory);
          const percentage = score;

          return {
            category: cat,
            score: correctAnswers,
            total: questionsPerCategory,
            percentage: percentage,
            passingGrade: passingGrade,
            passed: percentage >= passingGrade,
          };
        });
      }

      return {
        sessionId: session.id,
        applicationId: application.id,
        applicantName: application.applicant.fullName,
        jobTitle: application.jobPosting.title,
        division: application.jobPosting.division,
        status: application.status,
        testStatus: session.status,
        scheduledAt: session.scheduledAt?.toISOString() || null,
        startedAt: session.startedAt?.toISOString() || null,
        submittedAt: session.submittedAt?.toISOString() || null,
        totalScore: session.totalScore,
        passed: session.passed,
        categoryScores,
      };
    });

    return NextResponse.json({
      success: true,
      results,
      total: results.length,
    });
  } catch (error) {
    console.error("Get test results error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
