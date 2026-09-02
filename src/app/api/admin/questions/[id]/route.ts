import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET: Get single question
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const question = await prisma.question.findUnique({
      where: { id },
    });

    if (!question) {
      return NextResponse.json(
        { error: "Soal tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      question: {
        id: question.id,
        stem: question.stem,
        category: question.category,
        difficulty: question.difficulty,
        division: question.jobDivision,
        jobDivision: question.jobDivision,
        optionA: question.optionA,
        optionB: question.optionB,
        optionC: question.optionC,
        optionD: question.optionD,
        correctAnswer: question.correctAnswer,
        isActive: question.isActive,
        points: question.points,
        explanation: question.explanation,
      },
    });
  } catch (error) {
    console.error("Get question error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// PUT: Update question
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const {
      stem,
      category,
      difficulty,
      division,
      jobDivision,
      optionA,
      optionB,
      optionC,
      optionD,
      correctAnswer,
      explanation,
      points,
      isActive,
    } = body;

    const question = await prisma.question.update({
      where: { id },
      data: {
        stem,
        category,
        difficulty,
        jobDivision: division || jobDivision || null,
        optionA,
        optionB,
        optionC,
        optionD,
        correctAnswer: correctAnswer?.toUpperCase(),
        explanation: explanation || null,
        points: points || 1,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Soal berhasil diperbarui",
      question: {
        id: question.id,
        stem: question.stem,
        category: question.category,
      },
    });
  } catch (error) {
    console.error("Update question error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// DELETE: Delete question
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.question.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Soal berhasil dihapus",
    });
  } catch (error) {
    console.error("Delete question error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
