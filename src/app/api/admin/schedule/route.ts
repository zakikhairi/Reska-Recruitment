// API Route: Get Schedules
// GET /api/admin/schedule

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // TEST, INTERVIEW, or null for all
    const status = searchParams.get("status"); // filter by application status

    // Get test schedules
    let testSchedules: any[] = [];
    if (!type || type === "TEST") {
      const testSessions = await prisma.testSession.findMany({
        where: {
          startedAt: { not: null },
          application: status ? { status } : undefined,
        },
        include: {
          application: {
            include: {
              applicant: true,
              jobPosting: true,
            },
          },
        },
        orderBy: { startedAt: "asc" },
      });

      testSchedules = testSessions.map((s) => ({
        id: s.id,
        applicationId: s.applicationId,
        type: "TEST",
        scheduledAt: s.startedAt,
        location: "Online System",
        applicantName: s.application.applicant.fullName,
        position: s.application.jobPosting.title,
        division: s.application.jobPosting.division,
        status: s.application.status,
      }));
    }

    // Get interview schedules
    let interviewSchedules: any[] = [];
    if (!type || type === "INTERVIEW") {
      const interviews = await prisma.interview.findMany({
        where: {
          application: status ? { status } : undefined,
        },
        include: {
          application: {
            include: {
              applicant: true,
              jobPosting: true,
            },
          },
        },
        orderBy: { scheduledAt: "asc" },
      });

      interviewSchedules = interviews.map((i) => ({
        id: i.id,
        applicationId: i.applicationId,
        type: "INTERVIEW",
        scheduledAt: i.scheduledAt,
        location: i.location,
        interviewer: i.interviewer,
        applicantName: i.application.applicant.fullName,
        position: i.application.jobPosting.title,
        division: i.application.jobPosting.division,
        status: i.application.status,
      }));
    }

    // Combine and sort by scheduled date
    const allSchedules = [...testSchedules, ...interviewSchedules].sort(
      (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
    );

    return NextResponse.json({
      success: true,
      schedules: allSchedules,
      testSchedules,
      interviewSchedules,
    });
  } catch (error) {
    console.error("Get schedules error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
