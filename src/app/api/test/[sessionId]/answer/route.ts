import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// PUT: Submit a single answer
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const body = await request.json();
    const { questionId, selectedAnswer } = body;

    if (!questionId || !selectedAnswer) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get the session to find the answer mapping
    const session = await prisma.testSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Session not found" },
        { status: 404 }
      );
    }

    // 1. Cek apakah tes sudah selesai / disubmit
    if (session.status === "SUBMITTED" || session.status === "SCORED" || session.status === "COMPLETED" || session.submittedAt) {
      return NextResponse.json(
        { success: false, error: "Tes sudah selesai dikerjakan dan jawaban tidak dapat diubah lagi." },
        { status: 403 }
      );
    }

    // 2. Cek apakah waktu tes belum tiba
    if (session.scheduledAt && new Date(session.scheduledAt) > new Date()) {
      return NextResponse.json(
        { success: false, error: "Jadwal tes belum dimulai." },
        { status: 403 }
      );
    }

    // 3. Cek apakah waktu tes sudah habis
    if (session.endTime && new Date(session.endTime) < new Date()) {
      return NextResponse.json(
        { success: false, error: "Batas waktu pengerjaan tes telah berakhir." },
        { status: 403 }
      );
    }

    // Parse answer mappings from tabSwitchLogs
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

    // Convert the display answer (e.g., "C") back to original answer (e.g., "A")
    let originalAnswer = selectedAnswer;
    if (answerMappings[questionId]) {
      const mapping = answerMappings[questionId];
      const displayOption = mapping.displayOptions?.find(
        (opt: any) => opt.displayOption === selectedAnswer
      );
      if (displayOption) {
        originalAnswer = displayOption.originalOption;
      }
    }

    // Update or create the answer
    const existingAnswer = await prisma.applicantAnswer.findFirst({
      where: {
        testSessionId: sessionId,
        questionId,
      },
    });

    if (existingAnswer) {
      await prisma.applicantAnswer.update({
        where: { id: existingAnswer.id },
        data: {
          selectedAnswer: originalAnswer, // Store the original answer
          answeredAt: new Date(),
        },
      });
    } else {
      await prisma.applicantAnswer.create({
        data: {
          testSessionId: sessionId,
          questionId,
          selectedAnswer: originalAnswer,
          answeredAt: new Date(),
          pointsEarned: 0,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Answer saved",
    });
  } catch (error) {
    console.error("Error saving answer:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
