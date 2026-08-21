// API Route: Update/Delete Test Config by Job Posting ID
// PATCH /api/admin/test-config/[id]
// DELETE /api/admin/test-config/[id]

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await prisma.testConfig.update({
      where: { jobPostingId: id },
      data: {
        categories: body.categories,
        categoryWeights: body.categoryWeights,
        passingGrades: body.passingGrades,
        overallPassingGrade: body.overallPassingGrade,
        totalDurationMinutes: body.totalDurationMinutes,
        questionsPerCategory: body.questionsPerCategory,
        shuffleQuestions: body.shuffleQuestions,
        shuffleAnswers: body.shuffleAnswers,
        allowTabSwitch: body.allowTabSwitch,
        maxTabSwitches: body.maxTabSwitches,
        isActive: body.isActive,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Konfigurasi tes berhasil diperbarui",
      config: updated,
    });
  } catch (error) {
    console.error("Error updating test config:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Delete the config using jobPostingId
    await prisma.testConfig.delete({
      where: { jobPostingId: id },
    });

    return NextResponse.json({
      success: true,
      message: "Konfigurasi tes berhasil dihapus",
    });
  } catch (error: any) {
    console.error("Error deleting test config:", error);
    // If not found, still return success (idempotent)
    if (error.code === "P2025") {
      return NextResponse.json({
        success: true,
        message: "Konfigurasi tes tidak ditemukan atau sudah dihapus",
      });
    }
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
