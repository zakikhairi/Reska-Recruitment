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
        interview: true,
        mcu: true,
        offering: true,
        testSession: true,
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
        interview: application.interview,
        mcu: application.mcu,
        offering: application.offering,
        testSession: application.testSession ? {
          id: application.testSession.id,
          status: application.testSession.status,
          scheduledAt: application.testSession.scheduledAt,
          endTime: application.testSession.endTime,
          location: application.testSession.location,
          adminMessage: application.testSession.adminMessage,
          totalScore: application.testSession.totalScore,
          passed: application.testSession.passed,
        } : null,
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
    const { action, notes, testSchedule } = body;

    if (!action || !["approve", "reject", "schedule_test"].includes(action)) {
      return NextResponse.json(
        { success: false, error: "Action harus 'approve', 'reject', atau 'schedule_test'" },
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
    } else if (action === "schedule_test") {
      newStatus = "TEST_SCHEDULED";
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

    // Upsert test session if new status is TEST_SCHEDULED and testSchedule is provided
    if (newStatus === "TEST_SCHEDULED" && testSchedule) {
      const scheduledAtDate = testSchedule.scheduledAt ? new Date(testSchedule.scheduledAt) : null;
      const endTimeDate = testSchedule.endTime ? new Date(testSchedule.endTime) : null;

      await prisma.testSession.upsert({
        where: { applicationId: id },
        create: {
          applicationId: id,
          scheduledAt: scheduledAtDate,
          endTime: endTimeDate,
          location: testSchedule.location || "Online System (Portal CBT KAI Services)",
          adminMessage: testSchedule.adminMessage || null,
          status: "NOT_STARTED",
        },
        update: {
          scheduledAt: scheduledAtDate,
          endTime: endTimeDate,
          location: testSchedule.location || "Online System (Portal CBT KAI Services)",
          adminMessage: testSchedule.adminMessage || null,
        },
      });
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
            notes: notes || (action === "schedule_test" ? "Jadwal tes diperbarui oleh admin" : undefined),
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
      if (newStatus === "REJECTED") {
        emailNotes = notes || "Mohon maaf, setelah mempertimbangkan secara keseluruhan, kami memutuskan untuk tidak melanjutkan proses rekrutmen Anda pada kesempatan kali ini. Terima kasih atas minat Anda dan kami mendoakan yang terbaik untuk perjalanan karir Anda.";
      } else if (newStatus === "TEST_SCHEDULED") {
        let scheduleInfo = "";
        if (testSchedule?.scheduledAt) {
          const formattedStart = new Date(testSchedule.scheduledAt).toLocaleString("id-ID", { dateStyle: "full", timeStyle: "short" });
          const formattedEnd = testSchedule.endTime ? new Date(testSchedule.endTime).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "";
          scheduleInfo = `\n\nJadwal Tes: ${formattedStart}${formattedEnd ? ' s/d ' + formattedEnd : ''}\nLokasi / Format: ${testSchedule.location || "Online System (Portal CBT KAI Services)"}`;
          if (testSchedule.adminMessage) {
            scheduleInfo += `\nInstruksi: ${testSchedule.adminMessage}`;
          }
        }
        emailNotes = notes
          ? `${notes}${scheduleInfo}`
          : `Selamat! Berkas lamaran Anda telah diverifikasi dan Anda berhak mengikuti tes kompetensi.${scheduleInfo}\n\nSilakan login ke portal karir KAI Services tepat waktu.`;
      } else if (!emailNotes) {
        if (newStatus === "INTERVIEW") {
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
      message: action === "reject"
        ? "Lamaran berhasil ditolak. Email notifikasi sudah dikirim."
        : testSchedule?.scheduledAt
        ? "Berkas diverifikasi & jadwal tes berhasil ditetapkan. Email notifikasi sudah dikirim ke pelamar."
        : "Lamaran berhasil diverifikasi. Email notifikasi sudah dikirim.",
    });
  } catch (error) {
    console.error("Error verifying application:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
