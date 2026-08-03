// API Route: Update Application Status (Admin)
// PATCH /api/admin/applications/[id]/update

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, notes } = body;

    // Validasi status
    const validStatuses = [
      "PENDING",
      "ADMIN_CHECK",
      "TEST_SCHEDULED",
      "IN_TEST",
      "TEST_COMPLETED",
      "INTERVIEW",
      "MCU",
      "OFFERING",
      "ACCEPTED",
      "REJECTED",
      "WITHDRAWN",
    ];

    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: "Status tidak valid" },
        { status: 400 }
      );
    }

    // Get current application
    const currentApp = await prisma.application.findUnique({
      where: { id },
    });

    if (!currentApp) {
      return NextResponse.json(
        { success: false, error: "Lamaran tidak ditemukan" },
        { status: 404 }
      );
    }

    const previousStatus = currentApp.status;

    // Update application status and add to history
    const application = await prisma.application.update({
      where: { id },
      data: {
        status,
        notes: notes || currentApp.notes,
        reviewedAt: new Date(),
        statusHistory: {
          create: {
            fromStatus: previousStatus,
            toStatus: status,
            notes,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Status berhasil diubah dari ${previousStatus} ke ${status}`,
      data: {
        id: application.id,
        status: application.status,
        previousStatus,
      },
    });
  } catch (error) {
    console.error("Update application status error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
