// API Route: Update Application Status
// PATCH /api/admin/applications/[id]/status

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { sendStatusNotification } from "@/lib/email";

// Valid statuses
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    console.log("Status update request:", { id, status });

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

    console.log("Current status:", currentApp.status);

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
    });

    console.log("Update successful:", application.status);

    // Send email notification (async, don't wait)
    if (application.applicantId) {
      // Get applicant and user details for email
      const appWithDetails = await prisma.application.findUnique({
        where: { id },
        include: {
          applicant: {
            include: { user: true }
          },
          jobPosting: true
        }
      });

      if (appWithDetails?.applicant?.user?.email) {
        sendStatusNotification({
          applicantEmail: appWithDetails.applicant.user.email,
          applicantName: appWithDetails.applicant.fullName,
          jobTitle: appWithDetails.jobPosting.title,
          status,
          previousStatus,
          notes: body.notes,
          testDate: body.testDate,
          testLocation: body.testLocation,
          interviewDate: body.interviewDate,
          interviewLocation: body.interviewLocation,
        }).catch(err => console.error("Email notification error:", err));
      }
    }

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
