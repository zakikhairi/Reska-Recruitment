import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const jobs = await prisma.jobPosting.findMany({
      where: {
        status: "ACTIVE",
        deadline: {
          gte: new Date()
        }
      },
      include: {
        _count: {
          select: { applications: true }
        }
      },
      orderBy: { createdAt: "desc" }
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
        deadline: job.deadline,
        status: job.status,
        applicantCount: job._count.applications,
        isNew: (new Date().getTime() - new Date(job.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000
      }))
    });
  } catch (error) {
    console.error("Get jobs error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
