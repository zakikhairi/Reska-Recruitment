import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";

const dbUrl = process.env.DATABASE_URL || `file:${path.join(process.cwd(), "prisma", "dev.db")}`;
const adapter = new PrismaLibSql({ url: dbUrl });
const prisma = new PrismaClient({ adapter });

// GET - Get all jobs (for selection in forms)
export async function GET() {
  try {
    const jobs = await prisma.jobPosting.findMany({
      where: {
        status: "ACTIVE"
      },
      orderBy: { createdAt: "desc" }
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
