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

    // Get current application with applicant data
    const currentApp = await prisma.application.findUnique({
      where: { id },
      include: { applicant: true },
    });

    if (!currentApp) {
      return NextResponse.json(
        { success: false, error: "Lamaran tidak ditemukan" },
        { status: 404 }
      );
    }

    if (type === "personal") {
      // Update personal data (applicant fields)
      const updateData: any = {
        fullName: data.fullName,
        nik: data.nik,
        phone: data.phone,
        placeOfBirth: data.placeOfBirth,
        gender: data.gender,
        address: data.address,
        city: data.city,
      };

      if (data.dateOfBirth) {
        updateData.dateOfBirth = new Date(data.dateOfBirth);
      }

      const updatedApplicant = await prisma.applicant.update({
        where: { id: currentApp.applicantId },
        data: updateData,
      });

      return NextResponse.json({
        success: true,
        message: "Data pribadi berhasil diperbarui",
        data: updatedApplicant,
      });
    }

    if (type === "education") {
      // Update education data (applicant fields)
      const updatedApplicant = await prisma.applicant.update({
        where: { id: currentApp.applicantId },
        data: {
          education: data.education,
          university: data.university,
          height: data.height ? parseFloat(data.height) : null,
          weight: data.weight ? parseFloat(data.weight) : null,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Data pendidikan berhasil diperbarui",
        data: updatedApplicant,
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
