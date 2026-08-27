// API Route: Update Application Status
// PATCH /api/admin/applications/[id]/status

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { sendStatusChangeEmail } from "@/lib/email";

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
    const { status, notes } = body;

    console.log("Status update request:", { id, status });

    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: "Status tidak valid" },
        { status: 400 }
      );
    }

    // Get current application with applicant and user data
    const currentApp = await prisma.application.findUnique({
      where: { id },
      include: {
        applicant: {
          include: {
            user: true,
          },
        },
        jobPosting: true,
      },
    });

    if (!currentApp) {
      return NextResponse.json(
        { success: false, error: "Lamaran tidak ditemukan" },
        { status: 404 }
      );
    }

    console.log("Current status:", currentApp.status);

    const previousStatus = currentApp.status;
    const applicantEmail = currentApp.applicant?.user?.email;
    const applicantName = currentApp.applicant?.fullName || "Kandidat";
    const positionTitle = currentApp.jobPosting?.title || "Posisi";

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
            notes: notes || null,
          },
        },
      },
    });

    console.log("Update successful:", application.status);

    // Send email notification
    if (applicantEmail) {
      console.log("[STATUS] Sending email notification to:", applicantEmail);

      // Determine the message based on status
      let emailNotes = notes;
      if (!emailNotes) {
        switch (status) {
          case "REJECTED":
            emailNotes = "Mohon maaf, setelah mempertimbangkan secara keseluruhan, kami memutuskan untuk tidak melanjutkan proses rekrutmen Anda pada kesempatan kali ini. Terima kasih atas minat Anda dan kami mendoakan yang terbaik untuk perjalanan karir Anda.";
            break;
          case "INTERVIEW":
            emailNotes = "Tim HRD akan menghubungi Anda untuk menjadwalkan wawancara. Pastikan nomor HP dan email Anda aktif.";
            break;
          case "TEST_SCHEDULED":
            emailNotes = "Silakan cek jadwal tes di akun Anda dan pastikan mengerjakan tes tepat waktu.";
            break;
          case "ACCEPTED":
            emailNotes = "Selamat! Tim HRD akan menghubungi Anda untuk proses lebih lanjut.";
            break;
          default:
            emailNotes = undefined;
        }
      }

      try {
        const emailResult = await sendStatusChangeEmail(
          applicantEmail,
          applicantName,
          positionTitle,
          previousStatus,
          status,
          emailNotes
        );

        if (emailResult.success) {
          console.log("[STATUS] ✓ Email notification sent successfully");
        } else {
          console.log("[STATUS] ⚠️ Email notification failed:", emailResult.error);
        }
      } catch (emailError) {
        console.error("[STATUS] Error sending email:", emailError);
        // Don't fail the request if email fails
      }
    } else {
      console.log("[STATUS] ⚠️ No email address found for applicant");
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
