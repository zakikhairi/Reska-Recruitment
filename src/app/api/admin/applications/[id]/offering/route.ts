// API Route: Offering Letter CRUD
// POST /api/admin/applications/[id]/offering - Create offering
// PATCH /api/admin/applications/[id]/offering - Update offering

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      salary,
      salaryPeriod,
      startDate,
      employmentType,
      contractDuration,
      probationMonths,
      workLocation,
      positionTitle,
      benefits,
      notes,
    } = body;

    // Validate required fields
    if (!salary || !startDate || !employmentType) {
      return NextResponse.json(
        { success: false, error: "Gaji, tanggal mulai kerja, dan jenis karyawan wajib diisi" },
        { status: 400 }
      );
    }

    // Check application exists
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        applicant: { include: { user: true } },
        jobPosting: true,
        offering: true,
      },
    });

    if (!application) {
      return NextResponse.json(
        { success: false, error: "Lamaran tidak ditemukan" },
        { status: 404 }
      );
    }

    // Check if offering already exists
    if (application.offering) {
      return NextResponse.json(
        { success: false, error: "Offering sudah dibuat sebelumnya. Gunakan PATCH untuk update." },
        { status: 409 }
      );
    }

    // Calculate contract end date if CONTRACT type
    let contractEndDate = null;
    if (employmentType === "CONTRACT" && contractDuration) {
      const start = new Date(startDate);
      contractEndDate = new Date(start);
      contractEndDate.setMonth(contractEndDate.getMonth() + contractDuration);
    }

    // Create offering
    const offering = await prisma.offering.create({
      data: {
        applicationId: id,
        salary: parseInt(salary),
        salaryPeriod: salaryPeriod || "MONTHLY",
        startDate: new Date(startDate),
        employmentType,
        contractDuration: employmentType === "CONTRACT" ? (contractDuration ? parseInt(contractDuration) : null) : null,
        contractEndDate,
        probationMonths: employmentType === "PERMANENT" ? (probationMonths ? parseInt(probationMonths) : 3) : null,
        workLocation: workLocation || null,
        positionTitle: positionTitle || application.jobPosting?.title || null,
        benefits: benefits || null,
        notes: notes || null,
      },
    });

    // Update application status to OFFERING if not already
    if (application.status !== "OFFERING") {
      await prisma.application.update({
        where: { id },
        data: {
          status: "OFFERING",
          statusHistory: {
            create: {
              fromStatus: application.status,
              toStatus: "OFFERING",
              notes: "Offering letter dibuat",
            },
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: offering,
      message: "Offering letter berhasil dibuat",
    });
  } catch (error) {
    console.error("Error creating offering:", error);
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
    const { action, ...updateData } = body;

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        offering: true,
        applicant: { include: { user: true } },
        jobPosting: true,
      },
    });

    if (!application) {
      return NextResponse.json(
        { success: false, error: "Lamaran tidak ditemukan" },
        { status: 404 }
      );
    }

    if (!application.offering) {
      return NextResponse.json(
        { success: false, error: "Offering belum dibuat" },
        { status: 404 }
      );
    }

    // Accept offering -> advance to ACCEPTED
    if (action === "accept") {
      await prisma.offering.update({
        where: { id: application.offering.id },
        data: {
          status: "ACCEPTED",
          acceptedAt: new Date(),
        },
      });

      await prisma.application.update({
        where: { id },
        data: {
          status: "ACCEPTED",
          reviewedAt: new Date(),
          statusHistory: {
            create: {
              fromStatus: "OFFERING",
              toStatus: "ACCEPTED",
              notes: "Pelamar diterima berdasarkan offering letter",
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        message: "Pelamar berhasil diterima!",
      });
    }

    // Decline offering
    if (action === "decline") {
      await prisma.offering.update({
        where: { id: application.offering.id },
        data: {
          status: "DECLINED",
        },
      });

      return NextResponse.json({
        success: true,
        message: "Offering ditolak oleh pelamar",
      });
    }

    return NextResponse.json(
      { success: false, error: "Action tidak valid" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error updating offering:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
