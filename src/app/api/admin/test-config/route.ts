// API Route: Create Test Config for Job
// POST /api/admin/test-config

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      jobId,
      categories,
      categoryWeights,
      passingGrades,
      overallPassingGrade,
      totalDurationMinutes,
      questionsPerCategory,
      shuffleQuestions,
      shuffleAnswers,
      allowTabSwitch,
      maxTabSwitches,
      isActive,
    } = body;

    if (!jobId || !categories) {
      return NextResponse.json(
        { success: false, error: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    // Check if job exists
    const job = await prisma.jobPosting.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return NextResponse.json(
        { success: false, error: "Lowongan tidak ditemukan" },
        { status: 404 }
      );
    }

    // Check if config already exists for this job
    const existingConfig = await prisma.testConfig.findUnique({
      where: { jobPostingId: jobId },
    });

    if (existingConfig) {
      // Update existing config
      const updated = await prisma.testConfig.update({
        where: { jobPostingId: jobId },
        data: {
          categories,
          categoryWeights: JSON.stringify(categoryWeights),
          passingGrades: JSON.stringify(passingGrades),
          overallPassingGrade: overallPassingGrade || 65,
          totalDurationMinutes: totalDurationMinutes || 90,
          questionsPerCategory: questionsPerCategory || 10,
          shuffleQuestions: shuffleQuestions !== false,
          shuffleAnswers: shuffleAnswers !== false,
          allowTabSwitch: allowTabSwitch || false,
          maxTabSwitches: maxTabSwitches || 5,
          isActive: isActive !== false,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Konfigurasi tes berhasil diperbarui",
        config: updated,
      });
    }

    // Create new config
    const config = await prisma.testConfig.create({
      data: {
        jobPostingId: jobId,
        categories,
        categoryWeights: JSON.stringify(categoryWeights || {}),
        passingGrades: JSON.stringify(passingGrades || {}),
        overallPassingGrade: overallPassingGrade || 65,
        totalDurationMinutes: totalDurationMinutes || 90,
        questionsPerCategory: questionsPerCategory || 10,
        shuffleQuestions: shuffleQuestions !== false,
        shuffleAnswers: shuffleAnswers !== false,
        allowTabSwitch: allowTabSwitch || false,
        maxTabSwitches: maxTabSwitches || 5,
        isActive: isActive !== false,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Konfigurasi tes berhasil dibuat",
      config,
    });
  } catch (error) {
    console.error("Error creating test config:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// GET: List test configs
export async function GET() {
  try {
    const configs = await prisma.testConfig.findMany({
      include: {
        jobPosting: {
          select: {
            id: true,
            title: true,
            division: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      configs,
    });
  } catch (error) {
    console.error("Error fetching test configs:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
