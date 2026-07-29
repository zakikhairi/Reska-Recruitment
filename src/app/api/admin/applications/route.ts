// API Route: Get All Applications (Admin)
// GET /api/admin/applications

import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const applications = await prisma.application.findMany({
      include: {
        applicant: {
          select: {
            id: true,
            nik: true,
            fullName: true,
            email: true,
            phone: true,
            education: true,
          },
        },
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
        applicantId: app.applicantId,
        jobPostingId: app.jobPostingId,
        status: app.status,
        notes: app.notes,
        createdAt: app.createdAt,
        applicant: app.applicant,
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
