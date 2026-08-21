// API Route: Get test session by application ID
// GET /api/applicant/test-session?applicationId=xxx

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get("applicationId");

    if (!applicationId) {
      return NextResponse.json(
        { success: false, error: "Application ID diperlukan" },
        { status: 400 }
      );
    }

    // Get test session for this application
    const testSession = await prisma.testSession.findFirst({
      where: { applicationId },
    });

    if (!testSession) {
      return NextResponse.json({
        success: true,
        session: null,
      });
    }

    return NextResponse.json({
      success: true,
      session: {
        id: testSession.id,
        status: testSession.status,
        scheduledAt: testSession.scheduledAt?.toISOString(),
        endTime: testSession.endTime?.toISOString(),
        submittedAt: testSession.submittedAt?.toISOString(),
        startedAt: testSession.startedAt?.toISOString(),
      },
    });
  } catch (error) {
    console.error("Get test session error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
