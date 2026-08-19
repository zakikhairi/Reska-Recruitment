import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import * as XLSX from "xlsx";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "xlsx"; // xlsx or csv
    const status = searchParams.get("status");
    const jobId = searchParams.get("jobId");

    // Build where clause
    const where: any = {};
    if (status) where.status = status;
    if (jobId) where.jobPostingId = jobId;

    // Get applications with related data
    const applications = await prisma.application.findMany({
      where,
      include: {
        applicant: {
          include: {
            user: true,
          },
        },
        jobPosting: true,
        testSession: true,
        interview: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Transform data for export
    const exportData = applications.map((app, index) => ({
      No: index + 1,
      "Nama Lengkap": app.applicant.fullName,
      Email: app.applicant.user.email,
      NIK: app.applicant.nik,
      "No. Telepon": app.applicant.phone,
      "Tanggal Lahir": app.applicant.dateOfBirth
        ? new Date(app.applicant.dateOfBirth).toLocaleDateString("id-ID")
        : "-",
      Gender: app.applicant.gender,
      Pendidikan: app.applicant.education,
      Universitas: app.applicant.university || "-",
      "Posisi yang Dilamar": app.jobPosting.title,
      Divisi: app.jobPosting.division.replace(/_/g, " "),
      "Tanggal Lamar": new Date(app.createdAt).toLocaleDateString("id-ID"),
      Status: getStatusLabel(app.status),
      "Skor Tes": app.testSession?.totalScore ?? "-",
      "Hasil Tes": app.testSession?.passed === true ? "Lulus" : app.testSession?.passed === false ? "Tidak Lulus" : "-",
      "Jadwal Interview": app.interview?.scheduledAt
        ? new Date(app.interview.scheduledAt).toLocaleDateString("id-ID")
        : "-",
      Lokasi: app.interview?.location || "-",
      "Hasil Interview": app.interview?.result || "-",
    }));

    // Create workbook
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Pelamar");

    // Set column widths
    worksheet["!cols"] = [
      { wch: 5 },   // No
      { wch: 25 },  // Nama
      { wch: 30 },  // Email
      { wch: 18 },  // NIK
      { wch: 15 },  // HP
      { wch: 15 },  // Tgl Lahir
      { wch: 8 },   // Gender
      { wch: 10 },  // Pendidikan
      { wch: 20 },  // Universitas
      { wch: 25 },  // Posisi
      { wch: 15 },  // Divisi
      { wch: 15 },  // Tgl Lamar
      { wch: 15 },  // Status
      { wch: 10 },  // Skor
      { wch: 12 },  // Hasil Tes
      { wch: 15 },  // Jadwal Interview
      { wch: 20 },  // Lokasi
      { wch: 12 },  // Hasil Interview
    ];

    // Generate buffer
    const buffer = format === "csv"
      ? XLSX.utils.sheet_to_csv(worksheet)
      : XLSX.write(workbook, { type: "buffer", bookType: format === "csv" ? "csv" : "xlsx" });

    // Create filename
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `data_pelamar_${timestamp}.${format}`;

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": format === "csv" ? "text/csv" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal export data" },
      { status: 500 }
    );
  }
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: "Menunggu",
    ADMIN_CHECK: "Verifikasi Admin",
    TEST_SCHEDULED: "Tes Dijadwalkan",
    IN_TEST: "Sedang Tes",
    TEST_COMPLETED: "Tes Selesai",
    INTERVIEW: "Interview",
    MCU: "MCU",
    OFFERED: "Ditawarkan",
    ACCEPTED: "Diterima",
    REJECTED: "Ditolak",
    WITHDRAWN: "Dibatalkan",
  };
  return labels[status] || status;
}
