// API Route: Update Application Status
// PATCH /api/admin/applications/[id]/status

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// Valid statuses
const validStatuses = [
  "PENDING",
  "ADMIN_CHECK",
  "TEST",
  "IN_TEST",
  "TEST_SCHEDULED",
  "TEST_COMPLETED",
  "INTERVIEW",
  "MCU",
  "OFFERING",
  "OFFERED",
  "ACCEPTED",
  "REJECTED",
  "WITHDRAWN",
];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

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

    // Update application
    const application = await prisma.application.update({
      where: { id },
      data: {
        status,
        reviewedAt: new Date(),
        statusHistory: {
          create: {
            fromStatus: previousStatus,
            toStatus: status,
          },
        },
      },
      include: {
        applicant: {
          select: {
            fullName: true,
            email: true,
          },
        },
        jobPosting: {
          select: {
            title: true,
            division: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: application.id,
        status: application.status,
        previousStatus,
      },
      message: `Status berhasil diubah dari ${previousStatus} ke ${status}`,
    });
  } catch (error) {
    console.error("Error updating application status:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
