import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getRecommendationLevel } from "@/lib/scoring";
import { TestCategory } from "@/types";

// POST: Submit test and calculate scores
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    // Get test session with answers and application
    const session = await prisma.testSession.findUnique({
      where: { id: sessionId },
      include: {
        application: {
          include: {
            jobPosting: {
              include: {
                testConfig: true,
              },
            },
          },
        },
        answers: true,
      },
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Test session not found" },
        { status: 404 }
      );
    }

    if (session.status === "SUBMITTED" || session.status === "SCORED") {
      return NextResponse.json(
        { success: false, error: "Test already submitted" },
        { status: 400 }
      );
    }

    // Get questions
    const questionIds = session.questions ? JSON.parse(session.questions) : [];
    const questions = await prisma.question.findMany({
      where: { id: { in: questionIds } },
    });

    // Create question map
    const questionMap = new Map(
      questions.map((q) => [
        q.id,
        {
          id: q.id,
          category: q.category as TestCategory,
          correctAnswer: q.correctAnswer,
        },
      ])
    );

    // Grade each answer
    for (const answer of session.answers) {
      const question = questionMap.get(answer.questionId);
      if (question) {
        const isCorrect = answer.selectedAnswer === question.correctAnswer;
        await prisma.applicantAnswer.update({
          where: { id: answer.id },
          data: {
            isCorrect,
            pointsEarned: isCorrect ? 1 : 0,
          },
        });
      }
    }

    // Get test config
    const config = session.application.jobPosting.testConfig;
    if (!config) {
      return NextResponse.json(
        { success: false, error: "Test configuration not found" },
        { status: 500 }
      );
    }

    // Get updated answers
    const updatedAnswers = await prisma.applicantAnswer.findMany({
      where: { testSessionId: sessionId },
    });

    // Grade answers per category
    const rawScores: Record<string, { correct: number; total: number }> = {};
    const categories = config.categories.split(",");

    for (const category of categories) {
      rawScores[category] = { correct: 0, total: 0 };
    }

    for (const answer of updatedAnswers) {
      const question = questionMap.get(answer.questionId);
      if (question && rawScores[question.category]) {
        rawScores[question.category].total++;
        if (answer.isCorrect) {
          rawScores[question.category].correct++;
        }
      }
    }

    // Calculate weighted scores
    const categoryWeights = JSON.parse(config.categoryWeights);
    const passingGrades = JSON.parse(config.passingGrades);
    const weightedScores: Record<string, number> = {};
    let totalWeightedScore = 0;

    for (const category of categories) {
      const { correct, total } = rawScores[category];
      const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
      const weight = categoryWeights[category] || 0;
      const weightedScore = percentage * (weight / 100);
      weightedScores[category] = Math.round(weightedScore * 100) / 100;
      totalWeightedScore += weightedScore;
    }

    const finalScore = Math.round(totalWeightedScore);

    // Check if passed
    const allCategoriesPassed = categories.every((cat: string) => {
      const { correct, total } = rawScores[cat];
      const percentage = total > 0 ? (correct / total) * 100 : 0;
      return percentage >= passingGrades[cat];
    });

    const passed = allCategoriesPassed && finalScore >= config.overallPassingGrade;

    // Update session
    await prisma.testSession.update({
      where: { id: sessionId },
      data: {
        status: "SCORED",
        submittedAt: new Date(),
        rawScores: JSON.stringify(rawScores),
        weightedScores: JSON.stringify(weightedScores),
        totalScore: finalScore,
        passed,
      },
    });

    // Update application status
    await prisma.application.update({
      where: { id: session.applicationId },
      data: {
        status: passed ? "INTERVIEW" : "REJECTED",
        reviewedAt: new Date(),
      },
    });

    // Create status history
    await prisma.statusHistory.create({
      data: {
        applicationId: session.applicationId,
        toStatus: passed ? "INTERVIEW" : "REJECTED",
        notes: `Tes kompetensi selesai. Skor: ${finalScore}%. Status: ${passed ? "LULUS" : "TIDAK LULUS"}`,
      },
    });

    // Get recommendation level
    const categoryScores = categories.map((cat: string) => {
      const { correct, total } = rawScores[cat];
      const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
      const weight = categoryWeights[cat] || 25;
      const weightedScore = percentage * (weight / 100);
      return {
        category: cat as TestCategory,
        rawScore: correct,
        totalQuestions: total,
        percentage,
        weightedScore,
        passed: percentage >= passingGrades[cat],
      };
    });

    const recommendation = getRecommendationLevel(finalScore, categoryScores);

    return NextResponse.json({
      success: true,
      data: {
        sessionId,
        totalScore: finalScore,
        passed,
        rawScores,
        weightedScores,
        categoryScores,
        recommendation,
        breakdown: categories.map((cat: string) => ({
          category: cat,
          correct: rawScores[cat].correct,
          total: rawScores[cat].total,
          percentage: Math.round((rawScores[cat].correct / Math.max(rawScores[cat].total, 1)) * 100),
          passingGrade: passingGrades[cat],
          passed: (rawScores[cat].correct / Math.max(rawScores[cat].total, 1)) * 100 >= passingGrades[cat],
        })),
      },
    });
  } catch (error) {
    console.error("Error submitting test:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
