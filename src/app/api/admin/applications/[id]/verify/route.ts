// API Route: Verify Application (Approve/Reject) and Get Details
// GET /api/admin/applications/[id]/verify - Get application details
// PATCH /api/admin/applications/[id]/verify - Verify application

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        applicant: true,
        jobPosting: {
          select: {
            id: true,
            title: true,
            division: true,
            location: true,
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json(
        { success: false, error: "Lamaran tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        application: {
          id: application.id,
          status: application.status,
          notes: application.notes,
          createdAt: application.createdAt,
        },
        applicant: {
          id: application.applicant.id,
          fullName: application.applicant.fullName,
          email: application.applicant.user?.email || "",
          nik: application.applicant.nik,
          phone: application.applicant.phone,
          dateOfBirth: application.applicant.dateOfBirth,
          placeOfBirth: application.applicant.placeOfBirth,
          gender: application.applicant.gender,
          address: application.applicant.address,
          city: application.applicant.city,
          education: application.applicant.education,
          university: application.applicant.university,
          height: application.applicant.height,
          weight: application.applicant.weight,
        },
        job: application.jobPosting,
      },
    });
  } catch (error) {
    console.error("Error fetching application:", error);
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
    const { action, notes } = body;

    if (!action || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { success: false, error: "Action harus 'approve' atau 'reject'" },
        { status: 400 }
      );
    }

    // Get current application
    const currentApp = await prisma.application.findUnique({
      where: { id },
    });

    if (!currentApp) {
      return NextResponse.json(
        { success: false, error: "Lamaran tidak ditemukan" },
        { status: 404 }
      );
    }

    const previousStatus = currentApp.status;

    // Determine new status based on action
    const newStatus = action === "approve" ? "TEST" : "REJECTED";

    // Update application
    const application = await prisma.application.update({
      where: { id },
      data: {
        status: newStatus,
        notes: notes || currentApp.notes,
        reviewedAt: new Date(),
        statusHistory: {
          create: {
            fromStatus: previousStatus,
            toStatus: newStatus,
            notes,
          },
        },
      },
      include: {
        applicant: {
          select: {
            fullName: true,
          },
        },
        jobPosting: {
          select: {
            title: true,
            division: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: application.id,
        status: application.status,
        previousStatus,
      },
      message: action === "approve"
        ? "Lamaran berhasil diverifikasi dan dilanjutkan ke tahap tes"
        : "Lamaran berhasil ditolak",
    });
  } catch (error) {
    console.error("Error verifying application:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
