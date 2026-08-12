// API Route: Get Schedule Groups (grouped by job posting)
// GET /api/admin/test-schedule/groups

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Get all test sessions grouped by job posting
    const sessions = await prisma.testSession.findMany({
      where: {
        status: {
          in: ["NOT_STARTED", "IN_PROGRESS", "SUBMITTED", "SCORED", "EXPIRED"],
        },
      },
      include: {
        application: {
          include: {
            jobPosting: {
              select: {
                id: true,
                title: true,
                division: true,
              },
            },
            applicant: {
              select: {
                id: true,
                fullName: true,
                nik: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Group by job posting
    const groupsMap = new Map<string, {
      jobPostingId: string;
      position: string;
      division: string;
      createdAt: string;
      location: string;
      applicants: {
        applicationId: string;
        applicantName: string;
        nik: string;
        status: string;
        sessionId: string;
      }[];
    }>();

    for (const session of sessions) {
      const { jobPosting } = session.application;
      if (!jobPosting) continue;

      if (!groupsMap.has(jobPosting.id)) {
        groupsMap.set(jobPosting.id, {
          jobPostingId: jobPosting.id,
          position: jobPosting.title,
          division: jobPosting.division,
          createdAt: session.createdAt.toISOString(),
          location: "Online System",
          applicants: [],
        });
      }

      const group = groupsMap.get(jobPosting.id)!;
      group.applicants.push({
        applicationId: session.application.id,
        applicantName: session.application.applicant.fullName,
        nik: session.application.applicant.nik,
        status: session.status,
        sessionId: session.id,
      });
    }

    const groups = Array.from(groupsMap.values()).map(group => ({
      ...group,
      applicantCount: group.applicants.length,
    }));

    return NextResponse.json({
      success: true,
      groups,
      totalGroups: groups.length,
      totalApplicants: groups.reduce((sum, g) => sum + g.applicantCount, 0),
    });
  } catch (error: any) {
    console.error("Get schedule groups error:", error);
    return NextResponse.json(
      { success: false, error: `Terjadi kesalahan: ${error.message}` },
      { status: 500 }
    );
  }
}
