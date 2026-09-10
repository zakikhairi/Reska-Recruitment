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
    const body = await request.json().catch(() => ({}));
    const { answers } = body; // Optional: answers passed directly for auto-submit

    // Find the session - could be by sessionId or applicationId
    let session = await prisma.testSession.findUnique({
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

    // If not found, try as applicationId
    if (!session) {
      const application = await prisma.application.findUnique({
        where: { id: sessionId },
        include: {
          testSession: {
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
          },
        },
      });

      if (application?.testSession) {
        // Fetch with answers included
        session = await prisma.testSession.findUnique({
          where: { id: application.testSession.id },
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
      }
    }

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Sesi test tidak ditemukan" },
        { status: 404 }
      );
    }

    if (session.status === "SCORED" || session.status === "SUBMITTED" || session.status === "COMPLETED" || session.submittedAt) {
      return NextResponse.json(
        { success: false, error: "Tes sudah selesai dikerjakan dan tidak dapat disubmit lagi" },
        { status: 400 }
      );
    }

    if (session.scheduledAt && new Date(session.scheduledAt) > new Date()) {
      return NextResponse.json(
        { success: false, error: "Jadwal tes belum dimulai" },
        { status: 403 }
      );
    }

    // Get questions
    const questionIds = session.questions ? JSON.parse(session.questions) : [];
    const questions = await prisma.question.findMany({
      where: { id: { in: questionIds } },
    });

    // Create question map with correct answers
    const questionMap = new Map<string, { category: string; correctAnswer: string }>();
    questions.forEach((q) => {
      questionMap.set(q.id, {
        category: q.category,
        correctAnswer: q.correctAnswer,
      });
    });

    // Get answer mappings from tabSwitchLogs (for shuffled answers)
    let answerMappings: Record<string, any> = {};
    if (session.tabSwitchLogs) {
      try {
        const parsed = JSON.parse(session.tabSwitchLogs);
        if (parsed.answerMappings) {
          answerMappings = parsed.answerMappings;
        }
      } catch (e) {
        // No valid mappings
      }
    }

    // Get or prepare answers
    let sessionAnswers = session.answers;

    // If answers were passed directly (for auto-submit), save them first
    if (answers && typeof answers === "object") {
      for (const [qId, selectedAnswer] of Object.entries(answers)) {
        // Translate display answer back to original answer using mapping
        let originalAnswer = selectedAnswer as string;
        if (answerMappings[qId]) {
          const mapping = answerMappings[qId];
          const displayOption = mapping.displayOptions?.find(
            (opt: any) => opt.displayOption === selectedAnswer
          );
          if (displayOption) {
            originalAnswer = displayOption.originalOption;
          }
        }

        const existingAnswer = sessionAnswers.find(a => a.questionId === qId);
        if (existingAnswer) {
          await prisma.applicantAnswer.update({
            where: { id: existingAnswer.id },
            data: {
              selectedAnswer: originalAnswer,
              answeredAt: new Date(),
            },
          });
        } else {
          await prisma.applicantAnswer.create({
            data: {
              testSessionId: session.id,
              questionId: qId,
              selectedAnswer: originalAnswer,
              answeredAt: new Date(),
              pointsEarned: 0,
            },
          });
        }
      }
      // Refresh answers
      sessionAnswers = await prisma.applicantAnswer.findMany({
        where: { testSessionId: session.id },
      });
    }

    // Grade each answer
    for (const answer of sessionAnswers) {
      const question = questionMap.get(answer.questionId);
      if (question && answer.selectedAnswer) {
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
    const config = session.application?.jobPosting?.testConfig;
    if (!config) {
      return NextResponse.json(
        { success: false, error: "Konfigurasi test tidak ditemukan" },
        { status: 500 }
      );
    }

    // Get updated answers
    const updatedAnswers = await prisma.applicantAnswer.findMany({
      where: { testSessionId: sessionId },
    });

    // Grade answers per category
    const categories = config.categories.split(",");
    const rawScores: Record<string, { correct: number; total: number }> = {};

    for (const category of categories) {
      rawScores[category] = { correct: 0, total: 0 };
    }

    for (const answer of updatedAnswers) {
      const question = questionMap.get(answer.questionId);
      if (question && rawScores[question.category] !== undefined) {
        rawScores[question.category].total++;
        if (answer.isCorrect) {
          rawScores[question.category].correct++;
        }
      }
    }

    // Calculate weighted scores
    let categoryWeights = typeof config.categoryWeights === 'string'
      ? JSON.parse(config.categoryWeights)
      : config.categoryWeights;
    // Handle double-stringified data
    if (typeof categoryWeights === 'string') {
      categoryWeights = JSON.parse(categoryWeights);
    }

    let passingGrades = typeof config.passingGrades === 'string'
      ? JSON.parse(config.passingGrades)
      : config.passingGrades;
    // Handle double-stringified data
    if (typeof passingGrades === 'string') {
      passingGrades = JSON.parse(passingGrades);
    }

    let totalWeightedScore = 0;

    for (const category of categories) {
      const { correct, total } = rawScores[category];
      const percentage = total > 0 ? (correct / total) * 100 : 0;
      const weight = categoryWeights[category] || 25;
      totalWeightedScore += (percentage * weight) / 100;
    }

    const finalScore = Math.round(totalWeightedScore);

    // Check if passed
    let allCategoriesPassed = true;
    for (const cat of categories) {
      const { correct, total } = rawScores[cat];
      const percentage = total > 0 ? (correct / total) * 100 : 0;
      if (percentage < (passingGrades[cat] || 0)) {
        allCategoriesPassed = false;
        break;
      }
    }

    const passed = allCategoriesPassed && finalScore >= config.overallPassingGrade;
    const newStatus = passed ? "INTERVIEW" : "REJECTED";

    // Update session
    await prisma.testSession.update({
      where: { id: session.id },
      data: {
        status: "SCORED",
        submittedAt: new Date(),
        rawScores: JSON.stringify(rawScores),
        totalScore: finalScore,
        passed,
      },
    });

    // Update application status
    await prisma.application.update({
      where: { id: session.applicationId },
      data: {
        status: newStatus,
        reviewedAt: new Date(),
      },
    });

    // Create status history
    await prisma.statusHistory.create({
      data: {
        applicationId: session.applicationId,
        fromStatus: "IN_TEST",
        toStatus: newStatus,
        notes: `Tes kompetensi selesai. Skor: ${finalScore}%. Status: ${passed ? "LULUS" : "TIDAK LULUS"}`,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        sessionId: session.id,
        totalScore: finalScore,
        passed,
        status: newStatus,
      },
      message: passed ? "Selamat! Anda lulus tes." : "Mohon maaf, Anda tidak memenuhi passing grade.",
    });
  } catch (error: any) {
    console.error("Error submitting test:", error);
    console.error("Error stack:", error.stack);
    return NextResponse.json(
      { success: false, error: `Terjadi kesalahan server: ${error.message}` },
      { status: 500 }
    );
  }
}
