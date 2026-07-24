import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";

const dbUrl = process.env.DATABASE_URL || `file:${path.join(process.cwd(), "prisma", "dev.db")}`;
const adapter = new PrismaLibSql({ url: dbUrl });
const prisma = new PrismaClient({ adapter });

// GET - Get single job
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const job = await prisma.jobPosting.findUnique({
      where: { id },
      include: {
        applications: {
          include: {
            applicant: true
          }
        },
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

    return NextResponse.json({ success: true, job });
  } catch (error) {
    console.error("Error fetching job:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data lowongan" },
      { status: 500 }
    );
  }
}

// PUT - Update job
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, division, location, description, requirements, minEducation, deadline, salaryRange, status, minHeight, minAge, maxAge } = body;

    const job = await prisma.jobPosting.update({
      where: { id },
      data: {
        title,
        division,
        location,
        description,
        requirements,
        minEducation,
        deadline: deadline ? new Date(deadline) : undefined,
        salaryRange,
        status,
        minHeight: minHeight ? parseFloat(minHeight) : null,
        minAge: minAge ? parseInt(minAge) : null,
        maxAge: maxAge ? parseInt(maxAge) : null,
      }
    });

    return NextResponse.json({ success: true, job });
  } catch (error) {
    console.error("Error updating job:", error);
    return NextResponse.json(
      { error: "Gagal mengupdate lowongan" },
      { status: 500 }
    );
  }
}

// DELETE - Delete job
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.jobPosting.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: "Lowongan berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting job:", error);
    return NextResponse.json(
      { error: "Gagal menghapus lowongan" },
      { status: 500 }
    );
  }
}
