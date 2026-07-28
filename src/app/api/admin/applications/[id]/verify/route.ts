// API Route: Verify Application (Approve/Reject)
// PATCH /api/admin/applications/[id]/verify

import { NextRequest, NextResponse } from "next/server";
import { updateApplicationStatus } from "@/lib/local-db";

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
    const { getAllApplications } = await import("@/lib/local-db");
    const applications = getAllApplications();
    const application = applications.find(a => a.id === id);

    if (!application) {
      return NextResponse.json(
        { success: false, error: "Lamaran tidak ditemukan" },
        { status: 404 }
      );
    }

    // Determine new status based on action
    const newStatus = action === "approve" ? "TEST" : "REJECTED";

    // Update application status
    const updated = updateApplicationStatus(id, newStatus);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Gagal mengupdate status" },
        { status: 500 }
      );
    }

    // Save notes if provided
    if (notes) {
      const { getAllApplications: getApps } = await import("@/lib/local-db");
      const allApps = getApps();
      const appIndex = allApps.findIndex(a => a.id === id);
      if (appIndex !== -1) {
        allApps[appIndex].notes = notes;
        if (typeof window !== "undefined") {
          localStorage.setItem("kai_recruitment_db", JSON.stringify({
            users: [],
            jobs: [],
            applications: allApps,
            questions: []
          }));
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        status: updated.status,
        previousStatus: application.status,
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

// GET: Get application details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { getAllApplications, getAllUsers, getJobById } = await import("@/lib/local-db");

    const applications = getAllApplications();
    const application = applications.find(a => a.id === id);

    if (!application) {
      return NextResponse.json(
        { success: false, error: "Lamaran tidak ditemukan" },
        { status: 404 }
      );
    }

    const users = getAllUsers();
    const applicant = users.find(u => u.id === application.applicantId);
    const job = getJobById(application.jobPostingId);

    return NextResponse.json({
      success: true,
      data: {
        application: {
          id: application.id,
          status: application.status,
          notes: application.notes,
          createdAt: application.createdAt,
          updatedAt: application.updatedAt,
        },
        applicant: applicant ? {
          id: applicant.id,
          fullName: applicant.fullName,
          email: applicant.email,
          nik: applicant.nik,
          phone: applicant.phone,
          dateOfBirth: applicant.dateOfBirth,
          placeOfBirth: applicant.placeOfBirth,
          gender: applicant.gender,
          address: applicant.address,
          city: applicant.city,
          education: applicant.education,
          university: applicant.university,
          height: applicant.height,
          weight: applicant.weight,
        } : null,
        job: job ? {
          id: job.id,
          title: job.title,
          division: job.division,
          location: job.location,
        } : null,
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
