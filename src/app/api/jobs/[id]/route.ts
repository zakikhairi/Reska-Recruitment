import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// Get job posting by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const job = await prisma.jobPosting.findUnique({
      where: { id },
      include: {
        testConfig: true,
        _count: {
          select: { applications: true }
        }
      }
    });

    if (!job) {
      return NextResponse.json(
        { error: "Lowongan tidak ditemukan" },
        { status: 404 }
      );
    }

    // Don't return expired jobs
    if (new Date(job.deadline) < new Date() && job.status === "ACTIVE") {
      return NextResponse.json(
        { error: "Lowongan sudah ditutup" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      job: {
        id: job.id,
        title: job.title,
        division: job.division,
        location: job.location,
        description: job.description,
        requirements: job.requirements,
        deadline: job.deadline,
        status: job.status,
        minEducation: job.minEducation,
        minHeight: job.minHeight,
        minAge: job.minAge,
        maxAge: job.maxAge,
        applicantCount: job._count.applications,
        hasTest: !!job.testConfig
      }
    });

  } catch (error) {
    console.error("Get job error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
