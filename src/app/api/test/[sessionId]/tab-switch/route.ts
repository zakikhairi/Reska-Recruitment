import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// POST: Log tab switch event
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const body = await request.json();
    const { timestamp, reason } = body;

    // Get current session
    const session = await prisma.testSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Session not found" },
        { status: 404 }
      );
    }

    // Parse existing logs
    const existingLogs = session.tabSwitchLogs
      ? JSON.parse(session.tabSwitchLogs)
      : [];

    // Add new log entry
    const newLog = {
      timestamp: timestamp || new Date().toISOString(),
      reason: reason || "visibility_change",
    };

    existingLogs.push(newLog);

    // Update session
    const updatedSession = await prisma.testSession.update({
      where: { id: sessionId },
      data: {
        tabSwitchCount: session.tabSwitchCount + 1,
        tabSwitchLogs: JSON.stringify(existingLogs),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        tabSwitchCount: updatedSession.tabSwitchCount,
        logged: true,
      },
    });
  } catch (error) {
    console.error("Error logging tab switch:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
