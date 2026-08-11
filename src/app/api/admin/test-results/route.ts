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
        const questionsPerCategory = config.questionsPerCategory || 10;

        // rawScores is stored as { category: { correct: number, total: number } }
        const rawScoresObj = typeof session.rawScores === 'string'
          ? JSON.parse(session.rawScores)
          : session.rawScores;

        categoryScores = categories.map((cat: string) => {
          const catData = rawScoresObj?.[cat] || { correct: 0, total: 0 };
          const correct = catData.correct || 0;
          const total = catData.total || questionsPerCategory;
          // Calculate percentage from correct/total
          const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
          const passingGrade = passingGrades[cat] || 60;

          return {
            category: cat,
            score: correct,
            total: total,
            percentage: percentage,
            passingGrade: passingGrade,
            passed: percentage >= passingGrade,
          };
        });
      } else if (config) {
        // No rawScores yet, but we have config - show planned questions
        const categories = config.categories.split(",");
        const questionsPerCategory = config.questionsPerCategory || 10;
        const passingGrades = config.passingGrades ? JSON.parse(config.passingGrades) : {};

        categoryScores = categories.map((cat: string) => {
          const passingGrade = passingGrades[cat] || 60;
          return {
            category: cat,
            score: 0,
            total: questionsPerCategory,
            percentage: 0,
            passingGrade: passingGrade,
            passed: false,
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
