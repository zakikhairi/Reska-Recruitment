import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { selectQuestionsForTest } from "@/lib/scoring";
import { TestCategory } from "@/types";

// GET: Get test configuration and questions
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const now = new Date();

    // First try to find by session ID (testSession.id)
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
      },
    });

    // If not found, try as applicationId
    if (!session) {
      const application = await prisma.application.findUnique({
        where: { id: sessionId },
        include: {
          jobPosting: {
            include: {
              testConfig: true,
            },
          },
          testSession: true,
        },
      });

      if (!application) {
        return NextResponse.json(
          { success: false, error: "Lamaran tidak ditemukan" },
          { status: 404 }
        );
      }

      // If application has test session, get that instead
      if (application.testSession) {
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
          },
        });
      } else if (application.jobPosting.testConfig) {
        // No session yet, check if test is configured
        const config = application.jobPosting.testConfig;

        // Check scheduled time
        const scheduledAt = application.testSession?.scheduledAt;
        const canStart = !scheduledAt || new Date(scheduledAt) <= now;
        const minutesUntilStart = scheduledAt
          ? Math.max(0, Math.ceil((new Date(scheduledAt).getTime() - now.getTime()) / (1000 * 60)))
          : 0;

        return NextResponse.json({
          success: true,
          session: null,
          jobTitle: application.jobPosting.title,
          config: {
            totalDurationMinutes: config.totalDurationMinutes,
            categories: config.categories.split(","),
            questionsPerCategory: config.questionsPerCategory,
            passingGrade: config.overallPassingGrade,
          },
          questions: [],
          canStart,
          scheduledAt: scheduledAt?.toISOString() || null,
          minutesUntilStart,
        });
      } else {
        return NextResponse.json(
          { success: false, error: "Test belum dikonfigurasi untuk posisi ini" },
          { status: 400 }
        );
      }
    }

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Sesi test tidak ditemukan" },
        { status: 404 }
      );
    }

    const application = session.application;
    if (!application?.jobPosting.testConfig) {
      return NextResponse.json(
        { success: false, error: "Konfigurasi test tidak ditemukan" },
        { status: 400 }
      );
    }

    // Check scheduled time
    const scheduledAt = session.scheduledAt;
    const canStart = !scheduledAt || new Date(scheduledAt) <= now;
    const minutesUntilStart = scheduledAt
      ? Math.max(0, Math.ceil((new Date(scheduledAt).getTime() - now.getTime()) / (1000 * 60)))
      : 0;

    // Get questions
    let questions: any[] = [];
    if (session.questions) {
      const questionIds = JSON.parse(session.questions);
      questions = await prisma.question.findMany({
        where: { id: { in: questionIds } },
      });
      // Sort by the order in session.questions
      const orderMap = new Map(questionIds.map((id: string, idx: number) => [id, idx]));
      questions.sort((a: any, b: any) => {
        const aIdx = Number(orderMap.get(String(a.id))) || 0;
        const bIdx = Number(orderMap.get(String(b.id))) || 0;
        return aIdx - bIdx;
      });
    }

    // Remove correct answers from questions for client
    const safeQuestions = questions.map((q: typeof questions[number]) => ({
      id: q.id,
      category: q.category,
      stem: q.stem,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
    }));

    // Check if already submitted or scored
    if (session.status === "SUBMITTED" || session.status === "SCORED") {
      return NextResponse.json({
        success: true,
        session: {
          id: session.id,
          status: session.status,
          submittedAt: session.submittedAt,
          totalScore: session.totalScore,
          passed: session.passed,
          startedAt: session.startedAt,
          tabSwitchCount: session.tabSwitchCount,
        },
        jobTitle: application.jobPosting.title,
        questions: safeQuestions,
        config: {
          totalDurationMinutes: application.jobPosting.testConfig.totalDurationMinutes,
          categories: application.jobPosting.testConfig.categories.split(","),
        },
        canStart: false, // Already done
        scheduledAt: scheduledAt?.toISOString() || null,
      });
    }

    // Allow access - test is ready (time has arrived or no scheduled time)
    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        status: session.status,
        startedAt: session.startedAt,
        tabSwitchCount: session.tabSwitchCount,
      },
      jobTitle: application.jobPosting.title,
      questions: safeQuestions,
      config: {
        totalDurationMinutes: application.jobPosting.testConfig.totalDurationMinutes,
        categories: application.jobPosting.testConfig.categories.split(","),
        questionsPerCategory: application.jobPosting.testConfig.questionsPerCategory,
        passingGrade: application.jobPosting.testConfig.overallPassingGrade,
      },
      canStart,
      scheduledAt: scheduledAt?.toISOString() || null,
      minutesUntilStart,
    });
  } catch (error) {
    console.error("Error fetching test:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// POST: Start a new test session
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    // Check if test session already exists
    let existingSession = await prisma.testSession.findFirst({
      where: {
        OR: [
          { id: sessionId },
          { applicationId: sessionId },
        ],
      },
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
      },
    });

    if (existingSession) {
      // Check if already submitted
      if (existingSession.status === "SUBMITTED" || existingSession.status === "SCORED") {
        return NextResponse.json(
          { success: false, error: "Test sudah selesai" },
          { status: 400 }
        );
      }

      // Check if session has questions - if not, select them now
      let questionIds: string[] = [];
      let sessionToUpdate = existingSession;

      if (!existingSession.questions && existingSession.application?.jobPosting?.testConfig) {
        // Need to select questions for this session
        const config = existingSession.application.jobPosting.testConfig;
        const categories = config.categories.split(",");

        // Get questions from question bank
        const allQuestions = await prisma.question.findMany({
          where: {
            category: { in: categories },
            isActive: true,
          },
        });

        // Select and shuffle questions
        const selectedQuestions = selectQuestionsForTest(
          allQuestions.map((q) => ({
            id: q.id,
            category: q.category as TestCategory,
            stem: q.stem,
            optionA: q.optionA,
            optionB: q.optionB,
            optionC: q.optionC,
            optionD: q.optionD,
            correctAnswer: q.correctAnswer as "A" | "B" | "C" | "D",
            difficulty: q.difficulty as "EASY" | "MEDIUM" | "HARD",
            points: q.points,
            isActive: q.isActive,
          })),
          {
            categories: categories as TestCategory[],
            categoryWeights: JSON.parse(config.categoryWeights),
            passingGrades: JSON.parse(config.passingGrades),
            overallPassingGrade: config.overallPassingGrade,
            totalDurationMinutes: config.totalDurationMinutes,
            questionsPerCategory: config.questionsPerCategory,
            shuffleQuestions: config.shuffleQuestions,
            shuffleAnswers: config.shuffleAnswers,
            id: "",
            jobPostingId: existingSession.application.jobPostingId,
            allowTabSwitch: config.allowTabSwitch,
            maxTabSwitches: config.maxTabSwitches,
            isActive: config.isActive,
          }
        );

        questionIds = selectedQuestions.map((q) => q.id);

        // Update session with questions
        sessionToUpdate = await prisma.testSession.update({
          where: { id: existingSession.id },
          data: {
            status: "IN_PROGRESS",
            startedAt: existingSession.startedAt || new Date(),
            questions: JSON.stringify(questionIds),
          },
        });

        // Create answer records for selected questions
        await prisma.applicantAnswer.createMany({
          data: selectedQuestions.map((q) => ({
            testSessionId: existingSession.id,
            questionId: q.id,
            pointsEarned: 0,
          })),
          skipDuplicates: true,
        });
      } else {
        // Session already has questions - just resume
        questionIds = existingSession.questions
          ? JSON.parse(existingSession.questions)
          : [];

        sessionToUpdate = await prisma.testSession.update({
          where: { id: existingSession.id },
          data: {
            status: "IN_PROGRESS",
            startedAt: existingSession.startedAt || new Date(),
          },
        });
      }

      return NextResponse.json({
        success: true,
        sessionId: sessionToUpdate.id,
        status: sessionToUpdate.status,
        questions: questionIds,
        startedAt: sessionToUpdate.startedAt,
      });
    }

    // Get application with job posting and test config
    const application = await prisma.application.findUnique({
      where: { id: sessionId },
      include: {
        jobPosting: {
          include: {
            testConfig: true,
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json(
        { success: false, error: "Lamaran tidak ditemukan" },
        { status: 404 }
      );
    }

    if (!application.jobPosting.testConfig) {
      return NextResponse.json(
        { success: false, error: "Test belum dikonfigurasi" },
        { status: 400 }
      );
    }

    const config = application.jobPosting.testConfig;

    // Get questions from question bank
    const categories = config.categories.split(",");
    let questions = await prisma.question.findMany({
      where: {
        category: { in: categories },
        isActive: true,
      },
    });

    // Select and shuffle questions
    const selectedQuestions = selectQuestionsForTest(
      questions.map((q) => ({
        id: q.id,
        category: q.category as TestCategory,
        stem: q.stem,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctAnswer: q.correctAnswer as "A" | "B" | "C" | "D",
        difficulty: q.difficulty as "EASY" | "MEDIUM" | "HARD",
        points: q.points,
        isActive: q.isActive,
      })),
      {
        categories: categories as TestCategory[],
        categoryWeights: JSON.parse(config.categoryWeights),
        passingGrades: JSON.parse(config.passingGrades),
        overallPassingGrade: config.overallPassingGrade,
        totalDurationMinutes: config.totalDurationMinutes,
        questionsPerCategory: config.questionsPerCategory,
        shuffleQuestions: config.shuffleQuestions,
        shuffleAnswers: config.shuffleAnswers,
        id: "",
        jobPostingId: application.jobPostingId,
        allowTabSwitch: config.allowTabSwitch,
        maxTabSwitches: config.maxTabSwitches,
        isActive: config.isActive,
      }
    );

    // Create test session
    const session = await prisma.testSession.create({
      data: {
        applicationId: sessionId,
        status: "IN_PROGRESS",
        startedAt: new Date(),
        questions: JSON.stringify(selectedQuestions.map((q) => q.id)),
      },
    });

    // Create empty answer records
    await prisma.applicantAnswer.createMany({
      data: selectedQuestions.map((q) => ({
        testSessionId: session.id,
        questionId: q.id,
        pointsEarned: 0,
      })),
    });

    // Update application status
    await prisma.application.update({
      where: { id: sessionId },
      data: { status: "IN_TEST" },
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      status: session.status,
      questions: selectedQuestions.map((q) => q.id),
      startedAt: session.startedAt,
    });
  } catch (error) {
    console.error("Error starting test session:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// PATCH: Update session status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const body = await request.json();
    const { status } = body;

    const session = await prisma.testSession.update({
      where: { id: sessionId },
      data: { status },
    });

    // Also update application status if transitioning to IN_PROGRESS
    if (status === "IN_PROGRESS") {
      await prisma.application.update({
        where: { id: session.applicationId },
        data: { status: "IN_TEST" },
      });
    }

    return NextResponse.json({ success: true, status: session.status });
  } catch (error) {
    console.error("Error updating session:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
