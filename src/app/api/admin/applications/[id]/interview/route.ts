// API Route: Input & Update Interview Results (Schedule vs Score Separation)
// POST /api/admin/applications/[id]/interview

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { sendStatusChangeEmail } from "@/lib/email";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      actionType, // "schedule" | "score" | undefined
      interviewer,
      type = "ONLINE",
      scheduledAt,
      location = "Kantor Pusat KAI Services",
      zoomLink,
      score,
      result, // PASSED, FAILED, RESCHEDULE
      notes,
      aspectScores, // { communication, technicalSkill, personality, leadership, motivation }
      advanceStatus = true,
    } = body;

    // Verify application exists
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        applicant: {
          include: {
            user: true,
          },
        },
        jobPosting: true,
        interview: true,
      },
    });

    if (!application) {
      return NextResponse.json(
        { success: false, error: "Lamaran tidak ditemukan" },
        { status: 404 }
      );
    }

    let updatedInterview: any;
    let updatedApplication: any = application;

    // ==========================================
    // CASE 1: JADWALKAN WAWANCARA (actionType === "schedule")
    // ==========================================
    if (actionType === "schedule") {
      if (!scheduledAt) {
        return NextResponse.json(
          { success: false, error: "Waktu jadwal wawancara wajib diisi" },
          { status: 400 }
        );
      }

      const interviewDateTime = new Date(scheduledAt);

      updatedInterview = await prisma.interview.upsert({
        where: { applicationId: id },
        update: {
          interviewer: interviewer || application.interview?.interviewer || "Tim HRD KAI Services",
          type: type || application.interview?.type || "ONLINE",
          scheduledAt: interviewDateTime,
          location: location || application.interview?.location || "Kantor Pusat KAI Services",
          zoomLink: zoomLink !== undefined ? zoomLink : application.interview?.zoomLink,
          notes: notes !== undefined ? notes : application.interview?.notes,
          updatedAt: new Date(),
        },
        create: {
          applicationId: id,
          interviewer: interviewer || "Tim HRD KAI Services",
          type: type || "ONLINE",
          scheduledAt: interviewDateTime,
          location: location || "Kantor Pusat KAI Services",
          zoomLink: zoomLink || null,
          notes: notes || null,
        },
      });

      // Update status lamaran ke INTERVIEW jika sebelumnya belum
      if (application.status !== "INTERVIEW" && !["MCU", "OFFERING", "ACCEPTED"].includes(application.status)) {
        updatedApplication = await prisma.application.update({
          where: { id },
          data: {
            status: "INTERVIEW",
            reviewedAt: new Date(),
            notes: `Wawancara dijadwalkan pada ${interviewDateTime.toLocaleString("id-ID")}`,
          } as any,
          include: {
            applicant: {
              include: { user: true },
            },
            jobPosting: true,
          },
        });

        // Catat history
        await prisma.statusHistory.create({
          data: {
            applicationId: id,
            fromStatus: application.status,
            toStatus: "INTERVIEW",
            notes: `Jadwal wawancara ditetapkan: ${interviewDateTime.toLocaleString("id-ID")} (${type === "ONLINE" ? "Online" : "Tatap Muka"}). Pewawancara: ${interviewer || "Tim HRD"}`,
          },
        });

        // Kirim email notifikasi jadwal wawancara
        if (application.applicant.user?.email) {
          try {
            await sendStatusChangeEmail({
              to: application.applicant.user.email,
              applicantName: application.applicant.fullName,
              jobTitle: application.jobPosting.title,
              newStatus: "INTERVIEW",
              notes: `Jadwal Wawancara Anda: ${interviewDateTime.toLocaleString("id-ID")}. Format: ${type === "ONLINE" ? "Online (" + (zoomLink || "Link Zoom menyusul") + ")" : "Tatap Muka di " + location}. ${notes || ""}`,
            });
          } catch (emailError) {
            console.warn("Could not send interview schedule email:", emailError);
          }
        }
      }

      return NextResponse.json({
        success: true,
        message: "Jadwal wawancara berhasil ditetapkan",
        interview: updatedInterview,
        application: updatedApplication,
      });
    }

    // ==========================================
    // CASE 2: INPUT NILAI & EVALUASI WAWANCARA (actionType === "score" atau default)
    // ==========================================
    // Format combined notes with aspect scores breakdown if provided
    let combinedNotes = notes || "";
    if (aspectScores && typeof aspectScores === "object") {
      const breakdownText = `\n\n[Rincian Skor Aspek Kompetensi]\n- Komunikasi & Artikulasi: ${aspectScores.communication || aspectScores.komunikasi || 0}\n- Kemampuan Teknis & Pemahaman: ${aspectScores.technicalSkill || aspectScores.kompetensi || 0}\n- Sikap, Etika & AKHLAK: ${aspectScores.personality || aspectScores.etika || 0}\n- Kepemimpinan & Inisiatif: ${aspectScores.leadership || 0}\n- Motivasi & Komitmen KAI: ${aspectScores.motivation || aspectScores.penampilan || 0}`;
      combinedNotes = `${notes || ""}${breakdownText}`;
    }

    // Hitung rata-rata otomatis dari aspek kompetensi jika aspectScores disediakan
    let finalScore = score !== undefined && score !== null ? Number(score) : application.interview?.score;
    if (aspectScores && typeof aspectScores === "object") {
      const vals = [
        aspectScores.communication ?? aspectScores.komunikasi,
        aspectScores.technicalSkill ?? aspectScores.kompetensi,
        aspectScores.personality ?? aspectScores.etika,
        aspectScores.leadership,
        aspectScores.motivation ?? aspectScores.penampilan,
      ].filter(v => typeof v === "number" && !isNaN(v));

      if (vals.length > 0) {
        finalScore = Math.round(vals.reduce((sum, v) => sum + v, 0) / vals.length);
      }
    }

    const interviewDateTime = scheduledAt
      ? new Date(scheduledAt)
      : application.interview?.scheduledAt || new Date();

    updatedInterview = await prisma.interview.upsert({
      where: { applicationId: id },
      update: {
        interviewer: interviewer || application.interview?.interviewer || "Tim HRD KAI Services",
        type: type || application.interview?.type || "ONLINE",
        scheduledAt: interviewDateTime,
        location: location || application.interview?.location || "Kantor Pusat KAI Services",
        zoomLink: zoomLink !== undefined ? zoomLink : application.interview?.zoomLink,
        score: finalScore !== undefined && finalScore !== null ? Number(finalScore) : application.interview?.score,
        result: result || application.interview?.result || "PASSED",
        notes: combinedNotes,
        updatedAt: new Date(),
      },
      create: {
        applicationId: id,
        interviewer: interviewer || "Tim HRD KAI Services",
        type: type || "ONLINE",
        scheduledAt: interviewDateTime,
        location: location || "Kantor Pusat KAI Services",
        zoomLink: zoomLink || null,
        score: finalScore !== undefined && finalScore !== null ? Number(finalScore) : 80,
        result: result || "PASSED",
        notes: combinedNotes,
      },
    });

    // If advanceStatus is requested or result is PASSED/FAILED
    if (advanceStatus && result) {
      const newStatus =
        result === "PASSED"
          ? "MCU"
          : result === "FAILED"
          ? "REJECTED"
          : application.status; // Jika RESCHEDULE tetap INTERVIEW

      if (newStatus !== application.status) {
        updatedApplication = await prisma.application.update({
          where: { id },
          data: {
            status: newStatus,
            reviewedAt: new Date(),
            notes: `Hasil Wawancara: ${result === "PASSED" ? "LULUS" : result === "FAILED" ? "TIDAK LULUS" : "RESCHEDULE"} (Skor: ${score || "-"}). ${notes || ""}`,
          } as any,
          include: {
            applicant: {
              include: { user: true },
            },
            jobPosting: true,
          },
        });

        // Record status history
        await prisma.statusHistory.create({
          data: {
            applicationId: id,
            fromStatus: application.status,
            toStatus: newStatus,
            notes: `Hasil Wawancara: ${result === "PASSED" ? "LULUS (Lanjut MCU)" : result === "FAILED" ? "TIDAK LULUS" : "Jadwal Ulang"} (Skor: ${score || "-"}). ${notes || ""}`,
          },
        });

        // Send notification email
        if (application.applicant.user?.email) {
          try {
            await sendStatusChangeEmail({
              to: application.applicant.user.email,
              applicantName: application.applicant.fullName,
              jobTitle: application.jobPosting.title,
              newStatus,
              notes: notes || undefined,
            });
          } catch (emailError) {
            console.warn("Could not send status email:", emailError);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Hasil evaluasi wawancara berhasil disimpan",
      interview: updatedInterview,
      application: updatedApplication,
    });
  } catch (error: any) {
    console.error("Error saving interview result:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal menyimpan hasil wawancara" },
      { status: 500 }
    );
  }
}
