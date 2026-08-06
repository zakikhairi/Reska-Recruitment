import { NextRequest, NextResponse } from "next/server";
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
      jobs: jobs.map((job: typeof jobs[number]) => ({
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

// Create new job posting
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      division,
      location,
      description,
      requirements,
      minEducation,
      minHeight,
      minAge,
      maxAge,
      deadline,
      status = "ACTIVE"
    } = body;

    if (!title || !division || !location || !deadline) {
      return NextResponse.json(
        { success: false, error: "Field wajib tidak boleh kosong" },
        { status: 400 }
      );
    }

    const job = await prisma.jobPosting.create({
      data: {
        title,
        division,
        location,
        description: description || "",
        requirements: requirements || "",
        minEducation: minEducation || "SMA",
        minHeight: minHeight ? parseFloat(minHeight) : null,
        minAge: minAge ? parseInt(minAge) : null,
        maxAge: maxAge ? parseInt(maxAge) : null,
        deadline: new Date(deadline),
        status,
      },
    });

    return NextResponse.json({
      success: true,
      message: status === "ACTIVE" ? "Lowongan berhasil dipublikasikan" : "Lowongan berhasil disimpan sebagai draft",
      job: {
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
      },
    });
  } catch (error) {
    console.error("Create job error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
