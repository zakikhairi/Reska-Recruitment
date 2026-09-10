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
      include: {
        documents: {
          orderBy: { uploadedAt: "desc" },
        },
      },
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
        mcu: true,
        offering: true,
        jobPosting: true,
        statusHistory: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Find latest MCU document for the applicant
    const mcuDoc = applicant.documents?.find((d) => d.type === "MCU");

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
          totalScore: app.testSession.totalScore,
          passed: app.testSession.passed,
        };
      }

      // Add interview schedule if exists
      if (app.interview) {
        schedule.interview = {
          scheduledAt: app.interview.scheduledAt,
          location: app.interview.location,
          interviewer: app.interview.interviewer,
          type: app.interview.type,
          score: app.interview.score,
          result: app.interview.result,
          notes: app.interview.notes,
          zoomLink: app.interview.zoomLink,
        };
      }

      // Add MCU schedule if exists
      if (app.mcu) {
        schedule.mcu = {
          scheduledAt: app.mcu.scheduledAt,
          location: app.mcu.location,
          result: app.mcu.result,
          notes: app.mcu.notes,
          document: mcuDoc
            ? {
                id: mcuDoc.id,
                fileName: mcuDoc.fileName,
                fileUrl: mcuDoc.fileUrl,
                fileSize: mcuDoc.fileSize,
                uploadedAt: mcuDoc.uploadedAt,
              }
            : null,
        };
      }

      // Add Offering if exists
      if (app.offering) {
        schedule.offering = {
          id: app.offering.id,
          salary: app.offering.salary,
          salaryPeriod: app.offering.salaryPeriod,
          startDate: app.offering.startDate,
          employmentType: app.offering.employmentType,
          contractDuration: app.offering.contractDuration,
          contractEndDate: app.offering.contractEndDate,
          probationMonths: app.offering.probationMonths,
          workLocation: app.offering.workLocation,
          positionTitle: app.offering.positionTitle,
          benefits: app.offering.benefits,
          notes: app.offering.notes,
          status: app.offering.status,
          createdAt: app.offering.createdAt,
        };
      }

      return schedule;
    });

    // Filter: Show applications that have test session OR interview OR mcu OR offering,
    // as well as applications that are ACCEPTED or REJECTED (for history)
    const filteredSchedules = schedules.filter(
      (s) => s.test || s.interview || s.mcu || s.offering || s.status === "REJECTED" || s.status === "ACCEPTED"
    );

    return NextResponse.json({
      success: true,
      schedules: filteredSchedules,
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
