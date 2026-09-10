// API Route: Apply for a Job
// POST /api/apply

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobPostingId, userId } = body;

    if (!jobPostingId || !userId) {
      return NextResponse.json(
        { success: false, error: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    // Get applicant by userId
    const applicant = await prisma.applicant.findFirst({
      where: { userId },
    });

    if (!applicant) {
      return NextResponse.json(
        { success: false, error: "Profil pelamar tidak ditemukan" },
        { status: 404 }
      );
    }

    // Check if job exists and is active
    const job = await prisma.jobPosting.findUnique({
      where: { id: jobPostingId },
    });

    if (!job) {
      return NextResponse.json(
        { success: false, error: "Lowongan tidak ditemukan" },
        { status: 404 }
      );
    }

    if (job.status !== "ACTIVE") {
      return NextResponse.json(
        { success: false, error: "Lowongan sudah ditutup" },
        { status: 400 }
      );
    }

    // Check if already applied
    const existingApplication = await prisma.application.findUnique({
      where: {
        applicantId_jobPostingId: {
          applicantId: applicant.id,
          jobPostingId,
        },
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        { success: false, error: "Anda sudah melamar posisi ini" },
        { status: 400 }
      );
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        applicantId: applicant.id,
        jobPostingId,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Lamaran berhasil dikirim",
      application: {
        id: application.id,
        status: application.status,
        createdAt: application.createdAt,
      },
    });
  } catch (error) {
    console.error("Apply error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// GET: Get user's applications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID diperlukan" },
        { status: 400 }
      );
    }

    // Get applicant by userId
    const applicant = await prisma.applicant.findFirst({
      where: { userId },
    });

    if (!applicant) {
      return NextResponse.json({
        success: true,
        applications: [],
      });
    }

    // Get applications
    const applications = await prisma.application.findMany({
      where: { applicantId: applicant.id },
      include: {
        jobPosting: {
          select: {
            id: true,
            title: true,
            division: true,
            location: true,
          },
        },
        mcu: true,
        interview: true,
        testSession: true,
        offering: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      applications: applications.map((app: typeof applications[number]) => ({
        id: app.id,
        status: app.status,
        notes: app.notes,
        createdAt: app.createdAt,
        job: app.jobPosting,
        interview: app.interview ? {
          id: app.interview.id,
          scheduledAt: app.interview.scheduledAt,
          location: app.interview.location,
          interviewer: app.interview.interviewer,
          type: app.interview.type,
          score: app.interview.score,
          result: app.interview.result,
          notes: app.interview.notes,
          zoomLink: app.interview.zoomLink,
        } : null,
        testSession: app.testSession ? {
          id: app.testSession.id,
          status: app.testSession.status,
          scheduledAt: app.testSession.scheduledAt,
          endTime: app.testSession.endTime,
          totalScore: app.testSession.totalScore,
          passed: app.testSession.passed,
        } : null,
        medicalCheckup: app.mcu ? {
          id: app.mcu.id,
          scheduledAt: app.mcu.scheduledAt,
          location: app.mcu.location,
          result: app.mcu.result,
          notes: app.mcu.notes,
        } : null,
        offering: app.offering ? {
          id: app.offering.id,
          salary: app.offering.salary,
          salaryPeriod: app.offering.salaryPeriod,
          startDate: app.offering.startDate,
          employmentType: app.offering.employmentType,
          contractDuration: app.offering.contractDuration,
          contractEndDate: app.offering.contractEndDate,
          probationMonths: app.offering.probationMonths,
          workLocation: app.offering.workLocation,
          positionTitle: app.offering.positionTitle,
          benefits: app.offering.benefits,
          notes: app.offering.notes,
          status: app.offering.status,
          createdAt: app.offering.createdAt,
        } : null,
      })),
    });
  } catch (error) {
    console.error("Get applications error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// DELETE: Cancel/Withdraw application
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get("id");
    const userId = searchParams.get("userId");

    if (!applicationId || !userId) {
      return NextResponse.json(
        { success: false, error: "Application ID dan User ID diperlukan" },
        { status: 400 }
      );
    }

    // Get applicant by userId
    const applicant = await prisma.applicant.findFirst({
      where: { userId },
    });

    if (!applicant) {
      return NextResponse.json(
        { success: false, error: "Profil pelamar tidak ditemukan" },
        { status: 404 }
      );
    }

    // Get application and verify ownership
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      return NextResponse.json(
        { success: false, error: "Lamaran tidak ditemukan" },
        { status: 404 }
      );
    }

    if (application.applicantId !== applicant.id) {
      return NextResponse.json(
        { success: false, error: "Anda tidak memiliki akses ke lamaran ini" },
        { status: 403 }
      );
    }

    // Only allow deletion of PENDING applications
    if (application.status !== "PENDING") {
      return NextResponse.json(
        { success: false, error: "Hanya lamaran dengan status 'Menunggu' yang dapat dibatalkan" },
        { status: 400 }
      );
    }

    // Delete application
    await prisma.application.delete({
      where: { id: applicationId },
    });

    return NextResponse.json({
      success: true,
      message: "Lamaran berhasil dibatalkan",
    });
  } catch (error) {
    console.error("Delete application error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
