// API Route: Batch Schedule Tests (Simplified)
// POST /api/admin/test-schedule

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobPostingId, scheduledAt, location, message } = body;

    if (!jobPostingId || !scheduledAt) {
      return NextResponse.json(
        { success: false, error: "Lowongan dan jadwal tes diperlukan" },
        { status: 400 }
      );
    }

    // Get job posting
    const jobPosting = await prisma.jobPosting.findUnique({
      where: { id: jobPostingId },
      include: {
        testConfig: true,
      },
    });

    if (!jobPosting) {
      return NextResponse.json(
        { success: false, error: "Lowongan tidak ditemukan" },
        { status: 404 }
      );
    }

    if (!jobPosting.testConfig) {
      return NextResponse.json({
        success: false,
        error: "Konfigurasi tes belum diatur. Silakan atur tes di halaman Konfigurasi Tes terlebih dahulu.",
      }, { status: 400 });
    }

    const scheduledDateTime = new Date(scheduledAt);

    // Get all applications with TEST_SCHEDULED status for this job
    const applications = await prisma.application.findMany({
      where: {
        jobPostingId,
        status: "TEST_SCHEDULED",
      },
      include: {
        applicant: true,
        testSession: true,
      },
    });

    if (applications.length === 0) {
      return NextResponse.json(
        { success: false, error: "Tidak ada pelamar dengan status TEST_SCHEDULED. Pastikan pelamar sudah di-approve oleh HR." },
        { status: 400 }
      );
    }

    let scheduledCount = 0;
    const scheduledList: string[] = [];

    // Create/Update test sessions for each application
    for (const app of applications) {
      if (app.testSession) {
        // Update existing session with new schedule
        await prisma.testSession.update({
          where: { id: app.testSession.id },
          data: {
            scheduledAt: scheduledDateTime,
            status: "SCHEDULED",
            startedAt: null,
            submittedAt: null,
            adminMessage: message || null,
          },
        });
        scheduledList.push(app.applicant.fullName);
      } else {
        // Create new session
        await prisma.testSession.create({
          data: {
            applicationId: app.id,
            status: "SCHEDULED",
            scheduledAt: scheduledDateTime,
            adminMessage: message || null,
          },
        });
        scheduledList.push(app.applicant.fullName);
      }
      scheduledCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil menjadwalkan tes untuk ${scheduledCount} pelamar`,
      scheduledCount,
      scheduledAt: scheduledDateTime.toISOString(),
      location: location || "Online System",
      scheduledList,
      adminMessage: message || null,
    });
  } catch (error: any) {
    console.error("Batch schedule error:", error);
    return NextResponse.json(
      { success: false, error: `Terjadi kesalahan: ${error.message}` },
      { status: 500 }
    );
  }
}

// GET: Get applicants available for batch scheduling
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobPostingId = searchParams.get("jobPostingId");

    if (!jobPostingId) {
      return NextResponse.json(
        { success: false, error: "Job Posting ID diperlukan" },
        { status: 400 }
      );
    }

    // Get job posting
    const jobPosting = await prisma.jobPosting.findUnique({
      where: { id: jobPostingId },
      include: {
        testConfig: true,
      },
    });

    if (!jobPosting) {
      return NextResponse.json(
        { success: false, error: "Lowongan tidak ditemukan" },
        { status: 404 }
      );
    }

    // Get all applications with TEST_SCHEDULED status
    const applications = await prisma.application.findMany({
      where: {
        jobPostingId,
        status: "TEST_SCHEDULED",
      },
      include: {
        applicant: {
          select: {
            id: true,
            fullName: true,
            nik: true,
          },
        },
        testSession: true,
      },
    });

    // Separate into pending and already scheduled
    const pending = applications.filter(app => !app.testSession?.scheduledAt);
    const scheduled = applications.filter(app => app.testSession?.scheduledAt);

    return NextResponse.json({
      success: true,
      jobPosting: {
        id: jobPosting.id,
        title: jobPosting.title,
        division: jobPosting.division,
      },
      hasTestConfig: !!jobPosting.testConfig,
      totalApplicants: applications.length,
      pendingCount: pending.length,
      scheduledCount: scheduled.length,
      pendingApplicants: pending.map((app) => ({
        applicationId: app.id,
        applicantName: app.applicant.fullName,
        nik: app.applicant.nik,
      })),
      scheduledApplicants: scheduled.map((app) => ({
        applicationId: app.id,
        applicantName: app.applicant.fullName,
        nik: app.applicant.nik,
        scheduledAt: app.testSession?.scheduledAt,
      })),
    });
  } catch (error: any) {
    console.error("Get pending schedules error:", error);
    return NextResponse.json(
      { success: false, error: `Terjadi kesalahan: ${error.message}` },
      { status: 500 }
    );
  }
}
