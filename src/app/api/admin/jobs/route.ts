import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET: Get all job postings for admin (including inactive/draft)
export async function GET() {
  try {
    // First, auto-close jobs that have passed their deadline
    const now = new Date();
    await prisma.jobPosting.updateMany({
      where: {
        status: "ACTIVE",
        deadline: {
          lt: now,
        },
      },
      data: {
        status: "CLOSED",
      },
    });

    const jobs = await prisma.jobPosting.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { applications: true }
        },
        testConfig: true,
      },
    });

    return NextResponse.json({
      success: true,
      jobs: jobs.map(job => ({
        id: job.id,
        title: job.title,
        division: job.division,
        location: job.location,
        description: job.description,
        requirements: job.requirements,
        minEducation: job.minEducation,
        minHeight: job.minHeight,
        minAge: job.minAge,
        maxAge: job.maxAge,
        startDate: job.startDate,
        deadline: job.deadline,
        status: job.status,
        applicantCount: job._count.applications,
        hasTestConfig: !!job.testConfig,
      }))
    });
  } catch (error) {
    console.error("Get admin jobs error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
