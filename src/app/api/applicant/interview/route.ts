// API Route: Get interview by application ID
// GET /api/applicant/interview?applicationId=xxx

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

    // Get interview for this application
    const interview = await prisma.interview.findUnique({
      where: { applicationId },
    });

    if (!interview) {
      return NextResponse.json({
        success: true,
        interview: null,
      });
    }

    return NextResponse.json({
      success: true,
      interview: {
        id: interview.id,
        scheduledAt: interview.scheduledAt?.toISOString(),
        location: interview.location,
        interviewer: interview.interviewer,
        type: interview.type,
      },
    });
  } catch (error) {
    console.error("Get interview error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
