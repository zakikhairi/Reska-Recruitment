import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET: Get all questions for admin question bank
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const difficulty = searchParams.get("difficulty");
    const division = searchParams.get("division") || searchParams.get("jobDivision");
    const status = searchParams.get("status") || searchParams.get("isActive");
    const search = searchParams.get("search");

    // Build where clause
    const where: Record<string, unknown> = {};

    if (category && category !== "all") {
      where.category = category;
    }

    if (difficulty && difficulty !== "all") {
      where.difficulty = difficulty;
    }

    if (division && division !== "all") {
      where.jobDivision = division;
    }

    if (status === "active" || status === "true") {
      where.isActive = true;
    } else if (status === "inactive" || status === "false") {
      where.isActive = false;
    }

    if (search) {
      where.OR = [
        { stem: { contains: search, mode: "insensitive" } },
        { optionA: { contains: search, mode: "insensitive" } },
        { optionB: { contains: search, mode: "insensitive" } },
        { optionC: { contains: search, mode: "insensitive" } },
        { optionD: { contains: search, mode: "insensitive" } },
      ];
    }

    const questions = await prisma.question.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    // Get category stats
    const categoryStats = await prisma.question.groupBy({
      by: ["category"],
      _count: { category: true },
    });

    return NextResponse.json({
      success: true,
      questions: questions.map((q) => ({
        id: q.id,
        stem: q.stem,
        category: q.category,
        difficulty: q.difficulty,
        division: q.jobDivision,
        jobDivision: q.jobDivision,
        isActive: q.isActive,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        options: {
          A: q.optionA,
          B: q.optionB,
          C: q.optionC,
          D: q.optionD,
        },
        correct: q.correctAnswer,
        correctAnswer: q.correctAnswer,
        points: q.points,
        explanation: q.explanation,
        createdAt: q.createdAt,
      })),
      stats: categoryStats.map((stat) => ({
        category: stat.category,
        count: stat._count.category,
      })),
      total: questions.length,
    });
  } catch (error) {
    console.error("Get questions error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// POST: Create new question
export async function POST(request: Request) {
  try {
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
      correct,
      explanation,
      points,
    } = body;

    const answer = (correctAnswer || correct || "").toUpperCase();

    // Validation
    if (!stem || !category || !optionA || !optionB || !optionC || !optionD || !answer) {
      return NextResponse.json(
        { error: "Semua field wajib diisi" },
        { status: 400 }
      );
    }

    const question = await prisma.question.create({
      data: {
        stem,
        category,
        difficulty: difficulty || "MEDIUM",
        jobDivision: division || jobDivision || null,
        optionA,
        optionB,
        optionC,
        optionD,
        correctAnswer: answer,
        explanation: explanation || null,
        points: points || 1,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Soal berhasil dibuat",
      question: {
        id: question.id,
        stem: question.stem,
        category: question.category,
        difficulty: question.difficulty,
        jobDivision: question.jobDivision,
        optionA: question.optionA,
        optionB: question.optionB,
        optionC: question.optionC,
        optionD: question.optionD,
        correctAnswer: question.correctAnswer,
      },
    });
  } catch (error) {
    console.error("Create question error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// PUT: Update question
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      stem,
      category,
      jobDivision,
      division,
      difficulty,
      optionA,
      optionB,
      optionC,
      optionD,
      correctAnswer,
      correct,
      explanation,
      points,
      isActive,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "Question ID is required" }, { status: 400 });
    }

    const answer = (correctAnswer || correct || "").toUpperCase();

    const question = await prisma.question.update({
      where: { id },
      data: {
        stem,
        category,
        jobDivision: jobDivision || division || null,
        difficulty,
        optionA,
        optionB,
        optionC,
        optionD,
        correctAnswer: answer || undefined,
        explanation: explanation || null,
        points: points || 1,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Soal berhasil diperbarui",
      question,
    });
  } catch (error) {
    console.error("Error updating question:", error);
    return NextResponse.json({ error: "Failed to update question" }, { status: 500 });
  }
}

// DELETE: Delete question by id query param
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Question ID is required" }, { status: 400 });
    }

    await prisma.question.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Question deleted successfully" });
  } catch (error) {
    console.error("Error deleting question:", error);
    return NextResponse.json({ error: "Failed to delete question" }, { status: 500 });
  }
}
