// API Route: Get/Update Single Contact Message (Admin)
// GET /api/admin/contacts/[id]
// PATCH /api/admin/contacts/[id]

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const message = await prisma.contactMessage.findUnique({
      where: { id },
    });

    if (!message) {
      return NextResponse.json(
        { success: false, error: "Pesan tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message,
    });
  } catch (error) {
    console.error("Get contact error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, adminReply } = body;

    // Build update data
    const updateData: any = {};

    if (status) {
      updateData.status = status;
    }

    if (adminReply) {
      updateData.adminReply = adminReply;
      updateData.repliedAt = new Date();
      updateData.status = "REPLIED";
    }

    const updatedMessage = await prisma.contactMessage.update({
      where: { id },
      data: updateData,
    });

    console.log(`[CONTACT] Updated message ${id}: status=${status || updatedMessage.status}`);

    return NextResponse.json({
      success: true,
      message: "Pesan berhasil diperbarui",
      data: updatedMessage,
    });
  } catch (error) {
    console.error("Update contact error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
