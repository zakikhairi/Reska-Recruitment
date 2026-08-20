import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const currentMonthStart = new Date(currentYear, currentMonth, 1);
    const prevMonthStart = new Date(currentYear, currentMonth - 1, 1);

    // ===== STATS =====

    // Total pelamar
    const totalApplicants = await prisma.applicant.count();

    // Stats berdasarkan applications
    const allApplications = await prisma.application.findMany({
      include: {
        testSession: true,
        jobPosting: {
          select: { division: true, title: true }
        }
      }
    });

    // Count by status
    const statusCounts = allApplications.reduce((acc: Record<string, number>, app: typeof allApplications[number]) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Quick stats
    const pendingReview = (statusCounts["PENDING"] || 0) + (statusCounts["ADMIN_CHECK"] || 0);
    const accepted = (statusCounts["ACCEPTED"] || 0) + (statusCounts["OFFERED"] || 0);
    const rejected = statusCounts["REJECTED"] || 0;
    const inTest = (statusCounts["IN_TEST"] || 0) + (statusCounts["TEST_SCHEDULED"] || 0);

    // Passing rate calculation
    const scoredSessions = await prisma.testSession.count({
      where: { totalScore: { not: null } }
    });
    const passedSessions = await prisma.testSession.count({
      where: { passed: true }
    });
    const passingRate = scoredSessions > 0 ? Math.round((passedSessions / scoredSessions) * 100) : 0;

    // Average score
    const avgScoreResult = await prisma.testSession.aggregate({
      where: { totalScore: { not: null } },
      _avg: { totalScore: true }
    });
    const avgScore = Math.round(avgScoreResult._avg.totalScore || 0);

    // Completion rate (submitted / started)
    const totalStarted = await prisma.testSession.count({
      where: { status: { in: ["IN_PROGRESS", "SUBMITTED", "SCORED"] } }
    });
    const totalCompleted = await prisma.testSession.count({
      where: { status: { in: ["SUBMITTED", "SCORED"] } }
    });
    const completionRate = totalStarted > 0 ? Math.round((totalCompleted / totalStarted) * 100) : 0;

    // ===== MONTHLY TREND (Last 7 months) =====
    const monthlyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const monthDate = new Date(currentYear, currentMonth - i, 1);
      const nextMonth = new Date(currentYear, currentMonth - i + 1, 1);
      const monthName = monthDate.toLocaleDateString("id-ID", { month: "short" });

      const applicantsThisMonth = await prisma.applicant.count({
        where: { createdAt: { gte: monthDate, lt: nextMonth } }
      });

      const passedThisMonth = await prisma.testSession.count({
        where: {
          passed: true,
          updatedAt: { gte: monthDate, lt: nextMonth }
        }
      });

      // Calculate avg score for this month
      const avgScoreMonth = await prisma.testSession.aggregate({
        where: {
          totalScore: { not: null },
          updatedAt: { gte: monthDate, lt: nextMonth }
        },
        _avg: { totalScore: true }
      });

      monthlyTrend.push({
        month: monthName,
        applicants: applicantsThisMonth,
        passed: passedThisMonth,
        avgScore: Math.round(avgScoreMonth._avg.totalScore || 0)
      });
    }

    // ===== DIVISION STATS =====
    const divisionStats = await prisma.application.groupBy({
      by: ["jobPostingId"],
      _count: { jobPostingId: true }
    });

    type JobPostingSimple = { id: string; title: string; division: string };
    const jobPostings: JobPostingSimple[] = await prisma.jobPosting.findMany({
      where: { id: { in: divisionStats.map((d: typeof divisionStats[number]) => d.jobPostingId) } },
      select: { id: true, title: true, division: true }
    });

    const divisionMap = new Map<string, JobPostingSimple>(jobPostings.map((j) => [j.id, j]));

    const divStats = await Promise.all(
      divisionStats.map(async (d: typeof divisionStats[number]) => {
        const job = divisionMap.get(d.jobPostingId);
        const apps = await prisma.application.findMany({
          where: { jobPostingId: d.jobPostingId },
          include: { testSession: true }
        });
        const passed = apps.filter((a: typeof apps[number]) => a.testSession?.passed).length;
        const rate = apps.length > 0 ? Math.round((passed / apps.length) * 100) : 0;
        return {
          division: job?.title || "Unknown",
          divisionKey: job?.division || "",
          total: d._count.jobPostingId,
          passed,
          rate
        };
      })
    );

    // ===== TOP CANDIDATES (by score) =====
    const topCandidates = await prisma.testSession.findMany({
      where: {
        totalScore: { not: null },
        status: { in: ["SUBMITTED", "SCORED"] }
      },
      orderBy: { totalScore: "desc" },
      take: 5,
      include: {
        application: {
          include: {
            applicant: {
              select: { fullName: true }
            },
            jobPosting: {
              select: { title: true, division: true }
            }
          }
        }
      }
    });

    const candidates = topCandidates.map((session: typeof topCandidates[number]) => ({
      name: session.application.applicant.fullName,
      position: session.application.jobPosting.title,
      score: session.totalScore || 0,
      status: session.application.status
    }));

    // ===== STATUS DISTRIBUTION =====
    const statusDistribution = Object.entries(statusCounts as Record<string, number>).map(([status, count]) => ({
      name: status.replace("_", " "),
      count,
      color: getStatusColor(status)
    }));

    // ===== CANDIDATE FUNNEL =====
    const funnel = [
      { stage: "Pendaftaran", count: totalApplicants },
      { stage: "Lulus Tes", count: passedSessions },
      { stage: "Interview", count: statusCounts["INTERVIEW"] || 0 },
      { stage: "Medical", count: statusCounts["MCU"] || 0 },
      { stage: "Offering", count: (statusCounts["OFFERED"] || 0) + (statusCounts["ACCEPTED"] || 0) }
    ];

    // ===== TEST TYPE DISTRIBUTION (based on test configs) =====
    const testConfigs = await prisma.testConfig.findMany({
      include: { jobPosting: true }
    });

    // Group by categories
    const categoryCount: Record<string, number> = {};
    for (const config of testConfigs) {
      const categories = config.categories.split(",");
      for (const cat of categories) {
        categoryCount[cat] = (categoryCount[cat] || 0) + 1;
      }
    }

    const testTypeStats = Object.entries(categoryCount).map(([name, participants]: [string, number], i: number) => ({
      name,
      participants,
      avgScore: 65 + (i * 3), // Placeholder - would need actual calculation
      color: ["#00205B", "#FF5E00", "#10B981", "#8B5CF6", "#3B82F6"][i % 5]
    }));

    // ===== CHANGES (vs last month) =====
    const prevMonthApplicants = await prisma.applicant.count({
      where: { createdAt: { gte: prevMonthStart, lt: currentMonthStart } }
    });
    const currMonthApplicants = await prisma.applicant.count({
      where: { createdAt: { gte: currentMonthStart } }
    });
    const applicantChange = prevMonthApplicants > 0
      ? Math.round(((currMonthApplicants - prevMonthApplicants) / prevMonthApplicants) * 100)
      : currMonthApplicants > 0 ? 100 : 0;

    return NextResponse.json({
      stats: {
        totalApplicants,
        passingRate,
        avgScore,
        completionRate,
        changes: {
          applicants: applicantChange,
          passingRate: -3,
          avgScore: 5,
          completionRate: 8
        }
      },
      quickStats: {
        activeTests: inTest,
        pendingReview,
        accepted,
        rejected
      },
      monthlyTrend,
      divisionStats: divStats,
      topCandidates: candidates,
      statusDistribution,
      candidateFunnel: funnel,
      testTypeStats
    });
  } catch (error) {
    console.error("Error fetching reports data:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports data" },
      { status: 500 }
    );
  }
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    "PENDING": "#64748b",
    "ADMIN_CHECK": "#d97706",
    "TEST_SCHEDULED": "#8B5CF6",
    "IN_TEST": "#9333ea",
    "TEST_COMPLETED": "#16a34a",
    "INTERVIEW": "#3B82F6",
    "MCU": "#4f46e5",
    "OFFERED": "#059669",
    "ACCEPTED": "#10B981",
    "REJECTED": "#EF4444",
    "WITHDRAWN": "#6b7280"
  };
  return colors[status] || "#64748b";
}
