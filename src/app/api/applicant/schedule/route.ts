// API Route: Get Applicant Schedules
// GET /api/applicant/schedule?userId=xxx

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID diperlukan" },
        { status: 400 }
      );
    }

    // Get applicant
    const applicant = await prisma.applicant.findUnique({
      where: { userId },
    });

    if (!applicant) {
      return NextResponse.json(
        { success: false, error: "Pelamar tidak ditemukan" },
        { status: 404 }
      );
    }

    // Get all applications with schedules
    const applications = await prisma.application.findMany({
      where: { applicantId: applicant.id },
      include: {
        testSession: true,
        interview: true,
        jobPosting: true,
        statusHistory: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Format the response
    const schedules = applications.map((app) => {
      const schedule: any = {
        applicationId: app.id,
        position: app.jobPosting.title,
        division: app.jobPosting.division,
        status: app.status,
      };

      // Add test schedule if exists (even if scheduledAt is null)
      if (app.testSession) {
        schedule.test = {
          scheduledAt: app.testSession.scheduledAt || app.testSession.startedAt || app.testSession.createdAt,
          endTime: app.testSession.endTime,
          location: "Online System",
          status: app.testSession.status,
          sessionId: app.testSession.id,
          submittedAt: app.testSession.submittedAt,
        };
      }

      // Add interview schedule if exists
      if (app.interview) {
        schedule.interview = {
          scheduledAt: app.interview.scheduledAt,
          location: app.interview.location,
          interviewer: app.interview.interviewer,
          type: app.interview.type,
          result: app.interview.result,
          notes: app.interview.notes,
          zoomLink: app.interview.zoomLink,
        };
      }

      return schedule;
    });

    // Filter: Show applications that have test session OR interview
    // Include those with null scheduledAt (waiting for schedule)
    const upcomingSchedules = schedules.filter(
      (s) => s.test || s.interview
    );

    return NextResponse.json({
      success: true,
      schedules: upcomingSchedules,
      allApplications: schedules,
    });
  } catch (error) {
    console.error("Get applicant schedules error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
