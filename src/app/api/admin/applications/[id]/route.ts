// API Route: Update Applicant Data (Admin)
// PATCH /api/admin/applications/[id]

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { type, data } = body;

    // Get current application with user data
    const currentApp = await prisma.application.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!currentApp) {
      return NextResponse.json(
        { success: false, error: "Lamaran tidak ditemukan" },
        { status: 404 }
      );
    }

    if (type === "personal") {
      // Update personal data (user fields)
      const updatedUser = await prisma.user.update({
        where: { id: currentApp.userId },
        data: {
          fullName: data.fullName,
          nik: data.nik,
          phone: data.phone,
          placeOfBirth: data.placeOfBirth,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
          gender: data.gender,
          address: data.address,
          city: data.city,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Data pribadi berhasil diperbarui",
        data: updatedUser,
      });
    }

    if (type === "education") {
      // Update education data (user fields)
      const updatedUser = await prisma.user.update({
        where: { id: currentApp.userId },
        data: {
          education: data.education,
          university: data.university,
          height: data.height ? parseInt(data.height) : null,
          weight: data.weight ? parseInt(data.weight) : null,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Data pendidikan berhasil diperbarui",
        data: updatedUser,
      });
    }

    return NextResponse.json(
      { success: false, error: "Tipe update tidak valid" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Update applicant data error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
