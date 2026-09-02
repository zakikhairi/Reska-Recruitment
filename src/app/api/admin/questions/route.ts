import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET: Get all questions for admin question bank
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const difficulty = searchParams.get("difficulty");
    const division = searchParams.get("division");
    const status = searchParams.get("status");
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

    if (status === "active") {
      where.isActive = true;
    } else if (status === "inactive") {
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
      questions: questions.map(q => ({
        id: q.id,
        stem: q.stem,
        category: q.category,
        difficulty: q.difficulty,
        division: q.jobDivision,
        isActive: q.isActive,
        options: {
          A: q.optionA,
          B: q.optionB,
          C: q.optionC,
          D: q.optionD,
        },
        correct: q.correctAnswer,
        points: q.points,
        explanation: q.explanation,
        createdAt: q.createdAt,
      })),
      stats: categoryStats.map(stat => ({
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
      optionA,
      optionB,
      optionC,
      optionD,
      correctAnswer,
      explanation,
      points,
    } = body;

    // Validation
    if (!stem || !category || !optionA || !optionB || !optionC || !optionD || !correctAnswer) {
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
        jobDivision: division || null,
        optionA,
        optionB,
        optionC,
        optionD,
        correctAnswer,
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
