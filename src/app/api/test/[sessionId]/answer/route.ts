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
          selectedAnswer,
          answeredAt: new Date(),
        },
      });
    } else {
      await prisma.applicantAnswer.create({
        data: {
          testSessionId: sessionId,
          questionId,
          selectedAnswer,
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
