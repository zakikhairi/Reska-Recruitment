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
        // No session yet, but check if scheduled time exists
        const config = application.jobPosting.testConfig;
        const scheduledAt = application.testSession?.scheduledAt;
        const now = new Date();
        const canStart = !scheduledAt || now >= new Date(scheduledAt);

        return NextResponse.json({
          success: true,
          session: null,
          jobTitle: application.jobPosting.title,
          config: {
            totalDurationMinutes: config.totalDurationMinutes,
            categories: config.categories.split(","),
          },
          questions: [],
          canStart,
          scheduledAt,
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

    const config = application.jobPosting.testConfig;

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

    // Check if test is scheduled and if time has arrived
    const now = new Date();

    // Check if already submitted or scored
    if (session.status === "SUBMITTED" || session.status === "SCORED") {
      return NextResponse.json({
        success: true,
        session: {
          id: session.id,
          status: session.status,
          scheduledAt: session.scheduledAt,
          submittedAt: session.submittedAt,
          totalScore: session.totalScore,
          passed: session.passed,
          startedAt: session.startedAt,
          tabSwitchCount: session.tabSwitchCount,
        },
        jobTitle: application.jobPosting.title,
        questions: safeQuestions,
        config: {
          totalDurationMinutes: config.totalDurationMinutes,
          categories: config.categories.split(","),
        },
        canStart: false, // Already done
        scheduledAt: session.scheduledAt,
      });
    }

    // Check if scheduled time hasn't arrived yet
    if (session.scheduledAt && now < session.scheduledAt) {
      const timeUntilStart = session.scheduledAt.getTime() - now.getTime();
      const minutesUntilStart = Math.ceil(timeUntilStart / (1000 * 60));

      return NextResponse.json({
        success: true,
        session: {
          id: session.id,
          status: session.status,
          scheduledAt: session.scheduledAt,
          startedAt: session.startedAt,
          tabSwitchCount: session.tabSwitchCount,
        },
        jobTitle: application.jobPosting.title,
        questions: safeQuestions,
        config: {
          totalDurationMinutes: config.totalDurationMinutes,
          categories: config.categories.split(","),
        },
        canStart: false, // Time hasn't arrived
        minutesUntilStart,
        scheduledAt: session.scheduledAt,
      });
    }

    // Check if already submitted or scored
    if (session.status === "SUBMITTED" || session.status === "SCORED") {
      return NextResponse.json({
        success: true,
        session: {
          id: session.id,
          status: session.status,
          scheduledAt: session.scheduledAt,
          submittedAt: session.submittedAt,
          totalScore: session.totalScore,
          passed: session.passed,
          startedAt: session.startedAt,
          tabSwitchCount: session.tabSwitchCount,
        },
        jobTitle: application.jobPosting.title,
        questions: safeQuestions,
        config: {
          totalDurationMinutes: config.totalDurationMinutes,
          categories: config.categories.split(","),
        },
        canStart: false, // Already done
        scheduledAt: session.scheduledAt,
      });
    }

    // Allow access - either not scheduled, time has arrived, or already in progress
    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        status: session.status,
        scheduledAt: session.scheduledAt,
        startedAt: session.startedAt,
        tabSwitchCount: session.tabSwitchCount,
      },
      jobTitle: application.jobPosting.title,
      questions: safeQuestions,
      config: {
        totalDurationMinutes: config.totalDurationMinutes,
        categories: config.categories.split(","),
      },
      canStart: true, // Can start now
      scheduledAt: session.scheduledAt,
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

      // Check if scheduled time hasn't arrived (only if no startedAt yet)
      if (!existingSession.startedAt && existingSession.scheduledAt && new Date() < existingSession.scheduledAt) {
        return NextResponse.json(
          { success: false, error: "Belum waktunya memulai tes" },
          { status: 400 }
        );
      }

      // Resume or start existing session
      const updateData: any = {
        status: "IN_PROGRESS",
      };
      if (!existingSession.startedAt) {
        updateData.startedAt = new Date();
      }

      const updatedSession = await prisma.testSession.update({
        where: { id: existingSession.id },
        data: updateData,
      });

      // If no questions yet, generate them now
      let questionIds: string[] = [];
      if (existingSession.questions) {
        questionIds = JSON.parse(existingSession.questions);
      } else {
        // Generate questions
        const config = existingSession.application.jobPosting.testConfig;
        if (config) {
          const categories = config.categories.split(",");
          let questions = await prisma.question.findMany({
            where: { category: { in: categories }, isActive: true },
          });

          // Simple shuffle and select
          const shuffled = questions.sort(() => Math.random() - 0.5);
          const selected = shuffled.slice(0, config.questionsPerCategory * categories.length);
          questionIds = selected.map(q => q.id);

          // Update session with questions
          await prisma.testSession.update({
            where: { id: existingSession.id },
            data: { questions: JSON.stringify(questionIds) },
          });

          // Create answer records
          await prisma.applicantAnswer.deleteMany({
            where: { testSessionId: existingSession.id },
          });
          await prisma.applicantAnswer.createMany({
            data: selected.map((q) => ({
              testSessionId: existingSession.id,
              questionId: q.id,
              pointsEarned: 0,
            })),
          });
        }
      }

      return NextResponse.json({
        success: true,
        sessionId: updatedSession.id,
        status: updatedSession.status,
        questions: questionIds,
        startedAt: updatedSession.startedAt,
      });
    }

    // Get application with job posting and test config
    const application = await prisma.application.findUnique({
      where: { id: sessionId },
      include: {
        jobPosting: {
          include: {
            testConfig: true,
            testSessions: true,
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

    // Check if there's a scheduled time and if it hasn't arrived yet
    if (application.testSessions.length > 0) {
      const existingSession = application.testSessions[0];
      if (existingSession.scheduledAt && new Date() < existingSession.scheduledAt) {
        return NextResponse.json(
          { success: false, error: "Belum waktunya memulai tes" },
          { status: 400 }
        );
      }
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

    // Also update application status if transitioning to IN_TEST
    if (status === "IN_PROGRESS") {
      const application = await prisma.application.findFirst({
        where: { id: session.applicationId },
      });
      if (application) {
        await prisma.application.update({
          where: { id: application.id },
          data: { status: "IN_TEST" },
        });
      }
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
