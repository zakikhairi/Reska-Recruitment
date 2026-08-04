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

      // Add test schedule if exists
      if (app.testSession?.startedAt) {
        schedule.test = {
          scheduledAt: app.testSession.startedAt,
          location: "Online System (Link akan dikirim via email)",
          status: app.testSession.status,
        };
      }

      // Add interview schedule if exists
      if (app.interview) {
        schedule.interview = {
          scheduledAt: app.interview.scheduledAt,
          location: app.interview.location,
          interviewer: app.interview.interviewer,
          type: app.interview.type,
        };
      }

      return schedule;
    });

    // Filter only applications with schedules
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
