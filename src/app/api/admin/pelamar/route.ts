// API Route: Get All Applicants (Pelamar)
// GET /api/admin/pelamar

import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    // Get all applicants with their user data
    const applicants = await prisma.applicant.findMany({
      include: {
        user: {
          select: {
            email: true,
            createdAt: true,
          },
        },
        applications: {
          include: {
            jobPosting: {
              select: {
                title: true,
                division: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      applicants: applicants.map((app) => ({
        id: app.id,
        userId: app.userId,
        fullName: app.fullName,
        email: app.user?.email || "-",
        nik: app.nik,
        phone: app.phone,
        education: app.education,
        createdAt: app.user?.createdAt || app.createdAt,
        applications: app.applications.map((a) => ({
          id: a.id,
          status: a.status,
          jobTitle: a.jobPosting.title,
          division: a.jobPosting.division,
          appliedAt: a.createdAt,
        })),
        hasApplied: app.applications.length > 0,
      })),
    });
  } catch (error) {
    console.error("Get applicants error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
