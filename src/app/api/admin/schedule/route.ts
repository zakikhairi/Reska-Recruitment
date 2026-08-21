// API Route: Get and Delete Schedules
// GET /api/admin/schedule
// DELETE /api/admin/schedule?applicationId=xxx

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// DELETE: Delete test schedule for specific application
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get("applicationId");
    const jobPostingId = searchParams.get("jobPostingId");
    const deleteAll = searchParams.get("deleteAll");

    if (applicationId) {
      // Delete schedule for specific application (test session)
      const session = await prisma.testSession.findFirst({
        where: { applicationId },
      });

      if (!session) {
        return NextResponse.json(
          { success: false, error: "Jadwal tes tidak ditemukan" },
          { status: 404 }
        );
      }

      await prisma.testSession.delete({
        where: { id: session.id },
      });

      return NextResponse.json({
        success: true,
        message: "Jadwal tes berhasil dihapus",
      });
    } else if (jobPostingId) {
      // Delete all test sessions for a job posting
      const deleted = await prisma.testSession.deleteMany({
        where: {
          application: {
            jobPostingId,
          },
        },
      });

      return NextResponse.json({
        success: true,
        message: `Berhasil menghapus ${deleted.count} jadwal tes`,
        deletedCount: deleted.count,
      });
    } else if (deleteAll === "true") {
      // Delete all scheduled test sessions
      const deleted = await prisma.testSession.deleteMany({
        where: {
          status: "SCHEDULED",
        },
      });

      return NextResponse.json({
        success: true,
        message: `Berhasil menghapus ${deleted.count} jadwal tes`,
        deletedCount: deleted.count,
      });
    }

    return NextResponse.json(
      { success: false, error: "Parameter tidak valid" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Delete schedule error:", error);
    return NextResponse.json(
      { success: false, error: `Terjadi kesalahan: ${error.message}` },
      { status: 500 }
    );
  }
}

// GET: Get schedules (existing handler)
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
          OR: [
            { scheduledAt: { not: null } },
            { startedAt: { not: null } },
          ],
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

      testSchedules = testSessions.map((s) => ({
        id: s.id,
        applicationId: s.applicationId,
        jobPostingId: s.application.jobPosting.id,
        type: "TEST",
        scheduledAt: s.scheduledAt || s.startedAt,
        endTime: s.endTime,
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
        jobPostingId: i.application.jobPosting.id,
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
      (a, b) => {
        const dateA = a.scheduledAt ? new Date(a.scheduledAt).getTime() : 0;
        const dateB = b.scheduledAt ? new Date(b.scheduledAt).getTime() : 0;
        return dateB - dateA;
      }
    );

    // Group schedules by job posting ID (for batch view - per lowongan)
    const groupedByJob = allSchedules.reduce((acc: any, schedule) => {
      const key = schedule.jobPostingId; // Group by job posting ID
      if (!acc[key]) {
        acc[key] = {
          jobPostingId: schedule.jobPostingId,
          position: schedule.position,
          division: schedule.division,
          scheduledAt: schedule.scheduledAt,
          applicants: [],
          testCount: 0,
          interviewCount: 0,
        };
      }
      acc[key].applicants.push({
        id: schedule.id,
        applicationId: schedule.applicationId,
        applicantName: schedule.applicantName,
        type: schedule.type,
        status: schedule.status,
        scheduledAt: schedule.scheduledAt,
        location: schedule.location,
        interviewer: schedule.interviewer,
      });
      if (schedule.type === "TEST") {
        acc[key].testCount++;
      } else {
        acc[key].interviewCount++;
      }
      return acc;
    }, {});

    const groupedSchedules = Object.values(groupedByJob).map((g: any) => ({
      ...g,
      totalApplicants: g.applicants.length,
    }));

    return NextResponse.json({
      success: true,
      schedules: allSchedules,
      groupedSchedules,
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
