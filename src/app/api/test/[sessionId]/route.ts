import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { calculateTestScore, selectQuestionsForTest } from "@/lib/scoring";
import { TestCategory } from "@/types";

// GET: Get test configuration
// This endpoint handles both application ID and session ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    // First try to find by session ID
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
          { success: false, error: "Application not found" },
          { status: 404 }
        );
      }

      if (!application.jobPosting.testConfig) {
        return NextResponse.json(
          { success: false, error: "Test not configured for this position" },
          { status: 400 }
        );
      }

      const config = {
        ...application.jobPosting.testConfig,
        categories: application.jobPosting.testConfig.categories.split(",") as TestCategory[],
        categoryWeights: JSON.parse(application.jobPosting.testConfig.categoryWeights),
        passingGrades: JSON.parse(application.jobPosting.testConfig.passingGrades),
      };

      return NextResponse.json({
        success: true,
        data: {
          applicationId: sessionId,
          sessionId: application.testSession?.id,
          status: application.testSession?.status || "NOT_STARTED",
          config,
        },
      });
    }

    // Parse config from session's application
    const application = session.application;
    if (!application?.jobPosting.testConfig) {
      return NextResponse.json(
        { success: false, error: "Test configuration not found" },
        { status: 400 }
      );
    }

    const config = {
      ...application.jobPosting.testConfig,
      categories: application.jobPosting.testConfig.categories.split(",") as TestCategory[],
      categoryWeights: JSON.parse(application.jobPosting.testConfig.categoryWeights),
      passingGrades: JSON.parse(application.jobPosting.testConfig.passingGrades),
    };

    return NextResponse.json({
      success: true,
      data: {
        applicationId: application.id,
        sessionId: session.id,
        status: session.status,
        config,
      },
    });
  } catch (error) {
    console.error("Error fetching test config:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
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

    // Check if test session already exists (by application ID)
    const existingSession = await prisma.testSession.findFirst({
      where: {
        application: { id: sessionId },
      },
    });

    if (existingSession) {
      if (existingSession.status === "SUBMITTED" || existingSession.status === "SCORED") {
        return NextResponse.json(
          { success: false, error: "Test already completed" },
          { status: 400 }
        );
      }

      // Resume existing session
      const updatedSession = await prisma.testSession.update({
        where: { id: existingSession.id },
        data: {
          status: "IN_PROGRESS",
          startedAt: existingSession.startedAt || new Date(),
        },
      });

      const questions = existingSession.questions
        ? JSON.parse(existingSession.questions)
        : [];

      return NextResponse.json({
        success: true,
        data: {
          sessionId: updatedSession.id,
          status: updatedSession.status,
          questions,
          startedAt: updatedSession.startedAt,
        },
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
        { success: false, error: "Application not found" },
        { status: 404 }
      );
    }

    if (!application.jobPosting.testConfig) {
      return NextResponse.json(
        { success: false, error: "Test not configured for this position" },
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
      data: {
        sessionId: session.id,
        status: session.status,
        questions: selectedQuestions.map((q) => q.id),
        startedAt: session.startedAt,
      },
    });
  } catch (error) {
    console.error("Error starting test session:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
