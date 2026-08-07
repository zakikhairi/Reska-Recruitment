import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// Apply to a job
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobId, applicantId } = body;

    if (!jobId || !applicantId) {
      return NextResponse.json(
        { error: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    // Check if job exists
    const job = await prisma.jobPosting.findUnique({
      where: { id: jobId }
    });

    if (!job) {
      return NextResponse.json(
        { error: "Lowongan tidak ditemukan" },
        { status: 404 }
      );
    }

    // Check if job is still accepting applications
    if (job.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Lowongan sudah ditutup" },
        { status: 400 }
      );
    }

    // Check deadline
    if (new Date(job.deadline) < new Date()) {
      return NextResponse.json(
        { error: "Pendaftaran sudah ditutup" },
        { status: 400 }
      );
    }

    // Check if applicant exists
    const applicant = await prisma.applicant.findUnique({
      where: { id: applicantId }
    });

    if (!applicant) {
      return NextResponse.json(
        { error: "Profil pelamar tidak ditemukan" },
        { status: 404 }
      );
    }

    // Check if already applied
    const existingApplication = await prisma.application.findUnique({
      where: {
        applicantId_jobPostingId: {
          applicantId,
          jobPostingId: jobId
        }
      }
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: "Anda sudah melamar posisi ini" },
        { status: 400 }
      );
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        applicantId,
        jobPostingId: jobId,
        status: "ADMIN_CHECK",
        statusHistory: {
          create: {
            toStatus: "ADMIN_CHECK",
            notes: "Lamaran baru diajukan"
          }
        }
      },
      include: {
        jobPosting: true
      }
    });

    console.log(`[APPLICATION] New application: ${application.id} for job ${jobId}`);

    return NextResponse.json({
      success: true,
      message: "Lamaran berhasil diajukan!",
      application: {
        id: application.id,
        status: application.status,
        jobTitle: application.jobPosting.title
      }
    });

  } catch (error) {
    console.error("Apply error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// Get all applications for an applicant
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const applicantId = searchParams.get("applicantId");

    if (!applicantId) {
      return NextResponse.json(
        { error: "Applicant ID diperlukan" },
        { status: 400 }
      );
    }

    const applications = await prisma.application.findMany({
      where: { applicantId },
      include: {
        jobPosting: true,
        testSession: true
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({
      success: true,
      applications: applications.map((app: typeof applications[number]) => ({
        id: app.id,
        status: app.status,
        jobTitle: app.jobPosting.title,
        jobDivision: app.jobPosting.division,
        jobLocation: app.jobPosting.location,
        hasTest: !!app.testSession,
        testStatus: app.testSession?.status,
        appliedAt: app.createdAt
      }))
    });

  } catch (error) {
    console.error("Get applications error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
