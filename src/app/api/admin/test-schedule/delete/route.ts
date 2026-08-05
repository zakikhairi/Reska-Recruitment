// API Route: Delete Test Schedules
// DELETE /api/admin/test-schedule/delete?applicationId=xxx (individual)
// DELETE /api/admin/test-schedule/delete (all scheduled)
// POST /api/admin/test-schedule/delete with { deleteAll: true } (all scheduled)

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get("applicationId");
    const jobPostingId = searchParams.get("jobPostingId");

    if (applicationId) {
      // Delete schedule for specific application
      const session = await prisma.testSession.findFirst({
        where: { applicationId },
      });

      if (!session) {
        return NextResponse.json(
          { success: false, error: "Jadwal tidak ditemukan" },
          { status: 404 }
        );
      }

      await prisma.testSession.delete({
        where: { id: session.id },
      });

      return NextResponse.json({
        success: true,
        message: "Jadwal berhasil dihapus",
      });
    } else if (jobPostingId) {
      // Delete only schedules for specific job posting
      const deleted = await prisma.testSession.deleteMany({
        where: {
          application: {
            jobPostingId,
          },
          status: "SCHEDULED",
        },
      });

      return NextResponse.json({
        success: true,
        message: `Berhasil menghapus ${deleted.count} jadwal tes`,
        deletedCount: deleted.count,
      });
    } else {
      // Delete all scheduled test sessions
      const deleted = await prisma.testSession.deleteMany({
        where: {
          status: "SCHEDULED",
        },
      });

      return NextResponse.json({
        success: true,
        message: `Berhasil menghapus ${deleted.count} jadwal tes`,
        deletedCount: deleted.count,
      });
    }
  } catch (error: any) {
    console.error("Delete schedule error:", error);
    return NextResponse.json(
      { success: false, error: `Terjadi kesalahan: ${error.message}` },
      { status: 500 }
    );
  }
}

// DELETE ALL - Delete all scheduled test sessions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { deleteAll } = body;

    if (deleteAll === true) {
      // Delete all scheduled test sessions
      const deleted = await prisma.testSession.deleteMany({
        where: {
          status: "SCHEDULED",
        },
      });

      return NextResponse.json({
        success: true,
        message: `Berhasil menghapus ${deleted.count} jadwal tes`,
        deletedCount: deleted.count,
      });
    }

    return NextResponse.json(
      { success: false, error: "Parameter tidak valid" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Delete schedule error:", error);
    return NextResponse.json(
      { success: false, error: `Terjadi kesalahan: ${error.message}` },
      { status: 500 }
    );
  }
}
