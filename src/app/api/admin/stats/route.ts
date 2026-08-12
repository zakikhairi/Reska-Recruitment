// API Route: Get Applicant Statistics
// GET /api/admin/stats

import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "month"; // day, week, month, year

    // Calculate date ranges
    const now = new Date();
    let startDate: Date;
    let groupByFormat: string;

    switch (range) {
      case "day":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
        groupByFormat = "day";
        break;
      case "week":
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        groupByFormat = "week";
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
        groupByFormat = "month";
        break;
      case "year":
        startDate = new Date(now.getFullYear() - 2, 0, 1);
        groupByFormat = "year";
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
        groupByFormat = "month";
    }

    // Get applications grouped by creation date
    const applications = await prisma.application.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        createdAt: true,
        status: true,
      },
    });

    // Get test sessions with scores
    const testSessions = await prisma.testSession.findMany({
      where: {
        OR: [
          { status: "SCORED" },
          { status: "SUBMITTED" },
        ],
      },
      select: {
        submittedAt: true,
        totalScore: true,
        passed: true,
      },
    });

    // Group applications by time period
    const groupedByTime: Record<string, { applicants: number; passed: number }> = {};

    applications.forEach((app) => {
      let key: string;
      const date = new Date(app.createdAt);

      if (groupByFormat === "day") {
        key = date.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
      } else if (groupByFormat === "week") {
        const weekNum = Math.ceil((date.getDate()) / 7);
        key = `Minggu ${weekNum}`;
      } else if (groupByFormat === "month") {
        key = date.toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
      } else {
        key = date.getFullYear().toString();
      }

      if (!groupedByTime[key]) {
        groupedByTime[key] = { applicants: 0, passed: 0 };
      }
      groupedByTime[key].applicants++;
    });

    // Group test results by time period
    testSessions.forEach((session) => {
      if (!session.submittedAt) return;

      let key: string;
      const date = new Date(session.submittedAt);

      if (groupByFormat === "day") {
        key = date.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
      } else if (groupByFormat === "week") {
        const weekNum = Math.ceil((date.getDate()) / 7);
        key = `Minggu ${weekNum}`;
      } else if (groupByFormat === "month") {
        key = date.toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
      } else {
        key = date.getFullYear().toString();
      }

      if (!groupedByTime[key]) {
        groupedByTime[key] = { applicants: 0, passed: 0 };
      }
      if (session.passed) {
        groupedByTime[key].passed++;
      }
    });

    // Convert to array for chart
    const labels = Object.keys(groupedByTime);
    const chartData = labels.map((label) => ({
      label,
      applicants: groupedByTime[label].applicants,
      passed: groupedByTime[label].passed,
    }));

    // Calculate totals
    const totalApplicants = applications.length;
    const totalPassed = testSessions.filter((s) => s.passed).length;
    const avgScore = testSessions.filter((s) => s.totalScore !== null).length > 0
      ? Math.round(testSessions.filter((s) => s.totalScore !== null).reduce((sum, s) => sum + (s.totalScore || 0), 0) /
        testSessions.filter((s) => s.totalScore !== null).length)
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        chart: chartData,
        totals: {
          applicants: totalApplicants,
          passed: totalPassed,
          avgScore,
        },
        range,
      },
    });
  } catch (error) {
    console.error("Get stats error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
