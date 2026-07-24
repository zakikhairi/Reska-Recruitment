import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";

const dbUrl = process.env.DATABASE_URL || `file:${path.join(process.cwd(), "prisma", "dev.db")}`;
const adapter = new PrismaLibSql({ url: dbUrl });
const prisma = new PrismaClient({ adapter });

// GET - Get all jobs
export async function GET() {
  try {
    const jobs = await prisma.jobPosting.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { applications: true }
        }
      }
    });

    return NextResponse.json({ success: true, jobs });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data lowongan" },
      { status: 500 }
    );
  }
}

// POST - Create new job
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, division, location, description, requirements, minEducation, deadline, salaryRange, status } = body;

    if (!title || !division || !location || !description || !requirements || !minEducation || !deadline) {
      return NextResponse.json(
        { error: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    const job = await prisma.jobPosting.create({
      data: {
        title,
        division,
        location,
        description,
        requirements,
        minEducation,
        deadline: new Date(deadline),
        salaryRange: salaryRange || "",
        status: status || "ACTIVE",
      }
    });

    return NextResponse.json({ success: true, job });
  } catch (error) {
    console.error("Error creating job:", error);
    return NextResponse.json(
      { error: "Gagal membuat lowongan" },
      { status: 500 }
    );
  }
}
