// API Route: Input & Update Medical Checkup (MCU) Results & File Upload
// POST /api/admin/applications/[id]/mcu

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { sendStatusChangeEmail } from "@/lib/email";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verify application exists
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        applicant: {
          include: {
            user: true,
            documents: true,
          },
        },
        jobPosting: true,
        mcu: true,
      },
    });

    if (!application) {
      return NextResponse.json(
        { success: false, error: "Lamaran tidak ditemukan" },
        { status: 404 }
      );
    }

    const contentType = request.headers.get("content-type") || "";

    let actionType = "result";
    let location = "Kantor Balai Yasa PT KAI (Reska Multi Usaha)";
    let scheduledAt = new Date().toISOString();
    let result: string | null = "FIT";
    let notes = "";
    let advanceStatus = false;
    let uploadedDocument = null;
    let file: File | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      actionType = (formData.get("actionType") as string) || "result";
      location = (formData.get("location") as string) || location;
      scheduledAt = (formData.get("scheduledAt") as string) || scheduledAt;
      result = (formData.get("result") as string) || "FIT";
      notes = (formData.get("notes") as string) || notes;
      advanceStatus = formData.get("advanceStatus") === "true";
      file = formData.get("file") as File | null;
    } else {
      const body = await request.json();
      actionType = body.actionType || (body.result ? "result" : "schedule");
      location = body.location || location;
      scheduledAt = body.scheduledAt || scheduledAt;
      result = body.result !== undefined ? body.result : null;
      notes = body.notes || notes;
      advanceStatus = body.advanceStatus || false;
    }

    const mcuDateTime = new Date(scheduledAt);

    // ========================================================
    // CASE 1: PENJADWALAN MCU OFFLINE (actionType === "schedule")
    // ========================================================
    if (actionType === "schedule") {
      const updatedMcu = await prisma.medicalCheckup.upsert({
        where: { applicationId: id },
        update: {
          location: location || "Kantor Balai Yasa PT KAI (Reska Multi Usaha)",
          scheduledAt: mcuDateTime,
          notes: notes || undefined,
          updatedAt: new Date(),
        },
        create: {
          applicationId: id,
          location: location || "Kantor Balai Yasa PT KAI (Reska Multi Usaha)",
          scheduledAt: mcuDateTime,
          result: null, // Belum ada hasil pemeriksaan
          notes: notes || null,
        },
      });

      let updatedApplication = application;

      // Update status ke MCU jika sebelumnya belum
      if (application.status !== "MCU" && !["OFFERING", "ACCEPTED"].includes(application.status)) {
        updatedApplication = await prisma.application.update({
          where: { id },
          data: {
            status: "MCU",
            reviewedAt: new Date(),
            notes: `MCU offline dijadwalkan pada ${mcuDateTime.toLocaleString("id-ID")} di ${location}`,
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
            toStatus: "MCU",
            notes: `Jadwal MCU offline ditetapkan di ${location} pada ${mcuDateTime.toLocaleString("id-ID")}. ${notes || ""}`,
          },
        });

        // Kirim email notifikasi jadwal MCU
        if (application.applicant.user?.email) {
          try {
            await sendStatusChangeEmail({
              to: application.applicant.user.email,
              applicantName: application.applicant.fullName,
              jobTitle: application.jobPosting.title,
              newStatus: "MCU",
              notes: `Jadwal Pemeriksaan MCU Offline Anda:\nWaktu: ${mcuDateTime.toLocaleString("id-ID")} WIB\nLokasi: ${location}\n\nInstruksi Persiapan:\n${notes || "Harap hadir 15 menit sebelum waktu pemeriksaan dengan membawa KTP asli dan berpakaian rapi."}`,
            });
          } catch (emailError) {
            console.warn("Could not send MCU schedule email:", emailError);
          }
        }
      }

      return NextResponse.json({
        success: true,
        message: "Jadwal MCU offline di Balai Yasa berhasil ditetapkan",
        mcu: updatedMcu,
        application: updatedApplication,
      });
    }

    // ========================================================
    // CASE 2: INPUT HASIL & UPLOAD BERKAS MCU (actionType === "result")
    // ========================================================
    if (file && file.size > 0) {
      const applicantId = application.applicantId;
      const uploadDir = path.join(process.cwd(), "public", "uploads", "documents", applicantId);
      await mkdir(uploadDir, { recursive: true });

      const timestamp = Date.now();
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const fileName = `MCU_${timestamp}_${sanitizedFileName}`;
      const filePath = path.join(uploadDir, fileName);

      const bytes = await file.arrayBuffer();
      await writeFile(filePath, Buffer.from(bytes));

      const fileUrl = `/uploads/documents/${applicantId}/${fileName}`;

      uploadedDocument = await prisma.document.create({
        data: {
          applicantId,
          type: "MCU",
          fileName: file.name,
          fileUrl,
          fileSize: file.size,
        },
      });
    }

    const updatedMcu = await prisma.medicalCheckup.upsert({
      where: { applicationId: id },
      update: {
        location: location || application.mcu?.location || "Kantor Balai Yasa PT KAI (Reska Multi Usaha)",
        scheduledAt: mcuDateTime,
        result: result || application.mcu?.result || "FIT",
        notes: notes || undefined,
        updatedAt: new Date(),
      },
      create: {
        applicationId: id,
        location: location || "Kantor Balai Yasa PT KAI (Reska Multi Usaha)",
        scheduledAt: mcuDateTime,
        result: result || "FIT",
        notes,
      },
    });

    let updatedApplication = application;

    if (advanceStatus && result) {
      const newStatus = result === "FIT" ? "OFFERING" : result === "UNFIT" ? "REJECTED" : application.status;

      if (newStatus !== application.status) {
        updatedApplication = await prisma.application.update({
          where: { id },
          data: {
            status: newStatus,
            reviewedAt: new Date(),
            notes: `Hasil MCU: ${result}. ${notes || ""}`,
          } as any,
          include: {
            applicant: {
              include: { user: true },
            },
            jobPosting: true,
          },
        });

        await prisma.statusHistory.create({
          data: {
            applicationId: id,
            fromStatus: application.status,
            toStatus: newStatus,
            notes: `Hasil MCU: ${result} (Lokasi: ${location}). ${notes || ""}`,
          },
        });

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
            console.warn("Could not send email:", emailError);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Hasil pemeriksaan dan berkas MCU berhasil disimpan",
      mcu: updatedMcu,
      document: uploadedDocument,
      application: updatedApplication,
    });
  } catch (error: any) {
    console.error("Error saving MCU:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal memproses data MCU" },
      { status: 500 }
    );
  }
}
