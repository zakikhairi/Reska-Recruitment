// API Route: Batch Schedule Interviews
// POST /api/admin/interview-schedule

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobPostingId, scheduledAt, location, message, interviewer, interviewType } = body;

    if (!jobPostingId || !scheduledAt) {
      return NextResponse.json(
        { success: false, error: "Lowongan dan jadwal interview diperlukan" },
        { status: 400 }
      );
    }

    if (!interviewer) {
      return NextResponse.json(
        { success: false, error: "Nama interviewer wajib diisi" },
        { status: 400 }
      );
    }

    // Get job posting
    const jobPosting = await prisma.jobPosting.findUnique({
      where: { id: jobPostingId },
    });

    if (!jobPosting) {
      return NextResponse.json(
        { success: false, error: "Lowongan tidak ditemukan" },
        { status: 404 }
      );
    }

    const scheduledDateTime = new Date(scheduledAt);

    // Get all applications that are eligible for interview (not pending/rejected)
    // Include all statuses except PENDING and REJECTED
    const applications = await prisma.application.findMany({
      where: {
        jobPostingId,
        status: {
          notIn: ["PENDING", "REJECTED"],
        },
      },
      include: {
        applicant: true,
        interview: true, // Check if already has interview
      },
    });

    // Filter out applicants who already have an interview scheduled
    const eligibleApplications = applications.filter(app => !app.interview);

    if (eligibleApplications.length === 0) {
      return NextResponse.json(
        { success: false, error: "Tidak ada pelamar yang eligible untuk interview. Pastikan pelamar sudah melewati tahap administrasi." },
        { status: 400 }
      );
    }

    let scheduledCount = 0;
    const scheduledList: string[] = [];

    // Create interview records for each application
    for (const app of eligibleApplications) {
      // Create or update interview
      await prisma.interview.upsert({
        where: {
          applicationId: app.id,
        },
        update: {
          scheduledAt: scheduledDateTime,
          location: location || "Online System",
          interviewer: interviewer,
          type: interviewType || "ONLINE",
          notes: message || null,
        },
        create: {
          applicationId: app.id,
          scheduledAt: scheduledDateTime,
          location: location || "Online System",
          interviewer: interviewer,
          type: interviewType || "ONLINE",
          notes: message || null,
        },
      });

      // Update application status to INTERVIEW
      await prisma.application.update({
        where: { id: app.id },
        data: { status: "INTERVIEW" },
      });

      scheduledList.push(app.applicant.fullName);
      scheduledCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil menjadwalkan interview untuk ${scheduledCount} pelamar`,
      scheduledCount,
      scheduledAt: scheduledDateTime.toISOString(),
      location: location || "Online System",
      interviewer,
      interviewType,
      scheduledList,
      notes: message || null,
    });
  } catch (error: any) {
    console.error("Batch interview schedule error:", error);
    return NextResponse.json(
      { success: false, error: `Terjadi kesalahan: ${error.message}` },
      { status: 500 }
    );
  }
}
