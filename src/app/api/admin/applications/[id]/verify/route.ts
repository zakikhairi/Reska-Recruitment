// API Route: Verify Application (Approve/Reject) and Get Details
// GET /api/admin/applications/[id]/verify - Get application details
// PATCH /api/admin/applications/[id]/verify - Verify application

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { sendStatusChangeEmail } from "@/lib/email";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        applicant: {
          include: {
            documents: true,
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        jobPosting: {
          select: {
            id: true,
            title: true,
            division: true,
            location: true,
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json(
        { success: false, error: "Lamaran tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        application: {
          id: application.id,
          status: application.status,
          notes: application.notes,
          createdAt: application.createdAt,
        },
        applicant: {
          id: application.applicant.id,
          fullName: application.applicant.fullName,
          email: application.applicant.user?.email || "",
          nik: application.applicant.nik,
          phone: application.applicant.phone,
          dateOfBirth: application.applicant.dateOfBirth,
          placeOfBirth: application.applicant.placeOfBirth,
          gender: application.applicant.gender,
          address: application.applicant.address,
          city: application.applicant.city,
          education: application.applicant.education,
          university: application.applicant.university,
          height: application.applicant.height,
          weight: application.applicant.weight,
          photoUrl: application.applicant.photoUrl,
          documents: application.applicant.documents.map((doc: typeof application.applicant.documents[number]) => ({
            id: doc.id,
            type: doc.type,
            fileName: doc.fileName,
            fileUrl: doc.fileUrl,
            fileSize: doc.fileSize,
            uploadedAt: doc.uploadedAt,
          })),
        },
        job: application.jobPosting,
      },
    });
  } catch (error) {
    console.error("Error fetching application:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, notes } = body;

    if (!action || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { success: false, error: "Action harus 'approve' atau 'reject'" },
        { status: 400 }
      );
    }

    // Get current application with user info
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

    const previousStatus = currentApp.status;

    // Determine new status based on action and current status
    let newStatus = "";
    if (action === "reject") {
      newStatus = "REJECTED";
    } else {
      // Approve - determine next status based on current status
      switch (currentApp.status) {
        case "ADMIN_CHECK":
          newStatus = "TEST_SCHEDULED";
          break;
        case "TEST_COMPLETED":
          newStatus = "INTERVIEW";
          break;
        case "INTERVIEW":
          newStatus = "MCU";
          break;
        case "MCU":
          newStatus = "OFFERING";
          break;
        case "OFFERING":
          newStatus = "ACCEPTED";
          break;
        default:
          newStatus = "TEST_SCHEDULED";
      }
    }

    // Update application
    const application = await prisma.application.update({
      where: { id },
      data: {
        status: newStatus,
        notes: notes || currentApp.notes,
        reviewedAt: new Date(),
        statusHistory: {
          create: {
            fromStatus: previousStatus,
            toStatus: newStatus,
            notes,
          },
        },
      },
      include: {
        applicant: {
          select: {
            fullName: true,
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

    // Send email notification
    const applicantEmail = currentApp.applicant?.user?.email;
    const applicantName = currentApp.applicant?.fullName || "Kandidat";
    const positionTitle = currentApp.jobPosting?.title || "Posisi";

    if (applicantEmail) {
      console.log("[VERIFY] Sending email notification to:", applicantEmail);

      // Determine email notes based on status
      let emailNotes = notes;
      if (!emailNotes) {
        if (newStatus === "REJECTED") {
          emailNotes = "Mohon maaf, setelah mempertimbangkan secara keseluruhan, kami memutuskan untuk tidak melanjutkan proses rekrutmen Anda pada kesempatan kali ini. Terima kasih atas minat Anda dan kami mendoakan yang terbaik untuk perjalanan karir Anda.";
        } else if (newStatus === "TEST_SCHEDULED") {
          emailNotes = "Silakan cek jadwal tes di akun Anda dan pastikan mengerjakan tes tepat waktu.";
        } else if (newStatus === "INTERVIEW") {
          emailNotes = "Tim HRD akan menghubungi Anda untuk menjadwalkan wawancara. Pastikan nomor HP dan email Anda aktif.";
        } else if (newStatus === "ACCEPTED") {
          emailNotes = "Selamat! Tim HRD akan menghubungi Anda untuk proses lebih lanjut.";
        }
      }

      try {
        const emailResult = await sendStatusChangeEmail(
          applicantEmail,
          applicantName,
          positionTitle,
          previousStatus,
          newStatus,
          emailNotes
        );

        if (emailResult.success) {
          console.log("[VERIFY] ✓ Email notification sent successfully");
        } else {
          console.log("[VERIFY] ⚠️ Email notification failed:", emailResult.error);
        }
      } catch (emailError) {
        console.error("[VERIFY] Error sending email:", emailError);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        id: application.id,
        status: application.status,
        previousStatus,
      },
      message: action === "approve"
        ? "Lamaran berhasil diverifikasi. Email notifikasi sudah dikirim."
        : "Lamaran berhasil ditolak. Email notifikasi sudah dikirim.",
    });
  } catch (error) {
    console.error("Error verifying application:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
