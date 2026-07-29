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
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      applications: applications.map(app => ({
        id: app.id,
        status: app.status,
        notes: app.notes,
        createdAt: app.createdAt,
        job: app.jobPosting,
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
