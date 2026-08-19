import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import jsPDF from "jspdf";
import "jspdf-autotable";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get application with all related data
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        applicant: {
          include: {
            user: true,
            documents: true,
          },
        },
        jobPosting: true,
        testSession: true,
        interview: true,
        mcu: true,
        statusHistory: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!application) {
      return NextResponse.json(
        { success: false, error: "Lamaran tidak ditemukan" },
        { status: 404 }
      );
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFillColor(0, 32, 91); // KAI Blue
    doc.rect(0, 0, pageWidth, 35, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("LAPORAN PELAMAR", pageWidth / 2, 15, { align: "center" });
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("PT Reska Multi Usaha (KAI Services)", pageWidth / 2, 24, { align: "center" });
    doc.text("Sistem Rekrutmen Cerdas KAI", pageWidth / 2, 30, { align: "center" });

    let yPos = 45;

    // Section: Data Pribadi
    doc.setTextColor(0, 32, 91);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("DATA DIRI", 14, yPos);
    yPos += 5;

    doc.setDrawColor(0, 32, 91);
    doc.line(14, yPos, pageWidth - 14, yPos);
    yPos += 8;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    const personalData = [
      ["Nama Lengkap", application.applicant.fullName],
      ["NIK", application.applicant.nik],
      ["Email", application.applicant.user.email],
      ["No. Telepon", application.applicant.phone],
      ["Tempat, Tanggal Lahir", `${application.applicant.placeOfBirth}, ${new Date(application.applicant.dateOfBirth).toLocaleDateString("id-ID")}`],
      ["Jenis Kelamin", application.applicant.gender],
      ["Alamat", application.applicant.address],
      ["Kota", application.applicant.city],
      ["Pendidikan", application.applicant.education],
      ["Universitas", application.applicant.university || "-"],
    ];

    // @ts-ignore
    doc.autoTable({
      startY: yPos,
      body: personalData,
      theme: "plain",
      margin: { left: 14, right: 14 },
      columnStyles: {
        0: { cellWidth: 50, fontStyle: "bold", textColor: [0, 32, 91] },
        1: { cellWidth: "auto" },
      },
      styles: { fontSize: 10, cellPadding: 3 },
      tableLineColor: [200, 200, 200],
      tableLineWidth: 0.1,
    });

    // @ts-ignore
    yPos = doc.lastAutoTable.finalY + 15;

    // Check if need new page
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    // Section: Lowongan
    doc.setTextColor(0, 32, 91);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("LOWONGAN YANG DILAMAR", 14, yPos);
    yPos += 5;
    doc.line(14, yPos, pageWidth - 14, yPos);
    yPos += 8;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    const jobData = [
      ["Posisi", application.jobPosting.title],
      ["Divisi", application.jobPosting.division.replace(/_/g, " ")],
      ["Lokasi", application.jobPosting.location],
      ["Tanggal Lamar", new Date(application.createdAt).toLocaleDateString("id-ID")],
      ["Status", getStatusLabel(application.status)],
    ];

    // @ts-ignore
    doc.autoTable({
      startY: yPos,
      body: jobData,
      theme: "plain",
      margin: { left: 14, right: 14 },
      columnStyles: {
        0: { cellWidth: 50, fontStyle: "bold", textColor: [0, 32, 91] },
        1: { cellWidth: "auto" },
      },
      styles: { fontSize: 10, cellPadding: 3 },
      tableLineColor: [200, 200, 200],
      tableLineWidth: 0.1,
    });

    // @ts-ignore
    yPos = doc.lastAutoTable.finalY + 15;

    // Section: Hasil Tes
    if (application.testSession) {
      if (yPos > 230) {
        doc.addPage();
        yPos = 20;
      }

      doc.setTextColor(0, 32, 91);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("HASIL TES KOMPETENSI", 14, yPos);
      yPos += 5;
      doc.line(14, yPos, pageWidth - 14, yPos);
      yPos += 8;

      const testResult = application.testSession.passed
        ? "LULUS"
        : application.testSession.passed === false
        ? "TIDAK LULUS"
        : "BELUM DINILAI";
      const resultColor = application.testSession.passed
        ? [22, 163, 74]
        : application.testSession.passed === false
        ? [220, 38, 38]
        : [100, 100, 100];

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      const testData = [
        ["Skor Total", `${application.testSession.totalScore || 0}%`],
        ["Status", testResult],
        ["Tanggal Tes", application.testSession.submittedAt
          ? new Date(application.testSession.submittedAt).toLocaleDateString("id-ID")
          : "-"],
        ["Jumlah Pergantian Tab", `${application.testSession.tabSwitchCount} kali`],
      ];

      // @ts-ignore
      doc.autoTable({
        startY: yPos,
        body: testData,
        theme: "plain",
        margin: { left: 14, right: 14 },
        columnStyles: {
          0: { cellWidth: 50, fontStyle: "bold", textColor: [0, 32, 91] },
          1: { cellWidth: "auto" },
        },
        styles: { fontSize: 10, cellPadding: 3 },
        tableLineColor: [200, 200, 200],
        tableLineWidth: 0.1,
      });

      // @ts-ignore
      yPos = doc.lastAutoTable.finalY + 15;
    }

    // Section: Interview
    if (application.interview) {
      if (yPos > 230) {
        doc.addPage();
        yPos = 20;
      }

      doc.setTextColor(0, 32, 91);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("INTERVIEW", 14, yPos);
      yPos += 5;
      doc.line(14, yPos, pageWidth - 14, yPos);
      yPos += 8;

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      const interviewData = [
        ["Tanggal", new Date(application.interview.scheduledAt).toLocaleDateString("id-ID")],
        ["Lokasi", application.interview.location],
        ["Interviewer", application.interview.interviewer],
        ["Tipe", application.interview.type],
        ["Hasil", application.interview.result || "Belum ada"],
        ["Skor", application.interview.score ? `${application.interview.score}/100` : "-"],
        ["Catatan", application.interview.notes || "-"],
      ];

      // @ts-ignore
      doc.autoTable({
        startY: yPos,
        body: interviewData,
        theme: "plain",
        margin: { left: 14, right: 14 },
        columnStyles: {
          0: { cellWidth: 50, fontStyle: "bold", textColor: [0, 32, 91] },
          1: { cellWidth: "auto" },
        },
        styles: { fontSize: 10, cellPadding: 3 },
        tableLineColor: [200, 200, 200],
        tableLineWidth: 0.1,
      });

      // @ts-ignore
      yPos = doc.lastAutoTable.finalY + 15;
    }

    // Section: Riwayat Status
    if (application.statusHistory.length > 0) {
      if (yPos > 200) {
        doc.addPage();
        yPos = 20;
      }

      doc.setTextColor(0, 32, 91);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("RIWAYAT STATUS", 14, yPos);
      yPos += 5;
      doc.line(14, yPos, pageWidth - 14, yPos);
      yPos += 8;

      const historyData = application.statusHistory.map((h) => [
        new Date(h.createdAt).toLocaleDateString("id-ID"),
        getStatusLabel(h.toStatus),
        h.notes || "-",
      ]);

      // @ts-ignore
      doc.autoTable({
        startY: yPos,
        head: [["Tanggal", "Status", "Catatan"]],
        body: historyData,
        theme: "striped",
        margin: { left: 14, right: 14 },
        headStyles: {
          fillColor: [0, 32, 91],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        styles: { fontSize: 9, cellPadding: 3 },
      });
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Halaman ${i} dari ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: "center" }
      );
      doc.text(
        `Dicetak: ${new Date().toLocaleString("id-ID")}`,
        14,
        doc.internal.pageSize.getHeight() - 10
      );
      doc.text(
        "Sistem Rekrutmen Cerdas KAI",
        pageWidth - 14,
        doc.internal.pageSize.getHeight() - 10,
        { align: "right" }
      );
    }

    // Generate PDF buffer
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="laporan_${application.applicant.fullName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal generate PDF" },
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
