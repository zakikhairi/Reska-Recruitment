import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const division = searchParams.get("division");
    const difficulty = searchParams.get("difficulty");
    const isActive = searchParams.get("isActive");
    const search = searchParams.get("search");

    const where: any = {};

    if (category) where.category = category;
    if (division) where.jobDivision = division;
    if (difficulty) where.difficulty = difficulty;
    if (isActive === "true") where.isActive = true;
    if (isActive === "false") where.isActive = false;
    if (search) where.stem = { contains: search, mode: "insensitive" };

    const questions = await prisma.question.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(questions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { stem, category, jobDivision, difficulty, optionA, optionB, optionC, optionD, correctAnswer, explanation, points } = body;

    if (!stem || !category || !optionA || !optionB || !optionC || !optionD || !correctAnswer) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const question = await prisma.question.create({
      data: {
        stem,
        category,
        jobDivision: jobDivision || null,
        difficulty: difficulty || "MEDIUM",
        optionA,
        optionB,
        optionC,
        optionD,
        correctAnswer: correctAnswer.toUpperCase(),
        explanation: explanation || null,
        points: points || 1,
        isActive: true,
      },
    });

    return NextResponse.json(question);
  } catch (error) {
    console.error("Error creating question:", error);
    return NextResponse.json({ error: "Failed to create question" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, stem, category, jobDivision, difficulty, optionA, optionB, optionC, optionD, correctAnswer, explanation, points, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: "Question ID is required" }, { status: 400 });
    }

    const question = await prisma.question.update({
      where: { id },
      data: {
        stem,
        category,
        jobDivision: jobDivision || null,
        difficulty,
        optionA,
        optionB,
        optionC,
        optionD,
        correctAnswer: correctAnswer?.toUpperCase(),
        explanation: explanation || null,
        points: points || 1,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json(question);
  } catch (error) {
    console.error("Error updating question:", error);
    return NextResponse.json({ error: "Failed to update question" }, { status: 500 });
  }
}
