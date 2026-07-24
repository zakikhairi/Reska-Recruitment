import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";

const dbPath = path.join(process.cwd(), "prisma", "dev.db");
const adapter = new PrismaLibSql({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

// GET - Get single test config
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const config = await prisma.testConfig.findUnique({
      where: { id },
      include: {
        jobPosting: true
      }
    });

    if (!config) {
      return NextResponse.json(
        { error: "Konfigurasi tidak ditemukan" },
        { status: 404 }
      );
    }

    const transformedConfig = {
      id: config.id,
      jobTitle: config.jobPosting.title,
      division: config.jobPosting.division,
      categories: config.categories.split(","),
      passingGrade: config.overallPassingGrade,
      duration: config.totalDurationMinutes,
      questionsPerCategory: config.questionsPerCategory,
      totalQuestions: config.questionsPerCategory * config.categories.split(",").length,
      active: config.isActive,
      jobPostingId: config.jobPostingId,
      categoryWeights: JSON.parse(config.categoryWeights || "{}"),
      passingGrades: JSON.parse(config.passingGrades || "{}"),
    };

    return NextResponse.json({ success: true, config: transformedConfig });
  } catch (error) {
    console.error("Error fetching config:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data konfigurasi" },
      { status: 500 }
    );
  }
}

// PUT - Update test config
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { categories, passingGrade, duration, questionsPerCategory, active } = body;

    // Create category weights
    const categoryWeights: Record<string, number> = {};
    categories.forEach((cat: string) => {
      categoryWeights[cat] = Math.round(100 / categories.length);
    });

    // Create passing grades per category
    const passingGrades: Record<string, number> = {};
    categories.forEach((cat: string) => {
      passingGrades[cat] = passingGrade || 65;
    });

    const config = await prisma.testConfig.update({
      where: { id },
      data: {
        categories: categories.join(","),
        categoryWeights: JSON.stringify(categoryWeights),
        passingGrades: JSON.stringify(passingGrades),
        overallPassingGrade: passingGrade || 65,
        totalDurationMinutes: duration || 90,
        questionsPerCategory: questionsPerCategory || 10,
        isActive: active,
      },
      include: {
        jobPosting: true
      }
    });

    const transformedConfig = {
      id: config.id,
      jobTitle: config.jobPosting.title,
      division: config.jobPosting.division,
      categories: config.categories.split(","),
      passingGrade: config.overallPassingGrade,
      duration: config.totalDurationMinutes,
      questionsPerCategory: config.questionsPerCategory,
      totalQuestions: config.questionsPerCategory * config.categories.split(",").length,
      active: config.isActive,
      jobPostingId: config.jobPostingId,
    };

    return NextResponse.json({ success: true, config: transformedConfig });
  } catch (error) {
    console.error("Error updating config:", error);
    return NextResponse.json(
      { error: "Gagal mengupdate konfigurasi" },
      { status: 500 }
    );
  }
}

// DELETE - Delete test config
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.testConfig.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: "Konfigurasi berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting config:", error);
    return NextResponse.json(
      { error: "Gagal menghapus konfigurasi" },
      { status: 500 }
    );
  }
}
