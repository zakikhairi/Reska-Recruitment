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
        jobPosting: {
          include: {
            testConfig: true,
          },
        },
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

      // Add test schedule if exists
      if (app.testSession) {
        schedule.test = {
          scheduledAt: app.testSession.scheduledAt,
          location: "Online System",
          status: app.testSession.status,
          sessionId: app.testSession.id,
          message: app.testSession.adminMessage || null,
          durationMinutes: app.jobPosting.testConfig?.totalDurationMinutes || 90,
        };
      }

      // Add interview schedule if exists
      if (app.interview) {
        schedule.interview = {
          scheduledAt: app.interview.scheduledAt,
          endTime: app.interview.endTime,
          location: app.interview.location,
          interviewer: app.interview.interviewer,
          type: app.interview.type,
          message: app.interview.adminMessage || null,
        };
      }

      return schedule;
    });

    // Filter only applications with test sessions or interviews
    const upcomingSchedules = schedules.filter(
      (s) => s.test?.scheduledAt || s.interview?.scheduledAt
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
