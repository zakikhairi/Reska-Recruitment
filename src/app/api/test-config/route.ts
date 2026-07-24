import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";

const dbPath = path.join(process.cwd(), "prisma", "dev.db");
const adapter = new PrismaLibSql({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

// GET - Get all test configs
export async function GET() {
  try {
    const configs = await prisma.testConfig.findMany({
      include: {
        jobPosting: true
      },
      orderBy: { createdAt: "desc" }
    });

    // Transform data for frontend
    const transformedConfigs = configs.map(config => ({
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
      createdAt: config.createdAt,
      updatedAt: config.updatedAt
    }));

    return NextResponse.json({ success: true, configs: transformedConfigs });
  } catch (error) {
    console.error("Error fetching configs:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data konfigurasi" },
      { status: 500 }
    );
  }
}

// POST - Create new test config
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobTitle, division, categories, passingGrade, duration, questionsPerCategory, active } = body;

    if (!jobTitle || !categories || categories.length === 0) {
      return NextResponse.json(
        { error: "Data tidak lengkap" },
        { status: 400 }
      );
    }

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

    const config = await prisma.testConfig.create({
      data: {
        jobPosting: {
          create: {
            title: jobTitle,
            division: division || "ON_TRAIN_SERVICE",
            location: "Indonesia",
            description: "Lowongan tes",
            requirements: "-",
            minEducation: "SMA",
            deadline: new Date("2026-12-31"),
            status: "ACTIVE",
          }
        },
        categories: categories.join(","),
        categoryWeights: JSON.stringify(categoryWeights),
        passingGrades: JSON.stringify(passingGrades),
        overallPassingGrade: passingGrade || 65,
        totalDurationMinutes: duration || 90,
        questionsPerCategory: questionsPerCategory || 10,
        isActive: active !== false,
      },
      include: {
        jobPosting: true
      }
    });

    // Transform response
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
    console.error("Error creating config:", error);
    return NextResponse.json(
      { error: "Gagal membuat konfigurasi" },
      { status: 500 }
    );
  }
}
