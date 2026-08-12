// API Route: Delete individual test schedule
// DELETE /api/admin/test-schedule/[id]

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Delete the test session
    await prisma.testSession.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Jadwal berhasil dihapus",
    });
  } catch (error: any) {
    console.error("Delete schedule error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menghapus jadwal" },
      { status: 500 }
    );
  }
}

// Update individual test schedule
// PATCH /api/admin/test-schedule/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { scheduledAt, location, message } = body;

    // Update the test session
    await prisma.testSession.update({
      where: { id },
      data: {
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
        location: location,
        adminMessage: message,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Jadwal berhasil diupdate",
    });
  } catch (error: any) {
    console.error("Update schedule error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengupdate jadwal" },
      { status: 500 }
    );
  }
}
