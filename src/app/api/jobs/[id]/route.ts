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

// PUT: Update job posting
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
      startDate,
      deadline,
      status
    } = body;

    // Check if job exists
    const existingJob = await prisma.jobPosting.findUnique({
      where: { id }
    });

    if (!existingJob) {
      return NextResponse.json(
        { success: false, error: "Lowongan tidak ditemukan" },
        { status: 404 }
      );
    }

    const job = await prisma.jobPosting.update({
      where: { id },
      data: {
        title: title || existingJob.title,
        division: division || existingJob.division,
        location: location || existingJob.location,
        description: description ?? existingJob.description,
        requirements: requirements ?? existingJob.requirements,
        minEducation: minEducation || existingJob.minEducation,
        minHeight: minHeight !== undefined ? (minHeight ? parseFloat(minHeight) : null) : existingJob.minHeight,
        minAge: minAge !== undefined ? (minAge ? parseInt(minAge) : null) : existingJob.minAge,
        maxAge: maxAge !== undefined ? (maxAge ? parseInt(maxAge) : null) : existingJob.maxAge,
        startDate: startDate ? new Date(startDate) : existingJob.startDate,
        deadline: deadline ? new Date(deadline) : existingJob.deadline,
        status: status || existingJob.status,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Lowongan berhasil diperbarui",
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
        startDate: job.startDate,
        deadline: job.deadline,
        status: job.status,
      },
    });
  } catch (error) {
    console.error("Update job error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// DELETE: Delete job posting
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if job exists
    const existingJob = await prisma.jobPosting.findUnique({
      where: { id },
      include: {
        _count: {
          select: { applications: true }
        }
      }
    });

    if (!existingJob) {
      return NextResponse.json(
        { success: false, error: "Lowongan tidak ditemukan" },
        { status: 404 }
      );
    }

    // Check if there are applications
    if (existingJob._count.applications > 0) {
      return NextResponse.json(
        { success: false, error: "Tidak dapat menghapus lowongan yang sudah memiliki pelamar. Tutuplah lowongan ini sebagai gantinya." },
        { status: 400 }
      );
    }

    await prisma.jobPosting.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: "Lowongan berhasil dihapus",
    });
  } catch (error) {
    console.error("Delete job error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
