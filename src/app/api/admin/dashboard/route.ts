import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    // Get current date info for monthly stats
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Total applicants count
    const totalApplicants = await prisma.applicant.count();

    // Active jobs count
    const activeJobs = await prisma.jobPosting.count({
      where: { status: "ACTIVE" },
    });

    // Test completed count (applications with TEST_COMPLETED or higher status)
    const testCompleted = await prisma.application.count({
      where: {
        status: {
          in: ["TEST_COMPLETED", "INTERVIEW", "MCU", "OFFERED", "ACCEPTED"],
        },
      },
    });

    // Calculate passing rate
    const totalScored = await prisma.application.count({
      where: {
        status: {
          in: ["TEST_COMPLETED", "INTERVIEW", "MCU", "OFFERED", "ACCEPTED"],
        },
      },
    });

    const passedCount = await prisma.testSession.count({
      where: { passed: true },
    });

    const passingRate = totalScored > 0 ? Math.round((passedCount / totalScored) * 100) : 0;

    // Monthly trend data (last 6 months)
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(currentYear, currentMonth - i, 1);
      const nextMonth = new Date(currentYear, currentMonth - i + 1, 1);
      const monthName = monthDate.toLocaleDateString("id-ID", { month: "short" });

      const applicantsThisMonth = await prisma.applicant.count({
        where: {
          createdAt: {
            gte: monthDate,
            lt: nextMonth,
          },
        },
      });

      const passedThisMonth = await prisma.testSession.count({
        where: {
          passed: true,
          updatedAt: {
            gte: monthDate,
            lt: nextMonth,
          },
        },
      });

      monthlyTrend.push({
        month: monthName,
        pelamar: applicantsThisMonth,
        lulus: passedThisMonth,
      });
    }

    // Status distribution
    const statusCounts = await prisma.application.groupBy({
      by: ["status"],
      _count: { status: true },
    });

    const statusDistribution = statusCounts.map((s: typeof statusCounts[number]) => ({
      name: s.status.replace("_", " "),
      value: s._count.status,
    }));

    // Division distribution
    const divisionCounts = await prisma.application.groupBy({
      by: ["jobPostingId"],
      _count: { jobPostingId: true },
    });

    // Get job titles for divisions
    type JobPostingSimple = { id: string; title: string; division: string };
    const jobPostings: JobPostingSimple[] = await prisma.jobPosting.findMany({
      where: { id: { in: divisionCounts.map((d: typeof divisionCounts[number]) => d.jobPostingId) } },
      select: { id: true, title: true, division: true },
    });

    const divisionMap = new Map<string, JobPostingSimple>(jobPostings.map((j) => [j.id, j]));

    const topDivisions = divisionCounts
      .map((d: typeof divisionCounts[number]) => {
        const job = divisionMap.get(d.jobPostingId);
        return {
          name: job?.title || "Unknown",
          division: job?.division || "",
          applicants: d._count.jobPostingId,
        };
      })
      .sort((a: { applicants: number }, b: { applicants: number }) => b.applicants - a.applicants)
      .slice(0, 5);

    // Calculate changes (comparing to previous period)
    const prevMonthStart = new Date(currentYear, currentMonth - 1, 1);
    const currMonthStart = new Date(currentYear, currentMonth, 1);

    const prevMonthApplicants = await prisma.applicant.count({
      where: { createdAt: { gte: prevMonthStart, lt: currMonthStart } },
    });

    const currMonthApplicants = await prisma.applicant.count({
      where: { createdAt: { gte: currMonthStart } },
    });

    const applicantChange = prevMonthApplicants > 0
      ? Math.round(((currMonthApplicants - prevMonthApplicants) / prevMonthApplicants) * 100)
      : currMonthApplicants > 0 ? 100 : 0;

    return NextResponse.json({
      stats: {
        totalApplicants,
        testCompleted,
        passingRate,
        activeJobs,
        changes: {
          applicants: applicantChange,
          testCompleted: 8, // Placeholder - would need more complex logic
          passingRate: -3,
          activeJobs: 2,
        },
      },
      monthlyTrend,
      statusDistribution,
      topDivisions,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
