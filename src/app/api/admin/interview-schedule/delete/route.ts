// API Route: Delete Interview Schedule
// DELETE /api/admin/interview-schedule?id=xxx

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Interview ID diperlukan" },
        { status: 400 }
      );
    }

    // Get the interview to find the application
    const interview = await prisma.interview.findUnique({
      where: { id },
    });

    if (!interview) {
      return NextResponse.json(
        { success: false, error: "Jadwal interview tidak ditemukan" },
        { status: 404 }
      );
    }

    // Delete the interview
    await prisma.interview.delete({
      where: { id },
    });

    // Update application status back to TEST_COMPLETED
    await prisma.application.update({
      where: { id: interview.applicationId },
      data: { status: "TEST_COMPLETED" },
    });

    return NextResponse.json({
      success: true,
      message: "Jadwal interview berhasil dihapus",
    });
  } catch (error: any) {
    console.error("Delete interview error:", error);
    return NextResponse.json(
      { success: false, error: `Terjadi kesalahan: ${error.message}` },
      { status: 500 }
    );
  }
}
